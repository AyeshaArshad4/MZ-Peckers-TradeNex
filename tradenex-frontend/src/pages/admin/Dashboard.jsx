import { useState, useEffect } from 'react';
import { getDashboardApi } from '../../api/analytics.api';
import { approveUserApi, rejectUserApi } from '../../api/user.api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Package, ShoppingBag, Users, FileText, Star, MessageSquare, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card p-5 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-semibold text-[#66707A] uppercase tracking-wide">{label}</p>
      <p className="font-display text-2xl font-bold text-[#3F454D] mt-0.5">{value}</p>
      {sub && <p className="text-xs text-[#66707A] mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getDashboardApi()
      .then(({ data: d }) => setData(d.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    try { await approveUserApi(id); toast.success('User approved'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason (optional):');
    try { await rejectUserApi(id, { reason }); toast.success('User rejected'); load(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <AppLayout><Spinner size="lg" className="h-96" /></AppLayout>;

  const { stats, topProducts, recentOrders, pendingApprovals, monthlyRevenue } = data || {};

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#3F454D]">Admin Dashboard</h1>
        <p className="text-[#66707A] text-sm mt-1">Platform overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Orders"    value={stats?.TotalOrders    ?? 0} icon={ShoppingBag} color="bg-[#D8E3D6] text-[#5E7A5A]" />
        <StatCard label="Total Revenue"   value={formatCurrency(stats?.TotalRevenue ?? 0)} icon={TrendingUp} color="bg-[#E3EDDB] text-[#4A7A46]" />
        <StatCard label="Customers"       value={stats?.TotalCustomers ?? 0} icon={Users}      color="bg-[#E8E0ED] text-[#7A5A8A]" />
        <StatCard label="Pending Quotes"  value={stats?.PendingQuotes  ?? 0} icon={FileText}   color="bg-[#F0E8D0] text-[#8A6A3A]" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending Orders"  value={stats?.PendingOrders   ?? 0} icon={ShoppingBag} color="bg-[#F0E0D0] text-[#8A5A3A]" sub="Awaiting confirmation" />
        <StatCard label="Shipped"         value={stats?.ShippedOrders   ?? 0} icon={Package}     color="bg-[#E8E0F0] text-[#6A5A8A]" />
        <StatCard label="Pending Reviews" value={stats?.PendingReviews  ?? 0} icon={Star}        color="bg-[#F0E0E8] text-[#8A4A6A]" />
        <StatCard label="Pending Users"   value={stats?.PendingApprovals ?? 0} icon={Users}      color="bg-[#F5E4DC] text-[#C97B5E]" sub="Need approval" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-[#3F454D] mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#8FAF8B]" /> Monthly Revenue
          </h2>
          {monthlyRevenue?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="Month" tick={{ fontSize: 11, fill: '#66707A' }} />
                <YAxis tick={{ fontSize: 11, fill: '#66707A' }} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #CFCAB8', fontSize: 12 }} />
                <Bar dataKey="Revenue" fill="#8FAF8B" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-[#66707A] text-sm text-center py-16">No revenue data yet</p>}
        </div>

        {/* Top products */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-[#3F454D] mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts?.length ? topProducts.map((p, i) => (
              <div key={p.ProductID} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#D8E3D6] text-[#5E7A5A] text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3F454D] truncate">{p.ProductName}</p>
                  <p className="text-xs text-[#66707A]">{p.TotalUnitsSold} units sold</p>
                </div>
                <p className="text-sm font-semibold text-[#3F454D] shrink-0">{formatCurrency(p.TotalRevenue)}</p>
              </div>
            )) : <p className="text-[#66707A] text-sm text-center py-8">No data yet</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-[#3F454D] mb-4">Recent Orders</h2>
          <div className="space-y-2">
            {recentOrders?.length ? recentOrders.map((o) => (
              <div key={o.OrderID} className="flex items-center justify-between py-2 border-b border-[#D8D6C8] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#3F454D]">{o.CustomerName}</p>
                  <p className="text-xs text-[#66707A]">#{o.OrderID} · {formatDate(o.OrderPlacedAt)}</p>
                </div>
                <div className="text-right">
                  <Badge status={o.OrderStatus} />
                  <p className="text-sm font-bold text-[#3F454D] mt-1">{formatCurrency(o.Subtotal)}</p>
                </div>
              </div>
            )) : <p className="text-[#66707A] text-sm text-center py-8">No orders yet</p>}
          </div>
        </div>

        {/* Pending approvals */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-[#3F454D] mb-4">Pending Approvals</h2>
          {pendingApprovals?.length === 0
            ? <p className="text-[#66707A] text-sm text-center py-8">No pending approvals 🎉</p>
            : <div className="space-y-3">
                {pendingApprovals?.map((u) => (
                  <div key={u.UserID} className="flex items-center justify-between py-2 border-b border-[#D8D6C8] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#3F454D]">{u.FullName}</p>
                      <p className="text-xs text-[#66707A]">{u.Email} · {u.CustomerType}</p>
                      {u.CompanyName && <p className="text-xs text-[#66707A]">{u.CompanyName}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(u.UserID)} className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition">Approve</button>
                      <button onClick={() => handleReject(u.UserID)}  className="px-3 py-1 rounded-lg bg-[#F5E4DC] text-[#C97B5E] text-xs font-semibold hover:bg-[#EDD0C2] transition">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </AppLayout>
  );
}