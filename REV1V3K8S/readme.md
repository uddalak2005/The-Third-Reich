installl and run 


```bash
pip install kubernetes
python revivek8s.py --url https://your-cluster-api-server:6443 --token YOUR_BEARER_TOKEN --namespace ctf-lab --insecure
```


run with CA file

```
python revivek8s.py --url https://your-cluster-api-server:6443 --token YOUR_BEARER_TOKEN --namespace ctf-lab --ca-file /path/to/ca.crt
```
ReviveK8s is a Kubernetes security posture management tool that scans a cluster for risky misconfigurations, assigns a health score, applies safe runtime hardening fixes, and then rescans to prove measurable improvement.

It is designed for authorized cluster environments and focuses on practical cloud-native security problems such as privileged containers, privilege escalation settings, running workloads as root, writable root filesystems, secret-like values exposed in ConfigMaps or environment variables, and over-permissive RBAC. Instead of just listing issues, ReviveK8s classifies them into three action groups: auto-fixable, manual approval required, and not safe to automate.

The platform’s core value is that it does not stop at detection. It performs safe, deterministic remediations for workload hardening, clearly explains what was changed, how it was changed, and what was intentionally skipped to avoid breaking live systems. After remediation, it runs a verification pass and recalculates the cluster’s health score, giving teams a clear before-and-after view of their security posture.

In short, ReviveK8s helps teams scan, score, remediate, and verify Kubernetes security risks while balancing automation with operational safety.
