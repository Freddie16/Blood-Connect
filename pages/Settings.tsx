import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Moon, Sun, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
    const { user, logout } = useAuth();
    const [settings, setSettings] = useState({
        notifications: true,
        locationSharing: true,
        darkMode: false,
        language: 'en',
        emailUpdates: true
    });

    const handleSettingChange = (key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        // In a real app, save to backend
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                    <p className="text-gray-500 text-sm">Manage your application preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Notification Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Bell className="w-5 h-5 mr-2 text-red-600" />
                            Notifications
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">Push Notifications</p>
                                    <p className="text-sm text-gray-500">Receive alerts for urgent blood needs</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('notifications', !settings.notifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                        settings.notifications ? 'bg-red-900' : 'bg-gray-200'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">Email Updates</p>
                                    <p className="text-sm text-gray-500">Get weekly donation updates</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('emailUpdates', !settings.emailUpdates)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                        settings.emailUpdates ? 'bg-red-900' : 'bg-gray-200'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        settings.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-red-600" />
                            Privacy
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">Location Sharing</p>
                                    <p className="text-sm text-gray-500">Allow hospitals to see your location for nearby alerts</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('locationSharing', !settings.locationSharing)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                        settings.locationSharing ? 'bg-red-900' : 'bg-gray-200'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        settings.locationSharing ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            {settings.darkMode ? (
                                <Moon className="w-5 h-5 mr-2 text-red-600" />
                            ) : (
                                <Sun className="w-5 h-5 mr-2 text-red-600" />
                            )}
                            Appearance
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">Dark Mode</p>
                                    <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                        settings.darkMode ? 'bg-red-900' : 'bg-gray-200'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Language Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-red-600" />
                            Language
                        </h3>
                        <select
                            value={settings.language}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        >
                            <option value="en">English</option>
                            <option value="sw">Swahili</option>
                        </select>
                    </div>
                </div>

                {/* Account Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Account</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email</span>
                                <span className="text-gray-900">{user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Member since</span>
                                <span className="text-gray-900">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className="text-green-600 font-medium">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Danger Zone</h3>
                        <div className="space-y-3">
                            <button className="w-full px-4 py-2 text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                                Delete Account
                            </button>
                            <button 
                                onClick={logout}
                                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};