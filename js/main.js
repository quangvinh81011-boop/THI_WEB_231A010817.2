document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------
    // Xử lý chung: Lucide Icons
    // ------------------------------------
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // ------------------------------------
    // Footer: Cập nhật năm hiện tại
    // ------------------------------------
    const yearSpan = document.getElementById('current-year');
    if(yearSpan) {
        yearSpan.innerText = new Date().getFullYear();
    }

    // ------------------------------------
    // Trang About: Tương tác Sở thích
    // ------------------------------------
    const hobbyList = document.getElementById('hobby-list');
    const profileSection = document.getElementById('profile-section');

    if (hobbyList && profileSection) {
        const items = hobbyList.querySelectorAll('li');
        items.forEach(item => {
            item.addEventListener('click', function() {
                // 1. Prompt nhập mô tả
                const hobbyName = this.getAttribute('data-hobby');
                const userDesc = prompt(`Bạn nghĩ gì về sở thích: ${hobbyName}?`, "Rất thú vị!");
                
                if(userDesc) {
                    // 2. Alert hiển thị
                    alert(`Ghi nhận: Bạn thấy ${hobbyName} là "${userDesc}"`);
                    
                    // 3. Đổi màu background section ngẫu nhiên
                    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                    profileSection.style.backgroundColor = randomColor;
                    profileSection.style.color = "#fff"; // Đảm bảo text dễ đọc
                }
            });
        });
    }

    // ------------------------------------
    // Trang Contact: Form Validation & LocalStorage
    // ------------------------------------
    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Regex kiểm tra email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if(name === "" || message === "") {
                alert("Vui lòng điền tên và nội dung!");
                return;
            }

            if(!emailRegex.test(email)) {
                alert("Email không hợp lệ!");
                return;
            }

            // Lưu vào LocalStorage
            const contactData = {
                name: name,
                email: email,
                message: message,
                date: new Date().toISOString()
            };
            
            // Lấy dữ liệu cũ nếu có
            let allContacts = JSON.parse(localStorage.getItem('contacts')) || [];
            allContacts.push(contactData);
            localStorage.setItem('contacts', JSON.stringify(allContacts));

            // Hiển thị confirm
            if(confirm(`Cảm ơn ${name}! Chúng tôi đã nhận tin nhắn.\nBạn có muốn reset form không?`)) {
                contactForm.reset();
            }
        });
    }
});
// Data Bài Hát (Thay URL bằng SoundHelix placeholders)
const songs = [
    { title: "Em của ngày hôm qua", artist: "Sơn Tùng M-TP", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "images/song1.jpg" },
    { title: "Âm thầm bên em", artist: "Sơn Tùng M-TP", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", cover: "images/song2.jpg" },
    { title: "Sóng gió", artist: "Jack & K-ICM", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", cover: "images/song3.jpg" },
    { title: "Cháu lên ba", artist: "Nhạc thiếu nhi", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", cover: "images/song4.jpg" },
    { title: "Nơi này có anh", artist: "Sơn Tùng M-TP", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", cover: "images/song5.jpg" },
];

// State & DOM Elements
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let visualizerAnimationId;

const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const titleEl = document.getElementById('song-title');
const artistEl = document.getElementById('artist-name');
const coverImg = document.getElementById('cover-img'); // Đã sửa id trong HTML
const progress = document.getElementById('progress');
const playlistEl = document.getElementById('playlist');
const equalizerEl = document.getElementById('equalizer');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const searchInput = document.getElementById('search-input');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');


// Chức năng: Khởi tạo Visualizer (12 thanh)
function initEqualizer() {
    equalizerEl.innerHTML = '';
    for(let i = 0; i < 12; i++) {
        const bar = document.createElement('div');
        bar.classList.add('equalizer-bar');
        bar.style.height = '5px';
        equalizerEl.appendChild(bar);
    }
}

// Chức năng: Logic Visualizer Animation
function animateVisualizer() {
    // Nếu đang phát, ngẫu nhiên hóa chiều cao thanh
    if(isPlaying) {
        Array.from(equalizerEl.children).forEach(bar => {
            const h = Math.floor(Math.random() * 56) + 10;
            bar.style.height = `${h}px`;
        });
        visualizerAnimationId = requestAnimationFrame(animateVisualizer);
    } else {
        // Dừng và reset thanh về mặc định (5px)
        Array.from(equalizerEl.children).forEach(bar => bar.style.height = '5px');
    }
}


// Chức năng: Tải bài hát
function loadSong(song) {
    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    audio.src = song.src;
    // Kiểm tra và sử dụng ảnh bìa (giả định bạn đã có thư mục images/songX.jpg)
    coverImg.src = song.cover || 'images/default_cover.jpg'; 
    renderPlaylist(); // Cập nhật trạng thái active trong Playlist
}

// Chức năng: Phát nhạc
function playSong() {
    isPlaying = true;
    playBtn.innerHTML = '<i data-lucide="pause" class="w-8 h-8 fill-current"></i>';
    lucide.createIcons(); // Cập nhật icon
    audio.play();
    coverImg.classList.add('playing'); // Bật hiệu ứng xoay đĩa
    
    // Khởi động Visualizer
    if (visualizerAnimationId) cancelAnimationFrame(visualizerAnimationId);
    animateVisualizer();
    renderPlaylist(); // Cập nhật trạng thái active trong Playlist
}

// Chức năng: Tạm dừng nhạc
function pauseSong() {
    isPlaying = false;
    playBtn.innerHTML = '<i data-lucide="play" class="w-8 h-8 fill-current"></i>';
    lucide.createIcons();
    audio.pause();
    coverImg.classList.remove('playing'); // Tắt hiệu ứng xoay đĩa
    
    // Dừng Visualizer
    if (visualizerAnimationId) cancelAnimationFrame(visualizerAnimationId);
    animateVisualizer();
    renderPlaylist(); // Cập nhật trạng thái active trong Playlist
}

// Chức năng: Định dạng thời gian
const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

// Chức năng: Render Danh sách phát
function renderPlaylist(filterText = '') {
    playlistEl.innerHTML = '';
    
    // Lọc danh sách
    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(filterText.toLowerCase()) ||
        song.artist.toLowerCase().includes(filterText.toLowerCase())
    );

    filteredSongs.forEach((song, index) => {
        // Tìm index thực của bài hát trong mảng songs gốc
        const originalIndex = songs.findIndex(s => s.title === song.title && s.artist === song.artist);
        
        // Logic tạo class active
        const activeClass = originalIndex === currentIndex 
            ? 'bg-indigo-100 border-l-4 border-indigo-600 shadow-sm' 
            : 'hover:bg-gray-50 border-l-4 border-transparent';
            
        const li = document.createElement('li');
        li.className = `flex justify-between items-center p-3 rounded-r-lg cursor-pointer transition-all ${activeClass}`;
        li.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-xs font-bold text-gray-400 w-4">${originalIndex + 1}</span>
                <div>
                    <p class="font-semibold text-gray-800 ${originalIndex === currentIndex ? 'text-indigo-700' : ''}">${song.title}</p>
                    <p class="text-xs text-gray-500">${song.artist}</p>
                </div>
            </div>
            ${originalIndex === currentIndex && isPlaying ? '<i data-lucide="bar-chart-2" class="text-indigo-600 w-5 h-5 animate-pulse"></i>' : ''}
        `;
        li.onclick = () => {
            currentIndex = originalIndex;
            loadSong(songs[currentIndex]);
            playSong();
        };
        playlistEl.appendChild(li);
    });
    lucide.createIcons();
}

// ------------------------------------
// EVENT LISTENERS
// ------------------------------------

// Phát/Tạm dừng
playBtn.addEventListener('click', () => isPlaying ? pauseSong() : playSong());

// Bài trước
prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong(songs[currentIndex]);
    playSong();
});

// Bài tiếp theo
nextBtn.addEventListener('click', () => {
    if(isShuffle) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * songs.length);
        } while (newIndex === currentIndex); // Đảm bảo không lặp lại bài hát hiện tại
        currentIndex = newIndex;
    } else {
        currentIndex = (currentIndex + 1) % songs.length;
    }
    loadSong(songs[currentIndex]);
    playSong();
});

// Xáo trộn
shuffleBtn.addEventListener('click', function() {
    isShuffle = !isShuffle;
    this.classList.toggle('text-indigo-600', isShuffle);
    this.style.transform = isShuffle ? 'scale(1.1)' : 'scale(1)';
});

// Lặp lại
repeatBtn.addEventListener('click', function() {
    isRepeat = !isRepeat;
    this.classList.toggle('text-indigo-600', isRepeat);
    this.style.transform = isRepeat ? 'scale(1.1)' : 'scale(1)';
    // Thiết lập thuộc tính loop cho audio
    audio.loop = isRepeat;
});

// Tìm kiếm
searchInput.addEventListener('input', (e) => {
    renderPlaylist(e.target.value);
});

// Cập nhật thanh tiến trình và thời gian
audio.addEventListener('timeupdate', (e) => {
    const { duration, currentTime } = e.srcElement;
    if (isNaN(duration)) return;
    progress.value = (currentTime / duration) * 100;
    
    currentTimeEl.textContent = formatTime(currentTime);
});

// Lắng nghe sự kiện Duration Loaded
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

// Tua bài hát bằng thanh trượt
progress.addEventListener('input', () => {
    const duration = audio.duration;
    audio.currentTime = (progress.value / 100) * duration;
});

// Tự động chuyển bài khi kết thúc
audio.addEventListener('ended', () => {
    // Nếu không lặp lại, chuyển bài tiếp theo
    if (!isRepeat) {
        nextBtn.click();
    }
    // Nếu là lặp lại, bài hát sẽ tự động lặp lại nhờ audio.loop = true (đã xử lý ở repeatBtn)
});


// Initialization
initEqualizer();
loadSong(songs[currentIndex]);
// Đảm bảo icon được tạo khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});