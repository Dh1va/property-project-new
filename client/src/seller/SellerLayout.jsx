import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../components/AuthContext";
import { Link, Outlet } from "react-router-dom";

export default function SellerLayout() {
  const { logout, user } = useContext(AuthContext);

  const items = [
    { label: "Dashboard", path: "/seller", icon: (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
    { label: "My Properties", path: "/seller/properties", icon: (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
    { label: "Add Property", path: "/seller/properties/new", icon: (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 10v6M9 13h6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
  ];

  const logo = (
    <Link to="/seller" className="flex items-center gap-2">
      <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold">S</div>
      <div className="font-semibold">Seller</div>
    </Link>
  );

  const mobileLogout = (
    <button onClick={logout} className="px-2 py-1 border rounded text-sm bg-white text-gray-700 hover:bg-gray-50" title="Logout">
      Logout
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar items={items} logo={logo} rightAction={mobileLogout} />

      <div className="flex-1 relative overflow-y-auto md:pl-64">
        {/* Desktop absolute header */}
        <header className="hidden md:flex items-center justify-end gap-4 px-6 py-3 absolute top-0 right-0 z-20">
          <span className="text-sm text-gray-700 hidden sm:inline">Signed in as <strong>{user?.name}</strong></span>
          <button onClick={logout} className="px-3 py-1 rounded hidden sm:inline border cursor-pointer">Logout</button>
        </header>

        <div className="md:hidden h-14" />

        <main className="p-6 pt-6 md:pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
