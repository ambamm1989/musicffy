import React, { useState, useEffect } from 'react';
import './FrontPg.css';
import Navbar from './components/Navbar';
import Playlist from './components/Playlist';
import Player from './components/Player';
import { authEndpoint, clientId, redirectUri, scopes } from './utils/spotify';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();
function App() {
  const [token, setToken] = useState(null);
  const [trackId, setTrackId] = useState('');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);

  const handleTrackSelected = (trackUri, index) => {
    const trackId = trackUri.split(':').pop();
    setTrackId(trackId);
    setPlaylistIndex(index);
  };

  useEffect(() => {
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce(function (initial, item) {
        if (item) {
          var parts = item.split('=');
          initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
      }, {});
    window.location.hash = '';

    let _token = hash.access_token;
    if (_token) {
      setToken(_token);
      spotifyApi.setAccessToken(_token);
      spotifyApi.getMe().then((data) => {
        console.log('User data', data);
      });
      spotifyApi.getUserPlaylists().then((data) => {
        console.log('Playlists', data);
        setPlaylistTracks(data.items);
      });
    }
  }, []);

    const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="container app">
      <Navbar handleLogout={handleLogout} />
      {!token ? (
        <div className="login">
          <h1>Welcome to Musicffy</h1>
          <a
            className="btn"
            href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
              '%20'
            )}&response_type=token&show_dialog=true`}
          >
            Login
          </a>
        </div>
      ) : (
        <>
          <Playlist spotifyApi={spotifyApi} onTrackSelected={handleTrackSelected} />
          <Player
            spotifyApi={spotifyApi}
            trackId={trackId}
            onTrackSelected={handleTrackSelected}
            playlistTracks={playlistTracks}
            playlistIndex={playlistIndex}
            handleLogout={handleLogout} // pass handleLogout function as a prop
          />
        </>
      )}
    </div>
  );
}

export default App;
