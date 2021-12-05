---
title: Documentation
---

## `async load(options)`

Loads data from a folder, returns structured information gathered from `.md` and `.json` files.

```js
const { json, pages } = await load();
```

-   `json` is an object with **key = filename** and **value = filename contents**
-   `pages` is an array of parsed markdown files, each with front matter (destructured at root level) merged with page body inside the `content` key

For instance the following folder:

```
data/
┣ blog/
┃ ┣ 01-this-is-a-blog-post.md
┃ ┗ 02-this-is-another-blog-post.md
┣ about.md
┣ contact.md
┣ config.json
┗ labels.json
```

Will be parsed as:

```js
{
    json: {
        config: { ... },
        labels: { ... }
    },
    pages: [
        {
            title: 'This is a blog post',
            slug: "blog/01-this-is-a-blog-post",
            content: ...
        },
        {
            title: 'This is another blog post',
            slug: "blog/02-this-is-another-blog-post",
            content: ...
        },
        {
            title: 'About',
            slug: "about",
            content: ...
        },
        {
            title: 'Contact',
            slug: "about",
            content: ...
        },
    ]
}
```

### Available options

#### `dataPath`

Path where to look for data.

**Default**: `process.cwd() + /data`.

## `async render(options)`

Generates the `.html` files.

### Available options

#### `pages`

An array of pages, ideally parsed via the `load()` method.

The only constraint is to contain a unique `slug` key, like:

```js
[
    {
        title: 'This is a blog post',
        slug: "blog/01-this-is-a-blog-post",
        content: ...
    },
    {
        title: 'This is another blog post',
        slug: "blog/02-this-is-another-blog-post",
        content: ...
    },
    ...
]
```

#### `viewsPath`

The folder containing the handlebars views.

**Default**: `path.join(process.cwd(), "src", "views")`.

#### `buildPath`

The folder that will contain the HTML output.

**Default**: `path.join(process.cwd(), "dist")`.

#### `domain`

The website domain, used in the handlebars helpers for generating URLs.

#### `uglyUrls`

If `true`, appends `.html` to generated URLs.

**Default**: `false`.

#### `locals`

An object that will be merged into `apps.locals` and be available to all handlebars templates.

#### `markdown`

Overrides the [default markdown configuration][marked], e.g.:

```js
render({
    ...
    markdown: {
        renderer: {
            image: (href, title, text) =>
                `<img class="lazy" data-src="${href}" alt="${text}"/>`,
        },
    }
})
```

#### `handlebars`

Contains the handlebars configurations and helpers, e.g.:

```js
render({
    ...
    handlebars: {
        helpers: {
            formatDate: (date) => date.toLocaleDateString(),
        },
    }
})
```

#### `sitemap`

Contains the sitemap configuration.

**Default**: `{ generate: false, template: 'sitemap' }`.

[marked]: https://github.com/markedjs/marked
