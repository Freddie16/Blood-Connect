import React, { useEffect, useState } from 'react';
import { MapPin, AlertTriangle, Filter, Search, Heart } from 'lucide-react';
import { BloodAlert, BloodGroup, UrgencyLevel } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface EmergencyAlertsProps {
  user: any;
}

export const EmergencyAlerts: React.FC<EmergencyAlertsProps> = ({ user }) => {
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
      setAlerts(data);
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
      await api.rsvpToAlert(alertId, user.id);
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, isRsvped: true } : alert
      ));
      alert('Thank you for responding! The hospital will contact you soon.');
    } catch (error) {
      console.error('Failed to RSVP:', error);
      alert('Failed to respond to alert. Please try again.');
    }
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case UrgencyLevel.CRITICAL:
        return 'bg-red-100 text-red-700 border-red-200';
      case UrgencyLevel.MEDIUM:
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case UrgencyLevel.LOW:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Emergency Blood Alerts</h2>
        <p className="text-gray-600 mt-2">Respond to urgent blood needs in your area</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search hospitals, locations..."
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

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Found</h3>
            <p className="text-gray-500">There are no emergency alerts matching your criteria.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert.id} className="bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-6 border-b-2 ${getUrgencyColor(alert.urgency)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-50 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{alert.hospitalName}</h4>
                      <p className="text-xs text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {alert.location} • {alert.distanceKm}km away
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(alert.urgency)}`}>
                    {alert.urgency}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{alert.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {alert.bloodGroup.map(bg => (
                      <span key={bg} className="w-8 h-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-xs font-bold text-red-800">
                        {bg}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleRSVP(alert.id)}
                    disabled={alert.isRsvped}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      alert.isRsvped
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-red-900 text-white hover:bg-red-800'
                    }`}
                  >
                    {alert.isRsvped ? 'Responded ✓' : 'I Can Help'}
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>Required: {alert.requiredUnits} units</span>
                  <span>Collected: {alert.collectedUnits} units</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Contact: {alert.contactInfo}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};