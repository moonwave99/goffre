import test from "ava";
import path from "path";
import { dirname } from "dirname-filename-esm";
import { generateItems, clean, SuperStatic } from "./lib";
import { render, getSlug } from "../lib/goffre";

const __dirname = dirname(import.meta);

const buildPath = path.join(__dirname, "simple", "dist");
const viewsPath = path.join(__dirname, "views");

test.beforeEach(() => clean(buildPath));
test.afterEach(() => clean(buildPath));

const pages = [
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

const nav = [
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

test.serial("e2e - simple", async (t) => {
  const posts = generateItems(10);
  const domain = "https://example.com";

  await render({
    buildPath,
    viewsPath,
    logLevel: "silent",
    pages: [...pages, ...posts],
    locals: {
      posts,
      config: { nav },
    },
    sitemap: {
      generate: true,
    },
    domain,
  });

  const ss = new SuperStatic({ buildPath });
  await ss.load();

  // total page count
  t.is(ss.pageCount(), posts.length + pages.length);

  // link generation
  t.is(ss.getPage("index.html").$("nav .index").attr("href"), "/");
  t.is(ss.getPage("index.html").$("nav .blog").attr("href"), "/blog");

  // simple pages: existence, right nav class
  pages.forEach((page) => {
    const fileName = `${getSlug(page.slug, page)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$("nav .current").html(), page.title);
    t.is(
      ss.getPage(fileName).$('link[rel="sitemap"]').attr("href"),
      `${domain}/sitemap.xml`,
    );
  });

  // posts: existence, right title
  posts.forEach((post) => {
    const fileName = `${getSlug(post.slug, post)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$("h1").html(), post.title);
  });
});

test.serial("e2e - simple - uglyUrls", async (t) => {
  const posts = generateItems(10);

  await render({
    buildPath,
    viewsPath,
    uglyUrls: true,
    logLevel: "silent",
    pages: [...pages, ...posts],
    locals: {
      posts,
      config: { nav },
    },
  });

  const ss = new SuperStatic({ buildPath });
  await ss.load();

  // total page count
  t.is(ss.pageCount(), posts.length + pages.length);

  // link generation
  t.is(ss.getPage("index.html").$("nav .index").attr("href"), "/index.html");
  t.is(ss.getPage("index.html").$("nav .blog").attr("href"), "/blog.html");

  // simple pages: existence, right nav class
  pages.forEach((page) => {
    const fileName = `${getSlug(page.slug, page)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$("nav .current").html(), page.title);
  });

  // posts: existence, right title
  posts.forEach((post) => {
    const fileName = `${getSlug(post.slug, post)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$("h1").html(), post.title);
  });
});

test.serial("e2e - simple - prod", async (t) => {
  const posts = generateItems(10);
  const domain = "https://example.com";

  await render({
    buildPath,
    viewsPath,
    logLevel: "silent",
    domain,
    pages: [...pages, ...posts],
    locals: {
      posts,
      config: { nav },
    },
    env: {
      mode: "prod",
    },
  });

  const ss = new SuperStatic({ buildPath });
  await ss.load();

  // total page count
  t.is(ss.pageCount(), posts.length + pages.length);

  // link generation
  t.is(ss.getPage("index.html").$("nav .index").attr("href"), `${domain}/`);
  t.is(ss.getPage("index.html").$("nav .blog").attr("href"), `${domain}/blog`);

  // simple pages: existence, right nav class
  pages.forEach((page) => {
    const fileName = `${getSlug(page.slug, page)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$("nav .current").html(), page.title);
  });

  // posts: existence, right title
  posts.forEach((post) => {
    const fileName = `${getSlug(post.slug, post)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$("h1").html(), post.title);
  });
});

test.serial("e2e - simple - prod - uglyurls", async (t) => {
  const posts = generateItems(10);
  const domain = "https://example.com";

  await render({
    buildPath,
    viewsPath,
    uglyUrls: true,
    logLevel: "silent",
    domain,
    pages: [...pages, ...posts],
    locals: {
      posts,
      config: { nav },
    },
    env: {
      mode: "prod",
    },
  });

  const ss = new SuperStatic({ buildPath });
  await ss.load();

  // total page count
  t.is(ss.pageCount(), posts.length + pages.length);

  // link generation
  t.is(
    ss.getPage("index.html").$("nav .index").attr("href"),
    `${domain}/index.html`,
  );
  t.is(
    ss.getPage("index.html").$("nav .blog").attr("href"),
    `${domain}/blog.html`,
  );

  // simple pages: existence, right nav class
  pages.forEach((page) => {
    const fileName = `${getSlug(page.slug, page)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$("nav .current").html(), page.title);
  });

  // posts: existence, right title
  posts.forEach((post) => {
    const fileName = `${getSlug(post.slug, post)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$("h1").html(), post.title);
  });
});

test.serial("e2e - simple - prod in subfolder", async (t) => {
  const posts = generateItems(10);
  const domain = "https://example.com/subfolder";

  await render({
    buildPath,
    viewsPath,
    logLevel: "silent",
    domain,
    pages: [...pages, ...posts],
    locals: {
      posts,
      config: { nav },
    },
    env: {
      mode: "prod",
    },
  });

  const ss = new SuperStatic({ buildPath });
  await ss.load();

  // total page count
  t.is(ss.pageCount(), posts.length + pages.length);

  // link generation
  t.is(ss.getPage("index.html").$("nav .index").attr("href"), `${domain}/`);
  t.is(ss.getPage("index.html").$("nav .blog").attr("href"), `${domain}/blog`);

  // simple pages: existence, right nav class
  pages.forEach((page) => {
    const fileName = `${getSlug(page.slug, page)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$("nav .current").html(), page.title);
  });

  // posts: existence, right title
  posts.forEach((post) => {
    const fileName = `${getSlug(post.slug, post)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$("h1").html(), post.title);
  });
});

test.serial("e2e - no blocks", async (t) => {
  const posts = generateItems(3);

  await render({
    buildPath,
    viewsPath,
    logLevel: "silent",
    pages: [...pages, ...posts],
    locals: {
      posts,
      config: { nav },
    },
  });

  const ss = new SuperStatic({ buildPath });
  await ss.load();

  // posts: blocks, right content
  posts.forEach((post) => {
    const fileName = `${getSlug(post.slug, post)}.html`;
    t.true(ss.hasPage(fileName));
    t.is(ss.getPage(fileName).$(".block").length, 0);
    t.is(ss.getPage(fileName).$(".no-block").length, 1);
  });
});

test.serial("e2e - blocks", async (t) => {
  const posts = generateItems(3, true);

  await render({
    buildPath,
    viewsPath,
    logLevel: "silent",
    pages: [...pages, ...posts],
    locals: {
      posts,
      config: { nav },
    },
  });

  const ss = new SuperStatic({ buildPath });
  await ss.load();

  // posts: blocks, right content
  posts.forEach((post) => {
    const fileName = `${getSlug(post.slug, post)}.html`;
    t.true(ss.hasPage(fileName));
    const $ = ss.getPage(fileName).$;

    $(".block").each((index, el) => {
      t.is($(el).find("h2").text(), `Block ${index + 1}`);
      t.is($(el).find("p").length, 1);
    });
    t.is($(".block").length, 3);
    t.is($(".no-block").length, 0);
  });
});
