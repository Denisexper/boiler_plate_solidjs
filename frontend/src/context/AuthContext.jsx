import { createContext, useContext, createSignal, onMount } from "solid-js";
import { api } from "../services/api";

const AuthContext = createContext();

export function AuthProvider(props) {
  const [user, setUser] = createSignal(null);
  const [loading, setLoading] = createSignal(true);

  // para logs solo en desarrollo
  const log = (message, data) => {
    if (import.meta.env.DEV) {
      console.log(`[Auth] ${message}`, data || '');
    }
  };

  onMount(async () => {
    const token = api.getToken();

    if (!token) {
      log('No hay token, usuario no autenticado');
      setLoading(false);
      return; 
    }

    try {
      log('Cargando datos del usuario...');
      const userData = await api.getMe();
      setUser(userData.data);
      log('Usuario cargado:', userData.data);
    } catch (error) {
      log('Error cargando usuario:', error.message);
      // Token inválido o expirado
      api.removeToken();
      setUser(null);
    } finally {
      // finally asegura que loading siempre se desactive
      setLoading(false);
    }
  });

  const login = async (email, password) => {
    try {
      log('Intentando login...');
      const data = await api.login(email, password);
      setUser(data.user);
      log('Login exitoso:', data.user);
      return { success: true, user: data.user };
    } catch (error) {
      log('Error en login:', error.message);
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      log('Intentando registro...');
      const data = await api.register(name, email, password);
      setUser(data.newUser);
      log('Registro exitoso:', data.newUser);
      return { success: true, user: data.newUser };
    } catch (error) {
      log('Error en registro:', error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    log('Cerrando sesión...');
    api.removeToken();
    setUser(null);
  };

  const isAdmin = () => user()?.role === "admin";
  const isModerator = () => user()?.role === "moderator" || isAdmin();

  const hasPermission = (permission) => {
    const userPermissions = user()?.permissions || [];
    const has = userPermissions.includes(permission);
    
    if (import.meta.env.DEV && !has) {
      console.log(`[Auth] Usuario no tiene permiso: ${permission}`);
    }
    
    return has;
  };

  const refreshUser = async () => {
    if (!api.getToken()) return;
    
    try {
      log('Refrescando datos del usuario...');
      const userData = await api.getMe();
      setUser(userData.data);
      log('Usuario actualizado:', userData.data);
      return { success: true };
    } catch (error) {
      log('Error refrescando usuario:', error.message);
      return { success: false, error: error.message };
    }
  };

  const isAuthenticated = () => !!user();

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isModerator,
    hasPermission,
    refreshUser,
    isAuthenticated,
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
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}