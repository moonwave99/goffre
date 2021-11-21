import { generatePost, generateProject } from "./lib.js";

const [, , what, length = 20] = process.argv;

(async () => {
    await Promise.all(
        Array.from({ length }, (_, index) => {
            switch (what) {
                case "posts":
                    return generatePost({
                        index: index + 1,
                        basePath: "./data/blog",
                    });
                case "projects":
                    return generateProject({
                        index: index + 1,
                        basePath: "./data/projects",
                    });
            }
        })
    );
    console.log(`Generated ${length} ${what}.`);
})();
