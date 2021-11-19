import path from "path";
import { dirname, filename } from "dirname-filename-esm";
import { createRequire } from "module";
import fs from "fs-extra";
import { globby } from "globby";
import { marked } from "marked";
import matter from "gray-matter";
import express from "express";
import { engine } from "express-handlebars";

const __dirname = dirname(import.meta);
const require = createRequire(import.meta.url);
const config = require("../../data/config.json");
const labels = require("../../data/labels.json");

const BUILD_PATH = path.join(__dirname, "..", "..", "dist");
const DATA_PATH = path.join(__dirname, "..", "..", "data");

const { readFile, outputFile } = fs;

const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.set("layoutsDir", path.join(__dirname, "views/layouts"));

async function loadMarkdown() {
    const mdFiles = await globby("**/*.md", { cwd: DATA_PATH });
    return Promise.all(
        mdFiles.map(async (fileName) => {
            const fullPath = path.join(DATA_PATH, fileName);
            const contents = await readFile(fullPath, "utf-8");
            const parsed = matter(contents);
            const outputFileName = fileName.replace(".md", "");
            return {
                ...parsed.data,
                outputFileName,
                id: outputFileName.replaceAll("/", "-"),
                pageContent: marked(parsed.content),
            };
        })
    );
}

const DEFAULT_TEMPLATE = "_default";

function renderPage(page) {
    return new Promise((resolve, reject) => {
        app.render(
            page.template || DEFAULT_TEMPLATE,
            {
                ...page,
                config,
                labels,
            },
            async (error, html) => {
                if (error) {
                    reject(error);
                    return;
                }
                await outputFile(
                    path.join(BUILD_PATH, `${page.outputFileName}.html`),
                    html
                );
                resolve(true);
            }
        );
    });
}

(async () => {
    const data = await loadMarkdown();
    const results = await Promise.all([
        ...data.map(renderPage),
        renderPage({
            title: "Home",
            id: "homepage",
            outputFileName: "index",
            template: "homepage",
        }),
    ]);
    console.log(`Generated ${results.length} pages`);
})();
