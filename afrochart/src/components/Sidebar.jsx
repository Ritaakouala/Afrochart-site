import React from 'react';
import './sidebar.css';

function Sidebar({ activeTab, setActiveTab, setSelectedArtist, setSelectedAlbum }) {
  const handleNav = (tab) => {
    setActiveTab(tab);
    if (setSelectedArtist) setSelectedArtist(null);
    if (setSelectedAlbum) setSelectedAlbum(null); // Réinitialise l'album sélectionné
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="header-brand">AFROCHART</div>
        <br />
        <p className="sidebar-category-title active">DÉCOUVRIR</p>
        
        <a
          href="#"
          className={`sidebar-link ${activeTab === "accueil" ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); handleNav("accueil"); }}
        >
          Accueil
        </a>
        
        <a
          href="#"
          className={`sidebar-link ${activeTab === "charts" ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); handleNav("charts"); }}
        >
          Classements
        </a>
        
        <a
          href="#"
          className={`sidebar-link ${activeTab === "artists" ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); handleNav("artists"); }}
        >
          Artistes
        </a>

        <a
          href="#"
          className={`sidebar-link ${activeTab === "chansons" ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); handleNav("chansons"); }}
        >
          Chansons
        </a>

        <a
          href="#"
          className={`sidebar-link ${activeTab === "tendances" ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); handleNav("tendances"); }}
        >
          Tendances
        </a>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-category-title active">COLLECTION</p>
        
        <a
          href="#"
          className={`sidebar-link ${activeTab === "albums" ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); handleNav("albums"); }}
        >
          Albums
        </a>

        <a
          href="#"
          className={`sidebar-link ${activeTab === "nouveautes" ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); handleNav("nouveautes"); }}
        >
          Nouveautés
        </a>
      </div>

      <div className="sidebar-promo-box">
        <h3>AFROCHART</h3>
        <p>Découvrez le son de l'Afrique.</p>
      </div>
    </aside>
  );
}

export default Sidebar;