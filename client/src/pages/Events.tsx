import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../api';
import { Event } from '../types';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['全部', '演唱会', '话剧', '音乐会', '体育', '脱口秀', '舞蹈'];

  useEffect(() => {
    loadEvents();
  }, [search, category]);

  const loadEvents = async () => {
    try {
      const data = await getEvents(
        search || undefined,
        category && category !== '全部' ? category : undefined
      );
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🎭 活动列表</h1>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索活动名称、地点..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === '全部' ? '' : cat)}
                className={`px-4 py-2 rounded-lg transition ${
                  (cat === '全部' && !category) || cat === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">暂无活动</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full">
                    {event.category}
                  </span>
                  <span className="text-gray-500 text-sm">{event.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{event.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                <div className="flex items-center text-gray-500 text-sm">
                  <span>📍 {event.venue}</span>
                  <span className="mx-2">|</span>
                  <span>🕐 {event.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

