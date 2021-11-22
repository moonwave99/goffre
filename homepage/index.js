import path from "path";
import { dirname } from "dirname-filename-esm";
import chalk from "chalk";
import { load, render, log } from "../lib/index.js";

const __dirname = dirname(import.meta);

const buildPath = path.join(__dirname, "dist");
const dataPath = path.join(__dirname, "data");
const sitePath = path.join(__dirname, "src", "site");

(async () => {
    log(`Getting data from ${chalk.yellow(dataPath)}:`);

    const { json, pages } = await load({ dataPath });

    try {
        const results = await render({
            verbose: true,
            buildPath,
            sitePath,
            pages: [...pages],
            locals: {
                ...json,
                domain: "https://moonwave99.github.io/goffre",
            },
        });
        log(`Generated ${chalk.yellow(results.length)} pages`);
    } catch (error) {
        console.log(chalk.red(`Error generating site`));
        console.log(error);
    }
})();
