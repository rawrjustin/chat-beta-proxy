# Service information
#----------------------------------------------------------------------
SERVICE_NAME=genies-admin

# Build information
#----------------------------------------------------------------------
SERVER_PORT := 3000
SHELL := bash

IMAGE_URL := ${SERVICE_NAME}${DEPLOY_ENV}
COMMIT_SHA:=$(shell git rev-parse --short=8 HEAD)

#----------------------------------------------------------------------
# DEV COMMANDS
#----------------------------------------------------------------------
.PHONY: run-local
run-local: GENIES_CONFIG := local
run-local: set-env
	next dev -p ${SERVER_PORT}

.PHONY: run-container
run-container:
	docker run -p ${SERVER_PORT}:${SERVER_PORT} ${IMAGE_URL}:${COMMIT_SHA}

# Choose the environment configs to pull from /env to root.
.PHONY: set-env
set-env:
	rm -f ./.env
	cp ./env/.env.${GENIES_CONFIG} .env

#----------------------------------------------------------------------
# CI COMMANDS
#----------------------------------------------------------------------

.PHONY: install
install:
	npm ci

.PHONY: build
build:
	npm run build

.PHONY: containerize
containerize:
	npm prune --production && docker build -f ./Dockerfile -t ${IMAGE_URL}:${COMMIT_SHA} -t ${IMAGE_URL}:latest .

.PHONY: push
push:
	@docker push ${IMAGE_URL}:${BRANCH_NAME}
	@docker push ${IMAGE_URL}:${COMMIT_SHA}
	@docker push ${IMAGE_URL}:latest

.PHONY: deploy-qa
deploy-qa: update-deployment-image apply-qa-files

.PHONY: deploy-staging
deploy-staging: update-deployment-image apply-staging-files

.PHONY: deploy-production
deploy-production: update-deployment-image apply-prod-files

# Deployment YAMLs must have 'deployment' in their name.
.PHONY: update-deployment-image
update-deployment-image: CONTAINER=genies-app
update-deployment-image:
	@files=$$(find ${K8S_YAMLS_LOCATION} -type f \( -name "*.yml" -or -name "*.yaml" \) | grep deployment); \
	for i in $$files; do \
		patched=`openssl rand -hex 8`; \
		kubectl patch -f $$i -p '{"spec":{"template":{"spec":{"containers":[{"name":"${CONTAINER}","image":"${IMAGE_URL}:${COMMIT_SHA}"}]}}}}' --local -o yaml > $$patched; \
		mv -f $$patched $$i; \
	done

# QA YAMLs must have 'qa' in their name.
.PHONY: apply-qa-files
apply-qa-files: QA_YAMLS := ${K8S_YAMLS_LOCATION}/qa
apply-qa-files:
	files=$$(find ${QA_YAMLS} -type f \( -name "*.yml" -or -name "*.yaml" \)); \
	echo "$$files" | xargs -I {} kubectl --kubeconfig=$(KUBECONFIG) apply -f {}	

# Staging YAMLs must have 'staging' in their name.
.PHONY: apply-staging-files
apply-staging-files: STAGING_YAMLS := ${K8S_YAMLS_LOCATION}/staging
apply-staging-files:
	files=$$(find ${STAGING_YAMLS} -type f \( -name "*.yml" -or -name "*.yaml" \)); \
	echo "$$files" | xargs -I {} kubectl --kubeconfig=$(KUBECONFIG) apply -f {}

# Production YAMLs must have 'production' in their name.
.PHONY: apply-prod-files
apply-prod-files: PROD_YAMLS := ${K8S_YAMLS_LOCATION}/production
apply-prod-files:
	files=$$(find ${PROD_YAMLS} -type f \( -name "*.yml" -or -name "*.yaml" \)); \
	echo "$$files" | xargs -I {} kubectl --kubeconfig=$(KUBECONFIG) apply -f {}

# Required for container scanning
.PHONY: container-scan-build 
container-scan-build:
	docker build --build-arg ENV_FILE=${ENV_FILE} . -t genies-admin/${GITHUB_REF}:scan 

.PHONY: docker-build 
docker-build:
	docker build --build-arg ENV_FILE=${ENV_FILE} . -t ${REGISTRY}/${SERVICE}:${ENV}-${RELEASE_VERSION} -t ${REGISTRY}/${SERVICE}:${ENV}-${BRANCH_NAME}
