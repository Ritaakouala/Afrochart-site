import React from "react";
import "./sidebar.css";

function Sidebar({
  activeTab,
  setActiveTab,
  setSelectedArtist,
  setSelectedAlbum,
}) {
  const handleNav = (tab) => {
    setActiveTab(tab);

    if (setSelectedArtist) {
      setSelectedArtist(null);
    }

    if (setSelectedAlbum) {
      setSelectedAlbum(null);
    }
  };

  const discoverLinks = [
    ["accueil", "Accueil"],
    ["charts", "Classements"],
    ["artists", "Artistes"],
    ["chansons", "Chansons"],
    ["tendances", "Tendances"],
  ];

  const collectionLinks = [
    ["albums", "Albums"],
    ["nouveautes", "Nouveautés"],
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        AFROCHART
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <p className="sidebar-category-title">DÉCOUVRIR</p>

          {discoverLinks.map(([tab, label]) => (
            <a
              key={tab}
              href="#"
              className={`sidebar-link ${
                activeTab === tab ? "active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleNav(tab);
              }}
            >
              <span>{label}</span>
            </a>
          ))}
        </div>

        <div className="sidebar-section">
          <p className="sidebar-category-title">COLLECTION</p>

          {collectionLinks.map(([tab, label]) => (
            <a
              key={tab}
              href="#"
              className={`sidebar-link ${
                activeTab === tab ? "active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleNav(tab);
              }}
            >
              <span>{label}</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="sidebar-promo-box">
        <span className="promo-label">AFROCHART</span>

        <h3>Le son de l'Afrique.</h3>

        <p>
          Découvrez les artistes, les titres et les tendances
          musicales africaines.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;