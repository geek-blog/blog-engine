import BlogCard from './BlogCard';

function BlogGrid({ posts, emptyMessage = "No articles found matching your search." }) {
  if (posts.length === 0) {
    return (
      <div className="no-results">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="post-grid">
      {posts.map(post => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}

export default BlogGrid;
