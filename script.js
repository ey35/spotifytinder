document.addEventListener('DOMContentLoaded', () => {
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
  let clientId = localStorage.getItem('spotifyClientId');

  function renderLikedSongs() {
    likedSongsList.innerHTML = '';
    likedSongs.forEach(song => {
      const listItem = document.createElement('li');
      const img = document.createElement('img');
      img.src = song.art;
      listItem.appendChild(img);
      const songInfo = document.createElement('div');
      songInfo.classList.add('song-info');
      songInfo.innerHTML = `<p>${song.name} by ${song.artist}</p>`;
      const favoriteButton = document.createElement('button');
      favoriteButton.innerHTML = '<i class="fas fa-star"></i> Favorite';
      favoriteButton.classList.add('btn', 'favorite');
      favoriteButton.addEventListener('click', () => {
        favoriteButton.classList.toggle('active');
      });
      songInfo.appendChild(favoriteButton);
      listItem.appendChild(songInfo);
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
    songCard.classList.add('animated');
  }

  function dislikeSong() {
    fetchRandomSong();
    songCard.classList.add('animated');
  }

 function addLikedSong(song) {
  const listItem = document.createElement('li');
  const img = document.createElement('img');
  img.src = song.art;
  listItem.appendChild(img);
  const songInfo = document.createElement('div');
  songInfo.classList.add('song-info');
  songInfo.innerHTML = `<p>${song.name} by ${song.artist}</p>`;
  const favoriteButton = document.createElement('button');
  favoriteButton.innerHTML = '<i class="fas fa-star"></i> Favorite';
  favoriteButton.classList.add('btn', 'favorite');
  favoriteButton.addEventListener('click', () => {
    favoriteButton.classList.toggle('active');
  });
  songInfo.appendChild(favoriteButton);
  listItem.appendChild(songInfo);
  likedSongsList.appendChild(listItem);
}

  function handleSwipe(event) {
    if (event.direction === 4) { // Swipe right
      likeSong();
    } else if (event.direction === 2) { // Swipe left
      dislikeSong();
    }
  }

  likeButton.addEventListener('click', likeSong);

  dislikeButton.addEventListener('click', dislikeSong);

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
      clientId = params.get('client_id');
      localStorage.setItem('spotifyAccessToken', accessToken);
      localStorage.setItem('spotifyClientId', clientId);
    }

    if (!accessToken) {
      window.location.href = `${AUTH_ENDPOINT}?client_id=${clientId}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`;
    } else {
      renderLikedSongs();
      fetchRandomSong();
    }
  }

  handleAuth();

  // Initialize Hammer.js for swipe gestures
  const hammer = new Hammer(songCard);
  hammer.on('swipe', handleSwipe);

  // Remove animation class after animation ends
  songCard.addEventListener('animationend', () => {
    songCard.classList.remove('animated');
  });
});
