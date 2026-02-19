import { getSorter, getSlug, type Page } from "./goffre";
import { marked } from "marked";
import { stripHtml } from "string-strip-html";
import { type HelperOptions } from "handlebars";

type Context = {
  data: {
    root: {
      options?: {
        domain?: string;
        env?: {
          mode?: string;
        };
      };
    };
  };
};

type HelperContext = Context & Omit<HelperOptions, "fn" | "inverse">;
type BlockContext = Context & HelperOptions;

export const markdown = (text: string) => marked(text);

export async function getExcerpt(content: string) {
  const firstParagraph = content.split("\n").filter(Boolean).at(0);
  if (!firstParagraph) {
    return "";
  }
  const rendered = await marked(firstParagraph);
  return stripHtml(rendered).result;
}

export const getParamLink = (url: string, options: HelperContext) => {
  const output = getSlug(url, options.hash);
  return getAsset(output, options);
};

export const getAsset = (
  asset: string,
  context: Omit<HelperContext, "hash">,
) => {
  const { options, env } = context.data.root;
  return env.mode === "prod" && options.domain
    ? `${options.domain}${asset.startsWith("/") ? "" : "/"}${asset}`
    : asset;
};

export const getSitemapLink = (page: Page, context: HelperContext) => {
  const { options } = context.data.root;
  return `${options.domain}${getLink(page, context)}`;
};

export const getLink = (page: Page, context: HelperContext) => {
  const base =
    page.link || `${page.slug.startsWith("/") ? "" : "/"}${page.slug}`;
  const { uglyUrls } = context.data.root.options;
  if (uglyUrls) {
    return getAsset(`${base === "/" ? "/index" : base}.html`, context);
  }
  return getAsset(base.replace(/^\/index/, "/"), context);
};

export const getNavClass = ({ slug }: Page, currentPage: Page) => {
  const cleanSlug = slug && slug[0] === "/" ? slug.slice(1) : slug;
  return currentPage.slug.startsWith(cleanSlug)
    ? `${cleanSlug} current`
    : cleanSlug;
};

export const list = (context: Page[], options: BlockContext) => {
  const offset = parseInt(options.hash.offset, 10) || 0;
  const limit = parseInt(options.hash.limit, 10) || 100;
  const sortBy = options.hash.sortBy || "slug";
  const order = options.hash.order || "asc";

  let output = "";
  let i;

  const data = context.toSorted(getSorter({ sortBy, order }));

  if (offset < 0) {
    i = -offset < data.length ? data.length - -offset : 0;
  } else {
    i = offset < data.length ? offset : 0;
  }

  const j = limit + i < data.length ? limit + i : data.length;

  for (; i < j; i++) {
    output += options.fn(data[i]);
  }

  return output;
};

export const nextItem = (
  context: Page,
  options: Pick<BlockContext, "hash" | "fn">,
) => {
  const { list } = options.hash;
  const index = list.findIndex((x: Page) => x.slug === context.slug);
  const next = list[index + 1];
  if (!next) {
    return;
  }
  return options.fn(next);
};

export const prevItem = (
  context: Page,
  options: Pick<BlockContext, "hash" | "fn">,
) => {
  const { list } = options.hash;
  const index = list.findIndex((x: Page) => x.slug === context.slug);
  const prev = list[index - 1];
  if (!prev) {
    return;
  }
  return options.fn(prev);
};
