import test from "ava";
import path from "path";
import { dirname } from "dirname-filename-esm";
import { generateItems, clean, SuperStatic } from "../lib.js";
import { render } from "../../lib/index.js";

const __dirname = dirname(import.meta);

const buildPath = path.join(__dirname, "dist");

test.beforeEach(async () => await clean(buildPath));
test.afterEach(async () => await clean(buildPath));

const simplePages = [
    {
        title: "Home",
        slug: "index",
        template: "page",
        content: "This is a simple test",
    },
    {
        title: "Blog",
        slug: "blog",
        template: "blog-index",
    },
];

const simpleNav = [
    {
        title: "Home",
        slug: "index",
        link: "/",
    },
    {
        title: "Blog",
        slug: "/blog",
    },
];

test.serial("e2e  - simple", async (t) => {
    const viewsPath = path.join(__dirname, "..", "common", "views");
    const pages = generateItems(10);
    const posts = pages.filter((x) => x.slug.startsWith("blog"));

    await render({
        buildPath,
        viewsPath,
        logLevel: "silent",
        pages: [...simplePages, ...pages],
        locals: {
            posts,
            config: { nav: simpleNav },
        },
    });

    const ss = new SuperStatic({ buildPath });
    await ss.load();

    t.is(ss.pageCount(), pages.length + 2);
    posts.map((x) => t.true(ss.hasPage(`${x.slug}.html`)));
    t.true(ss.hasPage("index.html"));
    t.true(ss.hasPage("blog.html"));

    t.is(ss.getPage("index.html").$("nav .current").html(), "Home");
    t.is(ss.getPage("blog.html").$("nav .current").html(), "Blog");
});

test.serial("e2e  - simple - uglyUrls", async (t) => {
    const viewsPath = path.join(__dirname, "..", "common", "views");
    const pages = generateItems(10);
    const posts = pages.filter((x) => x.slug.startsWith("blog"));

    await render({
        buildPath,
        viewsPath,
        uglyUrls: true,
        logLevel: "silent",
        pages: [...simplePages, ...pages],
        locals: {
            posts,
            config: { nav: simpleNav },
        },
    });

    const ss = new SuperStatic({ buildPath });
    await ss.load();

    t.is(ss.pageCount(), pages.length + 2);
    posts.map((x) => t.true(ss.hasPage(`${x.slug}.html`)));
    t.true(ss.hasPage("index.html"));
    t.true(ss.hasPage("blog.html"));

    t.is(ss.getPage("index.html").$("nav .current").html(), "Home");
    t.is(ss.getPage("blog.html").$("nav .current").html(), "Blog");
});
