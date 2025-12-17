import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Coupons from './pages/Coupons';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {user ? (
          <>
            <Navbar user={user} onLogout={handleLogout} />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail user={user} />} />
                <Route path="/checkout" element={<Checkout user={user} />} />
                <Route path="/orders" element={<Orders user={user} />} />
                <Route path="/profile" element={<Profile user={user} onUserUpdate={handleLogin} />} />
                <Route path="/favorites" element={<Favorites user={user} />} />
                <Route path="/coupons" element={<Coupons />} />
                {user.role === 'admin' && (
                  <Route path="/admin" element={<Admin />} />
                )}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/register" element={<Register onRegister={handleLogin} />} />
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;

