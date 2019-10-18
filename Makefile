help:
	echo "COMMANDS: help, test, start, stop"

test:
	# Build and run tests
	docker-compose run node sh -c "npm install && npm run test && npm run test:e2e"
	docker-compose down

start:
	# start proxy in a docker container
	docker-compose up -d

stop:
	# stop proxy
	docker-compose down