import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Dashboard } from './pages/Dashboard';
import { Auth } from './pages/Auth';
import { Emergency } from './pages/Emergency';
import { Volunteer } from './pages/Volunteer';
import { Profile } from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Auth />} />
            
            <Route 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/request/new" element={<Emergency />} />
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
