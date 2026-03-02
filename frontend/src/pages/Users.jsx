import { createSignal, createResource, Show, For } from 'solid-js';
import { api } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from '@solidjs/router';

function Users() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth.isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  const [refetchTrigger, setRefetchTrigger] = createSignal(0);
  const [users, { refetch }] = createResource(refetchTrigger, () => api.getUsers());
  
  // ✅ NUEVO: Cargar roles disponibles
  const [roles] = createResource(() => api.getRoles());

  // Modal state
  const [showModal, setShowModal] = createSignal(false);
  const [editingUser, setEditingUser] = createSignal(null);
  const [modalLoading, setModalLoading] = createSignal(false);
  const [modalError, setModalError] = createSignal('');

  // Form state
  const [formName, setFormName] = createSignal('');
  const [formEmail, setFormEmail] = createSignal('');
  const [formPassword, setFormPassword] = createSignal('');
  const [formRole, setFormRole] = createSignal(''); // Ahora guardará el roleId

  const openCreate = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    // ✅ Buscar el rol "user" por defecto
    const defaultRole = roles()?.data?.find(r => r.name === 'user');
    setFormRole(defaultRole?._id || '');
    setModalError('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    // ✅ Establecer el roleId del usuario
    setFormRole(user.role?._id || user.role);
    setModalError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await api.deleteUser(id);
      refetch();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    try {
      if (editingUser()) {
        const data = {};
        if (formName()) data.name = formName();
        if (formEmail()) data.email = formEmail();
        if (formPassword()) data.password = formPassword();
        if (formRole()) data.role = formRole(); // ✅ Enviar roleId
        await api.updateUser(editingUser()._id, data);
      } else {
        await api.createUser({
          name: formName(),
          email: formEmail(),
          password: formPassword(),
          role: formRole() // ✅ Enviar roleId
        });
      }
      setShowModal(false);
      refetch();
    } catch (error) {
      setModalError(error.message);
    }

    setModalLoading(false);
  };

  // ✅ NUEVO: Función para obtener color según rol
  const roleColor = (roleName) => {
    if (roleName === 'admin') return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400';
    if (roleName === 'moderator') return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  // ✅ NUEVO: Obtener el nombre del rol para mostrar
  const getRoleName = (user) => {
    if (typeof user.role === 'string') return user.role;
    return user.role?.name || user.role?.displayName || 'user';
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div class="p-8 max-w-6xl mx-auto">

          {/* Header */}
          <div class="flex justify-between items-center mb-8">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
              <p class="text-gray-500 dark:text-gray-400 mt-1">
                Gestiona los usuarios del sistema
              </p>
            </div>
            <button onClick={openCreate} class="btn-primary">
              + Nuevo usuario
            </button>
          </div>

          {/* Tabla */}
          <div class="card overflow-hidden p-0">
            <Show when={users.loading}>
              <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                Cargando usuarios...
              </div>
            </Show>

            <Show when={users.error}>
              <div class="p-8 text-center text-red-500">
                Error al cargar usuarios
              </div>
            </Show>

            <Show when={users()}>
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-800">
                    <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Creado
                    </th>
                    <th class="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  <For each={users()?.data}>
                    {(user) => (
                      <tr class="border-b border-gray-100 dark:border-gray-800/50 
                                 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 
                                        flex items-center justify-center flex-shrink-0">
                              <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p class="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                              <p class="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <span class={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(getRoleName(user))}`}>
                            {getRoleName(user)}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-1.5">
                            <span class={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span class="text-xs text-gray-600 dark:text-gray-400">
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openEdit(user)}
                              class="text-xs px-3 py-1.5 rounded-md border border-gray-200 
                                     dark:border-gray-700 text-gray-600 dark:text-gray-400
                                     hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              class="text-xs px-3 py-1.5 rounded-md border border-red-200
                                     dark:border-red-500/30 text-red-600 dark:text-red-400
                                     hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>

              <div class="px-6 py-3 border-t border-gray-100 dark:border-gray-800">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Total: {users()?.total || 0} usuarios
                </p>
              </div>
            </Show>
          </div>
        </div>

        {/* Modal */}
        <Show when={showModal()}>
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
                        rounded-xl w-full max-w-md shadow-xl">
              <div class="flex justify-between items-center px-6 py-4 border-b 
                          border-gray-200 dark:border-gray-800">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingUser() ? 'Editar usuario' : 'Nuevo usuario'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    class="input-field w-full"
                    placeholder="Nombre completo"
                    value={formName()}
                    onInput={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    class="input-field w-full"
                    placeholder="correo@ejemplo.com"
                    value={formEmail()}
                    onInput={(e) => setFormEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {editingUser() ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser()}
                    class="input-field w-full"
                    placeholder={editingUser() ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                    value={formPassword()}
                    onInput={(e) => setFormPassword(e.target.value)}
                  />
                </div>

                {/* ✅ NUEVO: Dropdown de roles dinámico */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol
                  </label>
                  <Show
                    when={!roles.loading && roles()}
                    fallback={<p class="text-xs text-gray-400">Cargando roles...</p>}
                  >
                    <select
                      class="input-field w-full"
                      value={formRole()}
                      onChange={(e) => setFormRole(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      <For each={roles()?.data}>
                        {(role) => (
                          <option value={role._id}>
                            {role.displayName} ({role.permissions?.length || 0} permisos)
                          </option>
                        )}
                      </For>
                    </select>
                  </Show>
                </div>

                <Show when={modalError()}>
                  <div class="bg-red-500/10 border border-red-500/30 text-red-600 
                              dark:text-red-400 px-4 py-3 rounded-md text-sm">
                    {modalError()}
                  </div>
                </Show>

                <div class="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    class="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading()}
                    class="btn-primary flex-1 disabled:opacity-50"
                  >
                    {modalLoading() ? 'Guardando...' : editingUser() ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Show>

      </Layout>
    </ProtectedRoute>
  );
}

export default Users;