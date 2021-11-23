import test from "ava";
import { generatePost } from "../generator.js";
import { paginate, getTemplate, getSorter } from "./index.js";

const generateItems = (length) =>
    Array.from({ length }, (_, index) => generatePost({ index: index + 1 }));

test("getTemplate - pick passed template", (t) => {
    const template = getTemplate({
        page: { template: "my-template" },
    });
    t.is(template, "my-template");
});

test("getTemplate - try by slug", (t) => {
    const template = getTemplate({
        page: { slug: "slug" },
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
    const pages = paginate({ collection, size: 4 });
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

test("paginate - sort by creation asc", (t) => {
    const collection = generateItems(21);
    const pages = paginate({
        collection,
        size: 4,
        sortBy: "created_at",
        order: "asc",
    });
    const sortedCollection = [...collection].sort(
        getSorter({
            sortBy: "created_at",
            order: "asc",
        })
    );

    const lastPage = pages[pages.length - 1];

    t.deepEqual(pages[0].items[0], sortedCollection[0]);
    t.deepEqual(
        lastPage.items[lastPage.items.length - 1],
        sortedCollection[sortedCollection.length - 1]
    );
});

test("paginate - sort by creation desc", (t) => {
    const collection = generateItems(21);
    const pages = paginate({
        collection,
        size: 4,
        sortBy: "created_at",
        order: "desc",
    });
    const sortedCollection = [...collection].sort(
        getSorter({
            sortBy: "created_at",
            order: "desc",
        })
    );

    const lastPage = pages[pages.length - 1];

    t.deepEqual(pages[0].items[0], sortedCollection[0]);
    t.deepEqual(
        lastPage.items[lastPage.items.length - 1],
        sortedCollection[sortedCollection.length - 1]
    );
});
