import yall from "yall-js";

function loadBackground() {
    const dataset = document.querySelector("[data-background]")?.dataset;
    if (!dataset) {
        return;
    }
    const { background } = dataset;
    const img = new Image();
    document.body.classList.add("background-loadable");
    img.addEventListener("load", () => {
        document.documentElement.style.setProperty(
            "--background",
            `url(${background})`
        );
        document.body.classList.add("background-loaded");
    });
    img.src = background;
}

(() => {
    const $nav = document.querySelector("nav");

    window.addEventListener("scroll", (event) => {
        $nav.classList.toggle("scrolled", window.scrollY > 0);
        document.body.classList.remove("nav-open");
    });

    $nav.querySelector("button").addEventListener("click", () =>
        document.body.classList.toggle("nav-open")
    );

    document.addEventListener("DOMContentLoaded", () => {
        yall({
            events: {
                load: (event) => {
                    if (
                        !event.target.classList.contains("lazy") &&
                        event.target.nodeName == "IMG"
                    ) {
                        event.target.classList.add("loaded");
                        event.target
                            .closest("figure")
                            ?.classList?.add("loaded");
                    }
                },
            },
        });
    });

    loadBackground();
})();
