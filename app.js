
document.addEventListener("DOMContentLoaded", () => {


    const sidebar = document.querySelector(".sidebar");
    const sidebarTrigger = document.querySelector(".sidebar-trigger");

    const searchToggle = document.querySelector("#search-toggle");
    const searchInput = document.querySelector("#movie-search");

    const homeToggle = document.querySelector("#home-toggle");
    const moviesToggle = document.querySelector("#movies-toggle");
    const savedToggle = document.querySelector("#saved-toggle");
    const watchLaterMenu = document.querySelector("#watch-later-menu");

    const watchLaterSection = document.querySelector("#watch-later-section");
    const watchLaterList = document.querySelector("#watch-later-list");
    const watchLaterEmpty = document.querySelector("#watch-later-empty");

    const filterStatus = document.querySelector("#filter-status");

    const rickrollOverlay = document.querySelector("#rickroll-overlay");
    const rickrollVideo = document.querySelector("#rickroll-video");
    const closeRickroll = document.querySelector("#close-rickroll");

    const movieItems = [
        ...document.querySelectorAll(
            ".movie-list-container:not(#watch-later-section) .movie-list-item"
        )
    ];

    const arrows = document.querySelectorAll(".arrow");


    
    if (sidebar && sidebarTrigger){

        sidebarTrigger.addEventListener("mouseenter", () => {
            sidebar.classList.add("visible");
        });

        sidebar.addEventListener("mouseenter", () => {
            sidebar.classList.add("visible");
        });

        sidebar.addEventListener("mouseleave", () => {
            sidebar.classList.remove("visible");
        });

        sidebarTrigger.addEventListener("mouseleave", () => {
            if (!sidebar.matches(":hover")) {
                sidebar.classList.remove("visible");
            }
        });

    }


    
    const STORAGE_KEY = "movieHubWatchLater";

    function readSavedMovies(){

        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }

    }

    let savedMovies = readSavedMovies();


    
    movieItems.forEach((movie, index) =>{

        const movieId = `movie-${index}`;
        movie.dataset.movieId = movieId;

        const heartButton = document.createElement("button");

        heartButton.className = "movie-heart-button";
        heartButton.type = "button";
        heartButton.innerHTML = '<i class="fa-solid fa-heart"></i>';

        heartButton.title = "Add to Watch Later";
        heartButton.setAttribute("aria-label", "Add to Watch Later");

        movie.appendChild(heartButton);


        
        heartButton.addEventListener("click", (event) =>{

            event.stopPropagation();

            if (savedMovies.includes(movieId)) {

                savedMovies = savedMovies.filter(id => id !== movieId);

            } else {

                savedMovies.push(movieId);

            }

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(savedMovies)
            );

            updateHearts();
            renderWatchLater();

        });


        
        movie.addEventListener("click", (event) =>{

            if (event.target.closest(".movie-heart-button")) {
                return;
            }

            movieItems.forEach(item => {
                item.classList.remove("selected");
            });

            movie.classList.add("selected");

        });

    });


    
    function updateHearts(){

        movieItems.forEach(movie => {

            const movieId = movie.dataset.movieId;
            const heart = movie.querySelector(".movie-heart-button");

            const isSaved = savedMovies.includes(movieId);

            heart.classList.toggle("saved", isSaved);

            heart.title = isSaved
                ? "Remove from Watch Later"
                : "Add to Watch Later";

        });

    }


    
    function renderWatchLater(){

        watchLaterList.innerHTML = "";

        savedMovies.forEach(movieId => {

            const originalMovie = movieItems.find(
                movie => movie.dataset.movieId === movieId
            );

            if (!originalMovie) return;

            const clonedMovie = originalMovie.cloneNode(true);

            const clonedHeart = clonedMovie.querySelector(".movie-heart-button");

            if (clonedHeart) {
                clonedHeart.remove();
            }

            clonedMovie.classList.remove("selected");

            watchLaterList.appendChild(clonedMovie);

        });

        watchLaterEmpty.classList.toggle(
            "hidden",
            savedMovies.length > 0
        );

        watchLaterList.dataset.offset = "0";
        watchLaterList.style.transform = "translateX(0px)";

    }


    
    function openRickroll(){

        if (!rickrollOverlay || !rickrollVideo) return;

        
        rickrollOverlay.classList.add("active");
        rickrollOverlay.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        rickrollVideo.pause();
        rickrollVideo.load();

        const playPromise = rickrollVideo.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("The Rickroll video could not play:", error);
            });
        }

    }


    
    function closeRickrollOverlay(){

        if (!rickrollOverlay || !rickrollVideo) return;

        
        rickrollVideo.pause();
        rickrollVideo.currentTime = 0;

        rickrollOverlay.classList.remove("active");
        rickrollOverlay.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

    }


    document.addEventListener("click", (event) => {

        const watchButton = event.target.closest(
            ".movie-list-item-button, .featured-button"
        );

        if (watchButton) {

            event.preventDefault();
            openRickroll();

        }

    });


    if (closeRickroll) {
        closeRickroll.addEventListener("click", closeRickrollOverlay);
    }


    if (rickrollOverlay) {

        rickrollOverlay.addEventListener("click", (event) => {

            if (event.target === rickrollOverlay) {
                closeRickrollOverlay();
            }

        });

    }


    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            rickrollOverlay &&
            rickrollOverlay.classList.contains("active")
        ) {
            closeRickrollOverlay();
        }

    });


    function toggleSearch(){

        searchInput.classList.toggle("active");

        if (searchInput.classList.contains("active")) {

            searchInput.focus();

        } else {

            searchInput.value = "";
            applySearch();

        }

    }

    searchToggle.addEventListener("click", toggleSearch);

    searchToggle.addEventListener("keydown", event => {

        if (event.key === "Enter" || event.key === " ") {

            event.preventDefault();
            toggleSearch();

        }

    });



    function applySearch() {

        const searchText = searchInput.value.toLowerCase().trim();

        let visibleCount = 0;

        movieItems.forEach(movie => {

            const title =
                movie.querySelector(".movie-list-item-title")
                    .textContent.toLowerCase();

            const description =
                movie.querySelector(".movie-list-item-desc")
                    .textContent.toLowerCase();

            const matches =
                title.includes(searchText) ||
                description.includes(searchText);

            movie.style.display = matches ? "" : "none";

            if (matches) visibleCount++;

        });

        if (searchText) {

            filterStatus.textContent =
                `${visibleCount} matching movie(s)`;

            filterStatus.classList.add("active");

        } else {

            filterStatus.textContent = "";
            filterStatus.classList.remove("active");

        }

    }

    searchInput.addEventListener("input", applySearch);


    homeToggle.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });


    moviesToggle.addEventListener("click", () => {

        document.querySelector(".movie-list-container")
            .scrollIntoView({
                behavior: "smooth"
            });

    });


    function openWatchLater() {

        watchLaterSection.scrollIntoView({
            behavior: "smooth"
        });

    }

    savedToggle.addEventListener("click", openWatchLater);

    watchLaterMenu.addEventListener("click", openWatchLater);


    arrows.forEach(arrow => {

        arrow.addEventListener("click", () => {

            const wrapper = arrow.parentElement;
            const movieList = wrapper.querySelector(".movie-list");

            const currentOffset = Number(
                movieList.dataset.offset || 0
            );

            const maxOffset = Math.max(
                0,
                movieList.scrollWidth - wrapper.clientWidth
            );

            const slideAmount = 300;

            let nextOffset = currentOffset + slideAmount;

            if (nextOffset >= maxOffset) {
                nextOffset = 0;
            }

            movieList.dataset.offset = nextOffset;

            movieList.style.transform =
                `translateX(-${nextOffset}px)`;

        });

    });


    updateHearts();
    renderWatchLater();

});

