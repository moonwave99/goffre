# Goffre Example Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/b5a70fda-1026-432a-96fd-4ea8824ca532/deploy-status)](https://app.netlify.com/sites/goffre-example-page/deploys)

Live demo: https://goffre-example-page.netlify.app/

## Installation

```bash
$ npm install
```

If you want to generate some data, run:

```bash
$npm run dev:generate posts <qty>
$npm run dev:generate projects <qty>
```

## Development

Run in dev mode - in two separate tabs:

```bash
$ npm run dev:client
$ npm run dev:site
```

## Build

Build for production - run sequentially:

```bash
$ npm run build:client
$ npm run build:site
```
