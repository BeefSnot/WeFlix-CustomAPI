document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://weflix.media/api/movies';
    const movieRowsContainer = document.getElementById('movie-rows-container');

    // Hero Section Elements
    const heroBg = document.getElementById('hero-bg');
    const heroTitle = document.getElementById('hero-title');
    const heroDescription = document.getElementById('hero-description');
    const heroPlayBtn = document.getElementById('hero-play-btn');
    const heroInfoBtn = document.getElementById('hero-info-btn');

    // Video Player Elements (custom player only)
    const videoModal = document.getElementById('video-modal');
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
    const closePlayer = () => {
        const video = document.getElementById('custom-video');
        video.pause();
        video.src = '';
        videoModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };
    
    // --- NAVIGATION LOGIC ---
    const showDetailsPage = (movie) => {
        // In a real app, this would navigate to a new page like /movie/123
        // For this presentation, we'll simulate it by changing the URL hash
        const movieSlug = movie.title.toLowerCase().replace(/ /g, '-');
        window.location.hash = `#/movie/${movieSlug}`;
        alert(`Navigating to details page for: ${movie.title}`);
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
                <div class="card-actions">
                    <button class="card-button play-button">
                        <i class="ph ph-play-fill text-xl"></i>
                    </button>
                    <button class="card-button details-button">
                        <i class="ph ph-info-fill text-xl"></i>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners to the new buttons inside the card
        card.querySelector('.play-button').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the hero from updating
            playById(movie.id); // fresh token
        });
        
        card.querySelector('.details-button').addEventListener('click', (e) => {
            e.stopPropagation();
            showDetailsPage(movie);
        });

        // Clicking the card itself still updates the hero
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
            if (currentHeroMovie) playById(currentHeroMovie.id); // fresh token
        });
        heroInfoBtn.addEventListener('click', () => {
            if (currentHeroMovie) showDetailsPage(currentHeroMovie);
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

    window.playById = async function(id) {
        try {
            const res = await fetch(`/api/movies/${id}`);
            if (!res.ok) throw new Error('Failed to get stream URL');
            const movie = await res.json();
            if (!movie.streamUrl) throw new Error('No stream URL');
            window.openCustomPlayer(movie);
        } catch (e) {
            alert('Video stream for this title is not available.');
            console.error(e);
        }
    };

    // Show logged-in user in header and toggle Admin link
    (function showUserBadge() {
        try {
            const raw = localStorage.getItem('weflix.jwt');
            if (!raw) return;
            const payload = JSON.parse(atob(raw.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) return;
            const badge = document.getElementById('user-badge');
            const adminLink = document.getElementById('admin-link');
            if (badge) {
                badge.textContent = `Logged in: ${payload.username} (${payload.role})`;
                badge.classList.remove('hidden');
            }
            if (adminLink && payload.role === 'admin') adminLink.classList.remove('hidden');
        } catch { /* ignore */ }
    })();

    const avatar = document.getElementById('profile-avatar');
    const menu = document.getElementById('profile-menu');
    const guest = document.getElementById('menu-guest');
    const userMenu = document.getElementById('menu-user');
    const userName = document.getElementById('menu-username');
    const adminLink = document.getElementById('menu-admin');
    const logoutBtn = document.getElementById('menu-logout');

    function readJwt() {
        try { const raw = localStorage.getItem('weflix.jwt'); if (!raw) return null; return JSON.parse(atob(raw.split('.')[1])); } catch { return null; }
    }
    function refreshUserUI() {
        const p = readJwt();
        const badge = document.getElementById('user-badge');
        const isValid = p && (!p.exp || p.exp > (Date.now() / 1000));
        if (isValid) {
          guest.classList.add('hidden'); userMenu.classList.remove('hidden');
          userName.textContent = `${p.username} (${p.role})`;
          if (badge) { badge.textContent = `Logged in: ${p.username} (${p.role})`; badge.classList.remove('hidden'); }
          if (p.role === 'admin') adminLink.classList.remove('hidden'); else adminLink.classList.add('hidden');
        } else {
          userMenu.classList.add('hidden'); guest.classList.remove('hidden');
          adminLink.classList.add('hidden');
          if (badge) badge.classList.add('hidden');
        }
      }
      refreshUserUI();

    avatar && avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) menu.classList.add('hidden');
    });
    logoutBtn && logoutBtn.addEventListener('click', async () => {
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
        localStorage.removeItem('weflix.jwt');
        refreshUserUI();
        menu.classList.add('hidden');
        location.reload();
    });
});

// --- Custom Video Player Logic ---
(function () {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('custom-video');
    const playpause = document.getElementById('playpause');
    const seekbar = document.getElementById('seekbar');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');
    const quality = document.getElementById('quality');
    const subtitle = document.getElementById('subtitle');
    const speed = document.getElementById('speed');
    const volume = document.getElementById('volume');
    const closeBtn = document.getElementById('close-modal-btn');

    // Prevent download/context menu
    video.addEventListener('contextmenu', e => e.preventDefault());
    video.controls = false;

    // Example sources and subtitles (replace with dynamic data as needed)
    let sources = [];
    let subtitles = [];

    // Open modal and load video
    window.openCustomPlayer = function (movie) {
        sources = [
            { label: 'HD', src: `/api/stream/${movie.id}`, type: 'video/mp4' }
        ];
        subtitles = movie.subtitles || [
            { label: 'None', src: '', srclang: '', default: true },
            ...(movie.subtitlesList || [])
        ];

        // Populate quality selector
        quality.innerHTML = '';
        sources.forEach((s, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = s.label;
            quality.appendChild(opt);
        });

        // Populate subtitles
        subtitle.innerHTML = '';
        subtitles.forEach((s, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = s.label;
            subtitle.appendChild(opt);
        });

        loadSource(0);
        modal.classList.remove('hidden');
        video.play();
    };

    function loadSource(idx) {
        video.src = sources[idx].src;
        video.type = sources[idx].type;
        video.load();
        // Remove old tracks
        Array.from(video.querySelectorAll('track')).forEach(t => t.remove());
        // Add selected subtitle if not "None"
        const subIdx = subtitle.value || 0;
        if (subtitles[subIdx] && subtitles[subIdx].src) {
            const track = document.createElement('track');
            track.kind = 'subtitles';
            track.label = subtitles[subIdx].label;
            track.srclang = subtitles[subIdx].srclang;
            track.src = subtitles[subIdx].src;
            track.default = true;
            video.appendChild(track);
        }
    }

    // Controls
    playpause.onclick = () => video.paused ? video.play() : video.pause();
    video.onplay = () => { playpause.textContent = '⏸️'; };
    video.onpause = () => { playpause.textContent = '▶️'; };

    video.ontimeupdate = () => {
        seekbar.value = (video.currentTime / video.duration) * 100 || 0;
        currentTime.textContent = formatTime(video.currentTime);
        duration.textContent = formatTime(video.duration);
    };
    seekbar.oninput = () => {
        video.currentTime = (seekbar.value / 100) * video.duration;
    };

    quality.onchange = () => {
        const wasPlaying = !video.paused;
        loadSource(quality.value);
        if (wasPlaying) video.play();
    };

    subtitle.onchange = () => {
        loadSource(quality.value || 0);
        video.play();
    };

    speed.onchange = () => {
        video.playbackRate = parseFloat(speed.value);
    };

    volume.oninput = () => {
        video.volume = parseFloat(volume.value);
    };

    closeBtn.onclick = () => {
        video.pause();
        modal.classList.add('hidden');
        video.src = '';
    };

    function formatTime(sec) {
        sec = Math.floor(sec || 0);
        return `${Math.floor(sec / 60)}:${('0' + (sec % 60)).slice(-2)}`;
    }
})();

// --- Example usage: Replace your play button logic to use openCustomPlayer ---
// document.getElementById('hero-play-btn').onclick = function() {
//     openCustomPlayer({
//         sources: [
//             { label: '1080p', src: '/api/stream/movie.mp4?quality=1080', type: 'video/mp4' },
//             { label: '720p', src: '/api/stream/movie.mp4?quality=720', type: 'video/mp4' }
//         ],
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://weflix.media/api/movies';
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
    
    // --- NAVIGATION LOGIC ---
    const showDetailsPage = (movie) => {
        // In a real app, this would navigate to a new page like /movie/123
        // For this presentation, we'll simulate it by changing the URL hash
        const movieSlug = movie.title.toLowerCase().replace(/ /g, '-');
        window.location.hash = `#/movie/${movieSlug}`;
        alert(`Navigating to details page for: ${movie.title}`);
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
                <div class="card-actions">
                    <button class="card-button play-button">
                        <i class="ph ph-play-fill text-xl"></i>
                    </button>
                    <button class="card-button details-button">
                        <i class="ph ph-info-fill text-xl"></i>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners to the new buttons inside the card
        card.querySelector('.play-button').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the hero from updating
            playById(movie.id); // fresh token
        });
        
        card.querySelector('.details-button').addEventListener('click', (e) => {
            e.stopPropagation();
            showDetailsPage(movie);
        });

        // Clicking the card itself still updates the hero
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
            if (currentHeroMovie) playById(currentHeroMovie.id); // fresh token
        });
        heroInfoBtn.addEventListener('click', () => {
            if (currentHeroMovie) showDetailsPage(currentHeroMovie);
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

    window.playById = async function(id) {
        try {
            const res = await fetch(`/api/movies/${id}`);
            if (!res.ok) throw new Error('Failed to get stream URL');
            const movie = await res.json();
            if (!movie.streamUrl) throw new Error('No stream URL');
            openPlayer(movie.streamUrl); // uses your existing modal/video element
        } catch (e) {
            alert('Video stream for this title is not available.');
            console.error(e);
        }
    };

    // Show logged-in user in header and toggle Admin link
    (function showUserBadge() {
        try {
            const raw = localStorage.getItem('weflix.jwt');
            if (!raw) return;
            const payload = JSON.parse(atob(raw.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) return;
            const badge = document.getElementById('user-badge');
            const adminLink = document.getElementById('admin-link');
            if (badge) {
                badge.textContent = `Logged in: ${payload.username} (${payload.role})`;
                badge.classList.remove('hidden');
            }
            if (adminLink && payload.role === 'admin') adminLink.classList.remove('hidden');
        } catch { /* ignore */ }
    })();

    const avatar = document.getElementById('profile-avatar');
    const menu = document.getElementById('profile-menu');
    const guest = document.getElementById('menu-guest');
    const userMenu = document.getElementById('menu-user');
    const userName = document.getElementById('menu-username');
    const adminLink = document.getElementById('menu-admin');
    const logoutBtn = document.getElementById('menu-logout');

    function readJwt() {
        try { const raw = localStorage.getItem('weflix.jwt'); if (!raw) return null; return JSON.parse(atob(raw.split('.')[1])); } catch { return null; }
    }
    function refreshUserUI() {
        const p = readJwt();
        const badge = document.getElementById('user-badge');
        const isValid = p && (!p.exp || p.exp > (Date.now() / 1000));
        if (isValid) {
          guest.classList.add('hidden'); userMenu.classList.remove('hidden');
          userName.textContent = `${p.username} (${p.role})`;
          if (badge) { badge.textContent = `Logged in: ${p.username} (${p.role})`; badge.classList.remove('hidden'); }
          if (p.role === 'admin') adminLink.classList.remove('hidden'); else adminLink.classList.add('hidden');
        } else {
          userMenu.classList.add('hidden'); guest.classList.remove('hidden');
          adminLink.classList.add('hidden');
          if (badge) badge.classList.add('hidden');
        }
      }
      refreshUserUI();

    avatar && avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) menu.classList.add('hidden');
    });
    logoutBtn && logoutBtn.addEventListener('click', async () => {
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
        localStorage.removeItem('weflix.jwt');
        refreshUserUI();
        menu.classList.add('hidden');
        location.reload();
    });
});

// --- Custom Video Player Logic ---
(function () {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('custom-video');
    const playpause = document.getElementById('playpause');
    const seekbar = document.getElementById('seekbar');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');
    const quality = document.getElementById('quality');
    const subtitle = document.getElementById('subtitle');
    const speed = document.getElementById('speed');
    const volume = document.getElementById('volume');
    const closeBtn = document.getElementById('close-modal-btn');

    // Prevent download/context menu
    video.addEventListener('contextmenu', e => e.preventDefault());
    video.controls = false;

    let sources = [];
    let subtitles = [];

    // Open modal and load video (expects movie.streamUrl to be tokenized)
    window.openCustomPlayer = function (movie) {
        sources = [
            { label: 'HD', src: movie.streamUrl, type: 'video/mp4' }
        ];
        subtitles = movie.subtitles || [
            { label: 'None', src: '', srclang: '', default: true },
            ...(movie.subtitlesList || [])
        ];

        // Populate quality selector
        quality.innerHTML = '';
        sources.forEach((s, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = s.label;
            quality.appendChild(opt);
        });

        // Populate subtitles
        subtitle.innerHTML = '';
        subtitles.forEach((s, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = s.label;
            subtitle.appendChild(opt);
        });

        loadSource(0);
        modal.classList.remove('hidden');
        video.play();
    };

    function loadSource(idx) {
        video.src = sources[idx].src;
        video.type = sources[idx].type;
        video.load();
        // Remove old tracks
        Array.from(video.querySelectorAll('track')).forEach(t => t.remove());
        // Add selected subtitle if not "None"
        const subIdx = subtitle.value || 0;
        if (subtitles[subIdx] && subtitles[subIdx].src) {
            const track = document.createElement('track');
            track.kind = 'subtitles';
            track.label = subtitles[subIdx].label;
            track.srclang = subtitles[subIdx].srclang;
            track.src = subtitles[subIdx].src;
            track.default = true;
            video.appendChild(track);
        }
    }

    // Controls
    playpause.onclick = () => video.paused ? video.play() : video.pause();
    video.onplay = () => { playpause.textContent = '⏸️'; };
    video.onpause = () => { playpause.textContent = '▶️'; };

    video.ontimeupdate = () => {
        seekbar.value = (video.currentTime / video.duration) * 100 || 0;
        currentTime.textContent = formatTime(video.currentTime);
        duration.textContent = formatTime(video.duration);
    };
    seekbar.oninput = () => {
        video.currentTime = (seekbar.value / 100) * video.duration;
    };

    quality.onchange = () => {
        const wasPlaying = !video.paused;
        loadSource(quality.value);
        if (wasPlaying) video.play();
    };

    subtitle.onchange = () => {
        loadSource(quality.value || 0);
        video.play();
    };

    speed.onchange = () => {
        video.playbackRate = parseFloat(speed.value);
    };

    volume.oninput = () => {
        video.volume = parseFloat(volume.value);
    };

    closeBtn.onclick = () => {
        video.pause();
        modal.classList.add('hidden');
        video.src = '';
    };

    function formatTime(sec) {
        sec = Math.floor(sec || 0);
        return `${Math.floor(sec / 60)}:${('0' + (sec % 60)).slice(-2)}`;
    }
})();

// --- Example usage: Replace your play button logic to use openCustomPlayer ---
// document.getElementById('hero-play-btn').onclick = function() {
//     openCustomPlayer({
//         sources: [
//             { label: '1080p', src: '/api/stream/movie.mp4?quality=1080', type: 'video/mp4' },
//             { label: '720p', src: '/api/stream/movie.mp4?quality=720', type: 'video/mp4' }
//         ],
document.getElementById('hero-play-btn').onclick = function() {
    openCustomPlayer(currentMovie); // currentMovie should have .id
};
