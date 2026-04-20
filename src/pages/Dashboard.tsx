import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { useLocationContext } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
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

// Custom Icon for critical emergencies
const criticalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
  const { user } = useAuth();
  const defaultCenter: [number, number] = [28.6139, 77.2090]; // New Delhi
  const center: [number, number] = location ? [location.lat, location.lng] : defaultCenter;

  const [activeEmergencies, setActiveEmergencies] = useState<EmergencyRecord[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyRecord | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  const fetchEmergencies = async () => {
    if (!location) return;
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

  useEffect(() => {
    fetchEmergencies();

    // Subscribe to all realtime events for emergency requests
    const channel = supabase
      .channel('public:emergency_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests' }, (payload: any) => {
         if (payload.eventType === 'INSERT') {
           toast.error('New Emergency Nearby!', { icon: '🚨' });
         }
         fetchEmergencies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [location]);

  const handleRespond = async () => {
    if (!selectedEmergency || !user) return;
    setIsResponding(true);
    
    // Check if they are the requester
    const { data: requestData } = await supabase
      .from('emergency_requests')
      .select('requester_id')
      .eq('id', selectedEmergency.id)
      .single();
      
    if (requestData?.requester_id === user.id) {
      toast.error("You cannot respond to your own request.");
      setIsResponding(false);
      return;
    }

    const { error } = await supabase.from('request_responses').insert({
      request_id: selectedEmergency.id,
      volunteer_id: user.id,
      status: 'accepted'
    });

    if (!error) {
      toast.success("You have successfully responded to this emergency!");
      setSelectedEmergency(null);
    } else {
      // If error is unique constraint, they already responded
      if (error.code === '23505') {
        toast('You have already responded to this request.', { icon: 'ℹ️' });
      } else {
        toast.error("Failed to respond: " + error.message);
      }
    }
    setIsResponding(false);
  };

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
            <Marker 
              key={em.id} 
              position={[em.lat, em.lng]}
              icon={em.urgency === 'Critical' ? criticalIcon : new L.Icon.Default()}
              eventHandlers={{
                click: () => setSelectedEmergency(em)
              }}
            >
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
              <div 
                key={em.id} 
                onClick={() => setSelectedEmergency(em)}
                className={`bg-white p-3 rounded-lg shadow-sm border cursor-pointer transition-colors ${em.urgency === 'Critical' ? 'border-red-300 border-l-4 border-l-red-500' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${em.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                    {em.type} needed
                  </span>
                  <span className="text-xs text-gray-500">{(em.distance_meters / 1000).toFixed(1)} km</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{em.urgency} Request</h3>
                <button className="mt-3 w-full bg-gray-50 text-gray-900 border border-gray-200 text-xs font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedEmergency && (
        <div className="absolute inset-0 z-[500] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${selectedEmergency.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {selectedEmergency.urgency} Priority
                </span>
                <h2 className="text-2xl font-bold text-gray-900">{selectedEmergency.type} Needed</h2>
              </div>
              <button 
                onClick={() => setSelectedEmergency(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">{(selectedEmergency.distance_meters / 1000).toFixed(1)} km away</span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">If you can provide {selectedEmergency.type.toLowerCase()} or assist in this emergency, please respond below. The requester will be notified of your availability.</p>
              </div>

              <button
                onClick={handleRespond}
                disabled={isResponding}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-base font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
              >
                {isResponding ? 'Responding...' : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    I Can Help
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
