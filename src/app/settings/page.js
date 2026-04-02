"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Settings() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Female");
  const [displayNumbers, setDisplayNumbers] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // 1. Fetch user data with the NEW JOIN structure
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          name, 
          username, 
          gender, 
          user_settings (display_numbers)
        `)
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setName(profile.name || "");
        setUsername(profile.username || "");
        setGender(profile.gender || "Female");
        
        // Access nested settings data
        if (profile.user_settings) {
          setDisplayNumbers(profile.user_settings.display_numbers);
        }
      }
    };
    
    fetchUserData();
  }, [router]);

  // 2. Updated multi-table update function
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Update Table 1: Profiles (Identity)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: name,
          username: username,
          gender: gender,
        })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      // Update Table 2: User Settings (Preferences)
      const { error: settingsError } = await supabase
        .from("user_settings")
        .update({
          display_numbers: displayNumbers
        })
        .eq("id", session.user.id);

      if (settingsError) throw settingsError;

      // Secure Auth update if password changed
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        });
        if (passwordError) throw passwordError;
        setPassword(""); 
      }

      setSuccessMsg("Settings updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      
    } catch (err) {
      setSuccessMsg(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- YOUR EXACT LAYOUT BELOW (NO CHANGES) ---
  return (
    <div className="min-h-[100dvh] bg-[#F2FFF5] flex items-center justify-center p-4 sm:p-8 font-sans text-slate-800">
      
      <main className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-green-200 p-8 sm:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Profile Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Update your account details and preferences.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-slate-900 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Gender</label>
              <div className="bg-white p-1 rounded-2xl flex justify-between items-center border border-slate-200">
                {["Male", "Female"].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                      gender === g
                        ? "bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-slate-100 my-8" />

          {/* Numeric Toggle Section */}
          <div className="bg-[#f4f7fb] border border-slate-100 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex gap-4 items-center pr-4">
              <div className="text-slate-400 opacity-60">
                {displayNumbers ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Display Numeric Values</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs">
                  Show exact calories and scores across the app. We recommend keeping this off for a stress-free experience.
                </p>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={() => setDisplayNumbers(!displayNumbers)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${
                displayNumbers ? 'bg-slate-800' : 'bg-[#cbd5e1]'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-300 shadow-sm ${
                displayNumbers ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {successMsg && (
            <div className="p-3 bg-green-50 text-green-700 border border-green-100 rounded-xl text-sm text-center font-bold animate-in fade-in zoom-in-95">
              {successMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-1/3 py-3.5 rounded-2xl text-sm font-bold text-slate-600 bg-[#f8fafc] hover:bg-slate-100 active:scale-[0.98] transition-all border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-2/3 py-3.5 rounded-2xl text-sm font-bold text-white bg-[#27272a] hover:bg-black active:scale-[0.98] disabled:opacity-70 transition-all shadow-md"
            >
              {isLoading ? "Saving..." : "Update Profile"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}