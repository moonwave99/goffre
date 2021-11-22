import path from "path";
import fs from "fs-extra";
import faker from "faker";
import yaml from "js-yaml";

const { outputFile } = fs;
const { date, random, lorem } = faker;

const [, , what, length = 20] = process.argv;

const techs = [
    "react",
    "node-js",
    "css",
    "web-workers",
    "svelte",
    "vue",
    "fortran",
    "cobol",
    "brainfuck",
    "cabal",
    "nosql",
    "postgres",
    "astrology",
];

const projectRoots = [
    "aloa",
    "oslo",
    "din",
    "mela",
    "sito",
    "filo",
    "nana",
    "bela",
];

const projectSuffixes = ["ify", "ino", "top", "fix", "tic", "max"];

function getProjectName() {
    const name = `${random.arrayElement(projectRoots)}${random.arrayElement(
        projectSuffixes
    )}`;
    return `${name[0].toUpperCase()}${name.slice(1)}`;
}

const UNSPLASH_COLLECTION = 4324303;
const COVER_SIZE = "800x450";

(async () => {
    // console.log(faker.lorem.paragraphs(5));
    // return;
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

export async function generatePost({ index, basePath }) {
    const fileName = `${
        index < 10 ? `0${index}` : index
    }-this-is-a-blog-post.md`;

    const frontMatter = {
        title: `This is post number ${index}`,
        template: "pages/blog/post",
        created_at: date.between("2010-01-01", "2020-01-01"),
        slug: "blog/:created_at/:title",
        cover: {
            url: `https://source.unsplash.com/collection/${UNSPLASH_COLLECTION}/${COVER_SIZE}?${index}`,
            caption: "A nice picture",
            attribution: {
                text: "Source: Unsplash",
                link: "https://source.unsplash.com/",
            },
        },
    };

    const output = `---
${yaml.dump(frontMatter)}---

${lorem.paragraphs(5)}`;

    return await outputFile(path.join(basePath, fileName), output);
}

export async function generateProject({ index, basePath }) {
    const title = getProjectName();
    const fileName = `${index < 10 ? `0${index}` : index}-this-is-a-project.md`;

    const frontMatter = {
        title,
        slug: `projects/${index}/:title`,
        template: "pages/projects/project",
        work_date: date.between("2010-01-01", "2020-01-01"),
        homepage: "https://example.com/",
        demo: "https://example.com/",
        technologies: random.arrayElements(techs, 3),
        cover: {
            url: `https://source.unsplash.com/${COVER_SIZE}/?web&${index}`,
            caption: "A nice picture",
            attribution: {
                text: "Source: Unsplash",
                link: "https://source.unsplash.com/",
            },
        },
    };
    const output = `---
${yaml.dump(frontMatter)}---

${lorem.paragraphs(5)}`;

    return await outputFile(path.join(basePath, fileName), output);
}
