import React, { useState } from 'react';
import { X, AlertTriangle, Droplet, MapPin, Building } from 'lucide-react';
import { BloodGroup, UrgencyLevel } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface EmergencyAlertFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertCreated: () => void;
}

export const EmergencyAlertForm: React.FC<EmergencyAlertFormProps> = ({
  isOpen,
  onClose,
  onAlertCreated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: user?.organization || '',
    location: '',
    bloodGroup: [] as BloodGroup[],
    urgency: UrgencyLevel.MEDIUM,
    requiredUnits: 1,
    description: '',
    contactInfo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await api.createAlert({
        ...formData,
        organization: user.organization || '',
        createdBy: user.id
      });
      onAlertCreated();
      onClose();
      // Reset form
      setFormData({
        hospitalName: user.organization || '',
        location: '',
        bloodGroup: [],
        urgency: UrgencyLevel.MEDIUM,
        requiredUnits: 1,
        description: '',
        contactInfo: ''
      });
    } catch (error) {
      console.error('Failed to create alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBloodGroup = (group: BloodGroup) => {
    setFormData(prev => ({
      ...prev,
      bloodGroup: prev.bloodGroup.includes(group)
        ? prev.bloodGroup.filter(bg => bg !== group)
        : [...prev.bloodGroup, group]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            Create Emergency Alert
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hospital Name
            </label>
            <div className="relative">
              <Building className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.hospitalName}
                onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="Enter hospital name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="Enter location"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Blood Groups
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(BloodGroup).map(group => (
                <button
                  key={group}
                  type="button"
                  onClick={() => toggleBloodGroup(group)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.bloodGroup.includes(group)
                      ? 'bg-red-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency Level
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as UrgencyLevel }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              <option value={UrgencyLevel.LOW}>Low</option>
              <option value={UrgencyLevel.MEDIUM}>Medium</option>
              <option value={UrgencyLevel.CRITICAL}>Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Units
            </label>
            <input
              type="number"
              min="1"
              value={formData.requiredUnits}
              onChange={(e) => setFormData(prev => ({ ...prev, requiredUnits: parseInt(e.target.value) }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Describe the emergency situation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Information
            </label>
            <input
              type="text"
              value={formData.contactInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Phone number or email for contact"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.bloodGroup.length === 0}
              className="px-4 py-2 bg-red-900 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};