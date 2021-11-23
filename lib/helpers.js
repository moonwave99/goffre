import { getSorter } from "./index.js";
import { marked } from "marked";

export const markdown = (text) => marked(text);

export const getAsset = (asset, context) => {
    const { options, env } = context.data.root;
    return env.mode === "prod" && options.domain
        ? `${options.domain}${asset.startsWith("/") ? "" : "/"}${asset}`
        : asset;
};

export const getLink = (page, context) => {
    const base =
        page.link || `${page.slug.startsWith("/") ? "" : "/"}${page.slug}`;
    const { uglyUrls } = context.data.root.options;
    const ext = uglyUrls ? ".html" : "";
    if (uglyUrls) {
        return getAsset(`${base === "/" ? "/index" : base}${ext}`, context);
    }
    return getAsset(`${base}${ext}`, context);
};

export const getNavClass = ({ slug }, currentPage) => {
    const cleanSlug = slug && slug[0] === "/" ? slug.slice(1) : slug;
    return currentPage.slug.startsWith(cleanSlug)
        ? `${cleanSlug} current`
        : cleanSlug;
};

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
