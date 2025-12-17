import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, getSeats, lockSeat, unlockSeat, addFavorite, removeFavorite, getEventComments, addComment } from '../api';
import { Event, Seat, User, Comment } from '../types';

interface EventDetailProps {
  user: User;
}

export default function EventDetail({ user }: EventDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [commentForm, setCommentForm] = useState({ rating: 5, content: '' });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [eventData, seatsData, commentsData] = await Promise.all([
        getEvent(id!),
        getSeats(id!),
        getEventComments(id!)
      ]);
      setEvent(eventData);
      setSeats(seatsData);
      setComments(commentsData.comments);
      setAvgRating(commentsData.averageRating);

      // Restore selected seats that are locked by current user
      const userLockedSeats = seatsData
        .filter(s => s.status === 'locked' && s.lockedBy === user.id)
        .map(s => s.id);
      setSelectedSeats(userLockedSeats);
    } catch {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        await removeFavorite(id!, user.id);
        setIsFavorited(false);
      } else {
        await addFavorite(user.id, id!);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.content.trim()) return;

    setSubmittingComment(true);
    try {
      const result = await addComment(id!, user.id, commentForm.rating, commentForm.content);
      if (result.success && result.comment) {
        setComments([...comments, result.comment]);
        setCommentForm({ rating: 5, content: '' });
        // Reload comments to get updated average
        const commentsData = await getEventComments(id!);
        setAvgRating(commentsData.averageRating);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSeatClick = async (seat: Seat) => {
    if (seat.status === 'sold') return;
    if (seat.status === 'locked' && seat.lockedBy !== user.id) return;

    try {
      if (selectedSeats.includes(seat.id)) {
        // Unlock seat
        await unlockSeat(seat.id, user.id);
        setSelectedSeats(prev => prev.filter(id => id !== seat.id));
        setSeats(prev => prev.map(s => 
          s.id === seat.id ? { ...s, status: 'available', lockedBy: null, lockedAt: null } : s
        ));
      } else {
        // Lock seat
        const result = await lockSeat(seat.id, user.id);
        if (result.success) {
          setSelectedSeats(prev => [...prev, seat.id]);
          setSeats(prev => prev.map(s => 
            s.id === seat.id ? { ...s, status: 'locked', lockedBy: user.id } : s
          ));
        } else {
          setError(result.message || '选座失败');
        }
      }
    } catch {
      setError('操作失败，请重试');
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'sold') return 'bg-gray-400 cursor-not-allowed';
    if (seat.status === 'locked') {
      if (seat.lockedBy === user.id) return 'bg-green-500 hover:bg-green-600';
      return 'bg-yellow-400 cursor-not-allowed';
    }
    if (seat.price >= 280) return 'bg-purple-500 hover:bg-purple-600';
    if (seat.price >= 180) return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-indigo-500 hover:bg-indigo-600';
  };

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find(s => s.id === seatId);
    return sum + (seat?.price || 0);
  }, 0);

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
    localStorage.setItem('checkoutSeats', JSON.stringify(selectedSeats));
    localStorage.setItem('checkoutEventId', id!);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-12 text-red-500">{error || '活动不存在'}</div>;
  }

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Event Info */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <img src={event.image} alt={event.name} className="w-full md:w-64 h-48 object-cover rounded-lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full">{event.category}</span>
                {avgRating > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-yellow-400">★</span>
                    <span className="font-medium">{avgRating}</span>
                    <span className="text-gray-500 text-sm">({comments.length}条评价)</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleToggleFavorite}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isFavorited
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isFavorited ? '❤️ 已收藏' : '🤍 收藏'}
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-3">{event.name}</h1>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex flex-wrap gap-4 text-gray-500">
              <span>📍 {event.venue}</span>
              <span>📅 {event.date}</span>
              <span>🕐 {event.time}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎭 选择座位</h2>

          {/* Stage */}
          <div className="bg-gray-800 text-white text-center py-3 rounded-lg mb-8">舞台</div>

          {/* Seat Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-fit">
              {rows.map(row => (
                <div key={row} className="flex items-center gap-2 mb-2">
                  <span className="w-6 text-center font-medium text-gray-500">{row}</span>
                  <div className="flex gap-2">
                    {seats.filter(s => s.row === row).sort((a, b) => a.col - b.col).map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === 'sold' || (seat.status === 'locked' && seat.lockedBy !== user.id)}
                        className={`w-8 h-8 rounded text-white text-xs font-medium transition ${getSeatColor(seat)}`}
                        title={`${seat.seatNumber} - ¥${seat.price}`}
                      >
                        {seat.col}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>VIP (¥280)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>标准 (¥180)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-500 rounded"></div>
              <span>经济 (¥120)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>已选</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>已锁定</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>已售</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 订单详情</h2>

          {selectedSeats.length === 0 ? (
            <p className="text-gray-500">请选择座位</p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {selectedSeats.map(seatId => {
                  const seat = seats.find(s => s.id === seatId);
                  return seat ? (
                    <div key={seatId} className="flex justify-between text-gray-600">
                      <span>座位 {seat.seatNumber}</span>
                      <span>¥{seat.price}</span>
                    </div>
                  ) : null;
                })}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>总计</span>
                  <span className="text-indigo-600">¥{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition"
              >
                去结算 ({selectedSeats.length}张)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">💬 用户评价</h2>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="mb-8 pb-8 border-b">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCommentForm(prev => ({ ...prev, rating: star }))}
                  className={`text-2xl transition ${
                    star <= commentForm.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">评价内容</label>
            <textarea
              value={commentForm.content}
              onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="分享您的观看体验..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={submittingComment || !commentForm.content.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50"
          >
            {submittingComment ? '提交中...' : '提交评价'}
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无评价</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-800">{comment.userName}</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

