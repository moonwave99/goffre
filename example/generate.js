import {
    generatePost,
    generateProject,
    getRandomProjectNames,
    writeOutput,
} from "../generator.js";

const [, , what, length = 20] = process.argv;

(async () => {
    switch (what) {
        case "posts":
            await Promise.all(
                Array.from({ length }, (_, index) => {
                    const basePath = "./data/blog";
                    const { output, fileName } = generatePost({
                        index: index + 1,
                    });
                    return writeOutput({ basePath, output, fileName });
                })
            );
            break;
        case "projects":
            await Promise.all(
                getRandomProjectNames(length).map((name, index) => {
                    const basePath = "./data/projects";
                    const { output, fileName } = generateProject({
                        name,
                        index: index + 1,
                    });
                    return writeOutput({ basePath, output, fileName });
                    Z;
                })
            );
    }
    console.log(`Generated ${length} ${what}.`);
})();
