// Mock data for demo
const mockTracks = {
    'Summer Vibes': {
        title: 'Summer Vibes',
        artist: 'Artist Name',
        genre: 'Electronic',
        bpm: 128,
        key: 'D Major',
        mood: 'Energetic',
        duration: 240, // seconds
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        matches: [
            { title: 'Tropical Paradise', artist: 'DJ Cool', score: 98, genre: 'Electronic', bpm: 127, key: 'D Major', duration: 180, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
            { title: 'Beach Sunset', artist: 'Sunny Beats', score: 95, genre: 'House', bpm: 128, key: 'D Major', duration: 210, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
            { title: 'Holiday Groove', artist: 'Vacation Mix', score: 92, genre: 'Electronic', bpm: 129, key: 'C# Major', duration: 195, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
        ]
    },
    'Night Groove': {
        title: 'Night Groove',
        artist: 'Night Owl',
        genre: 'House',
        bpm: 120,
        key: 'A Minor',
        mood: 'Deep',
        duration: 220,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        matches: [
            { title: 'Midnight Pulse', artist: 'Dark Mode', score: 96, genre: 'House', bpm: 120, key: 'A Minor', duration: 200, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
            { title: 'Urban Vibes', artist: 'City Beats', score: 94, genre: 'Techno', bpm: 119, key: 'A Minor', duration: 230, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
            { title: 'Smooth Rhythm', artist: 'Jazz House', score: 91, genre: 'House', bpm: 121, key: 'G# Minor', duration: 250, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
        ]
    },
    'Electric Dreams': {
        title: 'Electric Dreams',
        artist: 'Synth Wave',
        genre: 'Techno',
        bpm: 130,
        key: 'E Major',
        mood: 'Hypnotic',
        duration: 260,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        matches: [
            { title: 'Neon Nights', artist: 'Future Sound', score: 97, genre: 'Techno', bpm: 131, key: 'E Major', duration: 215, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
            { title: 'Digital Prophet', artist: 'Tech Vision', score: 93, genre: 'Techno', bpm: 129, key: 'E Major', duration: 225, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
            { title: 'Cyber Loop', artist: 'Matrix Mix', score: 90, genre: 'Techno', bpm: 132, key: 'D# Major', duration: 190, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
        ]
    }
};

const libraryTracks = [
    { title: 'Summer Vibes', artist: 'Artist 1', duration: 240, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'Night Groove', artist: 'Artist 2', duration: 220, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'Electric Dreams', artist: 'Artist 3', duration: 260, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { title: 'Tropical Paradise', artist: 'Artist 4', duration: 180, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { title: 'Beach Sunset', artist: 'Artist 5', duration: 210, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'Midnight Pulse', artist: 'Artist 6', duration: 200, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'Urban Vibes', artist: 'Artist 7', duration: 230, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { title: 'Smooth Rhythm', artist: 'Artist 8', duration: 250, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

// Global audio player
let currentAudio = null;
let currentlyPlaying = null;

// Audio Player Controller
class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.audio.crossOrigin = 'anonymous';
        this.currentTrack = null;
        this.isPlaying = false;
        
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.onTrackEnd());
        this.audio.addEventListener('error', () => this.onAudioError());
    }

    play(track) {
        if (this.currentTrack?.audioUrl === track.audioUrl && this.isPlaying) {
            this.pause();
            return;
        }

        if (this.currentTrack?.audioUrl !== track.audioUrl) {
            this.audio.src = track.audioUrl;
            this.currentTrack = track;
        }

        this.audio.play().catch(err => console.log('Playback error:', err));
        this.isPlaying = true;
        this.updateUI();
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateUI();
    }

    togglePlay(track) {
        if (this.currentTrack?.audioUrl === track.audioUrl && this.isPlaying) {
            this.pause();
        } else {
            this.play(track);
        }
    }

    setTime(seconds) {
        this.audio.currentTime = seconds;
    }

    updateProgress() {
        const players = document.querySelectorAll('.audio-player');
        players.forEach(player => {
            const track = this.findTrackFromPlayer(player);
            if (track?.audioUrl === this.currentTrack?.audioUrl) {
                const progress = document.querySelector(`[data-audio-url="${track.audioUrl}"] .progress-bar`);
                const currentTimeEl = document.querySelector(`[data-audio-url="${track.audioUrl}"] .current-time`);
                if (progress) {
                    progress.value = (this.audio.currentTime / this.audio.duration) * 100 || 0;
                    if (currentTimeEl) {
                        currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
                    }
                }
            }
        });
    }

    onTrackEnd() {
        this.isPlaying = false;
        this.updateUI();
    }

    onAudioError() {
        console.error('Audio error');
        this.isPlaying = false;
        this.updateUI();
    }

    updateUI() {
        const players = document.querySelectorAll('.audio-player');
        players.forEach(player => {
            const track = this.findTrackFromPlayer(player);
            if (track?.audioUrl === this.currentTrack?.audioUrl) {
                const playBtn = player.querySelector('.play-btn');
                const icon = playBtn?.querySelector('i');
                if (this.isPlaying) {
                    playBtn?.classList.add('playing');
                    if (icon) icon.textContent = '⏸';
                } else {
                    playBtn?.classList.remove('playing');
                    if (icon) icon.textContent = '▶';
                }
            }
        });
    }

    findTrackFromPlayer(player) {
        const audioUrl = player.getAttribute('data-audio-url');
        // Search in all tracks
        for (let track of [...Object.values(mockTracks).flatMap(t => [t, ...t.matches]), ...libraryTracks]) {
            if (track.audioUrl === audioUrl) return track;
        }
        return null;
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getDuration() {
        return this.audio.duration || 0;
    }
}

// Initialize global audio player
const audioPlayer = new AudioPlayer();

// Create audio player HTML
function createAudioPlayer(track) {
    const duration = track.duration || audioPlayer.getDuration() || 0;
    return `
        <div class="audio-player" data-audio-url="${track.audioUrl}">
            <button class="play-btn" onclick="audioPlayer.togglePlay(${JSON.stringify(track).replace(/"/g, '&quot;')})">
                <i>▶</i>
            </button>
            <div class="player-controls">
                <div class="time-display">
                    <span class="current-time">0:00</span>
                    <span class="duration">${audioPlayer.formatTime(duration)}</span>
                </div>
                <input type="range" class="progress-bar" min="0" max="100" value="0" 
                       onchange="audioPlayer.setTime((this.value / 100) * audioPlayer.currentTrack?.duration || 0)">
            </div>
        </div>
    `;
}

// File upload handling
document.getElementById('fileInput')?.addEventListener('change', function(e) {
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
            ${createAudioPlayer(match)}
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
            ${createAudioPlayer(track)}
        `;
        libraryGrid.appendChild(libraryItem);
    });
}

// Search functionality
document.querySelector('.search-box')?.addEventListener('input', function(e) {
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
document.querySelector('.btn-primary.btn-lg')?.addEventListener('click', function() {
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
document.querySelector('.filter-dropdown')?.addEventListener('change', function(e) {
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
