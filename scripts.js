// API Configuration
const API_KEY = 'your-api-key-here'; // Bạn cần đăng ký tại https://www.themoviedb.org/
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Dữ liệu phim sẽ được load từ API
let moviesData = [];
let seriesData = [];

// Background effects
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor-effect') || createCursorEffect();
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

function createCursorEffect() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-effect';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(255,107,107,0.8), transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        animation: cursorPulse 2s ease-in-out infinite;
    `;
    
    document.body.appendChild(cursor);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cursorPulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);
    
    return cursor;
}

document.addEventListener('click', (e) => {
    createRippleEffect(e.clientX, e.clientY);
});

function createRippleEffect(x, y) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 107, 107, 0.6);
        transform: translate(-50%, -50%);
        animation: rippleAnimation 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
    `;
    
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleAnimation {
        to { width: 100px; height: 100px; opacity: 0; }
    }
`;
document.head.appendChild(rippleStyle);

// API Functions
async function fetchMoviesFromAPI(category = 'popular', page = 1) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/movie/${category}?api_key=${API_KEY}&page=${page}&language=vi-VN`);
        const data = await response.json();
        
        const movies = data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            genre: movie.genre_ids[0] ? getGenreName(movie.genre_ids[0]) : 'unknown',
            image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/300x400?text=No+Image',
            description: movie.overview || 'Không có mô tả',
            rating: movie.vote_average,
            videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` // Demo video
        }));
        
        hideLoading();
        return movies;
    } catch (error) {
        console.error('Error fetching movies:', error);
        hideLoading();
        return getFallbackMovies();
    }
}

async function fetchSeriesFromAPI(page = 1) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}&language=vi-VN`);
        const data = await response.json();
        
        const series = data.results.map(show => ({
            id: show.id,
            title: show.name,
            year: show.first_air_date ? `${show.first_air_date.split('-')[0]}-${show.last_air_date ? show.last_air_date.split('-')[0] : 'Present'}` : 'N/A',
            genre: show.genre_ids[0] ? getGenreName(show.genre_ids[0]) : 'unknown',
            image: show.poster_path ? `${IMAGE_BASE_URL}${show.poster_path}` : 'https://via.placeholder.com/300x400?text=No+Image',
            description: show.overview || 'Không có mô tả',
            rating: show.vote_average,
            videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4` // Demo video
        }));
        
        hideLoading();
        return series;
    } catch (error) {
        console.error('Error fetching series:', error);
        hideLoading();
        return getFallbackSeries();
    }
}

async function searchMoviesAndSeries(query) {
    try {
        showLoading();
        const [movieResponse, seriesResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=vi-VN`),
            fetch(`${API_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=vi-VN`)
        ]);
        
        const movieData = await movieResponse.json();
        const seriesData = await seriesResponse.json();
        
        const movies = movieData.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            genre: movie.genre_ids[0] ? getGenreName(movie.genre_ids[0]) : 'unknown',
            image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/300x400?text=No+Image',
            description: movie.overview || 'Không có mô tả',
            rating: movie.vote_average,
            videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
        }));
        
        const series = seriesData.results.map(show => ({
            id: show.id,
            title: show.name,
            year: show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A',
            genre: show.genre_ids[0] ? getGenreName(show.genre_ids[0]) : 'unknown',
            image: show.poster_path ? `${IMAGE_BASE_URL}${show.poster_path}` : 'https://via.placeholder.com/300x400?text=No+Image',
            description: show.overview || 'Không có mô tả',
            rating: show.vote_average,
            videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`
        }));
        
        hideLoading();
        return { movies, series };
    } catch (error) {
        console.error('Error searching:', error);
        hideLoading();
        return { movies: [], series: [] };
    }
}

function getGenreName(genreId) {
    const genres = {
        28: 'action',
        12: 'adventure', 
        16: 'animation',
        35: 'comedy',
        80: 'crime',
        99: 'documentary',
        18: 'drama',
        10751: 'family',
        14: 'fantasy',
        36: 'history',
        27: 'horror',
        10402: 'music',
        9648: 'mystery',
        10749: 'romance',
        878: 'sci-fi',
        10770: 'tv-movie',
        53: 'thriller',
        10752: 'war',
        37: 'western'
    };
    return genres[genreId] || 'unknown';
}

// Loading functions
function showLoading() {
    const loadingDiv = document.getElementById('loading') || createLoadingElement();
    loadingDiv.style.display = 'flex';
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

function createLoadingElement() {
    const loading = document.createElement('div');
    loading.id = 'loading';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        color: white;
        font-size: 1.2rem;
    `;
    loading.innerHTML = `
        <div style="text-align: center;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #ff6b6b; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <div>Đang tải...</div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(loading);
    
    return loading;
}

// Fallback data nếu API không hoạt động
function getFallbackMovies() {
    return [
        {
            id: 1,
            title: "Avengers: Endgame",
            year: "2019",
            genre: "action",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
            description: "Sau sự xảy ra của Infinity War, vũ trụ đang trong tình trạng hỗn loạn...",
            rating: 8.4,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        },
        {
            id: 2,
            title: "The Dark Knight",
            year: "2008",
            genre: "action",
            image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=400&fit=crop",
            description: "Batman phải đối mặt với kẻ thù nguy hiểm nhất - Joker...",
            rating: 9.0,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        },
        {
            id: 3,
            title: "Inception",
            year: "2010",
            genre: "sci-fi",
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
            description: "Một tên trộm có khả năng xâm nhập vào giấc mơ của người khác...",
            rating: 8.8,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        },
        // Thêm nhiều phim fallback khác...
    ];
}

function getFallbackSeries() {
    return [
        {
            id: 1,
            title: "Game of Thrones",
            year: "2011-2019",
            genre: "drama",
            image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=400&fit=crop",
            description: "Cuộc chiến tranh giành quyền lực tại Westeros...",
            rating: 9.3,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        },
        // Thêm nhiều series fallback khác...
    ];
}

// Navigation
document.addEventListener('DOMContentLoaded', async function() {
    await loadMovies();
    await loadSeries();
    setupNavigation();
    setupSearch();
    setupVideoModal();
    setupGenreFilter();
    setupLoadMore();
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

async function loadMovies(category = 'popular') {
    moviesData = await fetchMoviesFromAPI(category);
    displayMovies(moviesData);
}

async function loadSeries() {
    seriesData = await fetchSeriesFromAPI();
    displaySeries(seriesData);
}

function displayMovies(movies) {
    const moviesGrid = document.getElementById('moviesGrid');
    moviesGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesGrid.appendChild(movieCard);
    });
}

function displaySeries(series) {
    const seriesGrid = document.getElementById('seriesGrid');
    seriesGrid.innerHTML = '';
    
    series.forEach(show => {
        const seriesCard = createSeriesCard(show);
        seriesGrid.appendChild(seriesCard);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}" loading="lazy">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-year">${movie.year}</p>
            ${movie.rating ? `<div class="rating">⭐ ${movie.rating.toFixed(1)}</div>` : ''}
        </div>
    `;
    
    card.addEventListener('click', () => openVideoModal(movie));
    return card;
}

function createSeriesCard(series) {
    const card = document.createElement('div');
    card.className = 'series-card';
    card.innerHTML = `
        <img src="${series.image}" alt="${series.title}" loading="lazy">
        <div class="series-info">
            <h3 class="series-title">${series.title}</h3>
            <p class="series-year">${series.year}</p>
            ${series.rating ? `<div class="rating">⭐ ${series.rating.toFixed(1)}</div>` : ''}
        </div>
    `;
    
    card.addEventListener('click', () => openVideoModal(series));
    return card;
}

function setupVideoModal() {
    const modal = document.getElementById('videoModal');
    const closeBtn = document.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', closeVideoModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeVideoModal();
        }
    });
}

function openVideoModal(item) {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('videoPlayer');
    const title = document.getElementById('videoTitle');
    const description = document.getElementById('videoDescription');
    
    video.src = item.videoUrl;
    title.textContent = item.title;
    description.textContent = item.description;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('videoPlayer');
    
    modal.style.display = 'none';
    video.pause();
    video.src = '';
    document.body.style.overflow = 'auto';
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-submit');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

async function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (!searchTerm) return;
    
    const results = await searchMoviesAndSeries(searchTerm);
    
    displayMovies(results.movies);
    displaySeries(results.series);
    
    document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
}

function setupGenreFilter() {
    const genreCards = document.querySelectorAll('.genre-card');
    
    genreCards.forEach(card => {
        card.addEventListener('click', async () => {
            const genre = card.getAttribute('data-genre');
            await filterByGenre(genre);
        });
    });
}

async function filterByGenre(genre) {
    const movies = await fetchMoviesByGenre(genre);
    displayMovies(movies);
    
    document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
}

async function fetchMoviesByGenre(genre) {
    const genreMap = {
        'action': 28,
        'comedy': 35,
        'horror': 27,
        'romance': 10749,
        'sci-fi': 878,
        'drama': 18
    };
    
    const genreId = genreMap[genre];
    if (!genreId) return [];
    
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=vi-VN`);
        const data = await response.json();
        
        const movies = data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            genre: genre,
            image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/300x400?text=No+Image',
            description: movie.overview || 'Không có mô tả',
            rating: movie.vote_average,
            videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
        }));
        
        hideLoading();
        return movies;
    } catch (error) {
        console.error('Error fetching movies by genre:', error);
        hideLoading();
        return [];
    }
}

function setupLoadMore() {
    // Thêm button "Xem thêm" cho movies
    const moviesSection = document.querySelector('.movies-section .container');
    const loadMoreMoviesBtn = document.createElement('button');
    loadMoreMoviesBtn.className = 'btn btn-primary load-more-btn';
    loadMoreMoviesBtn.innerHTML = '<i class="fas fa-plus"></i> Xem thêm phim';
    loadMoreMoviesBtn.style.cssText = 'display: block; margin: 2rem auto;';
    moviesSection.appendChild(loadMoreMoviesBtn);
    
    let currentMoviePage = 1;
    loadMoreMoviesBtn.addEventListener('click', async () => {
        currentMoviePage++;
        const newMovies = await fetchMoviesFromAPI('popular', currentMoviePage);
        moviesData = [...moviesData, ...newMovies];
        
        // Chỉ thêm movies mới vào grid
        const moviesGrid = document.getElementById('moviesGrid');
        newMovies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            moviesGrid.appendChild(movieCard);
        });
    });
    
    // Thêm button "Xem thêm" cho series
    const seriesSection = document.querySelector('.series-section .container');
    const loadMoreSeriesBtn = document.createElement('button');
    loadMoreSeriesBtn.className = 'btn btn-primary load-more-btn';
    loadMoreSeriesBtn.innerHTML = '<i class="fas fa-plus"></i> Xem thêm phim bộ';
    loadMoreSeriesBtn.style.cssText = 'display: block; margin: 2rem auto;';
    seriesSection.appendChild(loadMoreSeriesBtn);
    
    let currentSeriesPage = 1;
    loadMoreSeriesBtn.addEventListener('click', async () => {
        currentSeriesPage++;
        const newSeries = await fetchSeriesFromAPI(currentSeriesPage);
        seriesData = [...seriesData, ...newSeries];
        
        // Chỉ thêm series mới vào grid
        const seriesGrid = document.getElementById('seriesGrid');
        newSeries.forEach(show => {
            const seriesCard = createSeriesCard(show);
            seriesGrid.appendChild(seriesCard);
        });
    });
}

// Smooth scrolling for hero buttons
document.addEventListener('DOMContentLoaded', function() {
    const watchBtn = document.querySelector('.btn-primary');
    const learnBtn = document.querySelector('.btn-secondary');
    
    if (watchBtn) {
        watchBtn.addEventListener('click', () => {
            document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (learnBtn) {
        learnBtn.addEventListener('click', () => {
            document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// Brightness animation
let brightnessValue = 1;
let increasing = true;

setInterval(() => {
    if (increasing) {
        brightnessValue += 0.005;
        if (brightnessValue >= 1.1) increasing = false;
    } else {
        brightnessValue -= 0.005;
        if (brightnessValue <= 0.95) increasing = true;
    }
    
    document.body.style.filter = `brightness(${brightnessValue})`;
}, 200);