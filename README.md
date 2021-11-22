# Goffre - Mini static site generator

[![Run tests](https://github.com/moonwave99/goffre/actions/workflows/tests.yml/badge.svg)](https://github.com/moonwave99/goffre/actions/workflows/tests.yml)

## Installation

```bash
$ npm install goffre --save
```

## Basic Usage

```js
import path from "path";
import { load, render } from "goffre";

// dist folder
const buildPath = path.join(__dirname, "dist");
// data folder with markdown files
const dataPath = path.join(__dirname, "data");
// source folder with handlebars views
const sitePath = path.join(__dirname, "src", "site");

(async () => {
    console.log(`Getting data from ${dataPath}:`);
    const { pages } = await load({ dataPath });

    try {
        const results = await render({
            buildPath,
            sitePath,
            pages,
        });
        console.log(`Generated ${results.length} pages`);
    } catch (error) {
        console.log("Error generating site", error);
    }
})();
```

See the [example](tree/main/example) folder for a more advanced use case.
