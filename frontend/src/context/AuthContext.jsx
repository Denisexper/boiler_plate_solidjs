import { createContext, useContext, createSignal, onMount } from 'solid-js';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider(props) {
  const [user, setUser] = createSignal(null);
  const [loading, setLoading] = createSignal(true);

  onMount(() => {
    // Cargar usuario del token si existe
    const token = api.getToken();
    if (token) {
      try {
        // Decodificar el token manualmente (simple base64 decode)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (error) {
        console.error('Error decoding token:', error);
        api.removeToken();
      }
    }
    setLoading(false);
  });

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api.register(name, email, password);
      setUser(data.newUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    api.removeToken();
    setUser(null);
  };

  const isAdmin = () => user()?.role === 'admin';
  const isModerator = () => user()?.role === 'moderator' || isAdmin();

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isModerator,
  };

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}