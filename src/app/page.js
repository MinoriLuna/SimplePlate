import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-[url('/images/index.png')] bg-cover bg-center flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[580px]">

        {/* Left — brand panel */}
        <div className="hidden md:flex w-[45%] flex-shrink-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 flex-col justify-between p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_25%_75%,white_0%,transparent_65%)]" />

          <div className="relative z-10">
            <span className="text-white font-black text-xl tracking-tight">
              Simple<span className="text-green-300">Plate</span>
            </span>
          </div>

          <div className="relative z-10 space-y-5">
            <h2 className="text-white font-black text-2xl leading-snug mb-2">
              Eat better.<br />Level up your life.
            </h2>

            {[
              {
                desc: "Log meals in seconds with AI vision scanning",
                icon: (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                desc: "Earn XP and level up from Seedling to Master Chef",
                icon: (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                desc: "Build daily streaks and protect your progress",
                icon: (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                ),
              },
              {
                desc: "Get weekly AI-powered nutrition insights",
                icon: (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <p className="text-green-100 text-sm leading-relaxed pt-1">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 w-fit">
              <div className="w-2 h-2 bg-green-300 rounded-full flex-shrink-0" />
              <p className="text-green-200 text-[11px] font-medium">Supporting SDG 3: Good Health and Well-being</p>
            </div>
          </div>
        </div>

        {/* Right — CTA panel */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-12">

          {/* Mobile brand */}
          <div className="md:hidden mb-8">
            <span className="text-slate-900 font-black text-xl">
              Simple<span className="text-[#00b252]">Plate</span>
            </span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              Welcome to<br />SimplePlate
            </h1>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-xs">
              A gentle, gamified way to build healthier eating habits without the pressure of calorie counting.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/register"
              className="block w-full bg-[#00b252] text-white py-3.5 rounded-xl font-black text-sm text-center hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-100"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="block w-full bg-slate-50 text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold text-sm text-center hover:bg-slate-100 active:scale-[0.98] transition-all"
            >
              I already have an account
            </Link>
          </div>

          {/* Mobile SDG */}
          <p className="md:hidden text-xs text-slate-400 mt-8 pt-6 border-t border-slate-100 text-center">
            Supporting SDG 3: Good Health and Well-being
          </p>
        </div>

      </div>
    </div>
  );
}
