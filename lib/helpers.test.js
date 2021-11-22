import test from "ava";
import sinon from "sinon";
import { nextItem, prevItem } from "./helpers.js";

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
