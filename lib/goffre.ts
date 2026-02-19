import path from "path";
import { globby } from "globby";
import { marked, type MarkedExtension, RendererObject } from "marked";
import matter from "gray-matter";
import { createRequire } from "module";
import fs from "fs-extra";
import express, { type Express } from "express";
import { engine } from "express-handlebars";
import chalk from "chalk";
import slugify from "slugify";
import * as defaultHelpers from "./helpers";

export const helpers = defaultHelpers;

const require = createRequire(import.meta.url);
const { readFile, outputFile } = fs;

const DEFAULT_DATA_PATH = path.join(process.cwd(), "data");
const DEFAULT_VIEWS_PATH = path.join(process.cwd(), "src", "views");
const DEFAULT_BUILD_PATH = path.join(process.cwd(), "dist");
const MAX_SLUG_LOG_LENGTH = 40;
const DEFAULT_BLOCK_SEPARATOR = "<!-- block -->";

function log(...args: unknown[]) {
  console.log.apply(
    null,
    ["[goffre]", ...args].map((x) => chalk.cyan(x)),
  );
}

function getEnv() {
  return {
    mode: process.env.MODE || "dev",
  };
}

export type Page = {
  slug: string;
  link?: string;
  template?: string;
  layout?: string | null;
  content?: string;
  extname?: string;
};

function stringify(token: unknown) {
  if (token instanceof Date) {
    return token.toISOString().split("T")[0];
  }
  return `${token}`;
}

export function getSlug(slug: string, params: Record<string, unknown>) {
  return slug
    .split("/")
    .reduce((memo, x) => {
      if (!x.startsWith(":")) {
        return [...memo, x];
      }
      const param = x.slice(1);
      const value = params[param];
      if (!value) {
        throw new Error(`No value found for parameter: ${param}`);
      }
      return [
        ...memo,
        slugify(stringify(value), {
          lower: true,
          strict: true,
        }),
      ];
    }, [] as string[])
    .join("/");
}

type GetTemplateParams = {
  page: Page;
  templates: string[];
  defaultTemplate?: string;
};

export function getTemplate({
  page,
  templates = [],
  defaultTemplate = "_default",
}: GetTemplateParams) {
  if (templates.find((x) => x === `${page.template}.handlebars`)) {
    return page.template as string;
  }
  if (templates.find((x) => x.startsWith(page.slug))) {
    return page.slug;
  }
  return defaultTemplate;
}

type RenderPageParams = Page & {
  app: Express;
  templates: string[];
  buildPath: string;
  maxSlugLogLength?: number;
  blockSeparator?: string;
  sitemapLink?: string;
  pages?: Page[];
};

function renderPage({
  app,
  templates,
  buildPath,
  maxSlugLogLength,
  blockSeparator,
  sitemapLink,
  ...page
}: RenderPageParams) {
  return new Promise((resolve, reject) => {
    const template = getTemplate({ page, templates });

    switch (app.locals.options.logLevel) {
      case "silent":
        break;
      case "verbose":
        log(
          `Generating ${chalk.yellow(
            page.slug.padEnd(maxSlugLogLength || MAX_SLUG_LOG_LENGTH, " "),
          )} with template ${chalk.green(template)}...`,
        );
        break;
      case "normal":
      default:
        log(`Generating ${chalk.yellow(page.slug)}...`);
    }

    app.render(
      template,
      {
        ...page,
        sitemapLink,
        layout: typeof page.layout === "undefined" ? "main" : page.layout,
        content: page.content ? marked.parse(page.content) : null,
        blocks: getPageBlocks(
          page.content,
          blockSeparator || DEFAULT_BLOCK_SEPARATOR,
        ),
      },
      async (error, html) => {
        if (error) {
          reject(error);
          return;
        }
        const outputFileName = `${page.slug}${page.extname || ".html"}`;
        await outputFile(path.join(buildPath, outputFileName), html);
        resolve({
          ...page,
          outputFileName,
        });
      },
    );
  });
}

function getPageBlocks(content = "", separator: string) {
  if (!content.includes(separator)) {
    return [];
  }
  const blocks = content.split(separator).map((x) => marked.parse(x));
  return blocks.filter(Boolean);
}

type LoadParams = {
  dataPath?: string;
};

export async function load({ dataPath }: LoadParams = {}) {
  return {
    json: await loadJSON(dataPath || DEFAULT_DATA_PATH),
    pages: await loadMarkdown(dataPath || DEFAULT_DATA_PATH),
  };
}

export async function loadJSON(cwd: string) {
  const files = await globby("**/*.json", { cwd });
  return files.reduce(
    (memo, x) => ({
      ...memo,
      [path.basename(x, ".json")]: require(path.join(cwd, x)),
    }),
    {},
  );
}

export async function loadMarkdown(cwd: string) {
  const files = await globby("**/*.md", { cwd });
  return Promise.all(
    files.map(async (fileName) => {
      const fullPath = path.join(cwd, fileName);
      const contents = await readFile(fullPath, "utf-8");
      const parsed = matter(contents, { excerpt: true });
      const outputFileName = fileName.replace(".md", "");
      const slug = !parsed.data.slug
        ? outputFileName
        : getSlug(parsed.data.slug, parsed.data);
      return {
        ...parsed.data,
        excerpt: parsed.excerpt,
        slug,
        description: parsed.data.description || parsed.excerpt,
        content: parsed.content,
      };
    }),
  );
}

type GetSorterParams = {
  sortBy: string;
  order: "asc" | "desc";
};

export function getSorter<T extends Record<string, unknown>>({
  sortBy,
  order,
}: GetSorterParams) {
  return (a: T, b: T) => {
    let output;
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (valA instanceof Date && valB instanceof Date) {
      output = Number(new Date(valA)) - Number(new Date(valB));
    } else {
      output = Number(valA) - Number(valB);
    }
    return order === "desc" ? -output : output;
  };
}

type RenderParams = {
  pages: Page[];
  viewsPath?: string;
  buildPath?: string;
  blockSeparator?: string;
  domain?: string;
  uglyUrls?: boolean;
  logLevel?: "silent" | "verbose" | "normal";
  locals: Record<string, unknown>;
  sitemap?: {
    generate?: boolean;
    template?: string;
  };
  env?: Record<string, unknown>;
  handlebars?: {
    extname?: string;
    helpers?: Record<string, unknown>;
  };
  markdown?: {
    middleware?: (MarkedExtension | (() => MarkedExtension))[];
    renderer?: RendererObject;
  };
};

export async function render({
  pages,
  viewsPath = DEFAULT_VIEWS_PATH,
  buildPath = DEFAULT_BUILD_PATH,
  blockSeparator = DEFAULT_BLOCK_SEPARATOR,
  domain,
  uglyUrls = false,
  logLevel = "normal",
  locals = {},
  markdown = {},
  handlebars = {},
  sitemap = {},
  env = {},
}: RenderParams) {
  const extname = handlebars.extname || ".handlebars";
  const app = express();
  app.engine(
    extname,
    engine({
      ...handlebars,
      helpers: {
        ...defaultHelpers,
        ...handlebars.helpers,
      },
    }),
  );
  app.set("view engine", "handlebars");
  app.set("layoutsDir", path.join(viewsPath, "layouts"));
  app.set("views", viewsPath);

  const templates = await globby(`**/*${extname}`, {
    cwd: viewsPath,
  });

  app.locals = {
    ...app.locals,
    ...locals,
    options: {
      domain,
      uglyUrls,
      logLevel,
    },
    env: { ...getEnv(), ...env },
  };

  if (markdown.middleware) {
    markdown.middleware.forEach((x) =>
      marked.use(typeof x === "function" ? x() : x),
    );
  }

  marked.use(markdown);

  switch (logLevel) {
    case "silent":
      break;
    case "verbose":
    case "normal":
    default:
      log(`Start generation...`);
  }

  const results = await Promise.all(
    pages.map((x) =>
      renderPage({
        ...x,
        buildPath,
        app,
        templates,
        sitemapLink: sitemap.generate ? `${domain}/sitemap.xml` : "",
        blockSeparator,
        maxSlugLogLength: Math.min(
          Math.max.call(null, ...pages.map((x) => x.slug.length)),
          MAX_SLUG_LOG_LENGTH,
        ),
      }),
    ),
  );

  switch (logLevel) {
    case "silent":
      break;
    case "verbose":
    case "normal":
    default:
      log(`Generated ${results.length} pages`);
  }

  if (sitemap.generate) {
    renderPage({
      slug: "sitemap",
      template: sitemap.template || "sitemap",
      extname: ".xml",
      layout: null,
      pages: results as Page[],
      buildPath,
      app,
      templates,
    });
  }

  return results;
}

type PaginateParams<T extends Page> = {
  collection: T[];
  size?: number;
  sortBy?: keyof T;
  order?: "asc" | "desc";
};

type PaginatedResult<T extends Page> = {
  pagination: {
    page: number;
    prev: number | null;
    next: number | null;
    total: number;
  };
  items: T[];
};

export function paginate<T extends Page>({
  collection,
  size = 10,
  sortBy = "slug",
  order = "asc",
}: PaginateParams<T>) {
  const total = Math.ceil(collection.length / size);
  return collection
    .toSorted(getSorter({ sortBy: sortBy as string, order }))
    .reduce((memo, x, index) => {
      if (index % size === 0) {
        const page = Math.floor(index / size) + 1;
        return [
          ...memo,
          {
            pagination: {
              page,
              prev: page > 1 ? page - 1 : null,
              next: page < total ? page + 1 : null,
              total,
            },
            items: [x],
          },
        ];
      }
      return [
        ...memo.slice(0, -1),
        {
          ...memo[memo.length - 1],
          items: [...memo[memo.length - 1].items, x],
        },
      ];
    }, [] as PaginatedResult<T>[]);
}
