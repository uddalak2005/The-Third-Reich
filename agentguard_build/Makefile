

.PHONY: build test test-unit test-sim observe docker clean

#Build
build:
	clang -O2 -g -target bpf \
		-D__TARGET_ARCH_x86 \
		-I/usr/include/x86_64-linux-gnu \
		-I/usr/include \
		kernel/agent_guard.bpf.c \
		-o kernel/agent_guard.bpf.o
	@echo "[✓] BPF object compiled: kernel/agent_guard.bpf.o"

docker:
	docker build -t agentguard .
	@echo "[✓] Docker image built: agentguard"

#Attach/Detach 
IFACE ?= eth0

attach:
	sudo ip link set dev $(IFACE) xdp obj kernel/agent_guard.bpf.o \
		sec xdp/ingress generic
	sudo tc qdisc add dev $(IFACE) clsact 2>/dev/null || true
	sudo tc filter add dev $(IFACE) egress bpf da \
		obj kernel/agent_guard.bpf.o sec tc/egress
	sudo tc filter add dev $(IFACE) ingress bpf da \
		obj kernel/agent_guard.bpf.o sec tc/ingress
	@echo "[✓] eBPF programs attached to $(IFACE)"

detach:
	sudo ip link set dev $(IFACE) xdp off 2>/dev/null || true
	sudo tc qdisc del dev $(IFACE) clsact 2>/dev/null || true
	@echo "[✓] eBPF programs detached from $(IFACE)"

#Run daemon
daemon:
	sudo python3 daemon/policy_daemon.py \
		--config policy.yaml \
		--iface $(IFACE) \
		--bpf-obj kernel/agent_guard.bpf.o

#Observability
observe:
	python3 observability/observe.py

observe-stream:
	python3 observability/observe.py --stream

observe-threats:
	python3 observability/observe.py --stream --threats-only

report:
	python3 observability/observe.py --report --out agentguard_report.json
	@echo "[✓] Report: agentguard_report.json"

metrics:
	python3 observability/observe.py --metrics-port 9090 &
	@echo "[✓] Prometheus metrics at :9090/metrics"

#Tests
install-test-deps:
	pip install pytest rich requests flask pyyaml structlog prometheus-client

test:
	python3 -m pytest tests/test_agentguard.py -v

test-unit:
	python3 -m pytest tests/test_agentguard.py -v \
		-k "not integration and not kernel"

test-sim:
	python3 tests/simulate_traffic.py --self-test --verbose

test-scenario:
	@echo "Usage: make test-scenario SCENARIO=prompt_injection"
	python3 tests/simulate_traffic.py --scenario $(SCENARIO) --verbose

test-all: test test-sim
	@echo "[✓] All tests complete"

inject:
	python3 tests/simulate_traffic.py \
		--inject --daemon http://localhost:8080 --rate 3

#Utils
clean:
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	rm -f kernel/agent_guard.bpf.o
	rm -f agentguard_report.json agentguard_report.csv
	@echo "[✓] Cleaned"

help:
	@echo ""
	@echo "AgentGuard — AI Agent Traffic Interception Framework"
	@echo "====================================================="
	@echo ""
	@echo "  make build           Compile BPF kernel object"
	@echo "  make docker          Build Docker image"
	@echo "  make attach          Attach eBPF to interface (IFACE=eth0)"
	@echo "  make detach          Detach eBPF from interface"
	@echo "  make daemon          Run policy daemon (requires root)"
	@echo ""
	@echo "  make observe         Live TUI dashboard"
	@echo "  make observe-stream  Raw event stream"
	@echo "  make observe-threats Threat events only"
	@echo "  make report          Generate JSON report"
	@echo "  make metrics         Start Prometheus exporter on :9090"
	@echo ""
	@echo "  make test            Run unit tests"
	@echo "  make test-sim        Run traffic simulation scenarios"
	@echo "  make test-all        Run everything"
	@echo "  make inject          Inject synthetic events into live daemon"
	@echo ""
	@echo "  IFACE=eth0 (override with IFACE=ens3, IFACE=wlan0, etc.)"
	@echo ""
