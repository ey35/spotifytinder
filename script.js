document.addEventListener('DOMContentLoaded', () => {
  const CLIENT_ID = '32e9e5d5c4d74bf98e34f5e240070726'; // Your Spotify client ID
  const REDIRECT_URI = window.location.href; // Redirect URI
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

  let currentAudio = new Audio(); // Initialize the audio element

  // Function to initiate Spotify login
  function handleLogin() {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`;
    window.location.href = authUrl;
  }

  // Function to fetch a random song from Spotify
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
        spotifyId: randomTrack.id,
        preview_url: randomTrack.preview_url
      };
      songNameElement.textContent = currentSong.name;
      songArtistElement.textContent = currentSong.artist;
      songArtElement.src = currentSong.art;
      playAudio(currentSong.preview_url);
    } catch (error) {
      console.error('Error fetching song:', error);
      alert('Error fetching song. Please try again.');
    }
  }

  // Function to play audio
  function playAudio(url) {
    if (currentAudio.src !== url) {
      currentAudio.pause(); // Pause the current audio
      currentAudio = new Audio(url);
      currentAudio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }

  // Function to handle liking a song
  function likeSong() {
    likedSongs.push(currentSong);
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    renderLikedSongs();
    fetchRandomSong();
  }

  // Function to handle disliking a song
  function dislikeSong() {
    fetchRandomSong();
  }

  // Function to render liked songs
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

  // Function to handle authentication
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
      handleLogin();
    } else {
      renderLikedSongs();
      fetchRandomSong();
    }
  }

  // Event listeners for like and dislike buttons
  likeButton.addEventListener('click', likeSong);
  dislikeButton.addEventListener('click', dislikeSong);

  // Event listener for viewing liked songs
  viewLikedSongsButton.addEventListener('click', () => {
    likedSongsContainer.style.display = 'block';
    songCard.style.display = 'none';
  });

  // Event listener for going back from liked songs view
  backButton.addEventListener('click', () => {
    likedSongsContainer.style.display = 'none';
    songCard.style.display = 'block';
  });

  // Call handleAuth function on page load
  handleAuth();
});
