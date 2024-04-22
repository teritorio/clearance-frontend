ARG  NODE_VERSION
FROM node:${NODE_VERSION}

WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock /app/
RUN yarn install

COPY . .
RUN yarn install
RUN yarn build

EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
