import Sidebar from './Sidebar';

function Layout(props) {
  return (
    <div class="flex min-h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <main class="flex-1 overflow-auto">
        {props.children}
      </main>
    </div>
  );
}

export default Layout;