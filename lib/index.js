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

function getEnv() {
    return {
        mode: process.env.MODE,
    };
}

function stringify(token) {
    if (token instanceof Date) {
        return token.toISOString().split("T")[0];
    }
    return token;
}

function getSlug({ filename, slug, page }) {
    if (!slug) {
        return filename;
    }
    return slug
        .split("/")
        .reduce(
            (memo, x) =>
                !x.startsWith(":")
                    ? [...memo, x]
                    : [
                          ...memo,
                          slugify(stringify(page[x.slice(1)]), {
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

function renderPage({ app, templates, buildPath, verbose, ...page }) {
    return new Promise((resolve, reject) => {
        const template = getTemplate({ page, templates });
        if (verbose) {
            log(
                `Generating ${chalk.yellow(
                    page.slug
                )} with template ${chalk.green(template)}...`
            );
        } else {
            log(`Generating ${chalk.yellow(page.slug)}...`);
        }

        app.render(
            template,
            {
                ...page,
                content: page.content ? marked.parse(page.content) : null,
            },
            async (error, html) => {
                if (error) {
                    reject(error);
                    return;
                }
                await outputFile(
                    path.join(buildPath, `${page.slug}.html`),
                    html
                );
                resolve(true);
            }
        );
    });
}

export async function load({ dataPath }) {
    return {
        json: await loadJSON(dataPath),
        pages: await loadMarkdown(dataPath),
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
            const slug = getSlug({
                filename: outputFileName,
                slug: parsed.data.slug,
                page: parsed.data,
            });
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

export function log() {
    console.log.apply(
        null,
        ["[generator]", ...arguments].map((x) => chalk.cyan(x))
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
    sitePath,
    buildPath,
    locals,
    helpers,
    markdown = {},
    verbose,
}) {
    const viewsPath = path.join(sitePath, "views");

    const app = express();
    app.engine(
        "handlebars",
        engine({
            helpers: {
                ...defaultHelpers,
                ...helpers,
            },
        })
    );
    app.set("view engine", "handlebars");
    app.set("layoutsDir", path.join(viewsPath, "layouts"));
    app.set("views", viewsPath);

    const templates = await globby("**/*.handlebars", { cwd: viewsPath });

    app.locals = { ...app.locals, ...locals, env: getEnv() };

    marked.use(markdown);

    const results = await Promise.all(
        pages.map((x) =>
            renderPage({ ...x, buildPath, app, templates, verbose })
        )
    );
    return results;
}

export function paginate({ collection, size = 10, sortBy, order = "asc" }) {
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
