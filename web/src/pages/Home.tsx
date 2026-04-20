import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0e14]/70 backdrop-blur-md shadow-[0_8px_32px_rgba(0,240,255,0.08)]">
        <nav className="flex justify-between items-center w-full px-8 py-4 mx-auto max-w-7xl">
          <div className="text-2xl font-bold tracking-tighter text-[#00F0FF] font-['Space_Grotesk']">VenueIQ</div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-[#00F0FF] border-b-2 border-[#00F0FF] pb-1 font-['Manrope']" href="#solutions">Solutions</a>
            <a className="text-slate-400 font-medium font-['Manrope'] hover:text-[#8ff5ff] transition-all duration-300" href="#insights">Insights</a>
            <a className="text-slate-400 font-medium font-['Manrope'] hover:text-[#8ff5ff] transition-all duration-300" href="#security">Security</a>
            <a className="text-slate-400 font-medium font-['Manrope'] hover:text-[#8ff5ff] transition-all duration-300" href="#operations">Operations</a>
          </div>
          <Link to="/dashboard" className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-6 py-2.5 rounded-md font-bold tracking-tight scale-95 active:scale-90 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.3)] inline-block text-center">
            Launch Dashboard
          </Link>
        </nav>
      </header>

      <main className="relative pt-20">
        {/* Background Accents */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(143,245,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(143,245,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-8 py-24 md:py-40 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-surface-container-high border border-outline-variant/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span className="text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-variant">Live System Active</span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline font-bold text-5xl md:text-8xl tracking-tighter text-on-surface max-w-4xl leading-[0.9]"
          >
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Stadium Intelligence</span>
          </motion.h1>

          <p className="mt-8 text-on-surface-variant text-lg md:text-xl max-w-2xl font-light leading-relaxed">
            Unlock high-capacity performance with real-time crowd orchestration, predictive analytics, and kinetic safety protocols designed for the world's most advanced venues.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-6">
            <Link to="/dashboard" className="px-10 py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-extrabold text-lg rounded-md shadow-[0_0_40px_rgba(143,245,255,0.2)] hover:shadow-[0_0_60px_rgba(143,245,255,0.35)] transition-all inline-block text-center">
              Launch Dashboard
            </Link>
            <a href="#solutions" className="px-10 py-5 bg-surface-container-high text-primary font-bold text-lg rounded-md outline outline-1 outline-primary/20 hover:bg-surface-container-highest transition-colors inline-block text-center">
              Explore Solutions
            </a>
          </div>

          {/* Hero Image / Visual Asset */}
          <div className="mt-20 w-full rounded-xl overflow-hidden bg-surface-container-low p-2 border border-outline-variant/10 shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
            <img 
              className="w-full h-[500px] object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
              alt="wide angle cinematic view of a futuristic glowing sports stadium interior at night with neon lights and digital data overlays" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMwAOfO0TrxcoPjM7CEYWFavqylhFwfRX0K8WQ-teenQ8hRDfZy-CP-TFKS31U9AarX6VXtiUR6eMe4iPQJJqQ334K4HJkMZGetT7EiIWZLcdqaJrfpN5TTpjfNcie7wXhJcrmPyCgm8o2X6E7KUPI2ee3sIxj20eggCl1m2pbSgb2qJ_WHaSRlO7pVO3orGKm8h4w2l_vJgLRFvAvxCXFUvE8Sqih3UuySQyzlNdj8mu6JZ4yue6AmyWW-LmI12mbXz81CtYXp2Iz"
            />
            {/* HUD Data Overlays */}
            <div className="absolute top-10 left-10 z-20 hidden md:block">
              <div className="bg-background/60 backdrop-blur-xl p-4 rounded-lg border border-primary/20">
                <div className="text-[10px] text-primary font-bold tracking-widest uppercase mb-1">Live Attendance</div>
                <div className="text-3xl font-headline font-bold text-on-surface tracking-tighter">72,408</div>
                <div className="w-full h-1 bg-surface-container-highest mt-2 rounded-full overflow-hidden">
                  <div className="w-[92%] h-full bg-primary shadow-[0_0_8px_rgba(143,245,255,1)]"></div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-10 right-10 z-20 hidden md:block">
              <div className="bg-background/60 backdrop-blur-xl p-4 rounded-lg border border-secondary/20">
                <div className="text-[10px] text-secondary font-bold tracking-widest uppercase mb-1">System Health</div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-headline font-bold text-on-surface tracking-tighter">99.9%</div>
                  <span className="material-symbols-outlined text-secondary text-sm mb-1">analytics</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="solutions" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
          <div className="mb-16">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface">Engineered for Velocity</h2>
            <div className="h-1 w-20 bg-primary mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group relative p-8 rounded-xl bg-surface-container-low backdrop-blur-lg border border-outline-variant/10 hover:border-primary/40 transition-all duration-500 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
              <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-4">AI Crowd Monitoring</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Computer vision algorithms process live feeds to identify congestion zones and optimize throughput in real-time across all concourse levels.
              </p>
              <div className="mt-8 flex items-center gap-2 text-primary font-bold text-sm tracking-tight cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                VIEW ANALYTICS <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative p-8 rounded-xl bg-surface-container-low backdrop-blur-lg border border-outline-variant/10 hover:border-primary/40 transition-all duration-500 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
              <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-4">Predictive Wait Times</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Forecast queue lengths for entry gates and concessions using historical data and current flow rates to redistribute crowds effectively.
              </p>
              <div className="mt-8 flex items-center gap-2 text-primary font-bold text-sm tracking-tight cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                CONFIGURE MODELS <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative p-8 rounded-xl bg-surface-container-low backdrop-blur-lg border border-outline-variant/10 hover:border-secondary/40 transition-all duration-500 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-colors"></div>
              <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center mb-8 border border-secondary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_maybe</span>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-4">Real-time Safety Alerts</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Instant notification system for security personnel. Automated response protocols for medical emergencies or localized security incidents.
              </p>
              <div className="mt-8 flex items-center gap-2 text-secondary font-bold text-sm tracking-tight cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                ALERTS CENTER <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section id="insights" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
            <div className="md:col-span-2 md:row-span-2 bg-surface-container p-10 rounded-2xl flex flex-col justify-between border border-outline-variant/10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-[12px] font-label font-bold uppercase tracking-[0.2em] text-primary mb-2">Primary Metric</div>
                <h4 className="font-headline font-bold text-4xl text-on-surface">Data-Driven Capacity Management</h4>
              </div>
              <div className="relative z-10 flex items-baseline gap-2">
                <span className="text-7xl font-headline font-bold text-on-surface">24%</span>
                <span className="text-primary text-xl font-bold font-headline leading-none">INCREASE</span>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10">
                <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'wght' 700" }}>hub</span>
              </div>
            </div>
            
            <div className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant/10">
              <div className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Active Nodes</div>
              <div className="text-4xl font-headline font-bold text-on-surface">1,402</div>
              <p className="mt-2 text-xs text-on-surface-variant font-medium">IoT SENSORS DEPLOYED</p>
            </div>
            
            <div className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant/10">
              <div className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Latency</div>
              <div className="text-4xl font-headline font-bold text-on-surface">14ms</div>
              <p className="mt-2 text-xs text-on-surface-variant font-medium">EDGE COMPUTING SPEED</p>
            </div>
            
            <div className="md:col-span-2 bg-gradient-to-br from-surface-container-high to-surface-container p-8 rounded-2xl border border-outline-variant/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-secondary mb-2">Safety Rating</div>
                <div className="text-4xl font-headline font-bold text-on-surface">Tier 1 Elite</div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">verified</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#0a0e14]">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-10 gap-6 max-w-7xl mx-auto">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold text-[#00F0FF] font-['Space_Grotesk']">VenueIQ</div>
            <p className="font-['Manrope'] text-xs tracking-widest uppercase text-slate-500">© 2024 VenueIQ Kinetic Intelligence. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <a className="font-['Manrope'] text-xs tracking-widest uppercase text-slate-500 hover:text-[#00F0FF] transition-colors" href="#">Privacy Policy</a>
            <a className="font-['Manrope'] text-xs tracking-widest uppercase text-slate-500 hover:text-[#00F0FF] transition-colors" href="#">Terms of Service</a>
            <a className="font-['Manrope'] text-xs tracking-widest uppercase text-slate-500 hover:text-[#00F0FF] transition-colors" href="#">Stadium API</a>
            <a className="font-['Manrope'] text-xs tracking-widest uppercase text-slate-500 hover:text-[#00F0FF] transition-colors" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
