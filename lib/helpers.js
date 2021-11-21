import path from "path";
import { getSorter } from "./index.js";

export const getLink = (page, context) => {
    const base = page.link || page.slug;
    const uglyUrls = context.data.root.config.goffre?.uglyUrls;
    const ext = uglyUrls ? ".html" : "";
    if (uglyUrls) {
        return path.join("/", `${base === "/" ? "index" : base}${ext}`);
    }
    return path.join("/", `${base}${ext}`);
};

export const getNavClass = ({ slug }, currentPage) =>
    currentPage.slug.startsWith(slug) ? `${slug} current` : slug;

export const list = (context, options) => {
    const offset = parseInt(options.hash.offset, 10) || 0;
    const limit = parseInt(options.hash.limit, 10) || 100;
    const sortBy = options.hash.sortBy || "slug";
    const order = options.hash.order || "asc";

    let output = "";
    let i, j;

    const data = [...context].sort(getSorter({ sortBy, order }));

    if (offset < 0) {
        i = -offset < data.length ? data.length - -offset : 0;
    } else {
        i = offset < data.length ? offset : 0;
    }

    j = limit + i < data.length ? limit + i : data.length;

    for (i, j; i < j; i++) {
        output += options.fn(data[i]);
    }

    return output;
};

export const nextItem = (context, options) => {
    const { list } = options.hash;
    const index = list.findIndex((x) => x.slug === context.slug);
    const next = list[index + 1];
    if (!next) {
        return;
    }
    return options.fn(next);
};

export const prevItem = (context, options) => {
    const { list } = options.hash;
    const index = list.findIndex((x) => x.slug === context.slug);
    const prev = list[index - 1];
    if (!prev) {
        return;
    }
    return options.fn(prev);
};
