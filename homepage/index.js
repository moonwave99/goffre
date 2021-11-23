import path from "path";
import chalk from "chalk";
import { dirname } from "dirname-filename-esm";
import { createRequire } from "module";
import { readFile } from "fs/promises";
import { load, render, log } from "../lib/index.js";
import git from "git-rev-sync";

const __dirname = dirname(import.meta);
const require = createRequire(import.meta.url);

const pkg = require(path.join("..", "package.json"));

const config = {
    title: "Goffre | Mini static site generator",
    description:
        "Goffre is a minimal static site generator available to the node.js ecosystem.",
    nav: [
        {
            title: "Home",
            slug: "index",
            link: "/",
        },
        {
            title: `Docs (v${pkg.version})`,
            slug: "docs",
            link: "/docs",
        },
        {
            title: "See on Github",
            link: "https://github.com/moonwave99/goffre",
            external: true,
        },
    ],
    domain: "https://moonwave99.github.io/goffre",
    repo: "https://github.com/moonwave99/goffre",
    author: {
        name: "Diego Caponera",
        link: "https://github.com/moonwave99",
    },
};

const buildPath = path.join(__dirname, "dist");
const dataPath = path.join(__dirname, "data");
const viewsPath = path.join(__dirname, "src", "views");

(async () => {
    log(`Getting data from ${chalk.yellow(dataPath)}:`);

    const { pages } = await load({ dataPath });

    try {
        const results = await render({
            verbose: true,
            buildPath,
            viewsPath,
            pages: [
                ...pages,
                {
                    title: config.title,
                    description: config.description,
                    slug: "index",
                    content: await readFile(
                        path.join("..", "README.md"),
                        "utf8"
                    ),
                },
            ],
            locals: {
                config,
                pkg,
                rev: git.short(".."),
                domain: config.domain,
            },
        });
        log(`Generated ${chalk.yellow(results.length)} pages`);
    } catch (error) {
        console.log(chalk.red(`Error generating site`));
        console.log(error);
    }
})();
