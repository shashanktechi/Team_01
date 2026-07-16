import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../app/authSlice';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { LogOut, ShoppingCart, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, userId } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'CUSTOMER':
        return 'Customer';
      case 'STORE_ADMIN':
        return 'Shopkeeper';
      case 'DELIVERY_PARTNER':
        return 'Delivery Partner';
      case 'SYSTEM_ADMIN':
        return 'Admin';
      default:
        return 'User';
    }
  };

  // Logo routing target: if authenticated -> dashboard
  const logoTarget = role === 'CUSTOMER' ? '/' : role === 'STORE_ADMIN' ? '/shopkeeper/dashboard' : role === 'DELIVERY_PARTNER' ? '/delivery/dashboard' : '/admin/dashboard';

  return (
    <nav className="sticky top-0 z-40 w-full h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 px-4 md:px-8 flex justify-between items-center transition-colors duration-200">
      <div className="flex items-center gap-2">
        <Link to={logoTarget} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <span className="font-bold text-lg text-teal dark:text-teal-light">QuickCart</span>
        </Link>
        {role === 'SYSTEM_ADMIN' ? (
          <select
            value={window.location.pathname.startsWith('/shopkeeper') ? 'STORE_ADMIN' : window.location.pathname.startsWith('/delivery') ? 'DELIVERY_PARTNER' : window.location.pathname.startsWith('/admin') ? 'SYSTEM_ADMIN' : 'CUSTOMER'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'SYSTEM_ADMIN') navigate('/admin/dashboard');
              else if (val === 'STORE_ADMIN') navigate('/shopkeeper/dashboard');
              else if (val === 'DELIVERY_PARTNER') navigate('/delivery/dashboard');
              else navigate('/');
            }}
            className="text-xs font-extrabold rounded-xl bg-teal/10 dark:bg-teal-light/10 text-teal dark:text-teal-light border-none py-1 px-2.5 focus:outline-none cursor-pointer max-w-[150px] outline-none"
          >
            <option value="SYSTEM_ADMIN" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">Admin View</option>
            <option value="CUSTOMER" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">Customer View</option>
            <option value="STORE_ADMIN" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">Shopkeeper View</option>
            <option value="DELIVERY_PARTNER" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">Delivery View</option>
          </select>
        ) : (
          <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal/10 dark:bg-teal-light/10 text-teal dark:text-teal-light">
            {getRoleLabel()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {role === 'CUSTOMER' && (
          <Link to="/customer/checkout" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-teal dark:hover:text-teal-light transition-all duration-200">
            <ShoppingCart size={20} />
            {totalCartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </Link>
        )}

        <LanguageSwitcher />

        <ThemeToggle size={18} />

        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
