import React, { useState, useEffect, useCallback } from 'react';
import './Playlist.css';

function Playlist({ spotifyApi, onTrackSelected }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const response = await spotifyApi.getUserPlaylists();
      setPlaylists(response.items);
    };
    fetchPlaylists();
  }, [spotifyApi]);

const handlePlaylistClick = useCallback(async (playlistId) => {
  const tracks = await spotifyApi.getPlaylistTracks(playlistId);
  setSelectedPlaylistTracks(tracks.items);
  setSelectedPlaylistId(playlistId);
}, [spotifyApi]);

const handleTrackClick = (trackUri, index) => {
  if (onTrackSelected) {
    onTrackSelected(trackUri, index);
  }
};

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        const selectedTrack = document.querySelector('.selected');
        if (selectedTrack) {
          const playlistId = selectedTrack.dataset.playlistId;
          handlePlaylistClick(playlistId);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePlaylistClick]);

return (
  <div className="playlist">
    <h2>My Playlists</h2>
    <ul>
      {playlists.map((playlist) => (
        <li
          key={playlist.id}
          onClick={() => handlePlaylistClick(playlist.id)}
          data-playlist-id={playlist.id}
        >
          <img src={playlist.images[0].url} alt={playlist.name} />
          <div className="playlist-details">
            <h3>{playlist.name}</h3>
            <p dangerouslySetInnerHTML={{ __html: playlist.description }}></p>
            <span>{playlist.tracks.total} songs</span>
          </div>
          {selectedPlaylistId === playlist.id && (
  <ul className="track-list">
    {selectedPlaylistTracks.map((track, index) => (
      <li
        key={track.track.id}
        className="track-item"
        onClick={() => handleTrackClick(track.track.uri, index)}
      >
        {track.track.name} - {track.track.artists[0].name}
      </li>
    ))}
  </ul>
)}
        </li>
      ))}
    </ul>
  </div>
);
}

export default Playlist;
