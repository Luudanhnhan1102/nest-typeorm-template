## Installation

```bash
$ npm install
```

## Running the app

```bash
# config env
cp .env.example .env
```
| Variable | Explanation | Required | Default |
| ------------- | --- | ------------- | --- |
| SERVER_PORT | Container port | Yes | 3200 | 
| REDIS_STANDALONE_HOST | Redis standalone host | Optional | localhost |
| REDIS_STANDALONE_PORT | Redis standalone port | Optional | 6379 |
| REDIS_CLUSTER_HOST | Redis cluster host, if it's configured, redis cluster will be used although redis standalone is configured or not | Optional | 
| REDIS_CLUSTER_PORT | Redis standalone port | Optional |
| SWAGGER_USERNAME | Swagger basic authentication user | Yes |
| SWAGGER_USERNAME | Swagger basic authentication password | Yes |
| SERVER_HOSTNAME | Host name this server running | Yes | 127.0.0.1:3200 |
| SERVER_TIMEZONE | Server timezone | Optional | UTC |
| AUTH_SALT | Salt to sign jwt token | Optional | 10 |
| AUTH_JWT_SECRET_KEY | Secret to sign access token | Yes |
| AUTH_JWT_EXPIRE_TIME | Access token expiry time | Optional | 1d |
| AUTH_REFRESH_TOKEN_SECRET_KEY | Secret to sign refresh token | Yes |
| AUTH_REFRESH_TOKEN_EXPIRE_TIME | Refresh token expiry time | Optional | 7d |


### Run directly
## Create logs folder
```bash
mkdir logs
```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Run with Docker
## Create docker-logs folder
```bash
mkdir docker-logs
```

## Run with production mode
docker-compose -f docker-compose.yml up --build  -d 

## Run with development mode
docker-compose -f docker-compose.dev.yml up --build  -d 
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Mock
### Generate admin
```bash
$ npm run build &&  npm run generate-admin -- --email={email} --password={password} 
```



