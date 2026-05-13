"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ points: 0, streak: 0, username: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
          const { data: profile, error } = await supabase
          .from("profiles")
          .select(`
            username, 
            is_admin,
            user_stats (points, current_streak)
          `)
          .eq("id", session.user.id)
          .single();

        if (profile && !error) {
          setStats({ 
            points: profile.user_stats?.points,
            streak: profile.user_stats?.current_streak,
            username: profile.username,
            isAdmin: profile.is_admin
          });
        }
      }
      
      setIsLoading(false);
    };
    
    fetchSessionAndProfile();

    window.addEventListener("statsUpdated", fetchSessionAndProfile);
    const { data: { authListener } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchSessionAndProfile(); 
      }
    });

    return () => {
    if (authListener?.subscription) {
      authListener.subscription.unsubscribe();
    }
    window.removeEventListener("statsUpdated", fetchSessionAndProfile);
  };
}, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-white/80 backdrop-blur-md text-black p-5 shadow-sm border-b border-slate-100">
      
      {/* Left: nav and greeting */}
      <div className="flex-1 flex items-center gap-4">
        {user && !isLoading && (
          <>
            <Link href={stats.isAdmin ? "/admin/dashboard" : "/dashboard"} className="text-base font-bold text-slate-500 hover:text-[#00b252] transition-colors flex items-center gap-1 w-fit hover:scale-105">
              Dashboard
            </Link>
            
            {stats.username && (
              <span className="hidden md:inline text-base font-medium text-slate-500 border-l border-slate-200 pl-4">
                Welcome back, <span className="font-bold text-slate-800">{stats.username}</span>!
              </span>
            )}
          </>
        )}
      </div>
      
      {/* Center: logo */}
      <Link href="/" className="hidden md:block text-2xl font-bold flex-1 text-center text-gray-900 hover:text-[#00b252] transition-colors hover:scale-105">
        Simple<span className="text-green-300">Plate</span>
      </Link>
      
      {/* Right: stats and auth */}
      <div className="flex flex-1 justify-end gap-3 items-center">
        {isLoading ? (
          <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-full"></div>
        ) : user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path>
              </svg>
              <span className="text-sm font-extrabold text-orange-600">{stats.streak}</span>
            </div>

            {/* Points */}
            <Link href="/rewards" className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer hover:scale-105">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
              </svg>
              <span className="text-sm font-extrabold text-blue-600">{stats.points}</span>
            </Link>

            {/* Logout */}
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all ml-1 hover:scale-105" title="Logout">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>

          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm md:text-lg font-bold text-[#00b252] hover:underline transition-all">Login</Link>
            <Link href="/register" className="text-sm md:text-lg font-bold text-[#00b252] hover:underline transition-all">Register</Link>
          </div>
        )}
      </div>
    </header>
  );
}