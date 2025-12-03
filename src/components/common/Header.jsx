import { Link, NavLink } from 'react-router-dom';
import config from '@config';
import { pages } from '@content/metadata';

function Header() {
  const siteName = config.siteName || 'My Blog';

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="site-name-link">
            <h1 className="site-name">{siteName}</h1>
          </Link>
          <nav className="main-nav">
            <NavLink to="/" end>Blog</NavLink>
            {pages.map(page => (
              <NavLink key={page.slug} to={`/${page.slug}`}>
                {page.title}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
