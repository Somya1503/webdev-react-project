import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

interface EmergencyRecord {
  id: string;
  type: string;
  urgency: string;
  status: string;
  lat: number;
  lng: number;
  distance_meters: number;
}

interface VolunteerResponse {
  id: string;
  request_id: string;
  status: string;
  emergency_requests: {
    id: string;
    type: string;
    urgency: string;
    status: string;
  };
}

export const Volunteer = () => {
  const { user } = useAuth();
  const { location } = useLocationContext();

  const [newAlerts, setNewAlerts] = useState<EmergencyRecord[]>([]);
  const [inProgress, setInProgress] = useState<VolunteerResponse[]>([]);
  const [completed, setCompleted] = useState<VolunteerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user || !location) return;
    
    // Fetch all active emergencies near user
    const { data: nearbyData } = await supabase
      .rpc('get_nearby_emergencies', {
        lat: location.lat,
        lng: location.lng,
        radius_meters: 20000 // 20km for volunteer alerts
      });

    // Fetch user's responses
    const { data: responsesData } = await supabase
      .from('request_responses')
      .select(`
        id,
        request_id,
        status,
        emergency_requests (
          id,
          type,
          urgency,
          status
        )
      `)
      .eq('volunteer_id', user.id);

    const responses = responsesData as unknown as VolunteerResponse[] || [];
    
    // Set In Progress
    setInProgress(responses.filter(r => r.status === 'accepted' && r.emergency_requests?.status !== 'resolved'));
    
    // Set Completed
    setCompleted(responses.filter(r => r.status === 'completed' || r.emergency_requests?.status === 'resolved'));

    // Filter New Alerts: Active emergencies not responded to, and not requested by the user
    if (nearbyData) {
      const respondedRequestIds = new Set(responses.map(r => r.request_id));
      
      const { data: ownRequests } = await supabase
        .from('emergency_requests')
        .select('id')
        .eq('requester_id', user.id);
      
      const ownRequestIds = new Set((ownRequests || []).map((r: any) => r.id));

      const filteredAlerts = nearbyData.filter((em: any) => !respondedRequestIds.has(em.id) && !ownRequestIds.has(em.id));
      setNewAlerts(filteredAlerts);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('volunteer_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'request_responses' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, location]);

  const handleAccept = async (emergencyId: string) => {
    if (!user) return;
    const toastId = toast.loading('Accepting request...');
    
    const { error } = await supabase.from('request_responses').insert({
      request_id: emergencyId,
      volunteer_id: user.id,
      status: 'accepted'
    });

    if (error) {
      toast.error('Failed to accept request.', { id: toastId });
    } else {
      toast.success('Request accepted! Moved to In Progress.', { id: toastId });
      fetchData();
    }
  };

  const handleComplete = async (responseId: string, emergencyId: string) => {
    const toastId = toast.loading('Marking as completed...');
    
    const { error: responseError } = await supabase
      .from('request_responses')
      .update({ status: 'completed' })
      .eq('id', responseId);

    if (responseError) {
      toast.error('Failed to update response.', { id: toastId });
      return;
    }

    await supabase
      .from('emergency_requests')
      .update({ status: 'resolved' })
      .eq('id', emergencyId);

    toast.success('Task marked as completed! Thank you for your help.', { id: toastId });
    fetchData();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-50">Volunteer Tasks</h1>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${user?.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
          {user?.isAvailable ? 'Available for Alerts' : 'Currently Unavailable'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* New Alerts Column */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col h-full overflow-hidden shadow-inner">
          <h2 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            New Alerts ({newAlerts.length})
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1 custom-scrollbar">
            {isLoading ? (
              <p className="text-sm text-slate-400 text-center py-4">Loading...</p>
            ) : newAlerts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No new alerts nearby.</p>
            ) : newAlerts.map((em) => (
              <div key={em.id} className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700/50 transition-all hover:shadow-xl hover:-translate-y-0.5">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${em.urgency === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {em.type} Needed
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{(em.distance_meters / 1000).toFixed(1)} km</span>
                </div>
                <h3 className="font-bold text-slate-50 text-sm mt-2">{em.urgency} Request</h3>
                <button 
                  onClick={() => handleAccept(em.id)}
                  className="mt-4 w-full bg-primary-500/10 text-primary-400 border border-primary-500/30 font-medium py-2 rounded-lg text-sm hover:bg-primary-500/20 transition-colors"
                >
                  Accept Request
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col h-full overflow-hidden shadow-inner">
          <h2 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            In Progress ({inProgress.length})
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1 custom-scrollbar">
            {inProgress.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No active tasks.</p>
            ) : inProgress.map((response) => (
              <div key={response.id} className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700/50 transition-all hover:shadow-xl hover:-translate-y-0.5">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-2 py-1 rounded-full">
                    {response.emergency_requests?.type}
                  </span>
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full animate-pulse">
                    Active
                  </span>
                </div>
                <h3 className="font-bold text-slate-50 text-sm mt-2">{response.emergency_requests?.urgency} Request</h3>
                <p className="text-xs text-slate-400 mt-1">Please proceed to the location safely.</p>
                <button 
                  onClick={() => handleComplete(response.id, response.request_id)}
                  className="mt-4 w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold py-2 rounded-lg text-sm hover:bg-emerald-500/20 transition-colors flex justify-center items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Completed
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col h-full overflow-hidden shadow-inner">
          <h2 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            Completed ({completed.length})
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1 custom-scrollbar">
            {completed.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No completed tasks yet.</p>
            ) : completed.map((response) => (
              <div key={response.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30 opacity-75 grayscale-[20%]">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-slate-700/50 text-slate-300 text-xs font-bold px-2 py-1 rounded-full">
                    {response.emergency_requests?.type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Done
                  </span>
                </div>
                <h3 className="font-bold text-slate-400 text-sm mt-2">{response.emergency_requests?.urgency} Request</h3>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
