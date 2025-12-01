
import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Settings } from 'lucide-react';
import { Appointment, User, BloodGroup } from '../types';
import { api } from '../services/api';

interface AppointmentsProps {
  user: User;
  isStaff: boolean;
}

export const Appointments: React.FC<AppointmentsProps> = ({ user, isStaff }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newApt, setNewApt] = useState({ date: '', time: '', hospitalName: 'Kenyatta National Hospital' });

  useEffect(() => {
    const loadAppointments = async () => {
      const data = await api.getAppointments();
      setAppointments(data);
    };
    loadAppointments();
  }, []);

  const handleBook = async () => {
    const payload: Partial<Appointment> = {
      ...newApt,
      donorId: user.id,
      donorName: user.name,
      status: 'Pending',
      bloodGroup: user.bloodGroup
    };
    // Optimistic
    setAppointments([...appointments, { ...payload, id: 'temp-' + Date.now() } as Appointment]);
    await api.createAppointment(payload);
    setShowModal(false);
    // Reload to get real ID
    const data = await api.getAppointments();
    setAppointments(data);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
  try {
    // Optimistic update
    setAppointments(prev => prev.map(a =>
      a.id === id ? { ...a, status: status as any } : a
    ));
    
    await api.updateAppointmentStatus(id, status);

    // Show success message
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      alert(`Appointment for ${appointment.donorName} has been ${status.toLowerCase()}`);
    }
  } catch (error) {
    console.error('Failed to update appointment:', error);
    // Revert on error
    const data = await api.getAppointments();
    setAppointments(data);
    alert('Failed to update appointment status. Please try again.');
  }
};

  // Filter appointments based on role
  // In a real backend, the API would filter this, but for this demo we filter client-side
  const displayAppointments = isStaff 
    ? appointments 
    : appointments.filter(a => a.donorId === user.id);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{isStaff ? 'Schedule Management' : 'My Appointments'}</h2>
          <p className="text-gray-500 text-sm">Manage upcoming donations and view history.</p>
        </div>
        {!isStaff && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-red-900 text-white px-5 py-2.5 rounded-lg font-medium flex items-center shadow-sm hover:bg-red-800 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" /> Book Appointment
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Date & Time</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">{isStaff ? 'Donor Name' : 'Hospital'}</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Blood Group</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayAppointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : (
              displayAppointments.map(apt => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{apt.date}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-gray-600">{apt.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {isStaff ? apt.donorName : apt.hospitalName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-bold">{apt.bloodGroup}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isStaff && apt.status === 'Pending' && (
                       <button 
                         onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                         className="text-blue-600 hover:underline text-sm font-medium mr-3"
                       >
                         Confirm
                       </button>
                    )}
                    {isStaff && apt.status === 'Confirmed' && (
                       <button 
                         onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                         className="text-green-600 hover:underline text-sm font-medium mr-3"
                       >
                         Mark Done
                       </button>
                    )}
                    <button className="text-gray-400 hover:text-red-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Book Donation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Center</label>
                <select 
                  className="w-full border p-2 rounded-lg"
                  value={newApt.hospitalName}
                  onChange={(e) => setNewApt({...newApt, hospitalName: e.target.value})}
                >
                  <option>Kenyatta National Hospital</option>
                  <option>Nairobi Hospital</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                   <input 
                    type="date" 
                    className="w-full border p-2 rounded-lg"
                    value={newApt.date}
                    onChange={(e) => setNewApt({...newApt, date: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                   <input 
                    type="time" 
                    className="w-full border p-2 rounded-lg"
                    value={newApt.time}
                    onChange={(e) => setNewApt({...newApt, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBook}
                  className="px-4 py-2 bg-red-900 text-white rounded-lg font-medium"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
