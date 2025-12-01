// components/Layout.tsx - Complete Updated Layout
import React, { useState, useEffect } from 'react';
import {
  Heart, Bell, User as UserIcon, MapPin,
  Calendar, LayoutDashboard, AlertTriangle,
  MessageCircle, Search, ChevronDown, Map,
  Settings as SettingsIcon, LogOut, X
} from 'lucide-react';
import { AppView, User } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  view: AppView;
  setView: (v: AppView) => void;
  isStaff: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView, isStaff }) => {
  const { logout } = useAuth();
  
 const menuItems = isStaff ? [
  {
    id: AppView.STAFF_DASHBOARD,
    label: 'Overview',
    icon: LayoutDashboard
  },
  {
    id: AppView.APPOINTMENTS,
    label: 'Schedule',
    icon: Calendar
  },
  {
    id: AppView.ALERTS,
    label: 'Emergency Alerts',
    icon: AlertTriangle
  }
] : [
    { id: AppView.HOME, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.APPOINTMENTS, label: 'My Appointments', icon: Calendar },
    { id: AppView.ALERTS, label: 'Donor Map', icon: Map },
    { id: AppView.CHAT_AI, label: 'AI Assistant', icon: MessageCircle },
    { id: AppView.PROFILE, label: 'My Profile', icon: UserIcon },
    { id: AppView.SETTINGS, label: 'Settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0">
      <div className="p-6 flex items-center space-x-2 border-b border-gray-100">
        <div className="bg-red-900 p-2 rounded-lg">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Blood<span className="text-red-600">Connect</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            {isStaff ? 'Hospital Portal' : 'Donor Portal'}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              view === item.id
                ? 'bg-red-50 text-red-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`w-5 h-5 ${view === item.id ? 'text-red-700' : 'text-gray-400'}`} />
            <span>{item.label}</span>
          </button>
        ))}
        
        {/* Logout Button */}
        {!isStaff && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-4"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            <span>Logout</span>
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-slate-900 rounded-xl p-4 text-white">
          <p className="text-xs text-slate-400 mb-1">System Status</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">Online</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isStaff ? 'Managing hospital operations' : 'Ready to save lives'}
          </p>
        </div>
      </div>
    </div>
  );
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface TopBarProps {
  user: User;
  isStaff: boolean;
  toggleMode: () => void;
  onSearch: (query: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, isStaff, toggleMode, onSearch }) => {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications!', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  // Fix the notification click handler
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read and handle notification action
    if (!notification.read) {
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Handle different notification types
    switch (notification.type) {
      case 'alert':
        console.log('Navigate to alert:', notification);
        break;
      case 'appointment':
        console.log('Navigate to appointment:', notification);
        break;
      default:
        console.log('Notification clicked:', notification);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleProfileAction = (action: string) => {
    setShowProfileMenu(false);
    switch (action) {
      case 'profile':
        // Navigate to profile - you'll need to pass this up to parent
        console.log('Navigate to profile');
        break;
      case 'settings':
        // Navigate to settings
        console.log('Navigate to settings');
        break;
      case 'logout':
        logout();
        break;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Search Bar */}
      <div className="flex items-center w-96 bg-gray-100 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder={isStaff ? "Search donors, appointments..." : "Search drives, hospitals, alerts..."}
          value={searchQuery}
          onChange={handleSearch}
          className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
        />
      </div>

      <div className="flex items-center space-x-4">
        {/* Switch Mode Button */}
        

        {/* Notifications */}
        <div className="relative">
          <button 
            className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-medium text-sm ${
                          !notification.read ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                      {!notification.read && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <button className="w-full text-center text-xs text-gray-600 hover:text-gray-800 font-medium">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-none">{user.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {user.county} • {user.bloodGroup}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
              showProfileMenu ? 'rotate-180' : ''
            }`} />
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute top-12 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
              <div className="p-2">
                <button
                  onClick={() => handleProfileAction('profile')}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>My Profile</span>
                </button>
                
                <button
                  onClick={() => handleProfileAction('settings')}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => handleProfileAction('logout')}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for dropdowns */}
      {(showNotifications || showProfileMenu) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </header>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  view: AppView;
  setView: (v: AppView) => void;
  isStaff: boolean;
  user: User;
  toggleMode: () => void;
  onSearch?: (query: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  view, 
  setView, 
  isStaff, 
  user, 
  toggleMode,
  onSearch = () => {} 
}) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar view={view} setView={setView} isStaff={isStaff} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar 
          user={user} 
          isStaff={isStaff} 
          toggleMode={toggleMode} 
          onSearch={onSearch}
        />
        <main className="flex-1 overflow-y-auto p-0 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};