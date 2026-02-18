import path from "path";
import fs from "fs/promises";
import { rimraf } from "rimraf";
import { load } from "cheerio";
import { globby } from "globby";
import { generatePost } from "../lib/generator.js";
import { getSlug } from "../lib/goffre";

const { readFile } = fs;

export const clean = rimraf;

export const generateItems = (length: number, withBlocks = false) =>
  Array.from({ length }, (_, index) =>
    generatePost({ index: index + 1, template: "page", withBlocks }),
  ).map(({ slug, ...page }) => ({
    ...page,
    slug: getSlug(slug, page),
  }));

type SuperStaticOptions = {
  buildPath: string;
};

export class SuperStatic {
  private buildPath: string;
  private pages: Record<string, { $: ReturnType<typeof load> }>;

  constructor({ buildPath }: SuperStaticOptions) {
    this.buildPath = buildPath;
    this.pages = {};
  }
  async load() {
    const files = await globby("**/*.html", { cwd: this.buildPath });
    await Promise.all(
      files.map(
        async (x) =>
          (this.pages[x] = {
            $: load(await readFile(path.join(this.buildPath, x), "utf8")),
          }),
      ),
    );
  }
  pageCount() {
    return Object.keys(this.pages).length;
  }
  getPage(page: string) {
    return this.pages[page];
  }
  getPages() {
    return this.pages;
  }
  hasPage(page: string) {
    return !!this.pages[page];
  }
}
