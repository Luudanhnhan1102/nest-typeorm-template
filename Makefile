migration-generate:
	npm run migration:migrate --name=$(name)

migration-run:
	npm run migration:run

migration-revert:
	npm run migration:revert

generate-admin:
	npm run generate-admin -- --email=$(email) --password=$(password)
	
docker-dev-start:
	rm -rf docker-logs && mkdir docker-logs && docker-compose -f docker-compose.dev.yml up -d --build

docker-dev-stop:
	docker-compose -f docker-compose.dev.yml down

docker-dev-generate-admin:
	docker-compose -f docker-compose.dev.yml exec -it api-beyond-blood sh -c "npm run generate-admin -- --email=$(email) --password=$(password)"

docker-dev-start-redis-mysql:
	docker-compose -f docker-compose.dev.yml up -d redis mysql

docker-dev-stop-redis-mysql:
	docker-compose -f docker-compose.dev.yml down redis mysql

docker-dev-start-api:
	docker-compose -f docker-compose.dev.yml up -d --build api-beyond-blood

docker-dev-stop-api:
	docker-compose -f docker-compose.dev.yml down api-beyond-blood

deploy-s45:
	rsync -avhzL --delete \
		--no-perms --no-owner --no-group \
		--exclude .git \
		--filter=":- .gitignore" \
		. sotatek@172.16.200.45:/home/sotatek/Projects/api-beyond-blood
