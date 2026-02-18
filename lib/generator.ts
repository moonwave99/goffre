import path from "path";
import fs from "fs-extra";
import { faker } from "@faker-js/faker";
import yaml from "js-yaml";

const { outputFile } = fs;
const { date, helpers, lorem } = faker;

const techs = [
  "express",
  "webpack",
  "handlebars",
  "markdown",
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

export function getRandomProjectNames(length: number) {
  const projectNames = projectRoots
    .reduce(
      (memo, x) => [...memo, ...projectSuffixes.map((y) => `${x}${y}`)],
      [] as string[],
    )
    .map((x) => `${x[0].toUpperCase()}${x.slice(1)}`);

  return helpers.arrayElements(projectNames, length);
}

const UNSPLASH_COLLECTION = 4324303;
const COVER_SIZE = "800x450";

type WriteOutputParams = {
  basePath: string;
  fileName: string;
  output: string;
};

export async function writeOutput({
  basePath,
  fileName,
  output,
}: WriteOutputParams) {
  return await outputFile(path.join(basePath, fileName), output);
}

export function toMarkdownFile({
  content,
  ...frontMatter
}: {
  content: string;
  frontMatter: Record<string, unknown>;
}) {
  return `---
${yaml.dump(frontMatter)}---

${content}`;
}

type GeneratePostParams = {
  index: number;
  template?: string;
  slug?: string;
  withBlocks?: boolean;
};

export function generatePost({
  index,
  template = "pages/blog/post",
  slug = "blog/:created_at/:title",
  withBlocks = false,
}: GeneratePostParams) {
  const fileName = `${index < 10 ? `0${index}` : index}-this-is-a-blog-post.md`;

  return {
    title: `This is post number ${index}`,
    template,
    created_at: date.between({ from: "2010-01-01", to: new Date() }),
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
    content: withBlocks
      ? Array.from({ length: 3 }, (_, i) => getBlock(i)).join("\n\n")
      : lorem.paragraphs(5),
  };
}

function getBlock(index = 0) {
  return ["<!-- block -->", `## Block ${index + 1}`, lorem.paragraphs(1)].join(
    "\n\n",
  );
}

export function generateProject({
  name,
  index,
}: {
  name: string;
  index: number;
}) {
  const fileName = `${index < 10 ? `0${index}` : index}-${name}.md`;

  return {
    title: name,
    slug: `projects/:title`,
    template: "pages/projects/project",
    work_date: date.between({ from: "2010-01-01", to: new Date() }),
    homepage: "https://example.com/",
    demo: "https://example.com/",
    technologies: helpers.arrayElements(techs, 3),
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
