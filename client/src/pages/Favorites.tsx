import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserFavorites, removeFavorite } from '../api';
import { User, Favorite } from '../types';

interface FavoritesProps {
  user: User;
}

export default function Favorites({ user }: FavoritesProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getUserFavorites(user.id);
      setFavorites(data);
    } catch (err) {
      setError('加载收藏失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (eventId: string) => {
    try {
      const result = await removeFavorite(eventId, user.id);
      if (result.success) {
        setFavorites(favorites.filter(f => f.eventId !== eventId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">❤️ 我的收藏</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">还没有收藏任何活动</p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            浏览活动
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              {favorite.event && (
                <>
                  <img
                    src={favorite.event.image}
                    alt={favorite.event.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">
                      {favorite.event.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {favorite.event.venue}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      📅 {favorite.event.date} {favorite.event.time}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        to={`/events/${favorite.event.id}`}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-center transition"
                      >
                        查看详情
                      </Link>
                      <button
                        onClick={() => handleRemove(favorite.eventId)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2 rounded-lg transition"
                      >
                        取消收藏
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

