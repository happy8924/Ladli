import React, {
  createContext,
  useState,
  useContext,
  useEffect
} from 'react';

import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load User From SessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem('ladli_token');
    const storedUser = sessionStorage.getItem('ladli_user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  // =========================
  // REGISTER
  // =========================
  const register = async (username, email, password, phone = '') => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        phone
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Register Error:', error.response || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Registration failed'
      };
    }
  };

  // =========================
  // LOGIN (Password)
  // =========================
  const login = async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const token = response.data.access_token;
      sessionStorage.setItem('ladli_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const userResponse = await api.get('/users/me');
      const userData = userResponse.data;

      setUser(userData);
      sessionStorage.setItem('ladli_user', JSON.stringify(userData));

      return {
        success: true,
        role: userData.role
      };
    } catch (error) {
      console.error('Login Error:', error.response || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Invalid credentials'
      };
    }
  };

  // =========================
  // SEND OTP (Email or Phone)
  // =========================
  const sendOtp = async (identifier, purpose = 'login') => {
    try {
      const response = await api.post('/auth/send-otp', { identifier, purpose });
      return {
        success: true,
        message: response.data.message,
        dev_otp: response.data.dev_otp
      };
    } catch (error) {
      console.error('Send OTP Error:', error.response || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to send OTP code'
      };
    }
  };

  // =========================
  // LOGIN WITH OTP (Email or Phone)
  // =========================
  const loginWithOtp = async (identifier, otp) => {
    try {
      const response = await api.post('/auth/login-otp', { identifier, otp });
      const token = response.data.access_token;

      sessionStorage.setItem('ladli_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const userResponse = await api.get('/users/me');
      const userData = userResponse.data;

      setUser(userData);
      sessionStorage.setItem('ladli_user', JSON.stringify(userData));

      return {
        success: true,
        role: userData.role
      };
    } catch (error) {
      console.error('OTP Login Error:', error.response || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Invalid or expired OTP code'
      };
    }
  };

  // =========================
  // FORGOT PASSWORD (Verify & Reset)
  // =========================
  const verifyForgotPassword = async (identifier) => {
    try {
      const response = await api.post('/auth/forgot-password/verify', { identifier });
      return {
        success: true,
        message: response.data.message,
        dev_otp: response.data.dev_otp
      };
    } catch (error) {
      console.error('Verify Forgot Password Error:', error.response || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Account verification failed'
      };
    }
  };

  const resetPassword = async (identifier, otp, newPassword) => {
    try {
      const response = await api.post('/auth/forgot-password/reset', {
        identifier,
        otp,
        new_password: newPassword
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Reset Password Error:', error.response || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Password reset failed'
      };
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    sessionStorage.removeItem('ladli_token');
    sessionStorage.removeItem('ladli_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        sendOtp,
        loginWithOtp,
        verifyForgotPassword,
        resetPassword,
        logout,

        // Roles
        isAdmin: user?.role === 'admin',
        isLogistics: user?.role === 'logistics',
        isUser: user?.role === 'user',
        userRole: user?.role
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);