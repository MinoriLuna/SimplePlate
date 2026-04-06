"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); 
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (profile && profile.is_admin) {
        setIsAdmin(true);
        await fetchUsers(); 
      } else {
        router.push("/dashboard");
      }
      setIsLoading(false); 
    };

    checkAdminAndFetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, user_stats(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setMessage({ text: "Updating user...", type: "loading" });

    try {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          username: editingUser.username,
          is_admin: editingUser.is_admin
        })
        .eq("id", editingUser.id);

      if (profileErr) throw profileErr;

      const { error: statsErr } = await supabase
        .from("user_stats")
        .update({
          points: parseInt(editingUser.user_stats.points) || 0,
          current_streak: parseInt(editingUser.user_stats.current_streak) || 0,
          total_xp: parseInt(editingUser.user_stats.total_xp) || 0
        })
        .eq("id", editingUser.id);

      if (statsErr) throw statsErr;

      setMessage({ text: "User updated successfully!", type: "success" });
      setEditingUser(null); 
      fetchUsers(); 
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, type: "error" });
    }
  };

  if (isLoading && !users.length) return <div className="p-10 text-center font-bold text-slate-500 uppercase tracking-widest text-xs">Loading Admin Portal...</div>;
  if (!isAdmin) return null;

  return (
    <AnimatePresence mode="wait">
      {isLoading || !isAdmin ? (
        <motion.div
          key="admin-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#F2FFF5] flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <img src="/images/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
          </motion.div>
          <p className="mt-4 text-[10px] font-black text-green-600 uppercase tracking-[0.4em] animate-pulse">
            Authorizing Admin Portal...
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="admin-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F2FFF5] flex min-h-screen no-scrollbar"
        >  
          <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28">
            
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
                <p className="text-slate-500 mt-2">View and edit SimplePlate user profiles.</p>
              </div>
              <div className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl shadow-xl border border-green-200">
                Total Users: <span className="text-[#00b252]">{users.length}</span>
              </div>
            </div>

            {message.text && (
              <div className={`p-4 mb-6 rounded-2xl font-bold text-sm text-center animate-in fade-in ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                {message.text}
              </div>
            )}

            {/* EDITING FORM */}
            {editingUser ? (
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-green-200 mb-8 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6 border-b border-green-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-800">Editing: {editingUser.email}</h2>
                  <button onClick={() => setEditingUser(null)} className="text-sm font-bold text-slate-400 hover:text-red-500 border rounded-3xl px-5 py-1">Cancel</button>
                </div>

                <form onSubmit={handleUpdateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                    <input type="text" value={editingUser.username || ""} onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-black outline-none focus:ring-2 focus:ring-[#00b252]/50" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Points</label>
                    <input type="number" value={editingUser.user_stats?.points || 0} onChange={(e) => setEditingUser({...editingUser, user_stats: {...editingUser.user_stats, points: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-black outline-none focus:ring-2 focus:ring-[#00b252]/50" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Streak</label>
                    <input type="number" value={editingUser.user_stats?.current_streak || 0} onChange={(e) => setEditingUser({...editingUser, user_stats: {...editingUser.user_stats, current_streak: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-black outline-none focus:ring-2 focus:ring-[#00b252]/50" />
                  </div>

                   <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">XP</label>
                    <input type="number" value={editingUser.user_stats?.total_xp || 0} onChange={(e) => setEditingUser({...editingUser, user_stats: {...editingUser.user_stats, total_xp: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-black outline-none focus:ring-2 focus:ring-[#00b252]/50" />
                  </div>

                  <div className="flex items-center mt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={editingUser.is_admin || false} onChange={(e) => setEditingUser({...editingUser, is_admin: e.target.checked})} className="w-5 h-5 rounded text-[#00b252] focus:ring-[#00b252]" />
                      <span className="text-sm font-bold text-slate-700">Grant Admin Privileges</span>
                    </label>
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-md">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl border border-green-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-green-200 text-xs uppercase tracking-wider text-slate-500 font-extrabold">
                        <th className="p-4 pl-6">Username</th>
                        <th className="p-4">Email</th>
                        <th className="p-4 text-center">Points</th>
                        <th className="p-4 text-center">Streak</th>
                        <th className="p-4 text-center">XP</th>
                        <th className="p-4 text-center">Role</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-800">{u.username || "No Name"}</td>
                          <td className="p-4 text-sm text-slate-500">{u.email}</td>
                          <td className="p-4 text-center font-bold text-blue-600">{u.user_stats?.points || 0}</td>
                          <td className="p-4 text-center font-bold text-orange-500">{u.user_stats?.current_streak || 0}</td>
                          <td className="p-4 text-center font-bold text-emerald-500">{u.user_stats?.total_xp || 0}</td>
                          <td className="p-4 text-center">
                            {u.is_admin ? (
                              <span className="bg-purple-100 text-purple-700 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full">Admin</span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full">User</span>
                            )}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button onClick={() => setEditingUser(u)} className="text-xs font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:text-[#00b252] transition-all shadow-sm">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}