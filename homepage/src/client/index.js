import Prism from "prismjs";

(() => {
    const $nav = document.querySelector("nav");

    window.addEventListener("scroll", () => {
        $nav.classList.toggle("scrolled", window.scrollY > 0);
        document.body.classList.remove("nav-open");
    });

    $nav.querySelector("button").addEventListener("click", () =>
        document.body.classList.toggle("nav-open")
    );

    Prism.highlightAll();
})();
