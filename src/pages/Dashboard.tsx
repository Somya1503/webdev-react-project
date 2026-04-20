import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLocationContext } from '../context/LocationContext';
import { supabase } from '../services/supabase';

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to recenter map when location changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 14);
  return null;
}

interface EmergencyRecord {
  id: string;
  type: string;
  urgency: string;
  status: string;
  lat: number;
  lng: number;
  distance_meters: number;
}

export const Dashboard = () => {
  const { location } = useLocationContext();
  const defaultCenter: [number, number] = [28.6139, 77.2090]; // New Delhi
  const center: [number, number] = location ? [location.lat, location.lng] : defaultCenter;

  const [activeEmergencies, setActiveEmergencies] = useState<EmergencyRecord[]>([]);

  useEffect(() => {
    if (!location) return;

    const fetchEmergencies = async () => {
      const { data, error } = await supabase
        .rpc('get_nearby_emergencies', {
          lat: location.lat,
          lng: location.lng,
          radius_meters: 10000 // 10km
        });

      if (data && !error) {
        setActiveEmergencies(data);
      }
    };

    fetchEmergencies();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('public:emergency_requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_requests' }, () => {
         // Simply refetch for MVP to get distance calculated
         fetchEmergencies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [location]);

  return (
    <div className="h-full flex flex-col relative">
      <div className="absolute inset-0 z-0 bg-gray-100">
        <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {location && (
            <Marker position={center}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          {activeEmergencies.map((em) => (
            <Marker key={em.id} position={[em.lat, em.lng]}>
              <Popup>
                <div className="text-sm">
                  <span className="font-bold text-red-600 block">{em.urgency}</span>
                  <span className="text-gray-900">{em.type} Needed</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Overlay Feed */}
      <div className="absolute top-4 left-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto z-[400] hidden md:block">
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20">
          <h2 className="font-bold text-gray-900 mb-4">Nearby Emergencies</h2>
          <div className="space-y-3">
            {activeEmergencies.length === 0 ? (
              <p className="text-sm text-gray-500">No active emergencies nearby.</p>
            ) : activeEmergencies.map((em) => (
              <div key={em.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:border-red-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">{em.type} needed</span>
                  <span className="text-xs text-gray-500">{(em.distance_meters / 1000).toFixed(1)} km</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{em.urgency} Request</h3>
                <button className="mt-3 w-full bg-gray-900 text-white text-xs font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
