import Auth from "./components/Auth";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import SubscriptionModal from "./components/SubscriptionModal.jsx";

function App() {
  // =========================================================
  // ÉTATS
  // =========================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [playingId, setPlayingId] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);

  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("accueil");

  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState([]);

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(0);

  const audioRef = useRef(null);

  // =========================================================
  // INITIALISATION DU LECTEUR AUDIO
  // =========================================================

  useEffect(() => {
    const audio = new Audio();

    audioRef.current = audio;

    const updateProgress = () => {
      if (!audio.duration || Number.isNaN(audio.duration)) return;

      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);

      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !Number.isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setPlayingId(null);
      setCurrentTime(0);
      setProgress(0);
    };

    const handleError = () => {
      console.error("Impossible de lire ce fichier audio.");
      setPlayingId(null);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();

      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // =========================================================
  // GENRES
  // =========================================================

  const genres = [
    { id: 0, label: "MONDIAL" },
    { id: 132, label: "AFROBEATS" },
    { id: 116, label: "LATINO" },
    { id: 129, label: "K-POP / ASIE" },
    { id: 152, label: "DANCE / EUROPE" },
    {
      id: "playlist-1313621735",
      label: "FRANCE",
    },
  ];

  // =========================================================
  // CATÉGORIES
  // =========================================================

  const categories = [
    {
      title: "HOT 100 HEBDOMADAIRE",
      subtitle: "SEMAINE",
      number: "100",
      symbol: "📅",
      color: "#00b4d8",
    },
    {
      title: "BILLBOARD 200",
      subtitle: "ALBUMS",
      number: "200",
      symbol: "📚",
      color: "#2d6a4f",
    },
    {
      title: "ARTISTES 100",
      subtitle: "TOP",
      number: "100",
      symbol: "👤",
      color: "#f77f00",
    },
    {
      title: "HOT 100 DE FIN D'ANNÉE",
      subtitle: "ANNUEL",
      number: "1",
      symbol: "🔥",
      color: "#d90429",
    },
  ];

  // =========================================================
  // CHARGEMENT DES CHANSONS
  // =========================================================

  useEffect(() => {
    const loadSongs = async () => {
      try {
        setLoading(true);

        const isPlaylist =
          typeof selectedGenre === "string" &&
          selectedGenre.startsWith("playlist-");

        let url = "";

        if (isPlaylist) {
          const playlistId = selectedGenre.replace(
            "playlist-",
            ""
          );

          url = `https://afrochart-proxy.vercel.app/api/deezer?playlistId=${playlistId}&limit=50`;
        } else {
          url = `https://afrochart-proxy.vercel.app/api/deezer?genre=${selectedGenre}&limit=50`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP : ${response.status}`
          );
        }

        const data = await response.json();

        const tracksList =
          data.data || data.tracks?.data || [];

        const formattedSongs = tracksList.map(
          (track, index) => {
            const baseStreams = track.rank
              ? track.rank * 1500
              : Math.floor(Math.random() * 5000000) +
                500000;

            const trends = ["▲", "▼", "—", "▲", "▲"];

            const randomTrend =
              trends[
                Math.floor(
                  Math.random() * trends.length
                )
              ];

            return {
              id:
                track.id ||
                `${index}-${track.title}`,

              position: index + 1,

              title:
                track.title || "Titre inconnu",

              artist:
                track.artist?.name ||
                "Artiste inconnu",

              streams:
                baseStreams.toLocaleString(),

              change: randomTrend,

              image:
                track.album?.cover_medium ||
                track.artist?.picture_medium ||
                "",

              preview: track.preview || null,

              album: track.album || null,
            };
          }
        );

        setSongs(formattedSongs);

        // Albums
        const extractedAlbums =
          data.albums?.data &&
          data.albums.data.length > 0
            ? data.albums.data
            : Array.from(
                new Map(
                  formattedSongs
                    .filter(
                      (song) => song.album?.id
                    )
                    .map((song) => [
                      song.album.id,
                      song.album,
                    ])
                ).values()
              );

        setAlbums(extractedAlbums);

        // Artistes
        const extractedArtists =
          data.artists?.data &&
          data.artists.data.length > 0
            ? data.artists.data
            : Array.from(
                new Map(
                  tracksList
                    .filter(
                      (track) =>
                        track.artist?.id
                    )
                    .map((track) => [
                      track.artist.id,
                      track.artist,
                    ])
                ).values()
              );

        setArtists(extractedArtists);
      } catch (error) {
        console.error(
          "Erreur de chargement :",
          error
        );

        setSongs([]);
        setAlbums([]);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, [selectedGenre]);

  // =========================================================
  // RECHERCHE
  // =========================================================

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const url =
          `https://afrochart-proxy.vercel.app/api/deezer` +
          `?search=${encodeURIComponent(query)}` +
          `&limit=30`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP : ${response.status}`
          );
        }

        const data = await response.json();

        const results = data.data || [];

        const formattedResults =
          results.map((track, index) => {
            const baseStreams = track.rank
              ? track.rank * 1500
              : Math.floor(
                  Math.random() * 5000000
                ) + 500000;

            const trends = [
              "▲",
              "▼",
              "—",
              "▲",
              "▲",
            ];

            const randomTrend =
              trends[
                Math.floor(
                  Math.random() * trends.length
                )
              ];

            return {
              id:
                track.id ||
                `${index}-${track.title}`,

              position: index + 1,

              title:
                track.title ||
                "Titre inconnu",

              artist:
                track.artist?.name ||
                "Artiste inconnu",

              streams:
                baseStreams.toLocaleString(),

              change: randomTrend,

              image:
                track.album?.cover_medium ||
                "",

              preview:
                track.preview || null,

              album: track.album || null,
            };
          });

        setSearchResults(formattedResults);
      } catch (error) {
        console.error(
          "Erreur recherche :",
          error
        );

        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // =========================================================
  // CHARGEMENT DES TITRES D'UN ALBUM
  // =========================================================

  useEffect(() => {
    if (!selectedAlbum?.id) {
      setAlbumTracks([]);
      return;
    }

    const loadAlbumTracks = async () => {
      try {
        const url =
          `https://afrochart-proxy.vercel.app/api/deezer` +
          `?albumId=${selectedAlbum.id}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP : ${response.status}`
          );
        }

        const data = await response.json();

        const tracks =
          data.data ||
          data.tracks?.data ||
          [];

        const formattedTracks =
          tracks.map((track, index) => {
            const baseStreams = track.rank
              ? track.rank * 1500
              : Math.floor(
                  Math.random() * 5000000
                ) + 500000;

            const trends = [
              "▲",
              "▼",
              "—",
              "▲",
              "▲",
            ];

            const randomTrend =
              trends[
                Math.floor(
                  Math.random() * trends.length
                )
              ];

            return {
              id:
                track.id ||
                `${index}-${track.title}`,

              position: index + 1,

              title:
                track.title ||
                "Titre inconnu",

              artist:
                track.artist?.name ||
                selectedAlbum.artist?.name ||
                "Artiste inconnu",

              streams:
                baseStreams.toLocaleString(),

              change: randomTrend,

              image:
                selectedAlbum.cover_medium ||
                "",

              preview:
                track.preview || null,
            };
          });

        setAlbumTracks(formattedTracks);
      } catch (error) {
        console.error(
          "Erreur album :",
          error
        );

        setAlbumTracks([]);
      }
    };

    loadAlbumTracks();
  }, [selectedAlbum]);

  // =========================================================
  // FILTRES
  // =========================================================

  const filteredAlbums = albums.filter(
    (album) => {
      const query =
        searchQuery.toLowerCase();

      return (
        (album.title &&
          album.title
            .toLowerCase()
            .includes(query)) ||
        (album.artist?.name &&
          album.artist.name
            .toLowerCase()
            .includes(query))
      );
    }
  );

  const filteredArtists = artists.filter(
    (artist) => {
      const query =
        searchQuery.toLowerCase();

      return (
        artist.name &&
        artist.name
          .toLowerCase()
          .includes(query)
      );
    }
  );

  const artistSongs = selectedArtist
    ? songs.filter((song) =>
        song.artist
          .toLowerCase()
          .includes(
            selectedArtist.name.toLowerCase()
          )
      )
    : [];

  // =========================================================
  // FORMATAGE DU TEMPS
  // =========================================================

  const formatTime = (time) => {
    if (!time || Number.isNaN(time)) {
      return "00:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes
      .toString()
      .padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // =========================================================
  // LECTURE / PAUSE
  // =========================================================

  const togglePlay = async (song) => {
    if (!song?.preview) {
      alert(
        "Aperçu audio non disponible pour ce titre."
      );
      return;
    }

    const audio = audioRef.current;

    if (!audio) return;

    // Même chanson
    if (playingId === song.id) {
      if (audio.paused) {
        try {
          await audio.play();
          setPlayingId(song.id);
        } catch (error) {
          console.error(
            "Erreur lecture :",
            error
          );
        }
      } else {
        audio.pause();
        setPlayingId(null);
      }

      return;
    }

    // Nouvelle chanson
    try {
      audio.pause();

      audio.src = song.preview;

      audio.currentTime = 0;
      audio.volume = volume;
      audio.playbackRate = playbackRate;

      setCurrentSong(song);
      setPlayingId(song.id);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);

      await audio.play();
    } catch (error) {
      console.error(
        "Erreur lecture audio :",
        error
      );

      setPlayingId(null);
    }
  };

  // =========================================================
  // AVANCER / RECULER DE 10 SECONDES
  // =========================================================

  const skipTime = (seconds) => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = Math.max(
      0,
      Math.min(
        audio.currentTime + seconds,
        audio.duration || 0
      )
    );
  };

  // =========================================================
  // BARRE DE PROGRESSION
  // =========================================================

  const handleProgressChange = (event) => {
    const audio = audioRef.current;

    if (!audio || !audio.duration) return;

    const newProgress = Number(
      event.target.value
    );

    const newTime =
      (newProgress / 100) *
      audio.duration;

    audio.currentTime = newTime;

    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  // =========================================================
  // VOLUME
  // =========================================================

  const handleVolumeChange = (event) => {
    const newVolume = Number(
      event.target.value
    );

    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // =========================================================
  // VITESSE
  // =========================================================

  const changePlaybackRate = () => {
    const speeds = [
      0.5,
      0.75,
      1,
      1.25,
      1.5,
      1.75,
      2,
    ];

    const currentIndex =
      speeds.indexOf(playbackRate);

    const nextIndex =
      (currentIndex + 1) % speeds.length;

    const newRate = speeds[nextIndex];

    setPlaybackRate(newRate);

    if (audioRef.current) {
      audioRef.current.playbackRate =
        newRate;
    }
  };

  // =========================================================
  // MUET
  // =========================================================

  const toggleMute = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.volume > 0) {
      setVolume(0);
      audio.volume = 0;
    } else {
      setVolume(1);
      audio.volume = 1;
    }
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSearchQuery("");
  };

  // =========================================================
  // TITRES DES PAGES
  // =========================================================

  const pageTitles = {
    accueil: "ACCUEIL",
    charts: "CLASSEMENTS",

    albums: selectedAlbum
      ? `ALBUM : ${selectedAlbum.title?.toUpperCase()}`
      : "ALBUMS",

    artists: "ARTISTES",
    chansons: "CHANSONS",
    tendances: "TENDANCES",
    nouveautes: "NOUVEAUTÉS",

    "artist-songs": selectedArtist
      ? `CHANSONS DE ${selectedArtist.name?.toUpperCase()}`
      : "ARTISTE",
  };

  // =========================================================
  // COMPOSANT CHANSON
  // =========================================================

  const SongRow = ({ song, index }) => (
    <div
      className={`song-row-grid ${
        playingId === song.id
          ? "song-playing"
          : ""
      }`}
      onClick={() => togglePlay(song)}
    >
      <span className="row-pos">
        {index + 1}
      </span>

      <div className="row-cover">
        {song.image ? (
          <img
            src={song.image}
            alt={song.title}
          />
        ) : (
          <div className="cover-placeholder">
            ♪
          </div>
        )}

        {playingId === song.id && (
          <div className="cover-playing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      <div className="row-song-info">
        <span className="row-title">
          {song.title}
        </span>

        <span className="row-artist">
          {song.artist}
        </span>
      </div>

      <span className="row-trend">
        {song.change}
      </span>

      <span className="row-streams">
        {song.streams}
      </span>
    </div>
  );

  // =========================================================
  // RENDU
  // =========================================================

  return (
    <div className="app">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        setSelectedArtist={setSelectedArtist}
        setSelectedAlbum={setSelectedAlbum}
      />

      <main className="main-content">

        {/* HEADER */}

        <header className="top-header">
          <div className="header-nav-links">

            <a
              href="#accueil"
              className={
                activeTab === "accueil" &&
                !selectedArtist &&
                !selectedAlbum
                  ? "active-tab"
                  : ""
              }
              onClick={(e) => {
                e.preventDefault();
                navigateTo("accueil");
              }}
            >
              ACCUEIL
            </a>

            <a
              href="#charts"
              className={
                activeTab === "charts" &&
                !selectedArtist &&
                !selectedAlbum
                  ? "active-tab"
                  : ""
              }
              onClick={(e) => {
                e.preventDefault();
                navigateTo("charts");
              }}
            >
              CHARTS
            </a>

            <a
              href="#artists"
              className={
                activeTab === "artists" &&
                !selectedArtist &&
                !selectedAlbum
                  ? "active-tab"
                  : ""
              }
              onClick={(e) => {
                e.preventDefault();
                navigateTo("artists");
              }}
            >
              ARTISTES
            </a>

            <a
              href="#albums"
              className={
                activeTab === "albums" &&
                !selectedArtist &&
                !selectedAlbum
                  ? "active-tab"
                  : ""
              }
              onClick={(e) => {
                e.preventDefault();
                navigateTo("albums");
              }}
            >
              ALBUMS
            </a>

            <a
              href="#nouveautes"
              className={
                activeTab === "nouveautes" &&
                !selectedArtist &&
                !selectedAlbum
                  ? "active-tab"
                  : ""
              }
              onClick={(e) => {
                e.preventDefault();
                navigateTo("nouveautes");
              }}
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
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="search-input-field"
              />

              {searchQuery.trim()
                .length >= 2 && (
                <span className="search-status">
                  {isSearching
                    ? "Recherche..."
                    : `${searchResults.length} résultat${
                        searchResults.length >
                        1
                          ? "s"
                          : ""
                      }`}
                </span>
              )}
            </div>

            <button
              onClick={() =>
                setIsSubModalOpen(true)
              }
              className="btn-abonnement"
            >
              ABONNEZ-VOUS
            </button>

            <Auth
              user={user}
              setUser={setUser}
            />
          </div>
        </header>

        {/* GENRES */}

        <div className="genre-selector">
          {genres.map((genre) => (
            <button
              key={genre.id}
              className={`genre-btn ${
                selectedGenre === genre.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedGenre(genre.id)
              }
            >
              {genre.label}
            </button>
          ))}
        </div>

        {/* TITRE */}

        <section className="page-title-section">
          <h1>
            {selectedArtist
              ? pageTitles["artist-songs"]
              : selectedAlbum
              ? pageTitles["albums"]
              : pageTitles[activeTab]}
          </h1>

          <p className="sub-title-desc">
            CLASSEMENT MIS À JOUR VIA DEEZER
            <br />
            SEMAINE EN COURS
          </p>
        </section>

        {/* RECHERCHE */}

        {searchQuery.trim().length >= 2 && (
          <section className="search-results-section">

            <div className="search-results-title">
              <div>
                <span className="section-label">
                  RECHERCHE
                </span>

                <h2>
                  Résultats pour "
                  {searchQuery}"
                </h2>
              </div>

              {isSearching && (
                <div className="search-loader">
                  <span></span>
                  Recherche...
                </div>
              )}
            </div>

            {!isSearching &&
              searchResults.length === 0 && (
                <div className="no-result-text">
                  Aucun résultat trouvé pour "
                  {searchQuery}".
                </div>
              )}

            <div className="songs-container">
              {searchResults.map(
                (song, index) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={index}
                  />
                )
              )}
            </div>
          </section>
        )}

        {/* ACCUEIL */}

        {activeTab === "accueil" &&
          !selectedArtist &&
          !selectedAlbum &&
          searchQuery.trim().length < 2 && (
            <div className="accueil-container">

              <div className="hero-banner">
                <span className="hero-badge">
                  🔥 TENDANCE AFRO 2026
                </span>

                <h2>
                  Bienvenue sur Afrochart
                </h2>

                <p>
                  Découvrez les sons,
                  albums et artistes qui
                  font vibrer l'Afrique
                  cette semaine.
                  Suivez les classements
                  en temps réel.
                </p>

                <button
                  onClick={() =>
                    navigateTo("charts")
                  }
                  className="hero-button"
                >
                  Voir tous les
                  classements →
                </button>
              </div>

              <section className="categories-grid">
                {categories.map(
                  (category) => (
                    <div
                      className="cat-card"
                      key={category.title}
                      style={{
                        borderLeftColor:
                          category.color,
                      }}
                      onClick={() =>
                        navigateTo(
                          "charts"
                        )
                      }
                    >
                      <div className="cat-card-top">
                        <span>
                          {
                            category.subtitle
                          }
                        </span>

                        <span>
                          {
                            category.symbol
                          }
                        </span>
                      </div>

                      <div className="cat-card-number">
                        {
                          category.number
                        }
                      </div>

                      <h3>
                        {category.title}
                      </h3>
                    </div>
                  )
                )}
              </section>

              <section className="chart-table-section">

                <div className="section-heading">
                  <div>
                    <span className="section-label">
                      TOP DE LA SEMAINE
                    </span>

                    <h2>
                      Titres tendances
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      navigateTo(
                        "charts"
                      )
                    }
                    className="see-all-button"
                  >
                    Tout voir →
                  </button>
                </div>

                <div className="table-header-row">
                  <span>POSITION</span>
                  <span>COUVERTURE</span>
                  <span>
                    TITRE / ARTISTE
                  </span>
                  <span>TENDANCE</span>
                  <span>STREAMS</span>
                </div>

                <div className="songs-container">
                  {loading ? (
                    <p className="no-result-text">
                      Chargement...
                    </p>
                  ) : (
                    songs
                      .slice(0, 5)
                      .map(
                        (
                          song,
                          index
                        ) => (
                          <SongRow
                            key={song.id}
                            song={song}
                            index={index}
                          />
                        )
                      )
                  )}
                </div>
              </section>
            </div>
          )}

        {/* CHARTS */}

        {activeTab === "charts" &&
          !selectedArtist &&
          !selectedAlbum &&
          searchQuery.trim().length < 2 && (
            <section className="chart-table-section">

              <div className="section-heading">
                <div>
                  <span className="section-label">
                    CLASSEMENT
                  </span>

                  <h2>
                    Top 50 de la semaine
                  </h2>
                </div>
              </div>

              <div className="table-header-row">
                <span>POSITION</span>
                <span>COUVERTURE</span>
                <span>
                  TITRE / ARTISTE
                </span>
                <span>TENDANCE</span>
                <span>STREAMS</span>
              </div>

              <div className="songs-container">
                {loading ? (
                  <p className="no-result-text">
                    Chargement des
                    derniers
                    classements...
                  </p>
                ) : songs.length > 0 ? (
                  songs.map(
                    (song, index) => (
                      <SongRow
                        key={song.id}
                        song={song}
                        index={index}
                      />
                    )
                  )
                ) : (
                  <p className="no-result-text">
                    Aucun résultat
                    trouvé.
                  </p>
                )}
              </div>
            </section>
          )}

        {/* ALBUMS */}

        {activeTab === "albums" &&
          !selectedArtist &&
          !selectedAlbum &&
          searchQuery.trim().length < 2 && (
            <section className="grid-cards-section">

              {loading ? (
                <p className="no-result-text">
                  Chargement des
                  albums...
                </p>
              ) : filteredAlbums.length >
                0 ? (
                filteredAlbums.map(
                  (album) => (
                    <div
                      className="media-card"
                      key={album.id}
                      onClick={() =>
                        setSelectedAlbum(
                          album
                        )
                      }
                    >
                      <div className="media-card-image">
                        <img
                          src={
                            album.cover_medium ||
                            album.cover
                          }
                          alt={
                            album.title
                          }
                        />
                      </div>

                      <h4>
                        {album.title}
                      </h4>

                      <p>
                        {album.artist
                          ?.name ||
                          "Artiste"}
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="no-result-text">
                  Aucun album trouvé.
                </p>
              )}
            </section>
          )}

        {/* ARTISTES */}

        {activeTab === "artists" &&
          !selectedArtist &&
          !selectedAlbum &&
          searchQuery.trim().length < 2 && (
            <section className="grid-cards-section">

              {loading ? (
                <p className="no-result-text">
                  Chargement des
                  artistes...
                </p>
              ) : filteredArtists.length >
                0 ? (
                filteredArtists.map(
                  (artist) => (
                    <div
                      className="media-card artist-card"
                      key={artist.id}
                      onClick={() =>
                        setSelectedArtist(
                          artist
                        )
                      }
                    >
                      <div className="media-card-image artist-image">
                        <img
                          src={
                            artist.picture_medium ||
                            artist.picture
                          }
                          alt={
                            artist.name
                          }
                        />
                      </div>

                      <h4>
                        {artist.name}
                      </h4>
                    </div>
                  )
                )
              ) : (
                <p className="no-result-text">
                  Aucun artiste trouvé.
                </p>
              )}
            </section>
          )}

        {/* CHANSONS / TENDANCES / NOUVEAUTÉS */}

        {(activeTab ===
          "chansons" ||
          activeTab ===
            "tendances" ||
          activeTab ===
            "nouveautes") &&
          !selectedArtist &&
          !selectedAlbum &&
          searchQuery.trim().length < 2 && (
            <section className="chart-table-section">

              <div className="table-header-row">
                <span>POSITION</span>
                <span>COUVERTURE</span>
                <span>
                  TITRE / ARTISTE
                </span>
                <span>TENDANCE</span>
                <span>STREAMS</span>
              </div>

              <div className="songs-container">
                {loading ? (
                  <p className="no-result-text">
                    Chargement...
                  </p>
                ) : songs.length > 0 ? (
                  songs.map(
                    (song, index) => (
                      <SongRow
                        key={song.id}
                        song={song}
                        index={index}
                      />
                    )
                  )
                ) : (
                  <p className="no-result-text">
                    Aucun résultat
                    trouvé.
                  </p>
                )}
              </div>
            </section>
          )}

        {/* ARTISTE SÉLECTIONNÉ */}

        {selectedArtist && (
          <section className="chart-table-section">

            <button
              onClick={() =>
                setSelectedArtist(null)
              }
              className="back-button"
            >
              ← Retour aux artistes
            </button>

            <div className="artist-profile-header">

              <div className="artist-profile-image">
                <img
                  src={
                    selectedArtist.picture_medium ||
                    selectedArtist.picture
                  }
                  alt={
                    selectedArtist.name
                  }
                />
              </div>

              <div>
                <span className="section-label">
                  ARTISTE
                </span>

                <h2>
                  {selectedArtist.name}
                </h2>
              </div>
            </div>

            <div className="songs-container">
              {artistSongs.length > 0 ? (
                artistSongs.map(
                  (song, index) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={index}
                    />
                  )
                )
              ) : (
                <p className="no-result-text">
                  Aucune chanson
                  disponible pour
                  cet artiste.
                </p>
              )}
            </div>
          </section>
        )}

        {/* ALBUM SÉLECTIONNÉ */}

        {selectedAlbum && (
          <section className="chart-table-section">

            <button
              onClick={() =>
                setSelectedAlbum(null)
              }
              className="back-button"
            >
              ← Retour aux albums
            </button>

            <div className="album-profile-header">

              <div className="album-profile-image">
                <img
                  src={
                    selectedAlbum.cover_medium ||
                    selectedAlbum.cover
                  }
                  alt={
                    selectedAlbum.title
                  }
                />
              </div>

              <div>
                <span className="section-label">
                  ALBUM
                </span>

                <h2>
                  {selectedAlbum.title}
                </h2>

                <p>
                  {selectedAlbum.artist
                    ?.name ||
                    "Artiste inconnu"}
                </p>
              </div>
            </div>

            <div className="table-header-row">
              <span>POSITION</span>
              <span>COUVERTURE</span>
              <span>
                TITRE / ARTISTE
              </span>
              <span>TENDANCE</span>
              <span>STREAMS</span>
            </div>

            <div className="songs-container">
              {albumTracks.length >
              0 ? (
                albumTracks.map(
                  (song, index) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={index}
                    />
                  )
                )
              ) : (
                <p className="no-result-text">
                  Chargement des
                  titres de l'album...
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      {/* =====================================================
          LECTEUR AUDIO PROFESSIONNEL
          ===================================================== */}

      {currentSong && (
        <div className="now-playing-bar">

          {/* Partie gauche */}

          <div className="now-playing-left">

            <div className="now-playing-cover-wrapper">
              {currentSong.image ? (
                <img
                  src={currentSong.image}
                  alt={currentSong.title}
                  className="now-playing-cover"
                />
              ) : (
                <div className="now-playing-cover-placeholder">
                  ♪
                </div>
              )}

              {playingId ===
                currentSong.id && (
                <div className="mini-playing-animation">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>

            <div className="now-playing-info">
              <h4>
                {currentSong.title}
              </h4>

              <p>
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Partie centrale */}

          <div className="player-center">

            <div className="player-main-controls">

              <button
                className="player-control-button"
                onClick={() =>
                  skipTime(-10)
                }
                title="Reculer de 10 secondes"
              >
                ↶
                <small>10</small>
              </button>

              <button
                className="main-play-button"
                onClick={() =>
                  togglePlay(
                    currentSong
                  )
                }
                title={
                  playingId ===
                  currentSong.id
                    ? "Pause"
                    : "Lecture"
                }
              >
                {playingId ===
                currentSong.id
                  ? "❚❚"
                  : "▶"}
              </button>

              <button
                className="player-control-button"
                onClick={() =>
                  skipTime(10)
                }
                title="Avancer de 10 secondes"
              >
                ↷
                <small>10</small>
              </button>
            </div>

            <div className="progress-area">

              <span className="time-label">
                {formatTime(
                  currentTime
                )}
              </span>

              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={
                  handleProgressChange
                }
                className="audio-progress"
                style={{
                  "--progress":
                    `${progress}%`,
                }}
              />

              <span className="time-label">
                {formatTime(duration)}
              </span>

            </div>
          </div>

          {/* Partie droite */}

          <div className="player-right-controls">

            <button
              className="speed-button"
              onClick={
                changePlaybackRate
              }
              title="Changer la vitesse"
            >
              {playbackRate}x
            </button>

            <button
              className="volume-icon"
              onClick={toggleMute}
              title="Activer / couper le son"
            >
              {volume === 0
                ? "🔇"
                : "🔊"}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={
                handleVolumeChange
              }
              className="volume-slider"
              style={{
                "--volume":
                  `${volume * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL D'ABONNEMENT */}

      {isSubModalOpen && (
        <SubscriptionModal
          onClose={() =>
            setIsSubModalOpen(false)
          }
        />
      )}
    </div>
  );
}

export default App;