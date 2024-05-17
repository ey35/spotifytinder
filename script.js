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

  function addLikedSong(song
