export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">Epic Games Store</div>
        <nav className="navigation">
          <a href="/store">Магазин</a>
          <a href="/news">Новини</a>
          <a href="/library">Бібліотека</a>
        </nav>
        <div className="user-actions">
          <button className="search-btn">Пошук</button>
          <button className="cart-btn">Кошик</button>
          <button className="login-btn">Увійти</button>
        </div>
      </div>
    </header>
  );
}
