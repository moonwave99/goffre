# Goffre

Goffre is a minimal static site generator available to the **node.js** ecosystem.

It uses [handlebars][handlebars] as templating system and [markdown + frontmatter][mdfront] as data layer, or whatever you decide to pass to `render()`.

## Installation

```bash
$ npm install goffre --save
```

## Basic Usage

```js
import { load, render } from "goffre";

(async () => {
    const { pages } = await load();

    try {
        const results = await render({ pages });
        console.log(`Generated ${results.length} pages`);
    } catch (error) {
        console.log("Error generating site", error);
    }
})();
```

Default paths:

-   **markdown files**: `./data` - used by `load()`
-   **output folder**: `./dist` - used by `render()`
-   **handlebars views**: `./src/views` - used by `render()`

See [examples](#examples) for a more advanced use case, and the [documentation][docs] for the complete reference.

## Data collecting and rendering are separate steps

This is the key for the maximum flexibility: `load()` gets all the `.md` files inside the data folder, and populates its return `pages` each with a unique `slug`.

The markdown body is available in the `content` key, and the YAML front matter is destructured - the output of `load()` of the following file:

```yaml
---
title: "Goffre | Mini static site generator"
slug: "index"
---
Goffre is a minimal static site generator available to the **node.js** ecosystem.
```

will be:

```js
{
    title: "Goffre | Mini static site generator",
    slug: "index",
    content: "Goffre is a minimal static site generator available to the **node.js** ecosystem."
}
```

**Note:** the markdown body is not yet parsed at this stage.

The `render()` method writes then every incoming page to `{page.slug}.html` - you can add further pages to the collected ones, like the text you are reading from the main `README.md` file of the repository:

```js
const { pages } = await load({ dataPath });
const results = await render({
    buildPath,
    sitePath,
    pages: [
        ...pages,
        {
            title: "Goffre | Mini static site generator",
            description:
                "Goffre is a minimal static site generator available to the node.js ecosystem.",
            slug: "index",
            content: await readFile(path.join("..", "README.md"), "utf8"),
        },
    ],
});
```

## For a better development experience

Goffre does not provide any watching / serving features out of the box, but don't worry.

**Serving**: if you use [webpack][webpack] for bundling the frontend CSS and JS, just use its [dev server][webpack-dev-server] - see the [configuration file for this very page][webpack-config] as reference. If you don't, a simple [http-server][http-server] will do.

**Watching**: use [nodemon][nodemon] to watch the _generation script_, the _data folder_ and the _handlebars views folder_:

```bash
$ nodemon -e js,json,md,handlebars --watch index.js --watch data --watch src/views
```

The scripts of `package.json` will look more or less like:

```json
{
    "clean": "rm -rf dist",
    "dev:client": "webpack serve --mode development",
    "dev:site": "nodemon -e js,json,md,handlebars --watch index.js --watch data --watch src/views",
    "build:client": "webpack --mode production",
    "build:site": "node index.js"
}
```

Just `npm run dev:client` and `npm run dev:site` in two terminal tabs and you are done. Don't forget to `npm install` the needed dependencies of course!

## Examples

-   [devblog][examples-devblog] - a personal website with blog posts and project pages
-   this page of course

[handlebars]: https://handlebarsjs.com/
[express-handlebars]: https://www.npmjs.com/package/express-handlebars
[mdfront]: https://www.google.com/search?q=markdown+frontmatter
[webpack]: https://webpack.js.org/
[webpack-dev-server]: https://webpack.js.org/configuration/dev-server/
[http-server]: https://www.npmjs.com/package/http-server
[nodemon]: https://www.npmjs.com/package/nodemon
[example]: https://github.com/moonwave99/goffre/tree/main/examples/devblog
[docs]: https://github.com/moonwave99/goffre/tree/main/examples/devblog
[webpack-config]: https://github.com/moonwave99/goffre/blob/main/homepage/webpack.config.cjs
[examples-devblog]: https://goffre-examples-devblog.netlify.app/
