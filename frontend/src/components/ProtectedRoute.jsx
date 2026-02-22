import { Navigate } from '@solidjs/router';
import { useAuth } from '../context/AuthContext';
import { Show } from 'solid-js';

function ProtectedRoute(props) {
  const auth = useAuth();
  
  return (
    <Show
      when={auth.user()}
      fallback={<Navigate href="/login" />}
    >
      {props.children}
    </Show>
  );
}

export default ProtectedRoute;