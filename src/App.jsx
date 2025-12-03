import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GitHubPagesRedirect } from './utils/githubPagesRedirect';
import { ScrollToTop } from './utils/scrollToTop';
import { pages } from '@content/metadata';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import StaticPage from './pages/StaticPage';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GitHubPagesRedirect />
      <Routes>
        <Route path="/" element={<Blog />} />
        {/* Dynamic routes for all static pages */}
        {pages.map(page => (
          <Route
            key={page.slug}
            path={`/${page.slug}`}
            element={<StaticPage />}
          />
        ))}
        {/* Blog post route - must come after static pages */}
        <Route path="/:slug" element={<BlogPost />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
