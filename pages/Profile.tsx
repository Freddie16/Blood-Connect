import React, { useState } from 'react';
import { User, Edit, Save, X, MapPin, Phone, Mail, Droplet, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BloodGroup } from '../types';
import { api } from '../services/api';

export const Profile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        county: user?.county || '',
        bloodGroup: user?.bloodGroup || BloodGroup.UNKNOWN
    });

    if (!user) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedUser = await api.updateUser(user.id, formData);
            updateUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.name,
            phone: user.phone,
            county: user.county,
            bloodGroup: user.bloodGroup
        });
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                    <p className="text-gray-500 text-sm">Manage your personal information and donation preferences</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-red-900 text-white px-5 py-2.5 rounded-lg font-medium flex items-center shadow-sm hover:bg-red-800 transition-colors"
                    >
                        <Edit className="w-5 h-5 mr-2" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex space-x-3">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg font-medium flex items-center hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-5 h-5 mr-2" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-red-900 text-white px-5 py-2.5 rounded-lg font-medium flex items-center shadow-sm hover:bg-red-800 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <User className="w-5 h-5 mr-2 text-red-600" />
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{user.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Mail className="w-4 h-4 mr-1 text-gray-400" />
                                    Email Address
                                </label>
                                <p className="text-gray-600">{user.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Phone className="w-4 h-4 mr-1 text-gray-400" />
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-gray-600">{user.phone || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                    County
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="county"
                                        value={formData.county}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-gray-600">{user.county || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Droplet className="w-4 h-4 mr-1 text-gray-400" />
                                    Blood Group
                                </label>
                                {isEditing ? (
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    >
                                        {Object.values(BloodGroup).map(group => (
                                            <option key={group} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                                        {user.bloodGroup}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Shield className="w-4 h-4 mr-1 text-gray-400" />
                                    Verification Status
                                </label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    user.isVerified 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {user.isVerified ? 'Verified Donor' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Donation Impact</h3>
                        <div className="flex items-center justify-center py-4">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#eee"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#b91c1c"
                                        strokeWidth="3"
                                        strokeDasharray={`${(user.totalDonations / 10) * 100}, 100`}
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="block text-2xl font-bold text-gray-900">
                                        {user.totalDonations}
                                    </span>
                                    <span className="text-xs text-gray-500">Donations</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                You have saved approximately{' '}
                                <span className="font-bold text-gray-900">
                                    {user.totalDonations * 3} lives
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Account Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Member since</span>
                                <span className="text-gray-900">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Last donation</span>
                                <span className="text-gray-900">
                                    {user.lastDonationDate 
                                        ? new Date(user.lastDonationDate).toLocaleDateString()
                                        : 'Never'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};