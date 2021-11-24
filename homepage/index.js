import path from "path";
import { createRequire } from "module";
import { readFile } from "fs/promises";
import { load, render } from "../index.js";
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
};

(async () => {
    const { pages } = await load();

    try {
        await render({
            domain: pkg.homepage,
            logLevel: "verbose",
            pages: [
                ...pages,
                {
                    title: config.title,
                    description: config.description,
                    slug: "index",
                    link: "/",
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
            sitemap: {
                generate: true,
            },
        });
    } catch (error) {
        console.log("Error generating site", error);
    }
})();
