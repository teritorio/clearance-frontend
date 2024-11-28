# Set ARG variables with default values
ARG NODE_VERSION=${NODE_VERSION:-20.13.1}
ARG ALPINE_VERSION=${ALPINE_VERSION:-3.19}

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

ENV NODE_ENV=production

# Set working directory
WORKDIR /src

# Install Yarn v2 (Berry)
RUN corepack enable

# Build
FROM base AS build

# Copy necessary files for dependency installation
COPY package.json yarn.lock .yarnrc.yml ./

# Install project dependencies
RUN yarn install --immutable

COPY . ./

# Build Nuxt app for production
RUN yarn build

# Run
FROM base

COPY --from=build /src/.output /src/.output

# Expose production port
EXPOSE 3000

# Start Nuxt in production mode
CMD ["node", ".output/server/index.mjs"]
