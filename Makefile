BUILD_DIR := build

build = node_modules/.bin/tsc
nodemon = node_modules/.bin/nodemon
tsnode = node_modules/.bin/ts-node
tslint = node_modules/.bin/tslint
before-build = $(BUILD_DIR)/node_modules
jest = node_modules/.bin/jest
webpack = node_modules/.bin/parallel-webpack

$(BUILD_DIR)/node_modules:
	mkdir -p $@
	ln -s ../server/src/app $@

.PHONY: deps
deps:
	npm install

.PHONY: prune
prune:
	npm prune --production

.PHONY: validate
validate: lint

.PHONY: lint
lint:
	$(tslint) -p ./front/tsconfig.json -c ./front/tslint.json -t codeFrame './front/src/client/**/*.{ts,tsx}'
	$(tslint) -p ./front/tsconfig.json -c ./front/tslint.json -t codeFrame './front/src/admin/**/*.{ts,tsx}'
	$(tslint) -p ./server/tsconfig.json -c ./server/tslint.json -t codeFrame './server/src/app/**/*.ts'
	$(tslint) -p ./server/tsconfig.json -c ./server/tslint.json -t codeFrame './server/src/tests/**/*.ts'

.PHONY: clean
clean:
	rm -rf $(BUILD_DIR)

.PHONY: build-client
build-client:
	$(webpack) --config ./front/webpack.config.ts

.PHONY: build-client-watch
build-client-watch:
	$(webpack) --watch --config ./front/webpack.config.ts

.PHONE: build-client-production
build-client-production:
	$(webpack) --config ./front/webpack.config.ts -- --mode=production

.PHONY: dev
dev:
	$(nodemon) --exec " \
		$(tsnode) --files=true -r tsconfig-paths/register \
			--project ./server/tsconfig.json \
			./server/src/app/app.ts" \
	-w ./server/src \
	-e ts

.PHONY: build-server
build-server: $(before-build)
	$(build) -p ./server/tsconfig.json

.PHONE: build-server-production
build-server-production: $(before-build)
	$(build) -p ./server/tsconfig-production.json

.PHONY: test
test: run-test-integration

.PHONY: run-test-integration
run-test-integration: fill-db
	@echo Run integration tests...
	@NODEJS_ENV=tests \
		$(jest) --forceExit --runTestsByPath $(BUILD_DIR)/src/tests/integration/**/*.test.js

.PHONY: fill-db
fill-db: clean build-server
	@echo Run fill db...
	@NODEJS_ENV=tests \
		node $(BUILD_DIR)/src/tests/integration/helpers/fill.js

DOCKER_HUB = cr.yandex/crpn0q4tiksugq5qds8d/ubuntu
get-version = node -p "require('./package.json').name + '_' + require('./package.json').version"
DOCKER_IMAGE_VERSION = $(call get-version)

.PHONY: docker-login
docker-login:
	docker login --username oauth --password ${YANDEX_CLOUD_OAUTH_TOKEN} cr.yandex

.PHONY: docker-build
docker-build:
	docker build -t ${DOCKER_HUB}:$(shell $(DOCKER_IMAGE_VERSION)) .

.PHONY: docker-push
docker-push:
	docker push ${DOCKER_HUB}:$(shell $(DOCKER_IMAGE_VERSION))

.PHONY: docker-pull
docker-pull:
	docker pull ${DOCKER_HUB}:$(shell $(DOCKER_IMAGE_VERSION))

.PHONY: docker-echo
docker-echo:
	echo ${DOCKER_HUB}:$(shell $(DOCKER_IMAGE_VERSION))
