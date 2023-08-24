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
