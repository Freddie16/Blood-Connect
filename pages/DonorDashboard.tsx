import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Search, Filter } from 'lucide-react';
import { User, BloodAlert, UrgencyLevel, BloodGroup } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface DonorDashboardProps {
  user: User;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ user }) => {
  const { updateUser } = useAuth();
  const [alerts, setAlerts] = useState<BloodAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<BloodAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState<BloodGroup | ''>('');

  useEffect(() => {
    loadAlerts();
    updateUserLocation();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchQuery, bloodFilter]);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      // Filter out demo alerts and show only real ones
      const realAlerts = data.filter(alert => 
        alert.hospitalName && 
        !alert.hospitalName.includes('Demo') &&
        alert.requiredUnits > 0
      );
      setAlerts(realAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await api.updateUserLocation(user.id, position.coords.latitude, position.coords.longitude);
            updateUser({
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            });
          } catch (error) {
            console.error('Failed to update location:', error);
          }
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (bloodFilter) {
      filtered = filtered.filter(alert =>
        alert.bloodGroup.includes(bloodFilter)
      );
    }

    setFilteredAlerts(filtered);
  };

  const handleRSVP = async (alertId: string) => {
  try {
    console.log('RSVP to alert:', alertId, 'by user:', user.id);
    
    // Optimistic update
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId 
        ? { 
            ...alert, 
            isRsvped: true, 
            collectedUnits: (alert.collectedUnits || 0) + 1 
          } 
        : alert
    ));
    
    await api.rsvpToAlert(alertId, user.id);
    
    alert('Thank you for responding! The hospital will contact you soon.');
  } catch (error: any) {
    console.error('Failed to RSVP:', error);
    
    // Revert optimistic update on error
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId 
        ? { 
            ...alert, 
            isRsvped: false, 
            collectedUnits: Math.max(0, (alert.collectedUnits || 0) - 1)
          } 
        : alert
    ));
    
    alert(error.message || 'Failed to respond to alert. Please try again.');
  }
};
  const handleDonateNow = () => {
    const criticalAlerts = alerts.filter(alert => alert.urgency === UrgencyLevel.CRITICAL);
    if (criticalAlerts.length > 0) {
      alert(`Urgent need at ${criticalAlerts[0].hospitalName}. Please check the alerts section.`);
    } else {
      alert('No urgent alerts currently. Check the alerts section for donation opportunities.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-900 to-red-700 rounded-2xl p-8 text-white flex justify-between items-center shadow-lg">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Welcome back, {user.name}!</h2>
          <p className="text-red-100 max-w-xl">
            Your blood group is <span className="font-bold bg-white/20 px-2 py-0.5 rounded">{user.bloodGroup}</span>.
            {user.location && ` Located in ${user.county}`}
          </p>
          <div className="pt-4">
            <button
              onClick={handleDonateNow}
              className="bg-white text-red-900 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-sm"
            >
              Donate Now
            </button>
          </div>
        </div>
        <div className="hidden md:block bg-white/10 p-4 rounded-full">
          <Heart className="w-16 h-16 text-white" />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search nearby drives, hospitals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value as BloodGroup | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              <option value="">All Blood Types</option>
              {Object.values(BloodGroup).map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Urgent Appeals</h3>
            <span className="text-sm text-gray-500">
              {filteredAlerts.length} alert(s) found
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-900 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No alerts found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAlerts.map(alert => (
                <div key={alert.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-50 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{alert.hospitalName}</h4>
                        <p className="text-xs text-gray-500">{alert.distanceKm}km away</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      alert.urgency === UrgencyLevel.CRITICAL
                        ? 'bg-red-100 text-red-700'
                        : alert.urgency === UrgencyLevel.MEDIUM
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {alert.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {alert.bloodGroup.map(bg => (
                        <span key={bg} className="w-8 h-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-xs font-bold text-red-800">
                          {bg}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleRSVP(alert.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        alert.isRsvped
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : 'bg-red-900 text-white hover:bg-red-800'
                      }`}
                      disabled={alert.isRsvped}
                    >
                      {alert.isRsvped ? 'Confirmed ✓' : 'I Can Help'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Impact Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">My Impact</h3>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#b91c1c" strokeWidth="3" strokeDasharray={`${(user.totalDonations / 10) * 100}, 100`}/>
                </svg>
                <div className="absolute text-center">
                  <span className="block text-2xl font-bold text-gray-900">{user.totalDonations}</span>
                  <span className="text-xs text-gray-500">Donations</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                You have saved approximately <span className="font-bold text-gray-900">{user.totalDonations * 3} lives</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Active Alerts</span>
                <span className="font-bold text-gray-900">{alerts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Critical Needs</span>
                <span className="font-bold text-red-600">
                  {alerts.filter(a => a.urgency === UrgencyLevel.CRITICAL).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Your Blood Type</span>
                <span className="font-bold text-gray-900">{user.bloodGroup}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};