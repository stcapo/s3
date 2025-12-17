import { useState, useEffect } from 'react';
import { getAdminStats, resetSystem, getAdminOrders } from '../api';
import { AdminStats, Order } from '../types';

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'orders'>('stats');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        getAdminStats(),
        getAdminOrders()
      ]);
      setStats(statsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('确定要重置系统吗？所有数据将被清空！')) return;
    
    setResetting(true);
    try {
      await resetSystem();
      await loadData();
      alert('系统已重置');
    } catch {
      alert('重置失败');
    } finally {
      setResetting(false);
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🛠️ 管理后台</h1>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {resetting ? '重置中...' : '🔄 重置系统'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-2 rounded-lg transition ${
            activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
          }`}
        >
          统计数据
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-lg transition ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
          }`}
        >
          订单管理
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl font-bold text-indigo-600">¥{stats.totalRevenue}</div>
              <div className="text-gray-500">总收入</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl font-bold text-green-600">{stats.soldSeats}</div>
              <div className="text-gray-500">已售票</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl font-bold text-yellow-600">{stats.lockedSeats}</div>
              <div className="text-gray-500">锁定中</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600">{stats.totalOrders}</div>
              <div className="text-gray-500">总订单</div>
            </div>
          </div>

          {/* Event Stats Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">活动销售统计</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">活动名称</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">总座位</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">已售</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">销售率</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">收入</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.eventStats.map(event => (
                    <tr key={event.eventId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{event.eventName}</td>
                      <td className="px-6 py-4 text-center">{event.totalSeats}</td>
                      <td className="px-6 py-4 text-center">{event.soldSeats}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${(event.soldSeats / event.totalSeats) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{Math.round((event.soldSeats / event.totalSeats) * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-indigo-600">¥{event.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">所有订单</h2>
          </div>
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">暂无订单</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">订单号</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">用户</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">活动</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">座位</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">金额</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order: Order & { user?: { name: string } }) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm">{order.id}</td>
                      <td className="px-6 py-4">{order.user?.name || '未知'}</td>
                      <td className="px-6 py-4">{order.event?.name || '未知'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {order.seats?.map(seat => (
                            <span key={seat?.id} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {seat?.seatNumber}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-indigo-600">¥{order.totalPrice}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

