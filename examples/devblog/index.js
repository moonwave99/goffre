import { load, render, paginate } from "../../index.js";

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
        image: (href, title, text) => `
            <figure>
                <img class="lazy loadable" data-src="${href}" alt="${text}"/>
                <figcaption>${text}</figcaption>
            </figure>`,
    },
};

function groupByTech(projects) {
    return projects.reduce((memo, x) => {
        x.technologies.forEach((t) => {
            const foundTech = memo.find((y) => y.name === t);
            if (foundTech) {
                foundTech.projects = [...foundTech.projects, x];
                return;
            }
            memo = [
                ...memo,
                {
                    name: t,
                    projects: [x],
                },
            ];
        });
        return memo;
    }, []);
}

(async () => {
    const { json, pages } = await load();

    const posts = pages.filter((x) => x.slug.startsWith("blog"));
    const projects = pages.filter((x) => x.slug.startsWith("project"));

    const projectsByTagPages = groupByTech(projects).map((x) => ({
        ...x,
        slug: `projects/techs/${x.name}`,
        title: `Projects | ${x.name}`,
        template: "pages/projects/tech",
        description: `These the projects where I used **${x.name}**:`,
    }));

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
            logLevel: "verbose",
            pages: [
                ...pages,
                ...blogPages,
                ...projectsByTagPages,
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
