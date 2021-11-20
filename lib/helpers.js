export const formatDate = (date) => date.toLocaleDateString();

export const getLink = (page) => `/${page.slug}.html`;

export const isCurrent = (navEntry, currentPage) =>
    currentPage.slug.startsWith(navEntry.slug) ? "current" : null;
