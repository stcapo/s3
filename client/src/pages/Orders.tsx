import { useState, useEffect } from 'react';
import { getUserOrders, cancelOrder } from '../api';
import { Order, User } from '../types';

interface OrdersProps {
  user: User;
}

export default function Orders({ user }: OrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getUserOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('确定要取消此订单吗？')) return;

    setCancelling(orderId);
    try {
      const result = await cancelOrder(orderId, user.id);
      if (result.success) {
        // Update order status
        setOrders(orders.map(o =>
          o.id === orderId
            ? { ...o, status: 'cancelled', refundAmount: result.refundAmount }
            : o
        ));
      } else {
        alert(result.message || '取消失败');
      }
    } catch (error) {
      console.error(error);
      alert('取消失败，请重试');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📋 我的订单</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🎫</div>
          <p className="text-gray-500">暂无订单</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className={`bg-white rounded-xl shadow-md p-6 ${order.status === 'cancelled' ? 'opacity-60' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {order.event?.name || '未知活动'}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'cancelled'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {order.status === 'cancelled' ? '已取消' : '已完成'}
                    </span>
                  </div>

                  {order.event && (
                    <div className="flex flex-wrap gap-3 text-gray-500 text-sm mb-3">
                      <span>📍 {order.event.venue}</span>
                      <span>📅 {order.event.date}</span>
                      <span>🕐 {order.event.time}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {order.seats?.map(seat => (
                      <span
                        key={seat?.id}
                        className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full"
                      >
                        座位 {seat?.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    ¥{order.totalPrice}
                  </div>
                  {order.discount && order.discount > 0 && (
                    <div className="text-sm text-green-600">
                      优惠: -¥{order.discount}
                    </div>
                  )}
                  <div className="text-gray-500 text-sm">
                    {new Date(order.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  订单号：{order.id}
                </div>
                {order.status === 'completed' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancelling === order.id}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-medium rounded-lg transition disabled:opacity-50"
                  >
                    {cancelling === order.id ? '取消中...' : '取消订单'}
                  </button>
                )}
                {order.status === 'cancelled' && order.refundAmount && (
                  <div className="text-sm text-green-600 font-medium">
                    已退款: ¥{order.refundAmount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

