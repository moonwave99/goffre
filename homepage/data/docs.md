---
title: Goffre | Documentation
---

## `load(options)`

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

Available options:

### `dataPath`

Path where to look for data.

**Default**: `process.cwd() + /data`.

## `render(options)`

Generates the `.html` files.
