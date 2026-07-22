
import { useState, useRef, useCallback, useEffect } from "react";
import "../styles/visionpage.css";
import { api } from "../Api";

const UNSPLASH_KEY = "NBvpY2ds0mr_TOCIJhm3-0-A9ZsQk7Avz4M--E4wbYU";

const CATEGORIES = [
  { label: "Career",        query: "career success office work" },
  { label: "Health",        query: "health fitness yoga wellness" },
  { label: "Travel",        query: "travel adventure destinations" },
  { label: "Finance",       query: "luxury wealth abundance home" },
  { label: "Relationships", query: "friends family love connection" },
  { label: "Personal",      query: "personal growth mindset motivation" },
  { label: "Nature",        query: "nature peaceful landscape" },
  { label: "Fashion",       query: "fashion style aesthetic outfit" },
];

const CATEGORY_COLORS = {
  Career:        ["#3a86ff", "#8338ec"],
  Health:        ["#fb5607", "#ffbe0b"],
  Travel:        ["#3a86ff", "#ff006e"],
  Finance:       ["#ffbe0b", "#fb5607"],
  Relationships: ["#ff006e", "#8338ec"],
  Personal:      ["#8338ec", "#3a86ff"],
  Nature:        ["#3a86ff", "#ffbe0b"],
  Fashion:       ["#ff006e", "#fb5607"],
  Search:        ["#8338ec", "#ff006e"],
  Upload:        ["#3a86ff", "#8338ec"],
};

let localIdCounter = Date.now();
const makeLocalId = () => `local_${++localIdCounter}`;

export default function Visionpage() {
  const [libImages,   setLibImages]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [activeCategory, setActive]   = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);

  // Board state — loaded from backend
  const [boardTiles,  setBoardTiles]  = useState([]);
  const [boardLoading,setBoardLoading]= useState(true);
  const [boardFilter, setBoardFilter] = useState("All");

  // Drag state
  const [draggingLib,   setDraggingLib]   = useState(null);
  const [draggingBoard, setDraggingBoard] = useState(null);
  const [dragOverBoard, setDragOverBoard] = useState(null);
  const [boardDragActive, setBoardDragActive] = useState(false);

  const fileRef = useRef(null);

 
  useEffect(() => {
    api.get("/visionboard")
      .then(data => {
        setBoardTiles(Array.isArray(data) ? data.map(t => ({ ...t, id: t.tileId })) : []);
      })
      .catch(err => console.error("Vision board load error:", err))
      .finally(() => setBoardLoading(false));
  }, []);

  // ── Fetch from Unsplash 
  const fetchImages = useCallback(async (query, pageNum = 1, append = false) => {
    if (!query) return;
    setLoading(true);
    try {
      const res  = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&page=${pageNum}&orientation=squarish`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
      );
      const data = await res.json();
      const imgs = (data.results || []).map(photo => ({
        id:       photo.id,
        url:      photo.urls.small,
        fullUrl:  photo.urls.regular,
        label:    photo.alt_description || photo.description || query,
        author:   photo.user.name,
        category: activeCategory || "Search",
      }));
      setLibImages(prev => append ? [...prev, ...imgs] : imgs);
      setHasMore(pageNum < data.total_pages);
    } catch (err) { console.error("Unsplash error:", err); }
    setLoading(false);
  }, [activeCategory]);

  const handleCategoryClick = (cat) => {
    setActive(cat.label);
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
    setLibImages([]);
    fetchImages(cat.query, 1, false);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchInput.trim()) return;
    setActive(null);
    setSearchQuery(searchInput.trim());
    setPage(1);
    setLibImages([]);
    fetchImages(searchInput.trim(), 1, false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const query = searchQuery || CATEGORIES.find(c => c.label === activeCategory)?.query;
    if (query) fetchImages(query, nextPage, true);
  };

  useEffect(() => { handleCategoryClick(CATEGORIES[0]); }, []);

 
  const addTileToBoard = useCallback(async (img) => {

    if (boardTiles.some(t => t.id === img.id)) return;

    const newTile = {
      id:       img.id,
      tileId:   img.id,
      url:      img.url,
      label:    img.label || "",
      category: img.category || "Personal",
      author:   img.author || "",
      order:    boardTiles.length,
    };

  
    setBoardTiles(prev => [...prev, newTile]);

    try {
      await api.post("/visionboard", {
        tileId:   newTile.tileId,
        url:      newTile.url,
        label:    newTile.label,
        category: newTile.category,
        author:   newTile.author,
        order:    newTile.order,
      });
    } catch (err) {
      console.error("Save tile error:", err);
      // Revert on failure
      setBoardTiles(prev => prev.filter(t => t.id !== newTile.id));
    }
  }, [boardTiles]);

  
  const removeTile = useCallback(async (id) => {
    setBoardTiles(prev => prev.filter(t => t.id !== id));
    try {
      await api.delete(`/visionboard/${id}`);
    } catch (err) { console.error("Delete tile error:", err); }
  }, []);

  // ── Upload own images
 const handleFiles = (files) => {
    Array.from(files).filter(f => f.type.startsWith("image/")).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const tileId = makeLocalId();
        const newTile = {
          id: tileId, tileId,
          url: e.target.result,
          label: file.name.replace(/\.[^.]+$/, ""),
          category: "Upload", author: "",
          order: boardTiles.length,
        };
        setBoardTiles(prev => [...prev, newTile]);
        try {
          await api.post("/visionboard", {
            tileId: newTile.tileId, url: newTile.url,
            label: newTile.label, category: newTile.category,
            author: "", order: newTile.order,
          });
        } catch (err) { console.error("Upload save error:", err); }
      };
      reader.readAsDataURL(file);
    });
  };

 const onLibDragStart = (e, img) => {
    setDraggingLib(img);
    e.dataTransfer.effectAllowed = "copy";
  };


  const onBoardDrop = (e) => {
    e.preventDefault();
    setBoardDragActive(false);

    if (e.dataTransfer.files?.length && !draggingLib) {
      handleFiles(e.dataTransfer.files);
      return;
    }
    if (draggingLib) {
      addTileToBoard(draggingLib);
      setDraggingLib(null);
    }
  };

  // ── Reorder board tiles 
  const onBoardTileDragStart = (e, id) => {
    setDraggingBoard(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onBoardTileDrop = async (e, targetId) => {
    e.stopPropagation();
    if (!draggingBoard || draggingBoard === targetId) {
      setDraggingBoard(null); setDragOverBoard(null); return;
    }
    setBoardTiles(prev => {
      const arr = [...prev];
      const fi  = arr.findIndex(t => t.id === draggingBoard);
      const ti  = arr.findIndex(t => t.id === targetId);
      const [moved] = arr.splice(fi, 1);
      arr.splice(ti, 0, moved);
   
      const orderPayload = arr.map((t, i) => ({ tileId: t.id, order: i }));
      api.put("/visionboard/reorder", { order: orderPayload }).catch(console.error);
      return arr;
    });
    setDraggingBoard(null); setDragOverBoard(null);
  };

  const boardCategories = ["All", ...new Set(boardTiles.map(t => t.category))];
  const visibleBoard = boardFilter === "All"
    ? boardTiles
    : boardTiles.filter(t => t.category === boardFilter);

  return (
    <div className="vision-root">
      <div className="vorb vorb-1" /><div className="vorb vorb-2" /><div className="vorb vorb-3" />
      <div className="grid-texture" />

      <div className="vision-content">

        {/* ── Header ── */}
        <div className="vision-header">
          <span className="vision-eyebrow">✨ Vision Board</span>
          <h1 className="vision-title">Your Dream Life</h1>
          <p className="vision-subtitle">Search millions of photos → drag onto your board → saved forever</p>
        </div>

        {/* ── Split layout ── */}
        <div className="vision-split">

          {/* ══ LEFT: Library ══ */}
          <div className="library-panel">

            {/* Search bar */}
            <form className="search-bar" onSubmit={handleSearch}>
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search anything..."
              />
              {searchInput && (
                <button type="button" className="search-clear" onClick={() => setSearchInput("")}>✕</button>
              )}
              <button type="submit" className="search-btn">Search</button>
            </form>

            {/* Category tabs */}
            <div className="lib-tabs">
              {CATEGORIES.map(cat => (
                <button key={cat.label}
                  className={`lib-tab${activeCategory === cat.label && !searchQuery ? " active" : ""}`}
                  onClick={() => handleCategoryClick(cat)}
                >{cat.label}</button>
              ))}
            </div>

            {/* Upload row */}
            <div className="lib-upload-row">
              <span className="lib-result-label">
                {searchQuery ? `Results for "${searchQuery}"` : activeCategory}
                {libImages.length > 0 && ` · ${libImages.length} photos`}
              </span>
              <button className="upload-btn" onClick={() => fileRef.current?.click()}>+ Upload own</button>
              <input ref={fileRef} type="file" accept="image/*" multiple
                style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
            </div>

            {/* Library scroll */}
            <div className="lib-scroll">
              {loading && libImages.length === 0 && (
                <div className="lib-masonry">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="lib-skeleton"
                      style={{ height: `${100 + (i % 3) * 40}px`, animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>
              )}

              {libImages.length > 0 && (
                <div className="lib-masonry">
                  {libImages.map((img, i) => {
                    const [c1, c2] = CATEGORY_COLORS[img.category] || ["#8338ec", "#ff006e"];
                    const alreadyAdded = boardTiles.some(t => t.id === img.id);
                    return (
                      <div key={img.id}
                        className={`lib-tile${alreadyAdded ? " already-added" : ""}`}
                        style={{ "--c1": c1, "--c2": c2, animationDelay: `${(i % 10) * 0.04}s` }}
                        draggable={!alreadyAdded}
                        onDragStart={e => !alreadyAdded && onLibDragStart(e, img)}
                        onDragEnd={() => setDraggingLib(null)}
                        title={alreadyAdded ? "Already on board" : "Drag to board"}
                      >
                        <img src={img.url} alt={img.label} className="lib-img" draggable={false} />
                        <div className="lib-overlay">
                          <span className="lib-chip">{img.category}</span>
                          <span className="lib-author">📷 {img.author}</span>
                          {alreadyAdded
                            ? <span className="lib-added-badge">✓ Added</span>
                            : <span className="lib-drag-hint">⠿ drag to board</span>
                          }
                        </div>
                        {!alreadyAdded && (
                          <button className="lib-quick-add"
                            onClick={() => addTileToBoard(img)}
                            title="Quick add to board"
                          >+</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && libImages.length === 0 && (
                <div className="lib-empty"><p>No results — try a different search</p></div>
              )}

              {hasMore && !loading && (
                <button className="load-more-btn" onClick={loadMore}>Load more photos</button>
              )}

              {loading && libImages.length > 0 && (
                <div className="loading-more"><div className="spinner" /></div>
              )}
            </div>
          </div>

          {/* ══ RIGHT: Board ══ */}
          <div className="board-panel">
            <div className="board-top">
              <div className="board-top-left">
                <h2 className="panel-title">My Vision Board</h2>
                <span className="board-count">{boardTiles.length} tiles ·</span>
              </div>
              <div className="board-filters">
                {boardCategories.map(cat => {
                  const cnt = cat === "All" ? boardTiles.length : boardTiles.filter(t => t.category === cat).length;
                  return (
                    <button key={cat}
                      className={`board-pill${boardFilter === cat ? " active" : ""}`}
                      onClick={() => setBoardFilter(cat)}
                    >{cat} ({cnt})</button>
                  );
                })}
              </div>
            </div>

            {/* Drop zone */}
            <div
              className={`board-zone${boardDragActive ? " drag-active" : ""}${boardTiles.length === 0 && !boardLoading ? " is-empty" : ""}`}
              onDragOver={e => { e.preventDefault(); setBoardDragActive(true); }}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setBoardDragActive(false); }}
              onDrop={onBoardDrop}
            >
              {boardLoading && (
                <div className="board-empty">
                  <div className="spinner" style={{ width: 36, height: 36, borderWidth: 4 }} />
                  <p className="board-empty-sub" style={{ marginTop: 16 }}>Loading your board...</p>
                </div>
              )}

              {!boardLoading && boardTiles.length === 0 && (
                <div className="board-empty">
                  <span className="board-empty-icon">⬇</span>
                  <p className="board-empty-title">Drop images here</p>
                  <p className="board-empty-sub">Drag from the library, or click + on any photo. Your board saves automatically.</p>
                </div>
              )}

              {!boardLoading && boardTiles.length > 0 && (
                <div className="board-masonry">
                  {visibleBoard.map(tile => {
                    const [c1, c2] = CATEGORY_COLORS[tile.category] || ["#8338ec", "#ff006e"];
                    return (
                      <div key={tile.id}
                        className={`board-tile${draggingBoard === tile.id ? " is-dragging" : ""}${dragOverBoard === tile.id ? " is-over" : ""}`}
                        style={{ "--c1": c1, "--c2": c2 }}
                        draggable
                        onDragStart={e => onBoardTileDragStart(e, tile.id)}
                        onDragEnter={() => setDragOverBoard(tile.id)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => onBoardTileDrop(e, tile.id)}
                        onDragEnd={() => { setDraggingBoard(null); setDragOverBoard(null); }}
                      >
                        <img src={tile.url} alt={tile.label} className="board-img" draggable={false} />
                        <div className="board-overlay">
                          <span className="board-chip">{tile.category}</span>
                          <span className="board-tile-name">{tile.label}</span>
                          <button className="board-remove"
                            onClick={e => { e.stopPropagation(); removeTile(tile.id); }}
                          >✕</button>
                        </div>
                        <span className="board-handle">⠿</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}