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

  // Load User From SessionStorage (per-tab, so admin & user sessions
  // in different tabs of the same browser don't overwrite each other)
  useEffect(() => {
    const token = sessionStorage.getItem('ladli_token');
    const storedUser = sessionStorage.getItem('ladli_user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));

      // Set token in axios headers
      api.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  // =========================
  // REGISTER
  // =========================
  const register = async (
    username,
    email,
    password
  ) => {
    try {
      const response = await api.post(
        '/auth/register',
        {
          username,
          email,
          password
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(
        'Register Error:',
        error.response || error
      );

      return {
        success: false,
        message:
          error.response?.data?.detail ||
          'Registration failed'
      };
    }
  };

  // =========================
  // LOGIN
  // =========================
  const login = async (
    username,
    password
  ) => {
    try {
      const formData = new URLSearchParams();

      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post(
        '/auth/login',
        formData,
        {
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded'
          }
        }
      );

      const token =
        response.data.access_token;

      // Save token
      sessionStorage.setItem(
        'ladli_token',
        token
      );

      // Set token globally
      api.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`;

      // Get logged user
      const userResponse = await api.get(
        '/users/me'
      );

      const userData = userResponse.data;

      // Save user
      setUser(userData);

      sessionStorage.setItem(
        'ladli_user',
        JSON.stringify(userData)
      );

      return {
        success: true,
        role: userData.role
      };
    } catch (error) {
      console.error(
        'Login Error:',
        error.response || error
      );

      return {
        success: false,
        message:
          error.response?.data?.detail ||
          'Invalid username or password'
      };
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    sessionStorage.removeItem(
      'ladli_token'
    );

    sessionStorage.removeItem(
      'ladli_user'
    );

    delete api.defaults.headers.common[
      'Authorization'
    ];

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
        logout,

        // Roles
        isAdmin:
          user?.role === 'admin',

        isLogistics:
          user?.role === 'logistics',

        isUser:
          user?.role === 'user',

        userRole: user?.role
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);