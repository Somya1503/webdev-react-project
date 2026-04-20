import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Creating test users...");
  const user1Email = `test1_${Date.now()}@test.com`;
  const user2Email = `test2_${Date.now()}@test.com`;
  
  const { data: auth1 } = await supabase.auth.signUp({ email: user1Email, password: 'password123' });
  const { data: auth2 } = await supabase.auth.signUp({ email: user2Email, password: 'password123' });
  
  const u1 = auth1.user.id;
  const u2 = auth2.user.id;
  
  // Insert profiles (auto-create logic is on client, so we do it manually here)
  await supabase.from('users').insert([{ id: u1, name: 'U1', phone: user1Email }, { id: u2, name: 'U2', phone: user2Email }]);

  console.log("User 1 creating emergency...");
  const { data: em, error: emErr } = await supabase.from('emergency_requests').insert({
    requester_id: u1,
    type: 'Blood',
    urgency: 'Critical',
    location: `POINT(77.2090 28.6139)`, // New Delhi
    status: 'active'
  }).select().single();
  
  if (emErr) console.error("Create Emergency Error:", emErr);

  console.log("User 2 fetching nearby emergencies...");
  const { data: nearby, error: nearbyErr } = await supabase.rpc('get_nearby_emergencies', {
    lat: 28.6139,
    lng: 77.2090,
    radius_meters: 20000
  });
  
  console.log("Nearby Emergencies for User 2:", nearby);
  if (nearbyErr) console.error(nearbyErr);

  console.log("Fetching User 2 responses...");
  const { data: responses, error: respErr } = await supabase.from('request_responses').select('id, request_id').eq('volunteer_id', u2);
  console.log("Responses:", responses);

  console.log("Fetching User 2 own requests...");
  const { data: ownReqs } = await supabase.from('emergency_requests').select('id').eq('requester_id', u2);
  console.log("Own requests:", ownReqs);

  // Volunteer Tab Filtering Logic
  const responded = new Set((responses || []).map(r => r.request_id));
  const own = new Set((ownReqs || []).map(r => r.id));
  const filtered = nearby.filter(e => !responded.has(e.id) && !own.has(e.id));
  console.log("Filtered Alerts for Volunteer Tab:", filtered.length > 0 ? "SUCCESS (found)" : "FAILED (empty)");
}

run().catch(console.error);
