import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Filter, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BloodGroup, BloodAlert, User, NearbyDonor } from '../types';
import { api } from '../services/api';

interface DonorMapProps {
  user: User;
}

declare global {
  interface Window {
    google: any;
  }
}

export const DonorMap: React.FC<DonorMapProps> = ({ user }) => {
  const { updateUser } = useAuth();
  const [alerts, setAlerts] = useState<BloodAlert[]>([]);
  const [donors, setDonors] = useState<NearbyDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | ''>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapType, setMapType] = useState<'donors' | 'alerts'>('alerts');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && window.google) {
      loadMapData();
      initializeMap();
    }
  }, [userLocation, selectedBloodGroup, mapType]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          updateUserLocation(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          const defaultLocation = { lat: -1.286389, lng: 36.817223 }; // Nairobi coordinates
          setUserLocation(defaultLocation);
        }
      );
    } else {
      const defaultLocation = { lat: -1.286389, lng: 36.817223 };
      setUserLocation(defaultLocation);
    }
  };

  const updateUserLocation = async (location: { lat: number; lng: number }) => {
    try {
      await api.updateUserLocation(user.id, location.lat, location.lng);
      updateUser({
        location: location
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const loadMapData = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      if (mapType === 'donors') {
        const nearbyDonors = await api.getNearbyDonors(
          userLocation.lat,
          userLocation.lng,
          50,
          selectedBloodGroup || undefined
        );
        setDonors(nearbyDonors);
      } else {
        const allAlerts = await api.getAlerts();
        // Filter real alerts (not demo)
        const realAlerts = allAlerts.filter(alert => 
          alert.hospitalName && !alert.hospitalName.includes('Demo')
        );
        setAlerts(realAlerts);
      }
    } catch (error) {
      console.error('Failed to load map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !userLocation || !window.google) return;

    // Clear existing map
    if (mapInstance.current) {
      mapInstance.current = null;
    }

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Initialize map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    // Add user location marker
    const userMarker = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstance.current,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(20, 20),
        anchor: new window.google.maps.Point(10, 10)
      }
    });
    markers.current.push(userMarker);

    // Add markers based on map type
    if (mapType === 'donors') {
      donors.forEach(donor => {
        if (donor.location) {
          const marker = new window.google.maps.Marker({
            position: { lat: donor.location.lat, lng: donor.location.lng },
            map: mapInstance.current,
            title: `${donor.name} - ${donor.bloodGroup}`,
            icon: {
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#10B981" stroke="white" stroke-width="2"/>
                  <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${donor.bloodGroup.replace('+', '%2B').replace('-', '%2D')}</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12)
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-bold">${donor.name}</h3>
                <p>Blood Type: ${donor.bloodGroup}</p>
                <p>Distance: ${donor.distance.toFixed(1)}km</p>
                <p>Donations: ${donor.totalDonations}</p>
                ${donor.isVerified ? '<p class="text-green-600">✓ Verified Donor</p>' : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance.current, marker);
          });

          markers.current.push(marker);
        }
      });
    } else {
      alerts.forEach(alert => {
        // Use alert location or generate nearby coordinates
        const alertLocation = alert.location && typeof alert.location === 'string' 
          ? JSON.parse(alert.location)
          : {
              lat: userLocation.lat + (Math.random() - 0.5) * 0.1,
              lng: userLocation.lng + (Math.random() - 0.5) * 0.1
            };

        const marker = new window.google.maps.Marker({
          position: alertLocation,
          map: mapInstance.current,
          title: `${alert.hospitalName} - ${alert.urgency}`,
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="12" fill="${alert.urgency === 'Critical' ? '#EF4444' : alert.urgency === 'Medium' ? '#F59E0B' : '#EAB308'}" stroke="white" stroke-width="2"/>
                <path d="M14 8L16 12H19L15.5 14.5L17 19L14 16L11 19L12.5 14.5L9 12H12L14 8Z" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(28, 28),
            anchor: new window.google.maps.Point(14, 14)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              <h3 class="font-bold text-lg">${alert.hospitalName}</h3>
              <p class="text-sm text-gray-600 mt-1">${alert.location}</p>
              <div class="flex items-center mt-2">
                <span class="px-2 py-1 rounded text-xs font-bold ${
                  alert.urgency === 'Critical' ? 'bg-red-100 text-red-700' :
                  alert.urgency === 'Medium' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }">${alert.urgency}</span>
                <span class="ml-2 text-xs text-gray-500">${alert.distanceKm}km away</span>
              </div>
              <p class="text-sm mt-2">${alert.description}</p>
              <div class="flex flex-wrap gap-1 mt-2">
                ${alert.bloodGroup.map(bg => `
                  <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">${bg}</span>
                `).join('')}
              </div>
              <div class="mt-2 text-xs">
                <p>Required: ${alert.requiredUnits} units</p>
                <p>Collected: ${alert.collectedUnits} units</p>
              </div>
              ${!alert.isRsvped ? `
                <button onclick="handleRSVP('${alert.id}')" class="w-full mt-3 bg-red-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-800 transition-colors">
                  I Can Help
                </button>
              ` : `
                <button disabled class="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium cursor-not-allowed">
                  Responded ✓
                </button>
              `}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current, marker);
        });

        markers.current.push(marker);
      });
    }
  };

  const refreshLocation = () => {
    getUserLocation();
  };

  const handleRSVP = async (alertId: string) => {
    try {
      await api.rsvpToAlert(alertId, user.id);
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, isRsvped: true, collectedUnits: alert.collectedUnits + 1 } : alert
      ));
      alert('Thank you for responding! The hospital will contact you soon.');
      loadMapData(); // Refresh data
    } catch (error) {
      console.error('Failed to RSVP:', error);
      alert('Failed to respond to alert. Please try again.');
    }
  };

  // Add handleRSVP to window for the info window button
  useEffect(() => {
    (window as any).handleRSVP = handleRSVP;
    return () => {
      delete (window as any).handleRSVP;
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donor Map</h2>
          <p className="text-gray-500 text-sm">Find nearby donors and emergency alerts</p>
        </div>
        <button
          onClick={refreshLocation}
          className="bg-red-900 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm hover:bg-red-800 transition-colors"
        >
          <Navigation className="w-5 h-5 mr-2" />
          Refresh Location
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setMapType('alerts')}
              className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors ${
                mapType === 'alerts'
                  ? 'bg-red-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency Alerts
            </button>
            <button
              onClick={() => setMapType('donors')}
              className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors ${
                mapType === 'donors'
                  ? 'bg-red-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Nearby Donors
            </button>
          </div>
          
          <div className="flex-1"></div>
          
          <select
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value as BloodGroup | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          >
            <option value="">All Blood Types</option>
            {Object.values(BloodGroup).map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">
            {mapType === 'donors' ? 'Nearby Donors Map' : 'Emergency Alerts Map'}
          </h3>
          {loading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-900 mr-2"></div>
              Loading...
            </div>
          )}
        </div>
        <div 
          ref={mapRef} 
          className="w-full h-[600px]"
          style={{ minHeight: '600px' }}
        />
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-3">Map Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          {mapType === 'donors' ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Nearby Donors</span>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Critical Alerts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span>Medium Alerts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>Low Alerts</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};