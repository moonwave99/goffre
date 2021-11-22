import test from "ava";
import { generatePost } from "../generator.js";
import { paginate, getTemplate } from "./index.js";

function generateItems(length) {
    return Array.from({ length }, (_, index) =>
        generatePost({
            index: index + 1,
        })
    );
}

test("getTemplate - pick passed template", (t) => {
    const template = getTemplate({
        page: {
            template: "my-template",
        },
    });
    t.is(template, "my-template");
});

test("getTemplate - try by slug", (t) => {
    const template = getTemplate({
        page: {
            slug: "slug",
        },
        templates: ["yo", "ye", "slug"],
    });
    t.is(template, "slug");
});

test("getTemplate - fallback", (t) => {
    const template = getTemplate({
        page: {},
        templates: ["yo", "ye", "slug"],
    });
    t.is(template, "_default");
});

test("paginate", (t) => {
    const collection = generateItems(21);
    const pages = paginate({
        collection,
        size: 4,
    });
    t.is(pages.length, 6);
    t.is(pages[pages.length - 1].items.length, 1);

    pages.forEach(({ pagination }, index) => {
        const { total, page, next, prev } = pagination;
        t.is(total, pages.length);
        t.is(page, index + 1);
        t.is(prev, index === 0 ? null : index);
        t.is(next, index === pages.length - 1 ? null : index + 2);
    });
});
