// Mock data for demo
const mockTracks = {
    'Summer Vibes': {
        title: 'Summer Vibes',
        artist: 'Artist Name',
        genre: 'Electronic',
        bpm: 128,
        key: 'D Major',
        mood: 'Energetic',
        matches: [
            { title: 'Tropical Paradise', artist: 'DJ Cool', score: 98, genre: 'Electronic', bpm: 127, key: 'D Major' },
            { title: 'Beach Sunset', artist: 'Sunny Beats', score: 95, genre: 'House', bpm: 128, key: 'D Major' },
            { title: 'Holiday Groove', artist: 'Vacation Mix', score: 92, genre: 'Electronic', bpm: 129, key: 'C# Major' }
        ]
    },
    'Night Groove': {
        title: 'Night Groove',
        artist: 'Night Owl',
        genre: 'House',
        bpm: 120,
        key: 'A Minor',
        mood: 'Deep',
        matches: [
            { title: 'Midnight Pulse', artist: 'Dark Mode', score: 96, genre: 'House', bpm: 120, key: 'A Minor' },
            { title: 'Urban Vibes', artist: 'City Beats', score: 94, genre: 'Techno', bpm: 119, key: 'A Minor' },
            { title: 'Smooth Rhythm', artist: 'Jazz House', score: 91, genre: 'House', bpm: 121, key: 'G# Minor' }
        ]
    },
    'Electric Dreams': {
        title: 'Electric Dreams',
        artist: 'Synth Wave',
        genre: 'Techno',
        bpm: 130,
        key: 'E Major',
        mood: 'Hypnotic',
        matches: [
            { title: 'Neon Nights', artist: 'Future Sound', score: 97, genre: 'Techno', bpm: 131, key: 'E Major' },
            { title: 'Digital Prophet', artist: 'Tech Vision', score: 93, genre: 'Techno', bpm: 129, key: 'E Major' },
            { title: 'Cyber Loop', artist: 'Matrix Mix', score: 90, genre: 'Techno', bpm: 132, key: 'D# Major' }
        ]
    }
};

const libraryTracks = [
    { title: 'Summer Vibes', artist: 'Artist 1' },
    { title: 'Night Groove', artist: 'Artist 2' },
    { title: 'Electric Dreams', artist: 'Artist 3' },
    { title: 'Tropical Paradise', artist: 'Artist 4' },
    { title: 'Beach Sunset', artist: 'Artist 5' },
    { title: 'Midnight Pulse', artist: 'Artist 6' },
    { title: 'Urban Vibes', artist: 'Artist 7' },
    { title: 'Smooth Rhythm', artist: 'Artist 8' },
];

// File upload handling
document.getElementById('fileInput').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-item-info">
                <div class="file-item-name">${file.name}</div>
                <div class="file-item-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <div style="color: var(--success);">✓ Uploaded</div>
        `;
        fileList.appendChild(fileItem);
    });
});

// Track selection and matching
function selectTrack(element, trackName) {
    // Remove active class from all tracks
    document.querySelectorAll('.track-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to selected track
    element.classList.add('active');

    // Get track data and display matches
    const track = mockTracks[trackName];
    displayMatches(track.matches);
}

function displayMatches(matches) {
    const matchResults = document.getElementById('matchResults');
    matchResults.innerHTML = '';

    matches.forEach(match => {
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item';
        matchItem.innerHTML = `
            <div class="match-header">
                <div>
                    <div class="match-title">${match.title}</div>
                    <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">${match.artist}</div>
                </div>
                <span class="match-score">${match.score}% Match</span>
            </div>
            <div class="match-details">
                <span>${match.genre}</span>
                <span>${match.bpm} BPM</span>
                <span>${match.key}</span>
            </div>
        `;
        matchResults.appendChild(matchItem);
    });
}

// Library population
function populateLibrary() {
    const libraryGrid = document.getElementById('libraryGrid');
    libraryGrid.innerHTML = '';

    libraryTracks.forEach(track => {
        const libraryItem = document.createElement('div');
        libraryItem.className = 'library-item';
        libraryItem.innerHTML = `
            <div class="library-thumbnail">🎵</div>
            <div class="library-info">
                <div class="library-title">${track.title}</div>
                <div class="library-artist">${track.artist}</div>
            </div>
        `;
        libraryGrid.appendChild(libraryItem);
    });
}

// Search functionality
document.querySelector('.search-box').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const libraryItems = document.querySelectorAll('.library-item');

    libraryItems.forEach(item => {
        const title = item.querySelector('.library-title').textContent.toLowerCase();
        const artist = item.querySelector('.library-artist').textContent.toLowerCase();

        if (title.includes(searchTerm) || artist.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Button click handlers
document.querySelector('.btn-primary.btn-lg').addEventListener('click', function() {
    document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('.btn-login, .btn-signup, .btn-secondary, .btn-primary').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.textContent.includes('Login') || this.textContent.includes('Sign Up')) {
            alert('Login/Sign Up functionality would be implemented here');
        }
    });
});

// Initialize library on page load
document.addEventListener('DOMContentLoaded', function() {
    populateLibrary();

    // Select first track by default
    setTimeout(() => {
        const firstTrack = document.querySelector('.track-item');
        if (firstTrack) {
            selectTrack(firstTrack, 'Summer Vibes');
        }
    }, 100);
});

// Filter functionality
document.querySelector('.filter-dropdown').addEventListener('change', function(e) {
    const selectedGenre = e.target.value;
    // In a real app, this would filter the library
    console.log('Filter by genre:', selectedGenre);
});

// Animate stat numbers on scroll
function animateStats() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease-in-out';
                observer.unobserve(entry.target);
            }
        });
    });

    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });
}

// Add fade-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize animations
animateStats();