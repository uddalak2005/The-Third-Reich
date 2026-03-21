# AgentGuard Dockerfile
# ======================================================
# Two interception modes, auto-detected at startup:
#
#   Proxy mode  — works on Windows / Docker Desktop / any host
#                 Transparent HTTP proxy on port 8888
#                 HTTP_PROXY=http://localhost:8888
#
#   CO-RE mode  — real Linux + BPF support
#                 Drop agent_guard.bpf.o into the image to enable

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libbpf0 libelf1 zlib1g                   \
    python3.11 python3-pip                    \
    iproute2 iputils-ping                     \
    curl jq procps                            \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install all Python dependencies
COPY backend/requirements.txt  ./backend-requirements.txt
COPY ag_proxy/requirements.txt ./proxy-requirements.txt
RUN pip3 install --no-cache-dir -r backend-requirements.txt -r proxy-requirements.txt

# Copy source
COPY backend/   ./backend/
COPY ag_proxy/  ./ag_proxy/
COPY sdk/       ./sdk/
COPY demo/      ./demo/
COPY policy.yaml .

# Create logs directory for audit log
RUN mkdir -p /app/logs

VOLUME ["/sys/fs/bpf", "/app/logs"]

EXPOSE 8080 8888

ENTRYPOINT ["sh", "-c", "exec python3 backend/policy_daemon.py \
  --config     ${AGENTGUARD_CONFIG:-policy.yaml} \
  --iface      ${AGENTGUARD_IFACE:-eth0} \
  --bpf-obj    ${AGENTGUARD_BPF_OBJ:-agent_guard.bpf.o} \
  --host       ${AGENTGUARD_HOST:-0.0.0.0} \
  --port       ${AGENTGUARD_PORT:-8080} \
  --proxy-port ${AGENTGUARD_PROXY_PORT:-8888}"]
