import { generatePost } from "./lib.js";

(async () => {
    const length = 20;
    await Promise.all(
        Array.from({ length }, (_, index) =>
            generatePost({
                index,
                postsPath: "./data/blog",
            })
        )
    );
    console.log(`Generated ${length} posts.`);
})();
