document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://weflix.jameshamby.me/api/movies';
    const movieRowsContainer = document.getElementById('movie-rows-container');
    
    // Hero Section Elements
    const heroBg = document.getElementById('hero-bg');
    const heroTitle = document.getElementById('hero-title');
    const heroDescription = document.getElementById('hero-description');
    const heroPlayBtn = document.getElementById('hero-play-btn');
    const heroInfoBtn = document.getElementById('hero-info-btn');

    // Video Player Elements
    const videoModal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    const closeModalBtn = document.getElementById('close-modal-btn');

    let moviesData = []; 
    let currentHeroMovie = null;

    // --- DYNAMIC HERO LOGIC ---
    const updateHeroSection = (movie) => {
        currentHeroMovie = movie;
        heroBg.style.backgroundImage = `url('${movie.posterUrl || `https://placehold.co/1920x1080/0c0a09/d946ef?text=SYSTEM_FAILURE`}')`;
        heroTitle.textContent = movie.title;
        heroDescription.textContent = movie.description;
    };

    // --- MODAL & PLAYER LOGIC ---
    const openPlayer = (streamUrl) => {
        if (!streamUrl) {
            alert('Video stream for this title is not available.');
            return;
        }
        videoPlayer.src = streamUrl;
        videoModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const closePlayer = () => {
        videoPlayer.pause();
        videoPlayer.src = '';
        videoModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };

    // --- UTILITY FUNCTIONS ---
    const createMovieCard = (movie) => {
        const card = document.createElement('div');
        card.className = 'movie-card flex-shrink-0 w-40 md:w-60 rounded-lg overflow-hidden cursor-pointer relative aspect-[2/3]';
        
        const poster = movie.posterUrl || `https://placehold.co/400x600/0c0a09/f0abfc?text=${encodeURIComponent(movie.title)}`;
        const titleContent = movie.titleImageUrl 
            ? `<img src="${movie.titleImageUrl}" alt="${movie.title} Logo" class="title-logo">`
            : `<h4 class="font-bold text-lg">${movie.title}</h4>`;

        card.innerHTML = `
            <img src="${poster}" alt="${movie.title}" class="w-full h-full object-cover">
            <div class="info-overlay absolute inset-0 p-4">
                ${titleContent}
            </div>
        `;

        card.addEventListener('click', () => updateHeroSection(movie));
        return card;
    };
    
    const createMovieRow = (title, movies) => {
        const row = document.createElement('div');
        row.className = 'movie-row';
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'movie-row-scroll flex space-x-4 overflow-x-auto pb-4';
        movies.forEach(movie => {
            scrollContainer.appendChild(createMovieCard(movie));
        });
        row.innerHTML = `<h3 class="movie-row-title text-xl md:text-2xl font-bold mb-4">${title}</h3>`;
        row.appendChild(scrollContainer);
        return row;
    };

    const fetchMovies = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error("Could not fetch movies:", error);
            movieRowsContainer.innerHTML = `<p class="text-red-500">Could not load movies. Is the server running?</p>`;
            return [];
        }
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        heroPlayBtn.addEventListener('click', () => {
            if (currentHeroMovie) openPlayer(currentHeroMovie.streamUrl);
        });
        heroInfoBtn.addEventListener('click', () => {
            if (currentHeroMovie) alert(`More details for: ${currentHeroMovie.title}`);
        });
        document.getElementById('search-icon').addEventListener('click', () => alert('Opening search...'));
        document.getElementById('notification-icon').addEventListener('click', () => alert('Showing notifications...'));
        closeModalBtn.addEventListener('click', closePlayer);
    };

    // --- INITIALIZATION LOGIC ---
    const initializePage = async () => {
        moviesData = await fetchMovies(); 
        if (moviesData.length > 0) {
            updateHeroSection(moviesData[0]);
            movieRowsContainer.appendChild(createMovieRow('Trending Now', moviesData));
            movieRowsContainer.appendChild(createMovieRow('New Releases', [...moviesData].reverse()));
            movieRowsContainer.appendChild(createMovieRow('Sci-Fi Hits', moviesData.filter(m => m.genre === 'Sci-Fi')));
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.movie-row').forEach(row => observer.observe(row));
        document.getElementById('app-container').classList.remove('opacity-0');
    };

    initializePage();
    setupEventListeners();
});
