document.addEventListener("DOMContentLoaded", function () {
    function highlightActiveLink() {
        const links = document.querySelectorAll(".menu a");
        const currentUrl = window.location.href; // Obtiene la URL completa

        links.forEach(link => {
            if (currentUrl.includes(link.getAttribute("href"))) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }

    highlightActiveLink();
});
