import Prism from "prismjs";

function initOutline() {
    const $titles = document.querySelectorAll("h2, h3, h4");
    const $aside = document.querySelector("aside ul");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const $target = document.querySelector(
                    `a[href="#${entry.target.id}"]`
                );
                $target.classList.toggle("active", entry.isIntersecting);
            });
        },
        {
            root: null,
            rootMargin: "0px",
            threshold: 1.0,
        }
    );

    $titles.forEach((el) => {
        $aside.innerHTML += `<li class="from-${el.tagName.toLowerCase()}"><a href="#${
            el.id
        }">${el.innerText}</a></li>`;
        observer.observe(el);
    });

    $aside.addEventListener("click", (event) => {
        event.preventDefault();
        if (!event.target.href) {
            return;
        }
        const $target = document.getElementById(
            event.target.href.split("#")[1]
        );
        if (!$target) {
            return;
        }

        $target.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
        history.replaceState(null, null, event.target.href);
    });
}

window.addEventListener("load", () => {
    const $nav = document.querySelector("nav");

    window.addEventListener("scroll", () => {
        $nav.classList.toggle("scrolled", window.scrollY > 0);
        document.body.classList.remove("nav-open");
    });

    $nav.querySelector("button").addEventListener("click", () =>
        document.body.classList.toggle("nav-open")
    );

    Prism.highlightAll();

    initOutline();
});
