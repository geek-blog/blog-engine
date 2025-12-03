import { useState } from 'react';
import { posts } from '@content/posts';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query) ||
      post.category?.toLowerCase().includes(query) ||
      post.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  if (posts.length === 0) {
    return (
      <div className="app">
        <header className="site-header">
          <div className="container">
            <div className="header-content">
              <h1 className="site-name">My Blog</h1>
              <nav className="main-nav">
                <a href="#blog">Blog</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
              </nav>
            </div>
          </div>
        </header>

        <main className="main-content">
          <div className="no-posts-container">
            <p className="no-posts">No posts yet. Run <code>npx blog-engine process</code> to generate posts.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="container">
          <div className="header-content">
            <h1 className="site-name">Volodymyr Shcherbyna</h1>
            <nav className="main-nav">
              <a href="#blog">Blog</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="search-section">
          <h2 className="page-title">Blog</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="container">
          {filteredPosts.length === 0 ? (
            <div className="no-results">
              <p>No articles found matching your search.</p>
            </div>
          ) : (
            <div className="post-grid">
              {filteredPosts.map(post => (
                <article key={post.slug} className="post-card">
                  {post.featuredImage && (
                    <div className="post-image">
                      <img src={post.featuredImage} alt={post.title} />
                    </div>
                  )}
                  <div className="post-content">
                    {post.category && (
                      <span className="category-badge">{post.category}</span>
                    )}
                    <h3 className="post-title">{post.title}</h3>
                    <div className="post-meta">
                      <span className="post-date">{post.date}</span>
                      <span className="meta-separator">•</span>
                      <span className="reading-time">{post.readingTime}</span>
                    </div>
                    {post.excerpt && (
                      <p className="post-excerpt">{post.excerpt}</p>
                    )}
                    <div className="post-author">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.author} className="author-avatar" />
                      ) : (
                        <div className="author-avatar-placeholder">
                          {post.author?.charAt(0) || 'A'}
                        </div>
                      )}
                      <span className="author-name">{post.author}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
