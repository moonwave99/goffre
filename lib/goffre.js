import path from "path";
import { globby } from "globby";
import { marked } from "marked";
import matter from "gray-matter";
import { createRequire } from "module";
import fs from "fs-extra";
import express from "express";
import { engine } from "express-handlebars";
import chalk from "chalk";
import slugify from "slugify";
import * as defaultHelpers from "./helpers.js";

const require = createRequire(import.meta.url);
const { readFile, outputFile } = fs;

const DEFAULT_DATA_PATH = path.join(process.cwd(), "data");
const DEFAULT_VIEWS_PATH = path.join(process.cwd(), "src", "views");
const DEFAULT_BUILD_PATH = path.join(process.cwd(), "dist");
const MAX_SLUG_LOG_LENGTH = 40;

function log() {
    console.log.apply(
        null,
        ["[goffre]", ...arguments].map((x) => chalk.cyan(x))
    );
}

function getEnv() {
    return {
        mode: process.env.MODE || "dev",
    };
}

function stringify(token) {
    if (token instanceof Date) {
        return token.toISOString().split("T")[0];
    }
    return token;
}

export function getSlug(slug, params) {
    return slug
        .split("/")
        .reduce(
            (memo, x) =>
                !x.startsWith(":")
                    ? [...memo, x]
                    : [
                          ...memo,
                          slugify(stringify(params[x.slice(1)]), {
                              lower: true,
                              strict: true,
                          }),
                      ],
            []
        )
        .join("/");
}

export function getTemplate({ page, templates, defaultTemplate = "_default" }) {
    if (page.template) {
        return page.template;
    }
    if (templates.find((x) => x.startsWith(page.slug))) {
        return page.slug;
    }
    return defaultTemplate;
}

function renderPage({ app, templates, buildPath, maxSlugLogLength, ...page }) {
    return new Promise((resolve, reject) => {
        const template = getTemplate({ page, templates });

        switch (app.locals.options.logLevel) {
            case "silent":
                break;
            case "verbose":
                log(
                    `Generating ${chalk.yellow(
                        page.slug.padEnd(maxSlugLogLength, " ")
                    )} with template ${chalk.green(template)}...`
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
                layout:
                    typeof page.layout === "undefined" ? "main" : page.layout,
                content: page.content ? marked.parse(page.content) : null,
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
            }
        );
    });
}

export async function load({ dataPath } = {}) {
    return {
        json: await loadJSON(dataPath || DEFAULT_DATA_PATH),
        pages: await loadMarkdown(dataPath || DEFAULT_DATA_PATH),
    };
}

export async function loadJSON(cwd) {
    const files = await globby("**/*.json", { cwd });
    return files.reduce(
        (memo, x) => ({
            ...memo,
            [path.basename(x, ".json")]: require(path.join(cwd, x)),
        }),
        {}
    );
}

function excerpt(file) {
    file.excerpt = file.content.split("\n")[1];
}

export async function loadMarkdown(cwd) {
    const files = await globby("**/*.md", { cwd });
    return Promise.all(
        files.map(async (fileName) => {
            const fullPath = path.join(cwd, fileName);
            const contents = await readFile(fullPath, "utf-8");
            const parsed = matter(contents, { excerpt });
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
        })
    );
}

export const getSorter =
    ({ sortBy, order }) =>
    (a, b) => {
        let output;
        if (a[sortBy] instanceof Date) {
            output = new Date(a[sortBy]) - new Date(b[sortBy]);
        } else {
            output = a[sortBy] - b[sortBy];
        }
        return order === "desc" ? -output : output;
    };

export async function render({
    pages,
    viewsPath = DEFAULT_VIEWS_PATH,
    buildPath = DEFAULT_BUILD_PATH,
    domain,
    uglyUrls = false,
    logLevel = "normal",
    locals = {},
    markdown = {},
    handlebars = {},
    sitemap = {},
    env = {},
}) {
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
        })
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
                maxSlugLogLength: Math.min(
                    Math.max.call(null, ...pages.map((x) => x.slug.length)),
                    MAX_SLUG_LOG_LENGTH
                ),
            })
        )
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
            pages: results,
            buildPath,
            app,
            templates,
        });
    }

    return results;
}

export function paginate({
    collection,
    size = 10,
    sortBy = "slug",
    order = "asc",
}) {
    const total = Math.ceil(collection.length / size);
    return collection
        .sort(getSorter({ sortBy, order }))
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
        }, []);
}
