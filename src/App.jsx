import React from 'react';
import { posts } from '@content/posts';
import './App.css';

function App() {
  if (posts.length === 0) {
    return (
      <div className="container">
        <header>
          <h1>My Blog</h1>
        </header>
        <main>
          <p className="no-posts">No posts yet. Run <code>npx blog-engine process</code> to generate posts.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>My Blog</h1>
        <p className="tagline">Welcome to my blog</p>
      </header>

      <main>
        <div className="posts-list">
          {posts.map(post => (
            <article key={post.slug} className="post-card">
              <h2>{post.title}</h2>
              <div className="post-meta">
                <span className="date">{post.date}</span>
                <span className="separator">•</span>
                <span className="author">{post.author}</span>
                <span className="separator">•</span>
                <span className="reading-time">{post.readingTime}</span>
              </div>
              {post.excerpt && <p className="excerpt">{post.excerpt}</p>}
              <div className="post-footer">
                <span className="category">{post.category}</span>
                {post.tags.length > 0 && (
                  <div className="tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="content-preview">
                <p>{post.content.substring(0, 200)}...</p>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer>
        <p>Powered by Blog Engine</p>
      </footer>
    </div>
  );
}

export default App;
