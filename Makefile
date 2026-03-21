IMAGE_NAME    := sentinel-console
CONTAINER_NAME := sentinel-console-app
DEV_IMAGE_NAME    := sentinel-console-dev
DEV_CONTAINER_NAME := sentinel-console-dev-app
PORT          := 5173
CONSOLE_DIR   := ./Console

.PHONY: build run up stop restart logs clean prune dev dev-stop help

## dev     : Build the dev image and start Vite dev server with HMR (source mounted)
dev:
	docker build -f $(CONSOLE_DIR)/Dockerfile.dev -t $(DEV_IMAGE_NAME) $(CONSOLE_DIR)
	docker run -d \
		--name $(DEV_CONTAINER_NAME) \
		-p $(PORT):$(PORT) \
		-v "$(CURDIR)/$(CONSOLE_DIR):/app" \
		-v /app/node_modules \
		$(DEV_IMAGE_NAME)
	@echo "Dev server running at http://localhost:$(PORT) (HMR enabled)"

## dev-stop: Stop and remove the dev container
dev-stop:
	-docker stop $(DEV_CONTAINER_NAME)
	-docker rm   $(DEV_CONTAINER_NAME)
	@echo "Dev container stopped."

## build  : Build the production Docker image from Console/Dockerfile
build:
	docker build -t $(IMAGE_NAME) $(CONSOLE_DIR)

## run    : Run the container (detached) — assumes image already built
run:
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):$(PORT) \
		--restart unless-stopped \
		$(IMAGE_NAME)
	@echo "Console is running at http://localhost:$(PORT)"

## up     : Build the image and start the container in one step
up: build run

## stop   : Stop and remove the running container
stop:
	-docker stop $(CONTAINER_NAME)
	-docker rm   $(CONTAINER_NAME)
	@echo "Container stopped and removed."

## restart: Stop then rebuild and start fresh
restart: stop up

## logs   : Tail live logs from the running container
logs:
	docker logs -f $(CONTAINER_NAME)

## clean  : Stop container and delete the local image
clean: stop
	-docker rmi $(IMAGE_NAME)
	@echo "Image removed."

## prune  : Full cleanup — remove container, image, and dangling build cache
prune: clean
	docker builder prune -f
	@echo "Build cache pruned."

## help   : List all available targets
help:
	@grep -E '^##' Makefile | sed 's/## /  make /'
