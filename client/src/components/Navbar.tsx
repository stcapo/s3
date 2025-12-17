import { Link } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">
            🎫 票务系统
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-indigo-200 transition">
              活动列表
            </Link>
            <Link to="/orders" className="hover:text-indigo-200 transition">
              我的订单
            </Link>
            <Link to="/favorites" className="hover:text-indigo-200 transition">
              ❤️ 收藏
            </Link>
            <Link to="/coupons" className="hover:text-indigo-200 transition">
              🎟️ 优惠券
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="hover:text-indigo-200 transition">
                管理后台
              </Link>
            )}

            <div className="flex items-center space-x-4 border-l border-indigo-400 pl-6">
              <Link to="/profile" className="hover:text-indigo-200 transition">
                👤 {user.name}
              </Link>
              <button
                onClick={onLogout}
                className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-lg transition"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

