# Clearance Frontend

"Clearance" is a tool for producing OpenStreetMap data extracts and keeping them up to date while respecting quality rules.

[Online Clearance Demo](https://clearance.teritorio.xyz)

## What Clearance Is
It is based on partial and local updates incoming from OpenStreetMap changes. Changes may be rejected as not respecting quality rules. Thus, data must be fixed in OpenStreetMap, or accepted as is. This project helps to review the rejected data and accept changes when considered OK.

See on the [Clearance project](https://github.com/teritorio/clearance?tab=readme-ov-file#What-Clearance-Does-and-How-It-Works) how it works.

![Clearance process overview](./public/Clearance-process.svg)

## Clearance Projects
The frontend home page lists all available projects. A project is a community based on a territory and a theme, sharing the same interest and agreeing to share the work of maintaining quality on some OpenStreetMap object types with the same quality rule set.

Each project contains a number of OpenStreetMap objects not complying with the quality rules and to be reviewed.

Each project also has a lag update delay, denoting when the last update from the original OpenStreetMap occurred. Extracts for OpenStreetMap FR are updated minutely and extracts from Geofabrik are updated daily.

## Changed Objects to Review
Each project's details list OpenStreetMap changes to be reviewed according to the thematic interest and quality rules defined by the project configuration. Changes not targeted by rules or out of the area of interest are applied silently.

The changed objects may be filtered by thematic, OpenStreetMap contributing users...

The changes are spatially grouped, also known as LoCha. The validation should be done at the LoCha level to ensure local consistency.

For each object, there is a report of geometry and tags before (the current valid state) and after (the incoming changes from original OpenStreetMap). It may contain information about OpenStreetMap users contributing the changes and information about why quality rules have rejected the changes.

When the incoming state is not desirable, the data should be fixed in the original OpenStreetMap. Then, wait for the next update from OpenStreetMap.

If after the incoming update from OpenStreetMap the data now complies with the quality rules, the objects will disappear automatically from the review list.

In case the incoming changes from OpenStreetMap are desirable, the data can be accepted manually with the blue check button ✓. Only logged-in users with write access to the project can consider accepting incoming data manually.

## Installation

### Requirements

- [Docker](https://docs.docker.com/get-docker/)

### Common Setup

Copy and configure the environment file (required for both dev and production):

```bash
cp .env.template .env # Set your variables accordingly
```

### Development

The dev workflow includes a Caddy reverse proxy for OSM OAuth support.

#### One-time setup

1. Install [mkcert](https://github.com/FiloSottile/mkcert) and generate a local certificate:
   ```bash
   sudo pacman -S mkcert   # Arch Linux
   mkcert -install         # installs the local CA in system trust stores
   mkdir .certs
   mkcert -cert-file .certs/cert.pem -key-file .certs/key.pem clearance-dev.teritorio.xyz
   ```

2. Add to `/etc/hosts`:
   ```
   127.0.0.1 clearance-dev.teritorio.xyz
   ```

#### Each session

```bash
yarn dev
```

Then open `https://clearance-dev.teritorio.xyz` in your browser.

Caddy routes `/api/*` and `/users/*` to the remote clearance-dev server and everything else to the Nuxt dev server (with hot module replacement).

#### ESLint config inspector

[Docs](https://github.com/eslint/config-inspector)

```bash
npx @eslint/config-inspector
```
Visit http://localhost:7777/ to view and play with your ESLint config

#### Setup Sentry

Add DSN key and environment in `.env`:

```bash
NUXT_PUBLIC_SENTRY_DSN="FILL THIS OUT"
NUXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

### Production

Build and run with Docker Compose:

```bash
docker compose up
```
