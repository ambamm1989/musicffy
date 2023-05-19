const accessToken = window.location.hash.substring(1).split('&')[0].split('=')[1];

localStorage.setItem('spotifyAccessToken', accessToken);


window.location.replace('/');
