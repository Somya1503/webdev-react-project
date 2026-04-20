import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) return null;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const handleToggleAvailable = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('users')
      .update({ is_available: !user.isAvailable })
      .eq('id', user.id);
      
    if (!error) {
      await refreshUser();
    } else {
      console.error("Failed to update availability", error);
    }
    setIsUpdating(false);
  };

  const handleUpdateBloodType = async (type: string) => {
    if (type === user.bloodType) return;
    setIsUpdating(true);
    const { error } = await supabase
      .from('users')
      .update({ blood_type: type })
      .eq('id', user.id);
      
    if (!error) {
      await refreshUser();
    } else {
      console.error("Failed to update blood type", error);
    }
    setIsUpdating(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-slate-50 mb-6">My Profile</h1>
      
      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 border border-primary-500/30 text-xl font-bold shadow-inner">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-50">{user.name}</h2>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
        </div>

        <div className={`p-6 space-y-6 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-200">Available as Volunteer</h3>
              <p className="text-sm text-slate-400">Receive alerts for nearby emergencies</p>
            </div>
            <button 
              onClick={handleToggleAvailable}
              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${user.isAvailable ? 'bg-primary-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'bg-slate-700'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${user.isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-sm font-medium text-slate-200 mb-4">Blood Type</h3>
            <div className="grid grid-cols-4 gap-2">
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((type) => (
                <div
                  key={type}
                  onClick={() => handleUpdateBloodType(type)}
                  className={`text-center py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                    type === user.bloodType ? 'border-primary-500 bg-primary-500/20 text-primary-400' : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
