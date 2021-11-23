import path from "path";
import fs from "fs/promises";
import rimraf from "rimraf";
import cheerio from "cheerio";
import { globby } from "globby";
import { generatePost } from "../lib/generator.js";
import { getSlug } from "../index.js";

const { readFile } = fs;

export const clean = (pathToClean) =>
    new Promise((resolve) => rimraf(pathToClean, resolve));

export const generateItems = (length) =>
    Array.from({ length }, (_, index) =>
        generatePost({ index: index + 1, template: "page" })
    ).map(({ slug, ...page }) => ({
        ...page,
        slug: getSlug({ slug, page }),
    }));

export class SuperStatic {
    constructor({ buildPath }) {
        this.buildPath = buildPath;
        this.pages = {};
    }
    async load() {
        const files = await globby("**/*.html", { cwd: this.buildPath });
        await Promise.all(
            files.map(
                async (x) =>
                    (this.pages[x] = {
                        $: cheerio.load(
                            await readFile(path.join(this.buildPath, x), "utf8")
                        ),
                    })
            )
        );
    }
    pageCount() {
        return Object.keys(this.pages).length;
    }
    getPage(page) {
        return this.pages[page];
    }
    hasPage(page) {
        return !!this.pages[page];
    }
}
