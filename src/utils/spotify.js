import SpotifyWebApi from 'spotify-web-api-js';

export const authEndpoint = 'https://accounts.spotify.com/authorize';
export const clientId = process.env.REACT_APP_CLIENT_ID;
export const redirectUri = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/callback'
    : 'https://secure-shore-30794.herokuapp.com/callback';
export const scopes = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'user-library-read',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
];

export const getTokenFromUrl = () => {
  console.log('getTokenFromUrl called');
  return window.location.hash
    .substring(1)
    .split('&')
    .reduce((initial, item) => {
      let parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});
};

export const spotifyApi = new SpotifyWebApi();

export const authenticateSpotify = () => {
  const token = getTokenFromUrl();
  if (token.access_token) {
    spotifyApi.setAccessToken(token.access_token);
    console.log('Access Token:', token.access_token);
    console.log('Access Token set successfully');
    return true;
  }
  console.log('Access Token not found');
  return false;
};

export const getUserProfile = async () => {
  const response = await spotifyApi.getMe();
  return response;
};

export const getUserPlaylists = async () => {
  const response = await spotifyApi.getUserPlaylists();
  return response;
};
