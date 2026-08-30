import Auth from "./components/Auth";
import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from "./components/Sidebar";
import SubscriptionModal from "./components/SubscriptionModal.jsx";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [progress, setProgress] = useState(0);
  const [audioRef] = useState(new Audio());
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("accueil");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const genres = [
    { id: 0, label: "MONDIAL" },
    { id: 132, label: "AFROBEATS" },
    { id: 116, label: "LATINO" },
    { id: 129, label: "K-POP / ASIE" },
    { id: 152, label: "DANCE / EUROPE" },
    { id: "playlist-1313621735", label: "FRANCE" },
  ];

  const categories = [
    { title: "HOT 100 HEBDOMADAIRE", subtitle: "SEMAINE", number: "100", symbol: "📅", color: "#00b4d8" },
    { title: "BILLBOARD 200", subtitle: "ALBUMS", number: "200", symbol: "📚", color: "#2d6a4f" },
    { title: "ARTISTES 100", subtitle: "TOP", number: "100", symbol: "👤", color: "#f77f00" },
    { title: "HOT 100 DE FIN D'ANNÉE", subtitle: "ANNUEL", number: "1", symbol: "🔥", color: "#d90429" }
  ];

  useEffect(() => {
    setLoading(true);
    const isPlaylist = typeof selectedGenre === "string" && selectedGenre.startsWith("playlist-");
    const url = isPlaylist
      ? `https://afrochart-proxy.vercel.app/api/deezer?playlistId=${selectedGenre.replace("playlist-", "")}&limit=50`
      : `https://afrochart-proxy.vercel.app/api/deezer?genre=${selectedGenre}&limit=50`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Extraction sécurisée des pistes selon la structure reçue
        const tracksList = data.data || data.tracks?.data || [];
        
        const formattedSongs = tracksList.map((track, index) => {
          const baseStreams = track.rank ? track.rank * 1500 : Math.floor(Math.random() * 5000000) + 500000;
          const trends = ["▲", "▼", "—", "▲", "▲"];
          const randomTrend = trends[Math.floor(Math.random() * trends.length)];

          return {
            position: index + 1,
            title: track.title || "Titre inconnu",
            artist: track.artist?.name || "Artiste inconnu",
            streams: baseStreams.toLocaleString(),
            change: randomTrend,
            image: track.album?.cover_medium || track.artist?.picture_medium || "",
            preview: track.preview,
            album: track.album
          };
        });
        setSongs(formattedSongs);

        // Extraction automatique des albums uniques basés sur les chansons si non fournis par l'API
        const extractedAlbums = data.albums?.data && data.albums.data.length > 0 
          ? data.albums.data 
          : Array.from(new Map(formattedSongs.filter(s => s.album?.id).map(s => [s.album.id, s.album])).values());
        setAlbums(extractedAlbums);

        // Extraction automatique des artistes uniques basés sur les chansons si non fournis par l'API
        const extractedArtists = data.artists?.data && data.artists.data.length > 0
          ? data.artists.data
          : Array.from(new Map(tracksList.filter(t => t.artist?.id).map(t => [t.artist.id, t.artist])).values());
        setArtists(extractedArtists);

        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur de chargement:", err);
        setLoading(false);
      });
  }, [selectedGenre]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`https://afrochart-proxy.vercel.app/api/deezer?search=${encodeURIComponent(searchQuery)}&limit=30`)
        .then(res => res.json())
        .then(data => {
          const results = data.data || [];
          const formatted = results.map((track, index) => {
            const baseStreams = track.rank ? track.rank * 1500 : Math.floor(Math.random() * 5000000) + 500000;
            const trends = ["▲", "▼", "—", "▲", "▲"];
            const randomTrend = trends[Math.floor(Math.random() * trends.length)];

            return {
              position: index + 1,
              title: track.title || "Titre inconnu",
              artist: track.artist?.name || "Artiste inconnu",
              streams: baseStreams.toLocaleString(),
              change: randomTrend,
              image: track.album?.cover_medium || "",
              preview: track.preview
            };
          });
          setSearchResults(formatted);
          setIsSearching(false);
        })
        .catch(err => {
          console.error("Erreur recherche:", err);
          setIsSearching(false);
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedAlbum) {
      // Si l'album a une propriété tracklist ou id, on tente de récupérer ses musiques
      const albumId = selectedAlbum.id;
      fetch(`https://afrochart-proxy.vercel.app/api/deezer?albumId=${albumId}`)
        .then(res => res.json())
        .then(data => {
          const tracks = data.data || data.tracks?.data || [];
          const formatted = tracks.map((track, index) => {
            const baseStreams = track.rank ? track.rank * 1500 : Math.floor(Math.random() * 5000000) + 500000;
            const trends = ["▲", "▼", "—", "▲", "▲"];
            const randomTrend = trends[Math.floor(Math.random() * trends.length)];

            return {
              position: index + 1,
              title: track.title || "Titre inconnu",
              artist: track.artist?.name || selectedAlbum.artist?.name || "Artiste",
              streams: baseStreams.toLocaleString(),
              change: randomTrend,
              image: selectedAlbum.cover_medium || "",
              preview: track.preview,
            };
          });
          setAlbumTracks(formatted);
        })
        .catch(err => {
          console.error("Erreur album tracks:", err);
          setAlbumTracks([]);
        });
    }
  }, [selectedAlbum]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.duration) {
        setProgress((audioRef.currentTime / audioRef.duration) * 100);
      }
    };
    audioRef.addEventListener('timeupdate', updateProgress);
    return () => audioRef.removeEventListener('timeupdate', updateProgress);
  }, [audioRef]);

  const filteredAlbums = albums.filter(album =>
    (album.title && album.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (album.artist?.name && album.artist.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredArtists = artists.filter(artist =>
    artist.name && artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const artistSongs = selectedArtist
    ? songs.filter(song => song.artist.toLowerCase().includes(selectedArtist.name.toLowerCase()))
    : [];

  const togglePlay = (song) => {
    if (!song.preview) {
      alert("Aperçu audio non disponible pour ce titre.");
      return;
    }
    if (playingId === song.position) {
      audioRef.pause();
      setPlayingId(null);
    } else {
      audioRef.src = song.preview;
      audioRef.play();
      setPlayingId(song.position);
      setCurrentSong(song);
      setProgress(0);
      audioRef.onended = () => setPlayingId(null);
    }
  };

  const pageTitles = {
    accueil: "ACCUEIL",
    charts: "CLASSEMENTS",
    albums: selectedAlbum ? `ALBUM : ${selectedAlbum.title?.toUpperCase()}` : "ALBUMS",
    artists: "ARTISTES",
    chansons: "CHANSONS",
    tendances: "TENDANCES",
    nouveautes: "NOUVEAUTÉS",
    "artist-songs": selectedArtist ? `CHANSONS DE ${selectedArtist.name?.toUpperCase()}` : "ARTISTE"
  };

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setSelectedArtist={setSelectedArtist} setSelectedAlbum={setSelectedAlbum} />

      <main className="main-content">
        <header className="top-header">
          <div className="header-nav-links">
            <a
              href="#accueil"
              className={activeTab === "accueil" && !selectedArtist && !selectedAlbum ? "active-tab" : ""}
              onClick={(e) => { e.preventDefault(); setActiveTab("accueil"); setSelectedArtist(null); setSelectedAlbum(null); }}
            >
              ACCUEIL
            </a>

            <a
              href="#charts"
              className={activeTab === "charts" && !selectedArtist && !selectedAlbum ? "active-tab" : ""}
              onClick={(e) => { e.preventDefault(); setActiveTab("charts"); setSelectedArtist(null); setSelectedAlbum(null); }}
            >
              CHARTS
            </a>

            <a
              href="#artists"
              className={activeTab === "artists" && !selectedArtist && !selectedAlbum ? "active-tab" : ""}
              onClick={(e) => { e.preventDefault(); setActiveTab("artists"); setSelectedArtist(null); setSelectedAlbum(null); }}
            >
              ARTISTES
            </a>

            <a
              href="#albums"
              className={activeTab === "albums" && !selectedArtist && !selectedAlbum ? "active-tab" : ""}
              onClick={(e) => { e.preventDefault(); setActiveTab("albums"); setSelectedArtist(null); setSelectedAlbum(null); }}
            >
              ALBUMS
            </a>

            <a
              href="#nouveautes"
              className={activeTab === "nouveautes" && !selectedArtist && !selectedAlbum ? "active-tab" : ""}
              onClick={(e) => { e.preventDefault(); setActiveTab("nouveautes"); setSelectedArtist(null); setSelectedAlbum(null); }}
            >
              NOUVEAUTÉS
            </a>
          </div>

          <div className="header-actions">
            <div className="search-box-container">
              <input
                type="text"
                placeholder="RECHERCHER..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>

            <button
              onClick={(e) => { e.preventDefault(); setIsSubModalOpen(true); }}
              className="btn-abonnement"
              style={{ background: "transparent", border: "1px solid #f77f00", color: "#f77f00", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
            >
              ABONNEZ-VOUS
            </button>

            <div className="genre-selector">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  className={`genre-btn ${selectedGenre === genre.id ? "active" : ""}`}
                  onClick={() => setSelectedGenre(genre.id)}
                >
                  {genre.label}
                </button>
              ))}
            </div>

            <Auth user={user} setUser={setUser} />
          </div>
        </header>

        <section className="page-title-section">
          <h1>{selectedArtist ? pageTitles["artist-songs"] : selectedAlbum ? pageTitles["albums"] : pageTitles[activeTab]}</h1>
          <p className="sub-title-desc">CLASSEMENT MIS À JOUR VIA DEEZER<br />SEMAINE EN COURS</p>
        </section>

        {searchQuery.trim().length >= 2 && (
          <section className="chart-table-section">
            <div className="table-header-row">
              <span>POSITION</span>
              <span>COUVERTURE</span>
              <span>TITRE</span>
              <span>ARTISTE</span>
              <span>TENDANCE</span>
              <span>STREAMS</span>
            </div>
            <div className="songs-container">
              {isSearching ? (
                <p className="no-result-text">Recherche en cours...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((song) => (
                  <div className="song-row-grid" key={song.position}>
                    <span className="row-pos">{song.position}</span>
                    <div className="row-cover"><img src={song.image} alt={song.title} /></div>
                    <span className="row-title">{song.title}</span>
                    <span className="row-artist">{song.artist}</span>
                    <span className={`row-trend ${song.change === "▲" ? "pos" : song.change === "▼" ? "neg" : ""}`}>{song.change}</span>
                    <span className="row-streams">{song.streams}</span>
                    <button className={`play-button ${playingId === song.position ? "playing" : ""}`} onClick={() => togglePlay(song)}>
                      {playingId === song.position ? "⏸" : "▶"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-result-text">Aucun résultat pour "{searchQuery}"</p>
              )}
            </div>
          </section>
        )}

        {activeTab === "accueil" && !selectedArtist && !selectedAlbum && searchQuery.trim().length < 2 && (
          <div className="accueil-container">
            <div className="hero-banner" style={{
              background: "linear-gradient(135deg, #f77f00 0%, #d90429 100%)",
              borderRadius: "16px",
              padding: "40px",
              marginBottom: "30px",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}>
              <span style={{ background: "rgba(0,0,0,0.2)", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                🔥 TENDANCE AFRO 2026
              </span>
              <h2 style={{ fontSize: "2.5rem", margin: "15px 0 10px 0" }}>Bienvenue sur Afrochart</h2>
              <p style={{ fontSize: "1.1rem", maxWidth: "600px", opacity: "0.9", lineHeight: "1.5" }}>
                Découvrez les sons, albums et artistes qui font vibrer l'Afrique cette semaine. Suivez les classements en temps réel.
              </p>
              <button
                onClick={() => setActiveTab("charts")}
                style={{
                  marginTop: "20px",
                  backgroundColor: "#fff",
                  color: "#d90429",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              >
                Voir tous les classements →
              </button>
            </div>

            <section className="categories-grid" style={{ marginBottom: "40px" }}>
              {categories.map((category) => (
                <div
                  className="cat-card"
                  key={category.title}
                  style={{ borderLeftColor: category.color, cursor: "pointer" }}
                  onClick={() => setActiveTab("charts")}
                >
                  <div className="cat-card-top">
                    <span>{category.subtitle}</span>
                    <span>{category.symbol}</span>
                  </div>
                  <div className="cat-card-number">{category.number}</div>
                  <h3>{category.title}</h3>
                </div>
              ))}
            </section>

            <section className="chart-table-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Titres Tendances de la Semaine</h2>
                <a href="#charts" onClick={(e) => { e.preventDefault(); setActiveTab("charts"); }} style={{ color: "#f77f00", textDecoration: "none", fontWeight: "bold" }}>Tout voir</a>
              </div>
              <div className="table-header-row">
                <span>POSITION</span>
                <span>COUVERTURE</span>
                <span>TITRE</span>
                <span>ARTISTE</span>
                <span>TENDANCE</span>
                <span>STREAMS</span>
              </div>
              <div className="songs-container">
                {loading ? (
                  <p className="no-result-text">Chargement...</p>
                ) : songs.slice(0, 5).map((song) => (
                  <div className="song-row-grid" key={song.position}>
                    <span className="row-pos">{song.position}</span>
                    <div className="row-cover"><img src={song.image} alt={song.title} /></div>
                    <span className="row-title">{song.title}</span>
                    <span className="row-artist">{song.artist}</span>
                    <span className={`row-trend ${song.change === "▲" ? "pos" : song.change === "▼" ? "neg" : ""}`}>{song.change}</span>
                    <span className="row-streams">{song.streams}</span>
                    <button className={`play-button ${playingId === song.position ? "playing" : ""}`} onClick={() => togglePlay(song)}>
                      {playingId === song.position ? "⏸" : "▶"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "charts" && !selectedArtist && !selectedAlbum && searchQuery.trim().length < 2 && (
          <section className="chart-table-section">
            <div className="table-header-row">
              <span>POSITION</span>
              <span>COUVERTURE</span>
              <span>TITRE</span>
              <span>ARTISTE</span>
              <span>TENDANCE</span>
              <span>STREAMS</span>
            </div>

            <div className="songs-container">
              {loading ? (
                <p className="no-result-text">Chargement des derniers classements...</p>
              ) : songs.length > 0 ? (
                songs.map((song) => (
                  <div className="song-row-grid" key={song.position}>
                    <span className="row-pos">{song.position}</span>
                    <div className="row-cover">
                      <img src={song.image} alt={song.title} />
                    </div>
                    <span className="row-title">{song.title}</span>
                    <span className="row-artist">{song.artist}</span>
                    <span className={`row-trend ${song.change === "▲" ? "pos" : song.change === "▼" ? "neg" : ""}`}>{song.change}</span>
                    <span className="row-streams">{song.streams}</span>
                    <button
                      className={`play-button ${playingId === song.position ? "playing" : ""}`}
                      onClick={() => togglePlay(song)}
                    >
                      {playingId === song.position ? "⏸" : "▶"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-result-text">Aucun résultat trouvé</p>
              )}
            </div>
          </section>
        )}

        {activeTab === "albums" && !selectedArtist && !selectedAlbum && searchQuery.trim().length < 2 && (
          <section className="grid-cards-section">
            {loading ? (
              <p className="no-result-text">Chargement des albums...</p>
            ) : filteredAlbums.length > 0 ? (
              filteredAlbums.map((album) => (
                <div
                  className="media-card"
                  key={album.id}
                  onClick={() => setSelectedAlbum(album)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={album.cover_medium || album.cover} alt={album.title} />
                  <h4>{album.title}</h4>
                  <p>{album.artist?.name || "Artiste"}</p>
                </div>
              ))
            ) : (
              <p className="no-result-text">Aucun album trouvé</p>
            )}
          </section>
        )}

        {activeTab === "artists" && !selectedArtist && !selectedAlbum && searchQuery.trim().length < 2 && (
          <section className="grid-cards-section">
            {loading ? (
              <p className="no-result-text">Chargement des artistes...</p>
            ) : filteredArtists.length > 0 ? (
              filteredArtists.map((artist) => (
                <div
                  className="media-card round"
                  key={artist.id}
                  onClick={() => setSelectedArtist(artist)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={artist.picture_medium || artist.picture} alt={artist.name} />
                  <h4>{artist.name}</h4>
                </div>
              ))
            ) : (
              <p className="no-result-text">Aucun artiste trouvé</p>
            )}
          </section>
        )}

        {(activeTab === "chansons" || activeTab === "tendances" || activeTab === "nouveautes") && !selectedArtist && !selectedAlbum && searchQuery.trim().length < 2 && (
          <section className="chart-table-section">
            <div className="table-header-row">
              <span>POSITION</span>
              <span>COUVERTURE</span>
              <span>TITRE</span>
              <span>ARTISTE</span>
              <span>TENDANCE</span>
              <span>STREAMS</span>
            </div>
            <div className="songs-container">
              {loading ? (
                <p className="no-result-text">Chargement...</p>
              ) : songs.length > 0 ? (
                songs.map((song) => (
                  <div className="song-row-grid" key={song.position}>
                    <span className="row-pos">{song.position}</span>
                    <div className="row-cover"><img src={song.image} alt={song.title} /></div>
                    <span className="row-title">{song.title}</span>
                    <span className="row-artist">{song.artist}</span>
                    <span className={`row-trend ${song.change === "▲" ? "pos" : song.change === "▼" ? "neg" : ""}`}>{song.change}</span>
                    <span className="row-streams">{song.streams}</span>
                    <button className={`play-button ${playingId === song.position ? "playing" : ""}`} onClick={() => togglePlay(song)}>
                      {playingId === song.position ? "⏸" : "▶"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-result-text">Aucun résultat trouvé</p>
              )}
            </div>
          </section>
        )}

        {selectedArtist && (
          <section className="chart-table-section">
            <button
              onClick={() => setSelectedArtist(null)}
              style={{ marginBottom: "20px", padding: "8px 16px", background: "#1e1e28", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              ← Retour aux artistes
            </button>
            <div className="table-header-row">
              <span>#</span>
              <span>COUVERTURE</span>
              <span>TITRE</span>
              <span>ARTISTE</span>
              <span>TENDANCE</span>
              <span>STREAMS</span>
            </div>
            <div className="songs-container">
              {artistSongs.length > 0 ? (
                artistSongs.map((song, index) => (
                  <div className="song-row-grid" key={index}>
                    <span className="row-pos">{index + 1}</span>
                    <div className="row-cover"><img src={song.image} alt={song.title} /></div>
                    <span className="row-title">{song.title}</span>
                    <span className="row-artist">{song.artist}</span>
                    <span className={`row-trend ${song.change === "▲" ? "pos" : song.change === "▼" ? "neg" : ""}`}>{song.change}</span>
                    <span className="row-streams">{song.streams}</span>
                    <button className={`play-button ${playingId === song.position ? "playing" : ""}`} onClick={() => togglePlay(song)}>
                      {playingId === song.position ? "⏸" : "▶"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-result-text">Aucune chanson disponible pour cet artiste.</p>
              )}
            </div>
          </section>
        )}

        {selectedAlbum && (
          <section className="chart-table-section">
            <button
              onClick={() => setSelectedAlbum(null)}
              style={{ marginBottom: "20px", padding: "8px 16px", background: "#1e1e28", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              ← Retour aux albums
            </button>
            <div className="table-header-row">
              <span>#</span>
              <span>COUVERTURE</span>
              <span>TITRE</span>
              <span>ARTISTE</span>
              <span>TENDANCE</span>
              <span>STREAMS</span>
            </div>
            <div className="songs-container">
              {albumTracks.length > 0 ? (
                albumTracks.map((song, index) => (
                  <div className="song-row-grid" key={index}>
                    <span className="row-pos">{index + 1}</span>
                    <div className="row-cover"><img src={song.image} alt={song.title} /></div>
                    <span className="row-title">{song.title}</span>
                    <span className="row-artist">{song.artist}</span>
                    <span className={`row-trend ${song.change === "▲" ? "pos" : song.change === "▼" ? "neg" : ""}`}>{song.change}</span>
                    <span className="row-streams">{song.streams}</span>
                    <button className={`play-button ${playingId === song.position ? "playing" : ""}`} onClick={() => togglePlay(song)}>
                      {playingId === song.position ? "⏸" : "▶"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-result-text">Chargement des titres de l'album...</p>
              )}
            </div>
          </section>
        )}
      </main>

      {currentSong && (
        <div className="now-playing-bar">
          <img src={currentSong.image} alt={currentSong.title} className="now-playing-cover" />
          <div className="now-playing-info">
            <h4>{currentSong.title}</h4>
            <p>{currentSong.artist}</p>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="now-playing-controls">
            <button className="now-playing-play-btn" onClick={() => togglePlay(currentSong)}>
              {playingId === currentSong.position ? "⏸" : "▶"}
            </button>
          </div>
        </div>
      )}

      {isSubModalOpen && (
        <SubscriptionModal onClose={() => setIsSubModalOpen(false)} />
      )}
    </div>
  );
}

export default App;