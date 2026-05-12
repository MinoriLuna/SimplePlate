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
  const [search, setSearch] = useState("");

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles").select("is_admin").eq("id", session.user.id).single();

      if (profile?.is_admin) {
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
      .from("profiles").select("*, user_stats(*)").order("created_at", { ascending: false });
    if (!error && data) setUsers(data);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setMessage({ text: "Saving...", type: "loading" });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          targetId: editingUser.id,
          username: editingUser.username,
          name: editingUser.name,
          email: editingUser.email,
          gender: editingUser.gender,
          is_admin: editingUser.is_admin,
          points: parseInt(editingUser.user_stats?.points) || 0,
          current_streak: parseInt(editingUser.user_stats?.current_streak) || 0,
          total_xp: parseInt(editingUser.user_stats?.total_xp) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");

      setMessage({ text: "User updated successfully!", type: "success" });
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: `Error: ${err.message}`, type: "error" });
    }
  };

  const filtered = users.filter(u =>
    (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter(u => u.is_admin).length;

  const initials = (u) => (u.username || u.email || "?").slice(0, 2).toUpperCase();

  const avatarColor = (id = "") => {
    const colors = ["bg-violet-500", "bg-blue-500", "bg-teal-500", "bg-orange-500", "bg-pink-500", "bg-emerald-500"];
    return colors[id.charCodeAt(0) % colors.length];
  };

  if (isLoading) return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
        <span className="text-2xl font-black text-slate-900">Simple<span className="text-[#00b252]">Plate</span></span>
      </motion.div>
      <p className="mt-4 text-[10px] font-black text-[#00b252] uppercase tracking-[0.4em] animate-pulse">Authorizing...</p>
    </div>
  );
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-black text-slate-900 text-sm">Admin Portal</span>
            <span className="hidden sm:inline text-[10px] font-black text-[#00b252] bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">SimplePlate</span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to App
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Users</p>
            <p className="text-2xl font-black text-slate-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Admins</p>
            <p className="text-2xl font-black text-violet-600">{adminCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Regular Users</p>
            <p className="text-2xl font-black text-[#00b252]">{users.length - adminCount}</p>
          </div>
        </div>

        {/* Message banner */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`p-3.5 rounded-xl font-bold text-sm text-center ${
                message.type === "error" ? "bg-red-50 text-red-600 border border-red-100" :
                message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" :
                "bg-blue-50 text-blue-600 border border-blue-100"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + table header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-lg font-black text-slate-900">User Management</h1>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-8 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b252] text-slate-800 placeholder-slate-400 w-full sm:w-56"
            />
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Points</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Streak</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">XP</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Role</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 ${avatarColor(u.id)}`}>
                        {initials(u)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{u.username || "—"}</p>
                        <p className="text-xs text-slate-500 leading-tight">{u.name || ""}</p>
                        <p className="text-xs text-slate-400 leading-tight">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center font-black text-blue-500 text-sm">{u.user_stats?.points || 0}</td>
                  <td className="px-5 py-3.5 text-center font-black text-orange-500 text-sm">{u.user_stats?.current_streak || 0}</td>
                  <td className="px-5 py-3.5 text-center font-black text-emerald-500 text-sm">{u.user_stats?.total_xp || 0}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      u.is_admin ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {u.is_admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-3.5 py-1.5 rounded-lg hover:bg-black transition-all"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm font-bold">No users found.</div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${avatarColor(u.id)}`}>
                    {initials(u)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm leading-tight">{u.username || "—"}</p>
                    {u.name && <p className="text-xs text-slate-500 leading-tight">{u.name}</p>}
                    <p className="text-xs text-slate-400 leading-tight truncate max-w-[140px]">{u.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    u.is_admin ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {u.is_admin ? "Admin" : "User"}
                  </span>
                  {u.gender && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                      {u.gender}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pts</p>
                  <p className="font-black text-blue-500 text-sm mt-0.5">{u.user_stats?.points || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Streak</p>
                  <p className="font-black text-orange-500 text-sm mt-0.5">{u.user_stats?.current_streak || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">XP</p>
                  <p className="font-black text-emerald-500 text-sm mt-0.5">{u.user_stats?.total_xp || 0}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(u)}
                className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white rounded-xl hover:bg-black transition-all"
              >
                Edit User
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-sm font-bold">No users found.</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setEditingUser(null)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 p-0 sm:p-4"
            >
              <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Edit User</h2>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{editingUser.email}</p>
                  </div>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleUpdateUser} className="p-6 space-y-5 overflow-y-auto max-h-[70vh] sm:max-h-none">

                  {/* Account Info */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Account Info</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
                        <input
                          type="email"
                          value={editingUser.email || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00b252] focus:border-transparent"
                        />
                        <p className="text-[10px] text-amber-500 font-bold mt-1">Changing email updates both auth and profile.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                          <input
                            type="text"
                            value={editingUser.name || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00b252] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
                          <input
                            type="text"
                            value={editingUser.username || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00b252] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Gender</label>
                        <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200">
                          {["Male", "Female"].map((g) => (
                            <button
                              type="button"
                              key={g}
                              onClick={() => setEditingUser({ ...editingUser, gender: g })}
                              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                (editingUser.gender || "Female") === g
                                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Game Stats */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Game Stats</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Points</label>
                        <input
                          type="number"
                          min="0"
                          value={editingUser.user_stats?.points || 0}
                          onChange={(e) => setEditingUser({ ...editingUser, user_stats: { ...editingUser.user_stats, points: e.target.value } })}
                          className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00b252] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Streak</label>
                        <input
                          type="number"
                          min="0"
                          value={editingUser.user_stats?.current_streak || 0}
                          onChange={(e) => setEditingUser({ ...editingUser, user_stats: { ...editingUser.user_stats, current_streak: e.target.value } })}
                          className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00b252] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total XP</label>
                        <input
                          type="number"
                          min="0"
                          value={editingUser.user_stats?.total_xp || 0}
                          onChange={(e) => setEditingUser({ ...editingUser, user_stats: { ...editingUser.user_stats, total_xp: e.target.value } })}
                          className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00b252] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <label className="flex items-center gap-3 cursor-pointer p-3.5 bg-violet-50 border border-violet-100 rounded-xl">
                    <input
                      type="checkbox"
                      checked={editingUser.is_admin || false}
                      onChange={(e) => setEditingUser({ ...editingUser, is_admin: e.target.checked })}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                    />
                    <div>
                      <p className="text-sm font-black text-slate-800">Grant Admin Privileges</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">User will have access to this portal</p>
                    </div>
                  </label>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="flex-1 py-3 rounded-xl text-sm font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl text-sm font-black text-white bg-slate-900 hover:bg-black transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
