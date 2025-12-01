import React, { useEffect, useState } from 'react';
import { AlertTriangle, Plus, RefreshCw, Edit, Trash2, MapPin, Users } from 'lucide-react';
import { BloodAlert, BloodGroup, UrgencyLevel } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { EmergencyAlertForm } from '../components/EmergencyAlertForm';

export const EmergencyAlertsStaff: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<BloodAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<BloodAlert | null>(null);

  const fetchAlerts = async () => {
    try {
      setRefreshing(true);
      const data = await api.getAlerts();
      // Filter alerts created by this staff member or all if admin
      const staffAlerts = data.filter(alert => 
        alert.createdBy === user.id || alert.organization === user.organization
      );
      setAlerts(staffAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = () => {
    setEditingAlert(null);
    setShowAlertForm(true);
  };

  const handleEditAlert = (alert: BloodAlert) => {
    setEditingAlert(alert);
    setShowAlertForm(true);
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        // Note: You'll need to add a delete endpoint in your backend
        // await api.deleteAlert(alertId);
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        alert('Alert deleted successfully');
      } catch (error) {
        console.error('Failed to delete alert:', error);
        alert('Failed to delete alert. Please try again.');
      }
    }
  };

  const handleAlertCreated = () => {
    fetchAlerts();
    setShowAlertForm(false);
    setEditingAlert(null);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Emergency Alerts Management</h2>
          <p className="text-gray-500 text-sm">Create and manage emergency blood alerts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateAlert}
            className="bg-red-900 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm hover:bg-red-800 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Alert
          </button>
          <button
            onClick={fetchAlerts}
            disabled={refreshing}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Created</h3>
            <p className="text-gray-500 mb-6">Create your first emergency alert to get started.</p>
            <button
              onClick={handleCreateAlert}
              className="bg-red-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 transition-colors"
            >
              Create First Alert
            </button>
          </div>
        ) : (
          alerts.map(alert => (
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
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditAlert(alert)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Alert"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(alert.urgency)}`}>
                  {alert.urgency}
                </span>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">{alert.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-1">
                    {alert.bloodGroup && alert.bloodGroup.map((bg, index) => (
                      <span key={index} className="w-8 h-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-xs font-bold text-red-800">
                        {bg}
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {alert.collectedUnits} responded
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                    <span>Required: {alert.requiredUnits} units</span>
                    <span>Collected: {alert.collectedUnits} units</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (alert.collectedUnits / alert.requiredUnits) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Contact: {alert.contactInfo}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Created: {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Emergency Alert Form */}
      <EmergencyAlertForm
        isOpen={showAlertForm}
        onClose={() => {
          setShowAlertForm(false);
          setEditingAlert(null);
        }}
        onAlertCreated={handleAlertCreated}
        editAlert={editingAlert}
      />
    </div>
  );
};