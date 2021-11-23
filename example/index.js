import { load, render, paginate } from "../lib/index.js";

const dateFormats = {
    long: {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    },
    short: {
        year: "numeric",
        month: "long",
        day: "numeric",
    },
    project: {
        year: "numeric",
        month: "long",
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
    const { json, pages } = await load();

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
            template: "pages/blog/list-page",
            posts: items,
            pagination,
        }));

    try {
        await render({
            verbose: true,
            pages: [
                ...pages,
                ...blogPages,
                {
                    title: "Home",
                    slug: "index",
                    template: "pages/index",
                    description: json.labels.index.subtitle,
                },
                {
                    title: "Projects",
                    slug: "projects",
                    template: "pages/projects/index",
                    description: json.labels.projects.subtitle,
                },
                {
                    title: "Blog",
                    slug: "blog",
                    template: "pages/blog/index",
                    description: json.labels.blog.subtitle,
                },
            ],
            locals: {
                ...json,
                projects,
                posts,
            },
            handlebars: {
                helpers,
            },
            markdown,
        });
    } catch (error) {
        console.log("Error generating site", error);
    }
})();
