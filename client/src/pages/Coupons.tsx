import { useState, useEffect } from 'react';
import { getCoupons, validateCoupon } from '../api';
import { Coupon } from '../types';

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [testAmount, setTestAmount] = useState('500');
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (couponCode: string) => {
    try {
      const amount = parseFloat(testAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('请输入有效的金额');
        return;
      }
      const result = await validateCoupon(couponCode, amount);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-gray-500">加载中...</p></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🎟️ 优惠券</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coupons List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-600 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedCoupon(coupon.code)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{coupon.code}</h3>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                  </div>
                  <div className="text-right">
                    {coupon.discountType === 'percentage' ? (
                      <div className="text-2xl font-bold text-indigo-600">
                        {coupon.discountValue}%
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-indigo-600">
                        ¥{coupon.discountValue}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">最低消费</p>
                    <p className="font-medium">¥{coupon.minPurchase}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">剩余次数</p>
                    <p className="font-medium">{coupon.maxUses - coupon.usedCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">有效期</p>
                    <p className="font-medium">{coupon.validTo.split('-')[0]}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${((coupon.maxUses - coupon.usedCount) / coupon.maxUses) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
            <h3 className="text-lg font-bold text-gray-800 mb-4">验证优惠券</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  优惠券代码
                </label>
                <input
                  type="text"
                  value={selectedCoupon || ''}
                  onChange={(e) => setSelectedCoupon(e.target.value)}
                  placeholder="输入优惠券代码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  订单金额 (¥)
                </label>
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="输入订单金额"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => selectedCoupon && handleValidate(selectedCoupon)}
                disabled={!selectedCoupon}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
              >
                验证
              </button>

              {validationResult && (
                <div className={`p-4 rounded-lg ${
                  validationResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {validationResult.success ? (
                    <>
                      <p className="text-sm font-medium text-green-800 mb-2">
                        ✓ 优惠券有效
                      </p>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>优惠金额: ¥{validationResult.coupon.discount}</p>
                        <p className="font-bold text-lg">
                          最终价格: ¥{validationResult.coupon.finalAmount}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-red-700">
                      ✗ {validationResult.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

