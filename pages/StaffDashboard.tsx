import React, { useEffect, useState } from 'react';
import { Droplet, Activity, Calendar, AlertTriangle, Minus, Plus, Users, RefreshCw, Bell, Check, X, Eye } from 'lucide-react';
import { InventoryItem, Appointment, BloodAlert, BloodGroup } from '../types';
import { api } from '../services/api';
import { EmergencyAlertForm } from '../components/EmergencyAlertForm';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [alerts, setAlerts] = useState<BloodAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [invData, aptData, alertData] = await Promise.all([
        api.getInventory(),
        api.getAppointments(),
        api.getAlerts(),
      ]);
      console.log('Fetched alerts:', alertData);
      setInventory(invData);
      setAppointments(aptData);
      setAlerts(alertData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateInventory = async (bloodGroup: string, change: number) => {
    try {
      // Optimistic update
      setInventory(prev => prev.map(item =>
        item.bloodGroup === bloodGroup
          ? { ...item, units: Math.max(0, item.units + change) }
          : item
      ));
      await api.updateInventory(bloodGroup, change);
    } catch (error) {
      console.error('Failed to update inventory:', error);
      // Revert on error
      fetchData();
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    try {
      console.log('Updating appointment:', id, 'to status:', status);
      
      // Optimistic update
      setAppointments(prev => prev.map(apt =>
        apt.id === id ? { ...apt, status: status as any } : apt
      ));
      
      await api.updateAppointmentStatus(id, status);
      
      // Refresh data to ensure consistency
      setTimeout(fetchData, 500);
      
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('Failed to update appointment status. Please try again.');
      fetchData(); // Revert on error
    }
  };

  const handleAlertCreated = () => {
    fetchData(); // Refresh alerts
    setShowAlertForm(false);
  };

  const navigateToAlerts = () => {
    navigate('/alerts');
  };

  const navigateToAppointments = () => {
    navigate('/appointments');
  };

  // Filter today's appointments
  const todayAppointments = appointments.filter(apt =>
    apt.date === new Date().toISOString().split('T')[0]
  );

  const totalUnits = inventory.reduce((acc, curr) => acc + curr.units, 0);
  const criticalAlerts = alerts.filter(a => a.urgency === 'Critical').length;
  const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Staff Dashboard - {user?.organization || 'Hospital'}
          </h2>
          <p className="text-gray-500 text-sm">Real-time hospital management</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAlertForm(true)}
            className="bg-red-900 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm hover:bg-red-800 transition-colors"
          >
            <Bell className="w-5 h-5 mr-2" />
            Create Alert
          </button>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Droplet className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Blood Units</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalUnits}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Activity className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Critical Alerts</p>
            <h3 className="text-2xl font-bold text-gray-900">{criticalAlerts}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Calendar className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Appointments</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingAppointments}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Today's Donors</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {todayAppointments.filter(a => a.status === 'Confirmed').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Inventory Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Blood Inventory Management</h3>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {inventory.map(item => (
              <div key={item.bloodGroup} className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-lg font-bold text-gray-900 mb-2">{item.bloodGroup}</div>
                <div className="text-2xl font-bold text-red-900 mb-3">{item.units} units</div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleUpdateInventory(item.bloodGroup, -1)}
                    disabled={item.units <= 0}
                    className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-red-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateInventory(item.bloodGroup, 1)}
                    className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Recent Appointments</h3>
          <button
            onClick={navigateToAppointments}
            className="text-red-900 hover:text-red-700 font-medium flex items-center"
          >
            View All
            <Eye className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 5).map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{appointment.donorName}</h4>
                        <p className="text-sm text-gray-600">
                          {appointment.bloodGroup} • {appointment.date} at {appointment.time}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        appointment.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                        appointment.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {appointment.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateAppointmentStatus(appointment.id, 'Confirmed')}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          title="Confirm Appointment"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateAppointmentStatus(appointment.id, 'Cancelled')}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Reject Appointment"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {appointment.status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, 'Completed')}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Mark as Completed"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Recent Emergency Alerts</h3>
          <button
            onClick={navigateToAlerts}
            className="text-red-900 hover:text-red-700 font-medium flex items-center"
          >
            View All
            <Eye className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="p-6">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No emergency alerts created yet</p>
              <button
                onClick={() => setShowAlertForm(true)}
                className="mt-4 bg-red-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-800 transition-colors"
              >
                Create Your First Alert
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{alert.hospitalName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      alert.urgency === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                      alert.urgency === 'Medium' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {alert.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex space-x-2">
                      {alert.bloodGroup && alert.bloodGroup.map((bg, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                          {bg}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500">
                        Required: {alert.requiredUnits} units
                      </span>
                      <span className={`font-medium ${
                        alert.collectedUnits >= alert.requiredUnits ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Collected: {alert.collectedUnits} units
                      </span>
                      <span className="text-gray-500">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Alert Form */}
      <EmergencyAlertForm
        isOpen={showAlertForm}
        onClose={() => setShowAlertForm(false)}
        onAlertCreated={handleAlertCreated}
      />
    </div>
  );
};