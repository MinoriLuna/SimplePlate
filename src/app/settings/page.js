"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FireIcon } from "@/components/icons/Icons";

export default function Settings() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Female");
  const [healthGoal, setHealthGoal] = useState("eat_cleaner");
  const [displayNumbers, setDisplayNumbers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [stats, setStats] = useState({ points: 0, total_xp: 0, current_streak: 0, total_meals: 0 });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      setEmail(session.user.email || "");

      const [profileRes, statsRes, mealsRes] = await Promise.all([
        supabase.from("profiles").select("name, username, gender, health_goal, user_settings (display_numbers)").eq("id", session.user.id).single(),
        supabase.from("user_stats").select("points, total_xp, current_streak").eq("id", session.user.id).single(),
        supabase.from("meals").select("id", { count: "exact", head: true }).eq("user_id", session.user.id),
      ]);

      if (profileRes.data) {
        setName(profileRes.data.name || "");
        setUsername(profileRes.data.username || "");
        setGender(profileRes.data.gender || "Female");
        setHealthGoal(profileRes.data.health_goal || "eat_cleaner");
        if (profileRes.data.user_settings) setDisplayNumbers(profileRes.data.user_settings.display_numbers);
      }

      if (statsRes.data) {
        setStats(prev => ({
          ...prev,
          points: statsRes.data.points || 0,
          total_xp: statsRes.data.total_xp || 0,
          current_streak: statsRes.data.current_streak || 0,
        }));
      }

      if (mealsRes.count !== null) {
        setStats(prev => ({ ...prev, total_meals: mealsRes.count }));
      }
    };
    fetchUserData();
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg("");

    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name cannot be empty.";
    if (!username.trim()) newErrors.username = "Username cannot be empty.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name, username, gender, health_goal: healthGoal })
        .eq("id", session.user.id);
      if (profileError) throw profileError;

      const { error: settingsError } = await supabase
        .from("user_settings")
        .update({ display_numbers: displayNumbers })
        .eq("id", session.user.id);
      if (settingsError) throw settingsError;

      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({ password });
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

  const initial = (name || username || "?").charAt(0).toUpperCase();
  const level = Math.floor((stats.total_xp || 0) / 100) + 1;
  const xpProgress = (stats.total_xp || 0) % 100;

  return (
    <div className="min-h-screen font-sans text-slate-800">

      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 px-5 lg:px-8 py-5">
        <h1 className="text-xl font-black text-slate-900">Profile Settings</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Manage your account details and preferences.</p>
      </div>

      <div className="p-6 lg:p-8">
        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column */}
          <div className="lg:col-span-4 space-y-5">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200/60">
                <span className="text-white font-black text-3xl">{initial}</span>
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-lg">{name || "Your Name"}</h2>
                <p className="text-sm text-slate-400 font-medium mt-0.5">@{username || "username"}</p>
              </div>
              <span className="text-[10px] font-black text-[#00b252] bg-green-50 border border-green-100 px-4 py-1.5 rounded-xl uppercase tracking-widest">
                {gender}
              </span>

              <div className="grid grid-cols-3 gap-2 w-full pt-1 border-t border-slate-100">
                <div className="bg-orange-50 rounded-xl p-2.5 text-center border border-orange-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Streak</p>
                  <p className="font-black text-orange-500 text-sm flex items-center justify-center gap-1">{stats.current_streak}<FireIcon className="w-3.5 h-3.5 text-orange-500" /></p>
                </div>
                <div className="bg-green-50 rounded-xl p-2.5 text-center border border-green-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Points</p>
                  <p className="font-black text-[#00b252] text-sm">{stats.points}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Level</p>
                  <p className="font-black text-slate-700 text-sm">Lv.{level}</p>
                </div>
              </div>

              {/* XP Bar */}
              <div className="w-full">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">XP Progress</span>
                  <span className="text-[10px] font-black text-slate-500">{xpProgress}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>
            </div>

            {/* Preferences Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#00b252]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-sm font-black text-slate-900">Preferences</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-400">
                      {displayNumbers ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm">Display Numbers</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Show exact scores in the app.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDisplayNumbers(!displayNumbers)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
                      displayNumbers ? "bg-[#00b252]" : "bg-slate-300"
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-300 shadow-sm ${
                      displayNumbers ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-5">

            {/* Account Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#00b252]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-sm font-black text-slate-900">Account Details</h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: undefined })); }}
                      placeholder="Your Name"
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder-slate-300 ${
                        errors.name ? "border-red-400 focus:ring-red-300" : "border-slate-200 focus:ring-green-400"
                      }`}
                    />
                    {errors.name && <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Username <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors(p => ({ ...p, username: undefined })); }}
                      placeholder="Username"
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder-slate-300 ${
                        errors.username ? "border-red-400 focus:ring-red-300" : "border-slate-200 focus:ring-green-400"
                      }`}
                    />
                    {errors.username && <p className="text-xs text-red-500 font-semibold mt-1.5">{errors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-slate-900 placeholder-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Gender</label>
                    <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200">
                      {["Male", "Female"].map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setGender(g)}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                            gender === g
                              ? "bg-[#00b252] text-white shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Health Goal</label>
                  <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200">
                    {[
                      { value: "lose_weight", label: "Lose Weight" },
                      { value: "maintain", label: "Maintain" },
                      { value: "eat_cleaner", label: "Eat Cleaner" },
                    ].map((goal) => (
                      <button
                        type="button"
                        key={goal.value}
                        onClick={() => setHealthGoal(goal.value)}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                          healthGoal === goal.value
                            ? "bg-[#00b252] text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#00b252]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-sm font-black text-slate-900">Activity Overview</h2>
                <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">Read-only</span>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</p>
                  <p className="text-2xl font-black text-orange-500">{stats.current_streak}</p>
                  <p className="text-[10px] text-orange-400 font-bold mt-0.5 flex items-center justify-center gap-1">days<FireIcon className="w-3 h-3 text-orange-400" /></p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Points</p>
                  <p className="text-2xl font-black text-[#00b252]">{stats.points}</p>
                  <p className="text-[10px] text-green-400 font-bold mt-0.5">balance</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total XP</p>
                  <p className="text-2xl font-black text-blue-500">{stats.total_xp}</p>
                  <p className="text-[10px] text-blue-400 font-bold mt-0.5">earned</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Meals Logged</p>
                  <p className="text-2xl font-black text-slate-700">{stats.total_meals}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">all time</p>
                </div>
              </div>
            </div>

            {successMsg && (
              <div className={`p-3.5 rounded-xl text-sm text-center font-bold animate-in fade-in zoom-in-95 ${
                successMsg.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
              }`}>
                {successMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#00b252] hover:bg-green-700 active:scale-[0.98] disabled:opacity-70 transition-all shadow-md shadow-green-200"
              >
                {isLoading ? "Saving..." : "Update Profile"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
