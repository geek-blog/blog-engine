import { Link } from 'react-router-dom';

function BlogCard({ post }) {
  return (
    <Link to={`/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article className="post-card">
        {post.coverImage && (
          <div className="post-image">
            <img src={post.coverImage} alt={post.title} />
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
    </Link>
  );
}

export default BlogCard;
