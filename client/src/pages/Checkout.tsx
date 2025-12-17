import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvent, getSeats, createOrder, createOrderWithCoupon, validateCoupon } from '../api';
import { Event, Seat, User } from '../types';

interface CheckoutProps {
  user: User;
}

export default function Checkout({ user }: CheckoutProps) {
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponValidated, setCouponValidated] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const seatIds = JSON.parse(localStorage.getItem('checkoutSeats') || '[]');
    const eventId = localStorage.getItem('checkoutEventId');

    if (!seatIds.length || !eventId) {
      navigate('/');
      return;
    }

    try {
      const [eventData, allSeats] = await Promise.all([
        getEvent(eventId),
        getSeats(eventId)
      ]);
      setEvent(eventData);
      setSeats(allSeats.filter(s => seatIds.includes(s.id)));
    } catch {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
  const finalPrice = couponValidated ? couponValidated.coupon.finalAmount : totalPrice;
  const discount = couponValidated ? couponValidated.coupon.discount : 0;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode, totalPrice);
      setCouponValidated(result);
    } catch (err) {
      console.error(err);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const seatIds = seats.map(s => s.id);
      const result = couponValidated
        ? await createOrderWithCoupon(user.id, seatIds, couponCode)
        : await createOrder(user.id, seatIds);

      if (result.success) {
        setSuccess(true);
        localStorage.removeItem('checkoutSeats');
        localStorage.removeItem('checkoutEventId');
      } else {
        setError(result.message || '支付失败');
      }
    } catch {
      setError('支付失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">支付成功！</h1>
          <p className="text-gray-600 mb-6">您的票务订单已确认</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition"
            >
              查看我的订单
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition"
            >
              继续浏览
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💳 确认订单</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* Event Info */}
      {event && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">{event.name}</h2>
          <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
            <span>📍 {event.venue}</span>
            <span>📅 {event.date}</span>
            <span>🕐 {event.time}</span>
          </div>
        </div>
      )}

      {/* Seats */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">已选座位</h2>
        <div className="space-y-3">
          {seats.map(seat => (
            <div key={seat.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <span className="font-medium">座位 {seat.seatNumber}</span>
                <span className="text-gray-500 text-sm ml-2">
                  ({seat.price >= 280 ? 'VIP区' : seat.price >= 180 ? '标准区' : '经济区'})
                </span>
              </div>
              <span className="font-medium">¥{seat.price}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between text-lg font-bold mb-2">
            <span>小计</span>
            <span>¥{totalPrice}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-lg font-bold text-green-600 mb-2">
              <span>优惠</span>
              <span>-¥{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>总计</span>
            <span className="text-indigo-600">¥{finalPrice}</span>
          </div>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🎟️ 优惠券</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="输入优惠券代码"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            disabled={couponValidated?.success}
          />
          <button
            onClick={handleValidateCoupon}
            disabled={validatingCoupon || !couponCode.trim() || couponValidated?.success}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {validatingCoupon ? '验证中...' : '验证'}
          </button>
        </div>
        {couponValidated && (
          <div className={`mt-3 p-3 rounded-lg ${
            couponValidated.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {couponValidated.success ? (
              <p className="text-green-700">
                ✓ 优惠券已应用，优惠 ¥{couponValidated.coupon.discount}
              </p>
            ) : (
              <p className="text-red-700">✗ {couponValidated.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={processing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
            处理中...
          </>
        ) : (
          `确认支付 ¥${finalPrice}`
        )}
      </button>
    </div>
  );
}

