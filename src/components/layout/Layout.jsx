import Header from '../common/Header';

function Layout({ children }) {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
