import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8E4D1' }}>
      <Navbar />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />
        <main className="flex-1 p-6 page-enter min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
