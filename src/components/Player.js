import React, { useRef, useState, useEffect } from 'react';
import './Player.css';

function formatTime(timeInSeconds) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

function Player({ spotifyApi, trackId, onTrackSelected, playlistTracks, playlistIndex }) {
  const audioRef = useRef(new Audio());
  const audio = audioRef.current;
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [track, setTrack] = useState({
    title: '',
    artist: '',
    album: '',
  });

  const fetchTrack = async () => {
    try {
      if (audio) {
        audio.pause();
      }
      const response = await spotifyApi.getTrack(trackId);
      setTrack({
        title: response.name,
        artist: response.artists[0].name,
        album: response.album.name,
      });
      const previewUrl = response.preview_url;
      if (previewUrl) {
        audioRef.current.src = previewUrl;
        audioRef.current.load();
        audioRef.current.addEventListener('loadedmetadata', onAudioLoadedMetadata);
      }
    } catch (error) {
      console.error('Error fetching track:', error);
    }
  };
  
  const onAudioLoadedMetadata = () => {
    console.log('Duration:', audioRef.current.duration);
    setDuration(audioRef.current.duration);
  };
    
  useEffect(() => {
    if (trackId) {
      fetchTrack();
    }
  }, [trackId]);
  
  console.log('trackId changed:', trackId);
        
  useEffect(() => {
    console.log('playing effect called');
    const onAudioEnded = () => {
      setPlaying(false);
    };
  
    audioRef.current.addEventListener('ended', onAudioEnded);
    audioRef.current.addEventListener('loadedmetadata', handleMetadataLoaded);
  
    return () => {
      audioRef.current.removeEventListener('ended', onAudioEnded);
      audioRef.current.removeEventListener('loadedmetadata', handleMetadataLoaded);
    };
  }, [playing]);
  
  console.log('playing changed:', playing);
            
  useEffect(() => {
    const interval = setInterval(() => {
      if (playing) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [playing, audioRef]);
  
  console.log('currentTime changed:', currentTime);
  
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [audioRef, volume]);
  
  console.log('volume changed:', volume);
  
  const handleSeek = (event) => {
    console.log('handleSeek called');
    const progressBarRect = event.currentTarget.getBoundingClientRect();
    const clickPositionX = event.clientX - progressBarRect.left;
    const newProgressPercentage = clickPositionX / progressBarRect.width;
  
    // Check if audio is not null and audio.duration is a finite number
    if (audio && Number.isFinite(audio.duration) && Number.isFinite(newProgressPercentage)) {
      const newCurrentTime = audio.duration * newProgressPercentage;
      if (Number.isFinite(newCurrentTime)) {
        setCurrentTime(newCurrentTime);
        audio.currentTime = newCurrentTime;
      } else {
        console.error("Invalid newCurrentTime:", newCurrentTime);
      }
    } else {
      console.error("Invalid audio or duration, or newProgressPercentage:", audio, audio?.duration, newProgressPercentage);
    }
  };
    
  
  const handlePlayPause = () => {
    if (!trackId) {
      return;
    }
    console.log("Playing state changed:", playing);

    if (!playing) {
      console.log('handlePlayPause called');
      audioRef.current.play()
        .then(() => {
          console.log('Playing');
          setPlaying(true);
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
        });
    } else {
      console.log('Pausing');
      audioRef.current.pause();
      setPlaying(false);
    }
  };
    

  const handleStop = () => {
    console.log('handleStop called');
    if (audio) {
      setPlaying(false);
      audio.pause();
      audio.currentTime = 0;
      setCurrentTime(0);
    }
  };
    
  const handleSkipForward = async () => {
    console.log('handleSkipForward called');
    try {
      const response = await spotifyApi.getRecommendations({
        seed_tracks: [trackId],
        limit: 1,
      });
      if (response && response.tracks && response.tracks.length > 0) {
        const newTrack = response.tracks[0];
        onTrackSelected(`spotify:track:${newTrack.id}`);
        setPlaying(true); // Set playing to true
      } else {
        console.warn('No tracks found in recommendations response:', response);
        // Play the next track in the playlist
        handleSkipBackward();
      }
    } catch (error) {
      console.error('Error skipping forward:', error);
      // Play the next track in the playlist
      handleSkipBackward();
    }
  };
        
  const handleSkipBackward = async () => {
    console.log('handleSkipBackward called');
    const {
      item: { id: currentTrackId },
      progress_ms: currentProgressMs,
    } = await spotifyApi.getMyCurrentPlayingTrack();
    
    const playbackPositionMs = currentProgressMs - 10000;
  
    if (playbackPositionMs < 0) {
      await spotifyApi.seek(0);
    } else {
      await spotifyApi.seek(playbackPositionMs);
    }
  
    await spotifyApi.play();
  
    console.log('Skipped backward to', playbackPositionMs, 'ms in track', currentTrackId);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    audioRef.current.volume = parseFloat(e.target.value);
  };
  
  const handleMetadataLoaded = () => {
    setDuration(audioRef.current.duration);
    audioRef.current.currentTime = 0;
    if (playing) {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };
  
        
  return (
    <div className="player">
      <div className="track-info">
        <div className="title">{track.title}</div>
        <div className="artist">{track.artist}</div>
        <div className="album">{track.album}</div>
      </div>
      <div className="controls">
        <button onClick={handlePlayPause}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={handleStop}>Stop</button>
        <button onClick={handleSkipForward}>Skip Forward</button>
        <div className="progress-bar">
          {Number.isFinite(duration) && Number.isFinite(currentTime) ? (
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
            />
          ) : null}
          <div className="progress-bar-wrapper" onClick={handleSeek}>
            <div
              className="progress-bar-track"
              style={{
                width: Number.isFinite(duration)
                  ? `${(currentTime / duration) * 100}%`
                  : '0%',
              }}
            ></div>
            <div
              className="progress-bar-thumb"
              style={{
                left: Number.isFinite(duration)
                  ? `${(currentTime / duration) * 95}%`
                  : '0%',
              }}
            ></div>
          </div>
          <span className='c-time'>{formatTime(currentTime)}</span>
          <span className='dur'>{formatTime(duration)}</span>
        </div>
        <div className="volume-bar">
          <div className='v-title'>Volume</div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolumeChange}
            className="volume-bar-input"
          />
        </div>
      </div>
    </div>
  );
  
  }
  
  export default Player;