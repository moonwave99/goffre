import test from "ava";
import sinon from "sinon";
import {
    getParamLink,
    getAsset,
    getLink,
    getNavClass,
    nextItem,
    prevItem,
} from "./helpers.js";

test("getParamLink - default case", (t) => {
    t.is(
        getParamLink("/page/:name", {
            hash: { name: "yo" },
            data: { root: { env: {} } },
        }),
        "/page/yo"
    );
});

test("getParamLink - no matching token", (t) => {
    const error = t.throws(() =>
        getParamLink("/page/:name", {
            hash: {},
            data: { root: { env: {} } },
        })
    );
    t.is(error.message, "slugify: string argument expected");
});

test("getAsset - default case", (t) => {
    t.is(getAsset("pic.jpg", { data: { root: { env: {} } } }), "pic.jpg");
});

test("getAsset - absolute path", (t) => {
    t.is(getAsset("/pic.jpg", { data: { root: { env: {} } } }), "/pic.jpg");
});

test("getAsset - subfolder", (t) => {
    t.is(
        getAsset("asset/pic.jpg", { data: { root: { env: {} } } }),
        "asset/pic.jpg"
    );
});

test("getAsset - subfolder - absolute", (t) => {
    t.is(
        getAsset("/assets/pic.jpg", { data: { root: { env: {} } } }),
        "/assets/pic.jpg"
    );
});

test("getAsset - prod with domain", (t) => {
    t.is(
        getAsset("pic.jpg", {
            data: {
                root: {
                    options: {
                        domain: "https://www.example.com",
                    },
                    env: { mode: "prod" },
                },
            },
        }),
        "https://www.example.com/pic.jpg"
    );
});

test("getAsset - prod without domain", (t) => {
    t.is(
        getAsset("pic.jpg", {
            data: {
                root: {
                    options: {},
                    env: { mode: "prod" },
                },
            },
        }),
        "pic.jpg"
    );
});

test("getLink - default case", (t) => {
    t.is(
        getLink(
            { slug: "blog" },
            {
                data: {
                    root: {
                        options: {},
                        env: {},
                    },
                },
            }
        ),
        "/blog"
    );
});

test("getLink - root", (t) => {
    t.is(
        getLink(
            { slug: "/" },
            {
                data: {
                    root: {
                        options: {},
                        env: {},
                    },
                },
            }
        ),
        "/"
    );
});

test("getLink - root with domain", (t) => {
    t.is(
        getLink(
            { slug: "/" },
            {
                data: {
                    root: {
                        options: {
                            domain: "https://www.example.com",
                        },
                        env: { mode: "prod" },
                    },
                },
            }
        ),
        "https://www.example.com/"
    );
});

test("getLink - default with domain", (t) => {
    t.is(
        getLink(
            { slug: "slug" },
            {
                data: {
                    root: {
                        options: {
                            domain: "https://www.example.com",
                        },
                        env: { mode: "prod" },
                    },
                },
            }
        ),
        "https://www.example.com/slug"
    );
});

test("getLink - from page.link", (t) => {
    t.is(
        getLink(
            { link: "my-blog", slug: "blog" },
            {
                data: {
                    root: {
                        options: {},
                        env: {},
                    },
                },
            }
        ),
        "my-blog"
    );
});

test("getLink - uglyUrls", (t) => {
    t.is(
        getLink(
            { slug: "blog" },
            {
                data: {
                    root: {
                        options: { uglyUrls: true },
                        env: {},
                    },
                },
            }
        ),
        "/blog.html"
    );
});

test("getLink - uglyUrls - homepage", (t) => {
    t.is(
        getLink(
            { slug: "/" },
            {
                data: {
                    root: {
                        options: { uglyUrls: true },
                        env: {},
                    },
                },
            }
        ),
        "/index.html"
    );
});

test("getNavClass", (t) => {
    t.is(getNavClass({ slug: "blog" }, { slug: "about" }), "blog");
    t.is(getNavClass({ slug: "blog" }, { slug: "blog" }), "blog current");
    t.is(
        getNavClass({ slug: "blog" }, { slug: "blog/post/1" }),
        "blog current"
    );
});

test("nextItem - default case", (t) => {
    const list = [{ slug: 1 }, { slug: 2 }, { slug: 3 }];

    const fn = sinon.spy();
    nextItem(list[0], {
        hash: { list },
        fn,
    });

    t.true(fn.calledWith(list[1]));
});

test("nextItem - last element", (t) => {
    const list = [{ slug: 1 }, { slug: 2 }, { slug: 3 }];

    const fn = sinon.spy();
    nextItem(list[list.length - 1], {
        hash: { list },
        fn,
    });

    t.false(fn.called);
});

test("prevItem - default case", (t) => {
    const list = [{ slug: 1 }, { slug: 2 }, { slug: 3 }];

    const fn = sinon.spy();
    prevItem(list[1], {
        hash: { list },
        fn,
    });

    t.true(fn.calledWith(list[0]));
});

test("prevItem - last element", (t) => {
    const list = [{ slug: 1 }, { slug: 2 }, { slug: 3 }];

    const fn = sinon.spy();
    prevItem(list[0], {
        hash: { list },
        fn,
    });

    t.false(fn.called);
});
