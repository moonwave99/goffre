import path from "path";
import { createRequire } from "module";
import { readFile } from "fs/promises";
import { load, render } from "../lib/index.js";
import git from "git-rev-sync";

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
    repo: "https://github.com/moonwave99/goffre",
    author: {
        name: "Diego Caponera",
        link: "https://github.com/moonwave99",
    },
};

(async () => {
    const { pages } = await load();

    try {
        await render({
            domain: "https://moonwave99.github.io/goffre",
            logLevel: "verbose",
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
            },
        });
    } catch (error) {
        console.log("Error generating site", error);
    }
})();
