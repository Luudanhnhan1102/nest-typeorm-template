ARG NODE_VERSION=22-alpine

#1 base
FROM node:${NODE_VERSION} as base
RUN apk add --no-cache make gcc g++ python3 && \
    npm rebuild bcrypt --build-from-source && \
    apk del make gcc g++ python3

#2 server-dev to install devDependencies
FROM base As server-builder
ARG DIR=/usr/src/app
WORKDIR ${DIR}
COPY package*.json ./
COPY . .
RUN npm ci
RUN npm run build

#3 server-prod to install prodDependencies and run
FROM base as server-prod
ARG DIR=/usr/src/app
WORKDIR ${DIR}
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
USER node
COPY --from=server-builder ${DIR}/dist ./dist
COPY --from=server-builder ${DIR}/config ./config

CMD [ "node", "dist/main.js" ]
