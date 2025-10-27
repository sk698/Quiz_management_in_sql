// src/components/Layout.js
import React from 'react';
import { Outlet, Link} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <nav className="navbar">
        <div>
          <Link to="/" className="brand">QuizApp</Link>
        </div>
        <div>
          {isAuthenticated ? (
            <>
              {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
              <span>Hello, {user.username}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main className="container">
        <Outlet /> {/* This is where the routed pages will be rendered */}
      </main>
    </>
  );
};

export default Layout;