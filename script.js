document.addEventListener('DOMContentLoaded', () => {
  const CLIENT_ID = '32e9e5d5c4d74bf98e34f5e240070726';
  const REDIRECT_URI = window.location.href;
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
  const RESPONSE_TYPE = 'token';
  const SCOPES = 'user-library-read';

  const songNameElement = document.getElementById('song-name');
  const songArtistElement = document.getElementById('song-artist');
  const songArtElement = document.getElementById('song-art');
  const likeButton = document.getElementById('like-button');
  const dislikeButton = document.getElementById('dislike-button');
  const likedSongsList = document.getElementById('liked-songs-list');
  const songCard = document.getElementById('song-card');
  const likedSongsContainer = document.getElementById('liked-songs');
  const viewLikedSongsButton = document.getElementById('view-liked-songs');
  const backButton = document.getElementById('back-button');

  let currentSong = null;
  let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
  let accessToken = localStorage.getItem('spotifyAccessToken');

  function renderLikedSongs() {
    likedSongsList.innerHTML = '';
    likedSongs.forEach(song => {
      const listItem = document.createElement('li');
      const img = document.createElement('img');
      img.src = song.art;
      listItem.appendChild(img);
      listItem.appendChild(document.createTextNode(`${song.name} by ${song.artist}`));
      likedSongsList.appendChild(listItem);
    });
  }

  async function fetchRandomSong() {
    try {
      const response = await fetch('https://api.spotify.com/v1/recommendations?seed_genres=pop', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      const tracks = data.tracks;
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      currentSong = {
        name: randomTrack.name,
        artist: randomTrack.artists[0].name,
        art: randomTrack.album.images[0].url,
        spotifyId: randomTrack.id
      };
      songNameElement.textContent = currentSong.name;
      songArtistElement.textContent = currentSong.artist;
      songArtElement.src = currentSong.art;
      songCard.style.transform = 'translateX(0)';
      songCard.style.opacity = '1';
    } catch (error) {
      console.error('Error fetching song:', error);
      alert('Error fetching song. Please try again.');
    }
  }

  function likeSong() {
    likedSongs.push(currentSong);
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    addLikedSong(currentSong);
    fetchRandomSong();
  }

  function addLikedSong(song) {
    const listItem = document.createElement('li');
    const img = document.createElement('img');
    img.src = song.art;
    listItem.appendChild(img);
    listItem.appendChild(document.createTextNode(`${song.name} by ${song.artist}`));
    likedSongsList.appendChild(listItem);
  }

  function handleSwipe(event) {
    if (event.direction === 4) { // Swipe right
      songCard.style.transform = 'translateX(100vw)';
      songCard.style.opacity = '0';
      setTimeout(likeSong, 300);
    } else if (event.direction === 2) { // Swipe left
      songCard.style.transform = 'translateX(-100vw)';
      songCard.style.opacity = '0';
      setTimeout(fetchRandomSong, 300);
    }
  }

  likeButton.addEventListener('click', () => {
    songCard.style.transform = 'translateX(100vw)';
    songCard.style.opacity = '0';
    setTimeout(likeSong, 300);
  });

  dislikeButton.addEventListener('click', () => {
    songCard.style.transform = 'translateX(-100vw)';
    songCard.style.opacity = '0';
    setTimeout(fetchRandomSong, 300);
  });

  viewLikedSongsButton.addEventListener('click', () => {
    songCard.classList.add('hidden');
    likedSongsContainer.style.display = 'block';
  });

  backButton.addEventListener('click', () => {
    likedSongsContainer.style.display = 'none';
    songCard.classList.remove('hidden');
  });

  function handleAuth() {
    const hash = window.location.hash;
    if (!accessToken && hash) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      accessToken = params.get('access_token');
      localStorage.setItem('spotifyAccessToken', accessToken);
    }

    if (!accessToken) {
      window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`;
    } else {
      renderLikedSongs();
      fetchRandomSong();
    }
  }

  handleAuth();

  // Initialize Hammer.js for swipe gestures
  const hammer = new Hammer(songCard);
  hammer.on('swipe', handleSwipe);
});
