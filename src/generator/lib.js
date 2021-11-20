import path from "path";
import { globby } from "globby";
import { marked } from "marked";
import matter from "gray-matter";
import { createRequire } from "module";
import { dirname } from "dirname-filename-esm";
import fs from "fs-extra";
import express from "express";
import { engine } from "express-handlebars";
import chalk from "chalk";
import slugify from "slugify";
import * as helpers from "./helpers.js";

const { readFile, outputFile } = fs;

const __dirname = dirname(import.meta);
const require = createRequire(import.meta.url);

const app = express();

app.engine("handlebars", engine({ helpers }));
app.set("view engine", "handlebars");
app.set("layoutsDir", path.join(__dirname, "views", "layouts"));
app.set("views", path.join(__dirname, "views"));

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

const DEFAULT_TEMPLATE = "_default";

function renderPage({ buildPath, ...page }) {
    return new Promise((resolve, reject) => {
        log(`Generating ${chalk.yellow(page.slug)}...`);
        app.render(
            page.template || DEFAULT_TEMPLATE,
            page,
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

export async function loadMarkdown(cwd) {
    const files = await globby("**/*.md", { cwd });
    return Promise.all(
        files.map(async (fileName) => {
            const fullPath = path.join(cwd, fileName);
            const contents = await readFile(fullPath, "utf-8");
            const parsed = matter(contents);
            const outputFileName = fileName.replace(".md", "");
            const slug = getSlug({
                filename: outputFileName,
                slug: parsed.data.slug,
                page: parsed.data,
            });
            return {
                ...parsed.data,
                slug,
                pageContent: marked(parsed.content),
            };
        })
    );
}

export function log(data) {
    console.log(chalk.cyan(`[generator] ${data}`));
}

export async function render({ pages, buildPath, locals }) {
    app.locals = { ...app.locals, ...locals };
    const results = await Promise.all(
        pages.map((x) => renderPage({ ...x, buildPath }))
    );
    return results;
}
