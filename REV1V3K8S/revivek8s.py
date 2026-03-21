#!/usr/bin/env python3
import argparse
import base64
import copy
import json
import re
import sys
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Tuple

from kubernetes import client
from kubernetes.client.rest import ApiException


SECRET_PATTERNS = {
    "AWS_ACCESS_KEY": re.compile(r"AKIA[0-9A-Z]{16}"),
    "GOOGLE_API_KEY": re.compile(r"AIza[0-9A-Za-z\-_]{35}"),
    "GITHUB_TOKEN": re.compile(r"ghp_[0-9A-Za-z]{36}"),
    "SLACK_TOKEN": re.compile(r"xox[baprs]-[0-9a-zA-Z]{10,48}"),
    "GENERIC_SECRET": re.compile(
        r"(?i)(api[_-]?key|token|secret)\s*[:=]\s*[\"']?[A-Za-z0-9_\-]{16,}[\"']?"
    ),
}

SEVERITY_POINTS = {
    "CRITICAL": 25,
    "HIGH": 15,
    "MEDIUM": 8,
    "LOW": 3,
    "INFO": 0,
}

DEFAULT_SCORE = 100


@dataclass
class Finding:
    severity: str
    finding_type: str
    kind: str
    resource: str
    namespace: Optional[str]
    container: Optional[str]
    field: Optional[str]
    current: Any
    why_risky: str
    remediation_class: str
    planned_action: str


def print_line(ch: str = "=", n: int = 60) -> None:
    print(ch * n)


def mask_value(value: str) -> str:
    s = str(value)
    if len(s) <= 8:
        return s
    return f"{s[:4]}...{s[-4:]}"


def safe_b64_decode(value: str) -> Optional[str]:
    try:
        return base64.b64decode(value).decode("utf-8", errors="ignore")
    except Exception:
        return None


def detect_secret_patterns(text: str) -> List[Tuple[str, str]]:
    findings: List[Tuple[str, str]] = []
    if not text:
        return findings
    for name, pattern in SECRET_PATTERNS.items():
        for match in pattern.findall(text):
            if isinstance(match, tuple):
                match = "".join(match)
            findings.append((name, match))
    return findings


def summarize(findings: List[Finding]) -> Dict[str, int]:
    out = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
    for f in findings:
        out[f.severity] = out.get(f.severity, 0) + 1
    return out


def score_findings(findings: List[Finding]) -> int:
    deducted = sum(SEVERITY_POINTS.get(f.severity, 0) for f in findings)
    return max(0, DEFAULT_SCORE - deducted)


def finding_key(f: Finding) -> Tuple:
    return (
        f.finding_type,
        f.kind,
        f.resource,
        f.namespace,
        f.container,
        f.field,
    )


class ReviveK8s:
    def __init__(
        self,
        api_url: str,
        token: str,
        namespace: Optional[str] = None,
        insecure: bool = False,
        ca_file: Optional[str] = None,
    ):
        self.namespace = namespace

        cfg = client.Configuration()
        cfg.host = api_url.rstrip("/")
        cfg.api_key = {"authorization": token}
        cfg.api_key_prefix = {"authorization": "Bearer"}
        cfg.verify_ssl = not insecure
        if ca_file:
            cfg.ssl_ca_cert = ca_file

        api_client = client.ApiClient(cfg)
        self.core = client.CoreV1Api(api_client)
        self.apps = client.AppsV1Api(api_client)
        self.rbac = client.RbacAuthorizationV1Api(api_client)

        self.scan_summary = {
            "deployments_scanned": 0,
            "statefulsets_scanned": 0,
            "daemonsets_scanned": 0,
            "pods_scanned": 0,
            "configmaps_scanned": 0,
            "clusterroles_scanned": 0,
        }

    def reset_counts(self) -> None:
        for k in self.scan_summary:
            self.scan_summary[k] = 0

    def _list_namespaces(self) -> List[str]:
        if self.namespace:
            return [self.namespace]
        return [ns.metadata.name for ns in self.core.list_namespace().items]

    def scan(self) -> List[Finding]:
        findings: List[Finding] = []
        findings.extend(self.scan_workloads())
        findings.extend(self.scan_configmaps())
        findings.extend(self.scan_pod_envs())
        findings.extend(self.scan_rbac())
        return findings

    def scan_workloads(self) -> List[Finding]:
        findings: List[Finding] = []
        for ns in self._list_namespaces():
            try:
                deps = self.apps.list_namespaced_deployment(ns).items
                self.scan_summary["deployments_scanned"] += len(deps)
                for dep in deps:
                    findings.extend(
                        self._scan_podspec(
                            kind="Deployment",
                            name=dep.metadata.name,
                            namespace=ns,
                            podspec=dep.spec.template.spec,
                        )
                    )
            except ApiException:
                pass

            try:
                ssets = self.apps.list_namespaced_stateful_set(ns).items
                self.scan_summary["statefulsets_scanned"] += len(ssets)
                for ss in ssets:
                    findings.extend(
                        self._scan_podspec(
                            kind="StatefulSet",
                            name=ss.metadata.name,
                            namespace=ns,
                            podspec=ss.spec.template.spec,
                        )
                    )
            except ApiException:
                pass

            try:
                dsets = self.apps.list_namespaced_daemon_set(ns).items
                self.scan_summary["daemonsets_scanned"] += len(dsets)
                for ds in dsets:
                    findings.extend(
                        self._scan_podspec(
                            kind="DaemonSet",
                            name=ds.metadata.name,
                            namespace=ns,
                            podspec=ds.spec.template.spec,
                        )
                    )
            except ApiException:
                pass
        return findings

    def _scan_podspec(
        self,
        kind: str,
        name: str,
        namespace: str,
        podspec: client.V1PodSpec,
    ) -> List[Finding]:
        findings: List[Finding] = []
        for c in podspec.containers or []:
            sc = c.security_context

            privileged = getattr(sc, "privileged", None) if sc else None
            if privileged is True:
                findings.append(
                    Finding(
                        severity="CRITICAL",
                        finding_type="PRIVILEGED_CONTAINER",
                        kind=kind,
                        resource=name,
                        namespace=namespace,
                        container=c.name,
                        field="securityContext.privileged",
                        current=True,
                        why_risky="Container has near-host level privileges.",
                        remediation_class="AUTO-FIX",
                        planned_action="Set privileged=false",
                    )
                )

            ape = getattr(sc, "allow_privilege_escalation", None) if sc else None
            if ape is True:
                findings.append(
                    Finding(
                        severity="HIGH",
                        finding_type="ALLOW_PRIVILEGE_ESCALATION",
                        kind=kind,
                        resource=name,
                        namespace=namespace,
                        container=c.name,
                        field="securityContext.allowPrivilegeEscalation",
                        current=True,
                        why_risky="Process can gain more privileges inside container.",
                        remediation_class="AUTO-FIX",
                        planned_action="Set allowPrivilegeEscalation=false",
                    )
                )

            rau = getattr(sc, "run_as_user", None) if sc else None
            if rau == 0:
                findings.append(
                    Finding(
                        severity="HIGH",
                        finding_type="RUN_AS_ROOT",
                        kind=kind,
                        resource=name,
                        namespace=namespace,
                        container=c.name,
                        field="securityContext.runAsUser",
                        current=0,
                        why_risky="Container is explicitly configured to run as root.",
                        remediation_class="AUTO-FIX",
                        planned_action="Set runAsNonRoot=true, runAsUser=1000",
                    )
                )

            rorf = getattr(sc, "read_only_root_filesystem", None) if sc else None
            if rorf is not True:
                findings.append(
                    Finding(
                        severity="MEDIUM",
                        finding_type="MISSING_READ_ONLY_ROOT_FS",
                        kind=kind,
                        resource=name,
                        namespace=namespace,
                        container=c.name,
                        field="securityContext.readOnlyRootFilesystem",
                        current=rorf,
                        why_risky="Writable root filesystem increases tampering risk.",
                        remediation_class="AUTO-FIX",
                        planned_action="Set readOnlyRootFilesystem=true",
                    )
                )
        return findings

    def scan_configmaps(self) -> List[Finding]:
        findings: List[Finding] = []
        for ns in self._list_namespaces():
            try:
                cms = self.core.list_namespaced_config_map(ns).items
                self.scan_summary["configmaps_scanned"] += len(cms)
            except ApiException:
                continue

            for cm in cms:
                if not cm.data:
                    continue
                for key, value in cm.data.items():
                    matches = detect_secret_patterns(str(value))
                    for _, matched_value in matches:
                        findings.append(
                            Finding(
                                severity="HIGH",
                                finding_type="SECRET_IN_CONFIGMAP",
                                kind="ConfigMap",
                                resource=cm.metadata.name,
                                namespace=ns,
                                container=None,
                                field=key,
                                current=mask_value(matched_value),
                                why_risky="Secret-like value stored in ConfigMap.",
                                remediation_class="MANUAL APPROVAL REQUIRED",
                                planned_action=(
                                    f"Migrate key to Secret/revivek8s-{cm.metadata.name} "
                                    f"and update workload references"
                                ),
                            )
                        )
        return findings

    def scan_pod_envs(self) -> List[Finding]:
        findings: List[Finding] = []
        for ns in self._list_namespaces():
            try:
                pods = self.core.list_namespaced_pod(ns).items
                self.scan_summary["pods_scanned"] += len(pods)
            except ApiException:
                continue

            owner_map = self._pod_owner_map(ns)

            for pod in pods:
                owner_kind, owner_name = owner_map.get(
                    pod.metadata.name, ("Pod", pod.metadata.name)
                )
                for c in pod.spec.containers or []:
                    for env in c.env or []:
                        if not env.value:
                            continue
                        matches = detect_secret_patterns(str(env.value))
                        for _, matched_value in matches:
                            findings.append(
                                Finding(
                                    severity="HIGH",
                                    finding_type="SECRET_IN_POD_ENV",
                                    kind=owner_kind,
                                    resource=owner_name,
                                    namespace=ns,
                                    container=c.name,
                                    field=env.name,
                                    current=mask_value(matched_value),
                                    why_risky="Secret-like value exposed as inline env var.",
                                    remediation_class="MANUAL APPROVAL REQUIRED",
                                    planned_action="Replace inline env with secretKeyRef",
                                )
                            )
        return findings

    def _pod_owner_map(self, namespace: str) -> Dict[str, Tuple[str, str]]:
        out: Dict[str, Tuple[str, str]] = {}
        try:
            pods = self.core.list_namespaced_pod(namespace).items
        except ApiException:
            return out

        rs_to_dep: Dict[str, str] = {}
        try:
            deps = self.apps.list_namespaced_deployment(namespace).items
            for dep in deps:
                for rs in self.apps.list_namespaced_replica_set(namespace).items:
                    for owner in rs.metadata.owner_references or []:
                        if owner.kind == "Deployment" and owner.name == dep.metadata.name:
                            rs_to_dep[rs.metadata.name] = dep.metadata.name
        except ApiException:
            pass

        for pod in pods:
            owner_kind = "Pod"
            owner_name = pod.metadata.name
            for owner in pod.metadata.owner_references or []:
                if owner.kind == "ReplicaSet":
                    owner_kind = "Deployment"
                    owner_name = rs_to_dep.get(owner.name, owner.name)
                elif owner.kind in {"StatefulSet", "DaemonSet", "Job", "CronJob"}:
                    owner_kind = owner.kind
                    owner_name = owner.name
            out[pod.metadata.name] = (owner_kind, owner_name)
        return out

    def scan_rbac(self) -> List[Finding]:
        findings: List[Finding] = []
        try:
            roles = self.rbac.list_cluster_role().items
            self.scan_summary["clusterroles_scanned"] += len(roles)
        except ApiException:
            return findings

        for role in roles:
            for rule in role.rules or []:
                verbs = rule.verbs or []
                resources = rule.resources or []
                if "*" in verbs or "*" in resources:
                    findings.append(
                        Finding(
                            severity="CRITICAL",
                            finding_type="RBAC_OVERPERMISSIVE",
                            kind="ClusterRole",
                            resource=role.metadata.name,
                            namespace=None,
                            container=None,
                            field="rules",
                            current=f"verbs={verbs}, resources={resources}",
                            why_risky="Wildcard permissions can allow full cluster takeover.",
                            remediation_class="NOT SAFE TO AUTOMATE",
                            planned_action=(
                                "Replace wildcard permissions with least-privilege rules "
                                "after workload permission mapping"
                            ),
                        )
                    )
                    break
        return findings

    def remediate(self) -> Dict[str, List[Dict[str, Any]]]:
        auto_fixed: List[Dict[str, Any]] = []
        manual: List[Dict[str, Any]] = []
        unsafe: List[Dict[str, Any]] = []

        scan_findings = self.scan()

        manual_seen = set()
        unsafe_seen = set()

        for f in scan_findings:
            if f.remediation_class == "MANUAL APPROVAL REQUIRED":
                key = (f.kind, f.resource, f.namespace, f.field)
                if key not in manual_seen:
                    manual_seen.add(key)
                    reason = (
                        "Secret-like values found in ConfigMap data"
                        if f.finding_type == "SECRET_IN_CONFIGMAP"
                        else "Inline environment variable contains secret-like value"
                    )
                    proposed_changes = []
                    why_not = ""

                    if f.finding_type == "SECRET_IN_CONFIGMAP":
                        secret_name = f"revivek8s-{f.resource}"
                        proposed_changes = [
                            f"Create Secret/{secret_name}",
                            f"Move {f.field} from ConfigMap to Secret",
                            f"Update {f.kind}/{'%s' % f.resource} envFrom/env refs to secretKeyRef",
                            "Remove sensitive key from ConfigMap after rollout validation",
                        ]
                        why_not = (
                            "Refactoring config sources can break application startup "
                            "if references are not updated safely"
                        )
                    else:
                        proposed_changes = [
                            "Create or reuse Secret/revivek8s-app-secrets",
                            f"Replace env[{f.field}].value with env[{f.field}].valueFrom.secretKeyRef",
                        ]
                        why_not = (
                            "Secret migration may require restart coordination and "
                            "validation of workload expectations"
                        )

                    manual.append(
                        {
                            "kind": f.kind,
                            "resource": f.resource,
                            "namespace": f.namespace,
                            "reason": reason,
                            "proposed_changes": proposed_changes,
                            "why_not_auto_applied": why_not,
                        }
                    )

            elif f.remediation_class == "NOT SAFE TO AUTOMATE":
                key = (f.kind, f.resource)
                if key not in unsafe_seen:
                    unsafe_seen.add(key)
                    unsafe.append(
                        {
                            "kind": f.kind,
                            "resource": f.resource,
                            "namespace": f.namespace,
                            "reason": "Wildcard permissions detected in cluster-wide RBAC",
                            "proposed_changes": [
                                "Replace verbs=['*'] with explicit verbs such as ['get','list','watch']",
                                "Replace resources=['*'] with explicit resource list required by workload",
                            ],
                            "why_skipped": (
                                "RBAC reduction without workload-specific analysis "
                                "can break production access paths"
                            ),
                        }
                    )

        for ns in self._list_namespaces():
            auto_fixed.extend(self._remediate_deployments(ns))
            auto_fixed.extend(self._remediate_statefulsets(ns))
            auto_fixed.extend(self._remediate_daemonsets(ns))

        return {
            "auto_fixed": auto_fixed,
            "manual_approval_required": manual,
            "not_safe_to_automate": unsafe,
        }

    def _patched_workload(
        self, pod_spec: client.V1PodSpec
    ) -> Tuple[Dict[str, Any], bool, List[str], List[Tuple[str, Any, Any]]]:
        spec_copy = copy.deepcopy(pod_spec)
        changed = False
        detail_changes: List[str] = []
        field_changes: List[Tuple[str, Any, Any]] = []

        for c in spec_copy.containers or []:
            if c.security_context is None:
                c.security_context = client.V1SecurityContext()
            sc = c.security_context

            if sc.privileged is True:
                field_changes.append(("securityContext.privileged", True, False))
                sc.privileged = False
                detail_changes.append("securityContext.privileged: true  -> false")
                changed = True

            if sc.allow_privilege_escalation is not False:
                old = sc.allow_privilege_escalation
                field_changes.append(
                    ("securityContext.allowPrivilegeEscalation", old, False)
                )
                sc.allow_privilege_escalation = False
                detail_changes.append(
                    f"securityContext.allowPrivilegeEscalation: {old} -> false"
                )
                changed = True

            if sc.run_as_non_root is not True:
                old = sc.run_as_non_root
                field_changes.append(("securityContext.runAsNonRoot", old, True))
                sc.run_as_non_root = True
                detail_changes.append(
                    f"securityContext.runAsNonRoot: {old} -> true"
                )
                changed = True

            if sc.run_as_user == 0:
                field_changes.append(("securityContext.runAsUser", 0, 1000))
                sc.run_as_user = 1000
                detail_changes.append("securityContext.runAsUser: 0 -> 1000")
                changed = True

            if sc.read_only_root_filesystem is not True:
                old = sc.read_only_root_filesystem
                field_changes.append(
                    ("securityContext.readOnlyRootFilesystem", old, True)
                )
                sc.read_only_root_filesystem = True
                detail_changes.append(
                    f"securityContext.readOnlyRootFilesystem: {old} -> true"
                )
                changed = True

        return (
            client.ApiClient().sanitize_for_serialization(spec_copy),
            changed,
            detail_changes,
            field_changes,
        )

    def _remediate_deployments(self, namespace: str) -> List[Dict[str, Any]]:
        out = []
        try:
            items = self.apps.list_namespaced_deployment(namespace).items
        except ApiException:
            return out

        for dep in items:
            spec, changed, details, _ = self._patched_workload(dep.spec.template.spec)
            if not changed:
                continue
            body = {"spec": {"template": {"spec": spec}}}
            try:
                self.apps.patch_namespaced_deployment(dep.metadata.name, namespace, body)
                out.append(
                    {
                        "kind": "Deployment",
                        "resource": dep.metadata.name,
                        "namespace": namespace,
                        "reason": "Runtime container hardening issue detected",
                        "changes_applied": details,
                        "method": "Patched Deployment template spec through Kubernetes AppsV1 API",
                        "result": "Rollout triggered successfully",
                    }
                )
            except ApiException as e:
                out.append(
                    {
                        "kind": "Deployment",
                        "resource": dep.metadata.name,
                        "namespace": namespace,
                        "reason": "Runtime container hardening issue detected",
                        "changes_applied": details,
                        "method": "Patched Deployment template spec through Kubernetes AppsV1 API",
                        "result": f"Patch failed: {e.reason}",
                    }
                )
        return out

    def _remediate_statefulsets(self, namespace: str) -> List[Dict[str, Any]]:
        out = []
        try:
            items = self.apps.list_namespaced_stateful_set(namespace).items
        except ApiException:
            return out

        for obj in items:
            spec, changed, details, _ = self._patched_workload(obj.spec.template.spec)
            if not changed:
                continue
            body = {"spec": {"template": {"spec": spec}}}
            try:
                self.apps.patch_namespaced_stateful_set(obj.metadata.name, namespace, body)
                out.append(
                    {
                        "kind": "StatefulSet",
                        "resource": obj.metadata.name,
                        "namespace": namespace,
                        "reason": "Runtime container hardening issue detected",
                        "changes_applied": details,
                        "method": "Patched StatefulSet template spec through Kubernetes AppsV1 API",
                        "result": "Rollout triggered successfully",
                    }
                )
            except ApiException as e:
                out.append(
                    {
                        "kind": "StatefulSet",
                        "resource": obj.metadata.name,
                        "namespace": namespace,
                        "reason": "Runtime container hardening issue detected",
                        "changes_applied": details,
                        "method": "Patched StatefulSet template spec through Kubernetes AppsV1 API",
                        "result": f"Patch failed: {e.reason}",
                    }
                )
        return out

    def _remediate_daemonsets(self, namespace: str) -> List[Dict[str, Any]]:
        out = []
        try:
            items = self.apps.list_namespaced_daemon_set(namespace).items
        except ApiException:
            return out

        for obj in items:
            spec, changed, details, _ = self._patched_workload(obj.spec.template.spec)
            if not changed:
                continue
            body = {"spec": {"template": {"spec": spec}}}
            try:
                self.apps.patch_namespaced_daemon_set(obj.metadata.name, namespace, body)
                out.append(
                    {
                        "kind": "DaemonSet",
                        "resource": obj.metadata.name,
                        "namespace": namespace,
                        "reason": "Runtime container hardening issue detected",
                        "changes_applied": details,
                        "method": "Patched DaemonSet template spec through Kubernetes AppsV1 API",
                        "result": "Rollout triggered successfully",
                    }
                )
            except ApiException as e:
                out.append(
                    {
                        "kind": "DaemonSet",
                        "resource": obj.metadata.name,
                        "namespace": namespace,
                        "reason": "Runtime container hardening issue detected",
                        "changes_applied": details,
                        "method": "Patched DaemonSet template spec through Kubernetes AppsV1 API",
                        "result": f"Patch failed: {e.reason}",
                    }
                )
        return out


def print_header(namespace: Optional[str]) -> None:
    print_line("=")
    print("ReviveK8s :: Kubernetes Security Scan & Auto-Remediation")
    print(f"Target: namespace={namespace if namespace else 'ALL'}")
    print("Mode: scan -> score -> fix -> rescan")
    print_line("=")


def print_counts(summary: Dict[str, int]) -> None:
    print("\n[SCAN 1/3] Enumerating resources...")
    print(f"  - Deployments scanned: {summary['deployments_scanned']}")
    print(f"  - StatefulSets scanned: {summary['statefulsets_scanned']}")
    print(f"  - DaemonSets scanned: {summary['daemonsets_scanned']}")
    print(f"  - Pods scanned: {summary['pods_scanned']}")
    print(f"  - ConfigMaps scanned: {summary['configmaps_scanned']}")
    print(f"  - ClusterRoles scanned: {summary['clusterroles_scanned']}")


def print_findings(findings: List[Finding]) -> None:
    print("\n[SCAN 1/3] Findings")
    print("-" * 64)
    for idx, f in enumerate(findings, start=1):
        print(f"[{idx}] {f.severity:<9} {f.finding_type}")
        print(f"    Resource   : {f.kind}/{f.resource}")
        print(f"    Namespace  : {f.namespace if f.namespace else '-'}")
        if f.container:
            print(f"    Container  : {f.container}")
        if f.field:
            print(f"    Field      : {f.field}")
        print(f"    Current    : {f.current}")
        print(f"    Why risky  : {f.why_risky}")
        print(f"    Remediation class : {f.remediation_class}")
        print(f"    Planned action    : {f.planned_action}\n")
    print("-" * 64)


def print_summary_block(summary: Dict[str, int], score: int, label: str) -> None:
    print(f"\n{label} severity summary:")
    print(f"  Critical: {summary['CRITICAL']}")
    print(f"  High    : {summary['HIGH']}")
    print(f"  Medium  : {summary['MEDIUM']}")
    print(f"  Low     : {summary['LOW']}")
    print(f"\n{label} health score: {score}/100")


def print_remediation(rem: Dict[str, List[Dict[str, Any]]]) -> None:
    print("\n[FIX 2/3] Remediation execution")
    print("-" * 64)

    print("AUTO-FIXED")
    print("-" * 64)
    if rem["auto_fixed"]:
        for item in rem["auto_fixed"]:
            print(f"[FIXED] {item['kind']}/{item['resource']}")
            print("  Reason:")
            print(f"    - {item['reason']}")
            print("  Changes applied:")
            for ch in item["changes_applied"]:
                print(f"    - {ch}")
            print("  Method:")
            print(f"    - {item['method']}")
            print("  Result:")
            print(f"    - {item['result']}\n")
    else:
        print("No auto-fixes applied.\n")

    print("MANUAL APPROVAL REQUIRED")
    print("-" * 64)
    if rem["manual_approval_required"]:
        for item in rem["manual_approval_required"]:
            print(f"[PENDING APPROVAL] {item['kind']}/{item['resource']}")
            print("  Reason:")
            print(f"    - {item['reason']}")
            print("  Proposed changes:")
            for ch in item["proposed_changes"]:
                print(f"    - {ch}")
            print("  Why not auto-applied:")
            print(f"    - {item['why_not_auto_applied']}\n")
    else:
        print("No approval-gated items.\n")

    print("NOT SAFE TO AUTOMATE")
    print("-" * 64)
    if rem["not_safe_to_automate"]:
        for item in rem["not_safe_to_automate"]:
            print(f"[SKIPPED] {item['kind']}/{item['resource']}")
            print("  Reason:")
            print(f"    - {item['reason']}")
            print("  Proposed changes:")
            for ch in item["proposed_changes"]:
                print(f"    - {ch}")
            print("  Why skipped:")
            print(f"    - {item['why_skipped']}\n")
    else:
        print("No unsafe-to-automate items.\n")
    print("-" * 64)


def compare(initial: List[Finding], final: List[Finding]) -> Tuple[List[str], List[str], List[str]]:
    final_keys = {finding_key(f) for f in final}
    resolved, pending_manual, skipped_unsafe = [], [], []

    for f in initial:
        label = f"{f.finding_type}: {f.kind}/{f.resource}"
        if finding_key(f) not in final_keys:
            resolved.append(label)
        else:
            if f.remediation_class == "MANUAL APPROVAL REQUIRED":
                pending_manual.append(label)
            elif f.remediation_class == "NOT SAFE TO AUTOMATE":
                skipped_unsafe.append(label)

    return resolved, pending_manual, skipped_unsafe


def main() -> int:
    parser = argparse.ArgumentParser(description="Authorized-use Kubernetes scanner/remediator")
    parser.add_argument("--url", required=True, help="Kubernetes API server URL")
    parser.add_argument("--token", required=True, help="Bearer token")
    parser.add_argument("--namespace", default=None, help="Namespace to scan")
    parser.add_argument("--insecure", action="store_true", help="Disable TLS verification")
    parser.add_argument("--ca-file", default=None, help="CA certificate path")
    parser.add_argument("--out", default="revivek8s_report.json", help="Output JSON report")
    args = parser.parse_args()

    rk = ReviveK8s(
        api_url=args.url,
        token=args.token,
        namespace=args.namespace,
        insecure=args.insecure,
        ca_file=args.ca_file,
    )

    print_header(args.namespace)

    initial_findings = rk.scan()
    print_counts(rk.scan_summary)
    print_findings(initial_findings)

    initial_summary = summarize(initial_findings)
    initial_score = score_findings(initial_findings)
    print_summary_block(initial_summary, initial_score, "Initial")

    rem = rk.remediate()
    print_remediation(rem)

    rk.reset_counts()
    final_findings = rk.scan()
    resolved, pending_manual, skipped_unsafe = compare(initial_findings, final_findings)

    print("\n[RESCAN 3/3] Verification")
    print("-" * 64)
    print("Resolved findings:")
    if resolved:
        for item in resolved:
            print(f"  - {item}")
    else:
        print("  - None")

    print("\nStill pending manual approval:")
    if pending_manual:
        for item in pending_manual:
            print(f"  - {item}")
    else:
        print("  - None")

    print("\nSkipped as unsafe to automate:")
    if skipped_unsafe:
        for item in skipped_unsafe:
            print(f"  - {item}")
    else:
        print("  - None")
    print("-" * 64)

    final_summary = summarize(final_findings)
    final_score = score_findings(final_findings)
    print_summary_block(final_summary, final_score, "Final")
    print(f"Score improvement: +{final_score - initial_score}")

    print("\nOverall result:")
    print(f"  - Findings detected            : {len(initial_findings)}")
    print(f"  - Auto-fixed                   : {len(resolved)}")
    print(f"  - Pending manual approval      : {len(pending_manual)}")
    print(f"  - Skipped (unsafe to automate) : {len(skipped_unsafe)}")

    report = {
        "target_namespace": args.namespace,
        "scan_summary": rk.scan_summary,
        "initial": {
            "health_score": initial_score,
            "severity_summary": initial_summary,
            "findings": [asdict(f) for f in initial_findings],
        },
        "remediation": rem,
        "final": {
            "health_score": final_score,
            "severity_summary": final_summary,
            "resolved_findings": resolved,
            "pending_manual_approval": pending_manual,
            "skipped_unsafe_to_automate": skipped_unsafe,
        },
        "score_delta": final_score - initial_score,
    }

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\nArtifacts:")
    print(f"  - {args.out}")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
