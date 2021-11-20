import path from "path";
import { dirname } from "dirname-filename-esm";
import chalk from "chalk";
import { loadJSON, loadMarkdown, log, render } from "./lib.js";

const __dirname = dirname(import.meta);

const buildPath = path.join(__dirname, "..", "..", "dist");
const dataPath = path.join(__dirname, "..", "..", "data");

(async () => {
    log(`Getting data from ${chalk.yellow(dataPath)}:`);

    const json = await loadJSON(dataPath);
    const data = await loadMarkdown(dataPath);

    try {
        const results = await render({
            buildPath,
            pages: [
                ...data,
                {
                    title: "Home",
                    slug: "index",
                    template: "index",
                },
                {
                    title: "Projects",
                    slug: "projects",
                    template: "projects-list",
                },
                {
                    title: "Blog",
                    slug: "blog",
                    template: "blog-index",
                },
            ],
            locals: {
                ...json,
                projects: data.filter((x) => x.slug.startsWith("project")),
                posts: data.filter((x) => x.slug.startsWith("blog")),
            },
        });
        log(`Generated ${chalk.yellow(results.length)} pages`);
    } catch (error) {
        console.log(chalk.red(`[generator] Error generating site`));
        console.log(error);
    }
})();
