import { useParams, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getPostBySlug } from '@content/posts';
import Layout from '../components/layout/Layout';

function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <Layout>
      <div className="blog-post-container">
        <article className="blog-post">
          {post.coverImage && (
            <div className="blog-post-image">
              <img src={post.coverImage} alt={post.title} />
            </div>
          )}

          <div className="blog-post-header">
            {post.category && (
              <span className="category-badge">{post.category}</span>
            )}
            <h1 className="blog-post-title">{post.title}</h1>

            <div className="blog-post-meta">
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
              <div className="post-info">
                <span className="post-date">{post.date}</span>
                <span className="meta-separator">•</span>
                <span className="reading-time">{post.readingTime}</span>
              </div>
            </div>
          </div>

          <div className="blog-post-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="blog-post-tags">
              {post.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </article>
      </div>
    </Layout>
  );
}

export default BlogPost;
