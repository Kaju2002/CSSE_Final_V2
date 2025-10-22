import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../ui/Button';
import Input from '../../../Shared_Ui/Input';
import StaffNavbar from './StaffNavbar';
import { staffLogin } from '../../../lib/utils/staffApi';

const StaffAuth: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      setError('Please enter both email/staff ID and password');
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      const data = await staffLogin({ email, password });

      // Store authentication data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('staff', JSON.stringify(data.data.staff));
      
      // Store remember device preference
      if (rememberDevice) {
        localStorage.setItem('rememberDevice', 'true');
      }

      // Only redirect to staff portal if role is staff
      if (data.data.user.role.toLowerCase() === 'staff') {
        navigate('/staff/check-in');
      } else {
        throw new Error('Unauthorized: Staff credentials required');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col">
  {/* Staff Navbar */}
  <StaffNavbar title="MediWay" subtitle="Staff Portal" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#e6f0fa] flex items-center justify-center mb-2">
                <svg className="w-7 h-7 text-[#2a6bb7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v3h16v-3c0-2.663-5.33-4-8-4z" /></svg>
              </div>
              <h2 className="text-xl font-semibold text-[#2a6bb7]">Staff Sign in</h2>
              <p className="text-gray-600 text-center text-sm mt-1">Sign in with your staff credentials or scan your staff badge. All activity is audited.</p>
          </div>
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Email / Staff ID"
              type="text"
              placeholder="Enter your email or staff ID"
              className="mb-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              className="mb-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
            />
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="form-checkbox rounded border-gray-300"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                />
                Remember this device
              </label>
              <a href="#" className="text-[#2a6bb7] hover:underline">Forgot Password?</a>
            </div>
            <Button 
              type="submit" 
              className="w-full mt-2 text-base font-semibold py-3 bg-[#2a6bb7] hover:bg-[#245ca0] active:bg-[#1f4f8a]"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in to Staff Portal'}
            </Button>
          </form>
          <div className="my-4 w-full flex items-center">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="mx-2 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <button className="w-full py-3 rounded-md border border-gray-300 bg-gray-50 text-gray-700 font-medium shadow-sm transition hover:bg-gray-100 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-[#2a6bb7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V5a4 4 0 00-8 0v2m8 0v2a4 4 0 01-8 0V7"></path></svg>
            Scan Staff Badge
          </button>
        </div>
      </main>
    </div>
  );
};

export default StaffAuth;
