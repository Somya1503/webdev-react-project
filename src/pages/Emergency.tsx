import { useState } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export const Emergency = () => {
  const { location, isLoading: isLocationLoading, refreshLocation, error } = useLocationContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState('Blood');
  const [urgency, setUrgency] = useState('Critical');

  const handleSubmit = async () => {
    if (!user) return alert('You must be logged in');
    if (!location) return alert('Please allow location access first');

    setIsSubmitting(true);
    
    try {
      const { error: insertError } = await supabase.from('emergency_requests').insert({
        requester_id: user.id,
        type: type,
        urgency: urgency,
        location: `POINT(${location.lng} ${location.lat})`,
        status: 'active'
      });

      if (insertError) throw insertError;
      
      alert('SOS Broadcasted successfully!');
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Error broadcasting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Request Emergency Help</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Blood', 'Oxygen', 'Ambulance', 'Other'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    type === t 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
            <select 
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border"
            >
              <option value="Critical">Critical (Life Threatening)</option>
              <option value="High">High (Need within hours)</option>
              <option value="Medium">Medium (Need within a day)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={
                  isLocationLoading 
                    ? 'Fetching location...' 
                    : error 
                      ? error 
                      : location 
                        ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` 
                        : 'Location unavailable'
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={refreshLocation}
                disabled={isLocationLoading}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                Locate Me
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !location}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Broadcasting...' : 'Broadcast SOS Request'}
          </button>
        </form>
      </div>
    </div>
  );
};
