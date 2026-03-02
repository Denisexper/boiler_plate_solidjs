import { createSignal, createResource, Show, For } from "solid-js";
import { api } from "../services/api";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

function Logs() {
  const auth = useAuth();

  const [filters, setFilters] = createSignal({});
  const [logs, { refetch }] = createResource(filters, (f) => api.getLogs(f));

  const [filterAction, setFilterAction] = createSignal("");
  const [filterResource, setFilterResource] = createSignal("");
  const [filterDate, setFilterDate] = createSignal("");

  const applyFilters = () => {
    const f = {};
    if (filterAction()) f.action = filterAction();
    if (filterResource()) f.resource = filterResource();

    if (filterDate()) {
      const [year, month, day] = filterDate().split("-");
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
      f.startDate = startOfDay.toISOString();
      f.endDate = endOfDay.toISOString();
    }

    setFilters(f);
  };

  const clearFilters = () => {
    setFilterAction("");
    setFilterResource("");
    setFilterDate("");
    setFilters({});
  };

  // ✅ AGREGAR esta función
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este log?")) return;
    try {
      await api.deleteLog(id);
      refetch();
    } catch (error) {
      alert(error.message);
    }
  };

  const actionColor = (action) => {
    const colors = {
      login: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
      logout: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      create: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      update: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
      delete: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
      read: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    };
    return colors[action] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  };

  const statusColor = (code) => {
    if (code >= 200 && code < 300) return "text-green-600 dark:text-green-400";
    if (code >= 400) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div class="p-8 max-w-7xl mx-auto">
          <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Bitácoras
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">
              Registro de actividad del sistema
            </p>
          </div>

          {/* Filtros */}
          <div class="card mb-6">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Filtros
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                class="input-field"
                value={filterAction()}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="">Todas las acciones</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>

              <select
                class="input-field"
                value={filterResource()}
                onChange={(e) => setFilterResource(e.target.value)}
              >
                <option value="">Todos los recursos</option>
                <option value="users">Users</option>
                <option value="auth">Auth</option>
                <option value="logs">Logs</option>
              </select>

              <input
                type="date"
                class="input-field"
                placeholder="Buscar por fecha"
                value={filterDate()}
                onInput={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div class="flex gap-3 mt-4">
              <button onClick={applyFilters} class="btn-primary">
                Aplicar filtros
              </button>
              <button onClick={clearFilters} class="btn-secondary">
                Limpiar
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div class="card overflow-hidden p-0">
            <Show when={logs.loading}>
              <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                Cargando bitácoras...
              </div>
            </Show>

            <Show when={logs()}>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-800">
                      <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acción
                      </th>
                      <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Recurso
                      </th>
                      <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Usuario Afectado
                      </th>
                      <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      {/* ✅ COLUMNA PARA BOTÓN */}
                      <Show when={auth.hasPermission("logs.delete")}>
                        <th class="px-6 py-3"></th>
                      </Show>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={logs()?.data}>
                      {(log) => (
                        <tr class="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <td class="px-6 py-4">
                            <div>
                              <p class="text-sm font-medium text-gray-900 dark:text-white">
                                {log.user?.name || "Desconocido"}
                              </p>
                              <p class="text-xs text-gray-500 dark:text-gray-400">
                                {log.user?.email}
                              </p>
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <span
                              class={`px-2 py-1 rounded-full text-xs font-medium ${actionColor(log.action)}`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {log.resource}
                          </td>
                          <td class="px-6 py-4">
                            <Show
                              when={log.targetUserName || log.targetUser}
                              fallback={<span class="text-xs text-gray-400 italic">-</span>}
                            >
                              <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">
                                  {log.targetUserName || log.targetUser?.name || "Usuario"}
                                </p>
                                <Show when={log.targetUser?.email}>
                                  <p class="text-xs text-gray-500 dark:text-gray-400">
                                    {log.targetUser.email}
                                  </p>
                                </Show>
                              </div>
                            </Show>
                          </td>
                          <td class="px-6 py-4">
                            <span
                              class={`text-sm font-mono font-medium ${statusColor(log.statusCode)}`}
                            >
                              {log.statusCode}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                            {new Date(log.createdAt).toLocaleString("es-ES")}
                          </td>
                          {/* ✅ BOTÓN DE ELIMINAR */}
                          <Show when={auth.hasPermission("logs.delete")}>
                            <td class="px-6 py-4">
                              <button
                                onClick={() => handleDelete(log._id)}
                                class="text-xs px-3 py-1.5 rounded-md border border-red-200
                                       dark:border-red-500/30 text-red-600 dark:text-red-400
                                       hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                Eliminar
                              </button>
                            </td>
                          </Show>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>

              <div class="px-6 py-3 border-t border-gray-100 dark:border-gray-800">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Total: {logs()?.total || 0} registros
                </p>
              </div>
            </Show>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default Logs;