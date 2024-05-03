# Clearance Frontend

"Clearance" is a tool for producing OSM extracts and keeping them up to date while respecting quality rules. It is based on partial and local updates. Rejected data groups must be corrected in OSM or accepted manually. OSM changes to be revised are handled collaboratively by interest groups.

![](./public/Clearance-process.svg)

Online demo : https://clearance-dev.teritorio.xyz

## Setup

Make sure to install the dependencies:

```bash
yarn install
```

## Development Server

Start the development server on `http://localhost:3000`

```bash
yarn dev
```

### Setup hooks

Ensure that `core.hooksPath` is properly setup !

From your project root run:

```bash
git config core.hooksPath .git/hooks/
```

Then update your hooks with the following command:

```bash
yarn dlx simple-git-hooks
```

### ESLint config inspector

[Docs](https://github.com/eslint/config-inspector)

```bash
npx @eslint/config-inspector
```
Visit http://localhost:7777/ to view and play with your ESLint config

### Setup Sentry

Add DSN key and environment in .env file.

```bash
NUXT_PUBLIC_SENTRY_DSN="FILL THIS OUT"
NUXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

## Production

Build the application for production:

```bash
yarn generate
yarn start

```

Locally preview production build:

```bash
yarn preview
```
