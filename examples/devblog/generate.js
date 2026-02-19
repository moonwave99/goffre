import { generator } from "../../dist/index.js";

const {
  generatePost,
  generateProject,
  getRandomProjectNames,
  writeOutput,
  toMarkdownFile,
} = generator;

const [, , what, length = 20] = process.argv;

switch (what) {
  case "posts":
    await Promise.all(
      Array.from({ length }, (_, index) => {
        const basePath = "./data/blog";
        const { fileName, ...post } = generatePost({
          index: index + 1,
        });
        return writeOutput({
          basePath,
          output: toMarkdownFile(post),
          fileName,
        });
      }),
    );
    break;
  case "projects":
    await Promise.all(
      getRandomProjectNames(+length).map((name, index) => {
        const basePath = "./data/projects";
        const { fileName, ...project } = generateProject({
          name,
          index: index + 1,
        });
        return writeOutput({
          basePath,
          output: toMarkdownFile(project),
          fileName,
        });
      }),
    );
}
console.log(`Generated ${length} ${what}.`);
