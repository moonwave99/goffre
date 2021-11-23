import path from "path";
import fs from "fs-extra";
import faker from "faker";
import yaml from "js-yaml";

const { outputFile } = fs;
const { date, random, lorem } = faker;

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
    "run",
    "oslo",
    "dino",
    "site",
    "filo",
    "tipsy",
    "micro",
    "tico",
    "mega",
    "clumsy",
];

const projectSuffixes = ["ify", "fix", "matic", "max", "tastic"];

export function getRandomProjectNames(length) {
    const projectNames = projectRoots
        .reduce(
            (memo, x) => [...memo, ...projectSuffixes.map((y) => `${x}${y}`)],
            []
        )
        .map((x) => `${x[0].toUpperCase()}${x.slice(1)}`);

    return random.arrayElements(projectNames, length);
}

const UNSPLASH_COLLECTION = 4324303;
const COVER_SIZE = "800x450";

export async function writeOutput({ basePath, fileName, output }) {
    return await outputFile(path.join(basePath, fileName), output);
}

export function toMarkdownFile({ content, ...frontMatter }) {
    return `---
${yaml.dump(frontMatter)}---

${content}`;
}

export function generatePost({
    index,
    template = "pages/blog/post",
    slug = "blog/:created_at/:title",
}) {
    const fileName = `${
        index < 10 ? `0${index}` : index
    }-this-is-a-blog-post.md`;

    return {
        title: `This is post number ${index}`,
        template,
        created_at: date.between("2010-01-01", "2020-01-01"),
        slug,
        cover: {
            url: `https://source.unsplash.com/collection/${UNSPLASH_COLLECTION}/${COVER_SIZE}?${index}`,
            caption: "A nice picture",
            attribution: {
                text: "Source: Unsplash",
                link: "https://source.unsplash.com/",
            },
        },
        fileName,
        content: lorem.paragraphs(5),
    };
}

export function generateProject({ name, index }) {
    const fileName = `${index < 10 ? `0${index}` : index}-${name}.md`;

    return {
        title: name,
        slug: `projects/:title`,
        template: "pages/projects/project",
        work_date: date.between("2010-01-01", "2020-01-01"),
        homepage: "https://example.com/",
        demo: "https://example.com/",
        technologies: random.arrayElements(techs, 3),
        cover: {
            url: `https://source.unsplash.com/${COVER_SIZE}/?web&${name}`,
            caption: "A nice picture",
            attribution: {
                text: "Source: Unsplash",
                link: "https://source.unsplash.com/",
            },
        },
        fileName,
        content: lorem.paragraphs(5),
    };
}
