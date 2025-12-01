import { Appointment, BloodAlert, InventoryItem, BloodGroup, UrgencyLevel, User } from '../types';

const API_URL = 'http://localhost:5001/api';

// Enhanced fetch wrapper with better error handling
const fetchWithErrorHandling = async (url: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        if (!data.success) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<User> => {
    const data = await fetchWithErrorHandling(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data.user;
  },

  signup: async (userData: any): Promise<User> => {
    const data = await fetchWithErrorHandling(`${API_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return data.user;
  },

  // User Management
  getUser: async (id: string): Promise<User> => {
    const data = await fetchWithErrorHandling(`${API_URL}/users/${id}`);
    return data.user;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const data = await fetchWithErrorHandling(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    return data.user;
  },

  // Donor Location
  getNearbyDonors: async (lat: number, lng: number, radius: number, bloodGroup?: BloodGroup): Promise<any[]> => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      ...(bloodGroup && { bloodGroup })
    });

    const data = await fetchWithErrorHandling(`${API_URL}/donors/nearby?${params}`);
    return data.donors;
  },

  // Inventory
  getInventory: async (): Promise<InventoryItem[]> => {
    const data = await fetchWithErrorHandling(`${API_URL}/inventory`);
    return data.inventory;
  },

  updateInventory: async (bloodGroup: string, change: number) => {
    await fetchWithErrorHandling(`${API_URL}/inventory`, {
      method: 'POST',
      body: JSON.stringify({ bloodGroup, change }),
    });
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const data = await fetchWithErrorHandling(`${API_URL}/appointments`);
    return data.appointments;
  },

  createAppointment: async (appointment: Partial<Appointment>) => {
    await fetchWithErrorHandling(`${API_URL}/appointments`, {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  },

  updateAppointmentStatus: async (id: string, status: string) => {
    await fetchWithErrorHandling(`${API_URL}/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Alerts
  getAlerts: async (): Promise<BloodAlert[]> => {
    const data = await fetchWithErrorHandling(`${API_URL}/alerts`);
    return data.alerts;
  },

  // Search alerts
  searchAlerts: async (query: string, bloodGroup?: BloodGroup): Promise<BloodAlert[]> => {
    const params = new URLSearchParams({ query });
    if (bloodGroup) params.append('bloodGroup', bloodGroup);

    const data = await fetchWithErrorHandling(`${API_URL}/alerts/search?${params}`);
    return data.alerts;
  },

  // Update user location
  updateUserLocation: async (userId: string, lat: number, lng: number): Promise<User> => {
    const data = await fetchWithErrorHandling(`${API_URL}/users/${userId}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng }),
    });
    return data.user;
  },

  // Notifications
  getNotifications: async (userId: string): Promise<any[]> => {
    const data = await fetchWithErrorHandling(`${API_URL}/users/${userId}/notifications`);
    return data.notifications;
  },

  // RSVP to alert
  // Update the RSVP method
rsvpToAlert: async (alertId: string, userId: string): Promise<BloodAlert> => {
  const data = await fetchWithErrorHandling(`${API_URL}/alerts/${alertId}/rsvp`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
  return data.alert;
},

// Add update alert method
updateAlert: async (alertId: string, alertData: Partial<BloodAlert>): Promise<BloodAlert> => {
  const data = await fetchWithErrorHandling(`${API_URL}/alerts/${alertId}`, {
    method: 'PATCH',
    body: JSON.stringify(alertData),
  });
  return data.alert;
},


// Add to your existing api object
  createAlert: async (alertData: Partial<BloodAlert>): Promise<BloodAlert> => {
    const data = await fetchWithErrorHandling(`${API_URL}/alerts`, {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
    return data.alert;
},
};