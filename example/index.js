import path from "path";
import { dirname } from "dirname-filename-esm";
import chalk from "chalk";
import { generatePost } from "./lib.js";
import { load, render, log, paginate } from "../lib/index.js";

const __dirname = dirname(import.meta);

const buildPath = path.join(__dirname, "dist");
const dataPath = path.join(__dirname, "data");
const sitePath = path.join(__dirname, "src", "site");

const dateFormats = {
    long: {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    },
    short: {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    },
};

const helpers = {
    formatDate: (date, format = "short") =>
        date.toLocaleDateString(undefined, dateFormats[format]),
    getPrevPageLink: (page) => (page > 1 ? `/blog/page/${page}` : "/blog"),
    getNextPageLink: (page) => `/blog/page/${page}`,
};

const markdown = {
    renderer: {
        image: (href, title, text) => {
            return `<figure class="has-figcaption">
                            <img class="lazy loadable" data-src="${href}" alt="${text}"/>
                            <figcaption>${text}</figcaption>
                        </figure>`;
        },
    },
};

(async () => {
    log(`Getting data from ${chalk.yellow(dataPath)}:`);

    const { json, pages } = await load({ dataPath });

    const posts = pages.filter((x) => x.slug.startsWith("blog"));
    const projects = pages.filter((x) => x.slug.startsWith("project"));

    const blogPages = paginate({
        collection: posts,
        size: json.config.postsPerPage,
        sortBy: "created_at",
        order: "desc",
    })
        .slice(1)
        .map(({ items, pagination }) => ({
            slug: `blog/page/${pagination.page}`,
            title: `Blog | Page ${pagination.page} of ${pagination.total}`,
            template: "blog/list-page",
            posts: items,
            pagination,
        }));

    try {
        const results = await render({
            buildPath,
            sitePath,
            pages: [
                ...pages,
                ...blogPages,
                {
                    title: "Home",
                    slug: "index",
                    template: "index",
                    description: json.labels.index.subtitle,
                },
                {
                    title: "Projects",
                    slug: "projects",
                    template: "projects/index",
                    description: json.labels.projects.subtitle,
                },
                {
                    title: "Blog",
                    slug: "blog",
                    template: "blog/index",
                    description: json.labels.blog.subtitle,
                },
            ],
            locals: {
                ...json,
                projects,
                posts,
            },
            helpers,
            markdown,
        });
        log(`Generated ${chalk.yellow(results.length)} pages`);
    } catch (error) {
        console.log(chalk.red(`[generator] Error generating site`));
        console.log(error);
    }
})();
