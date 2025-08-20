document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api/movies';
    const movieRowsContainer = document.getElementById('movie-rows-container');
    const appContainer = document.getElementById('app-container');
    const header = document.querySelector('header');
    
    // Video Modal Elements
    const videoModal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const mainContent = document.getElementById('main-content');

    let moviesData = []; // Store fetched movies

    // --- VIDEO PLAYER LOGIC ---
    const openPlayer = (streamUrl) => {
        if (!streamUrl) {
            alert('Video stream for this title is not available.');
            return;
        }
        videoPlayer.src = streamUrl;
        videoModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closePlayer = () => {
        videoPlayer.pause();
        videoPlayer.src = ''; // Clear source
        videoModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };

    // --- UTILITY FUNCTIONS ---
    const createMovieCard = (movie) => {
        const card = document.createElement('div');
        card.className = 'movie-card flex-shrink-0 w-40 md:w-60 rounded-lg overflow-hidden cursor-pointer relative aspect-[2/3]';
        const placeholderImg = `https://placehold.co/400x600/0c0a09/f0abfc?text=${encodeURIComponent(movie.title)}`;
        
        card.innerHTML = `
            <img src="${placeholderImg}" alt="${movie.title}" class="w-full h-full object-cover">
            <div class="info-overlay absolute inset-0 p-4 flex flex-col justify-end">
                <h4 class="font-bold text-lg">${movie.title}</h4>
                <div class="flex justify-between items-center text-xs text-gray-400 mt-1">
                    <span>${movie.year}</span>
                    <span class="flex items-center">
                        <i class="ph-star-fill text-yellow-400 mr-1"></i> ${movie.rating || 'N/A'}
                    </span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openPlayer(movie.streamUrl));
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
        document.getElementById('hero-play-btn').addEventListener('click', () => {
            if (moviesData.length > 0) {
                openPlayer(moviesData[0].streamUrl);
            }
        });
        document.getElementById('hero-info-btn').addEventListener('click', () => alert('Showing more info...'));
        document.getElementById('search-icon').addEventListener('click', () => alert('Opening search...'));
        document.getElementById('notification-icon').addEventListener('click', () => alert('Showing notifications...'));

        closeModalBtn.addEventListener('click', closePlayer);
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closePlayer();
            }
        });

        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    };

    // --- INITIALIZATION LOGIC ---
    const initializePage = async () => {
        moviesData = await fetchMovies(); 

        if (moviesData.length > 0) {
            document.getElementById('hero-title').textContent = moviesData[0].title;
            document.getElementById('hero-description').textContent = moviesData[0].description || 'No description available.';

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
        
        appContainer.classList.remove('opacity-0');
    };

    initializePage();
    setupEventListeners();
});
