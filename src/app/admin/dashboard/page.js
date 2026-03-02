"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminDashboard() {
  const router = useRouter();
  
  // Auth State
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data State
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // Holds the user we are currently editing
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      // 1. Check if the current user is an admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (profile && profile.is_admin) {
        setIsAdmin(true);
        // 2. Since they are an admin, fetch ALL users!
        fetchUsers();
      } else {
        router.push("/dashboard");
      }
    };

    checkAdminAndFetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }); // Newest users first

    if (!error && data) {
      setUsers(data);
    }
    setIsLoading(false);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setMessage({ text: "Updating user...", type: "loading" });

    // Send the updated data to the profiles table
    const { error } = await supabase
      .from("profiles")
      .update({
        username: editingUser.username,
        points: parseInt(editingUser.points) || 0,
        current_streak: parseInt(editingUser.current_streak) || 0,
        is_admin: editingUser.is_admin
      })
      .eq("id", editingUser.id); // Update the specific user by their ID

    if (error) {
      setMessage({ text: `Error: ${error.message}`, type: "error" });
    } else {
      setMessage({ text: "User updated successfully!", type: "success" });
      setEditingUser(null); 
      fetchUsers(); 
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  if (isLoading && !users.length) return <div className="p-10 text-center font-bold text-slate-500">Loading Admin Portal...</div>;
  if (!isAdmin) return null;

  return (
  <div className="bg-white flex min-h-screen py-30">  
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-2">View and edit SimplePlate user profiles.</p>
        </div>
        <div className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          Total Users: <span className="text-[#00b252]">{users.length}</span>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-2xl font-bold text-sm text-center animate-in fade-in ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
          {message.text}
        </div>
      )}

      {/* --- IF EDITING A USER, SHOW THIS FORM --- */}
      {editingUser ? (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">Editing: {editingUser.email}</h2>
            <button onClick={() => setEditingUser(null)} className="text-sm font-bold text-slate-400 hover:text-red-500">Cancel</button>
          </div>

          <form onSubmit={handleUpdateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-black font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
              <input type="text" value={editingUser.username || ""} onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-black outline-none focus:ring-2 focus:ring-[#00b252]/50" />
            </div>
            
            <div>
              <label className="block text-xs text-black font-bold text-slate-500 uppercase tracking-wider mb-2">Points</label>
              <input type="number" value={editingUser.points || 0} onChange={(e) => setEditingUser({...editingUser, points: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-black outline-none focus:ring-2 focus:ring-[#00b252]/50" />
            </div>

            <div>
              <label className="block text-xs text-black font-bold text-slate-500 uppercase tracking-wider mb-2">Current Streak</label>
              <input type="number" value={editingUser.current_streak || 0} onChange={(e) => setEditingUser({...editingUser, current_streak: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-black outline-none focus:ring-2 focus:ring-[#00b252]/50" />
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

        /* --- IF NOT EDITING, SHOW THE USERS TABLE --- */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-extrabold">
                  <th className="p-4 pl-6">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Points</th>
                  <th className="p-4 text-center">Streak</th>
                  <th className="p-4 text-center">Role</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-800">{u.username || "No Name"}</td>
                    <td className="p-4 text-sm text-slate-500">{u.email}</td>
                    <td className="p-4 text-center font-bold text-blue-600">{u.points}</td>
                    <td className="p-4 text-center font-bold text-orange-500">{u.current_streak}</td>
                    <td className="p-4 text-center">
                      {u.is_admin ? (
                        <span className="bg-purple-100 text-purple-700 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full">Admin</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full">User</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={() => setEditingUser(u)}
                        className="text-xs font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:text-[#00b252] hover:border-[#00b252]/30 hover:bg-green-50 transition-all shadow-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}