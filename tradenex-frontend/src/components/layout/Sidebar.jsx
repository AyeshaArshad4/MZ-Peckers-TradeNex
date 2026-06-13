import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Package, ShoppingBag, FileText,
  Users, Star, MessageSquare, BarChart2,
} from 'lucide-react';

const adminLinks = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/admin/users',    icon: Users,           label: 'Users'      },
  { to: '/admin/products', icon: Package,         label: 'Products'   },
  { to: '/admin/orders',   icon: ShoppingBag,     label: 'Orders'     },
  { to: '/admin/quotes',   icon: FileText,        label: 'Quotes'     },
  { to: '/admin/reviews',  icon: Star,            label: 'Reviews'    },
  { to: '/admin/queries',  icon: MessageSquare,   label: 'Queries'    },
];

const customerLinks = [
  { to: '/products', icon: Package,       label: 'Products'   },
  { to: '/orders',   icon: ShoppingBag,   label: 'My Orders'  },
  { to: '/quotes',   icon: FileText,      label: 'My Quotes'  },
  { to: '/queries',  icon: MessageSquare, label: 'My Queries' },
  { to: '/cart',     icon: ShoppingBag,   label: 'Cart'       },
];

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const links = user?.role === 'Admin' ? adminLinks : customerLinks;

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 min-h-screen py-6"
      style={{ backgroundColor: '#D8D6C8', borderRight: '1px solid #CFCAB8' }}>
      <nav className="flex flex-col gap-1 px-3">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive ? 'nav-link-active' : ''
              }`
            }
            style={({ isActive }) => isActive ? {} : { color: '#3F454D' }}
            onMouseEnter={e => { if (!e.currentTarget.classList.contains('nav-link-active')) e.currentTarget.style.backgroundColor = '#CFCAB8'; }}
            onMouseLeave={e => { if (!e.currentTarget.classList.contains('nav-link-active')) e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
