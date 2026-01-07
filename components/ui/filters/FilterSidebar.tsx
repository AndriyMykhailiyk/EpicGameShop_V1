export default function FilterSidebar() {
  return (
    <aside className="filter-sidebar">
      <h3>Фільтри</h3>
      <div className="filter-section">
        <h4>Ціна</h4>
        <input type="range" min="0" max="100" />
      </div>
      <div className="filter-section">
        <h4>Платформи</h4>
        <label>
          <input type="checkbox" /> Windows
        </label>
        <label>
          <input type="checkbox" /> Mac
        </label>
        <label>
          <input type="checkbox" /> Linux
        </label>
      </div>
    </aside>
  );
}
