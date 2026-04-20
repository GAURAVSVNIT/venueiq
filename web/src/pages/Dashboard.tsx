import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, AlertTriangle, Settings, Activity, Zap, Map as MapIcon, ChevronRight, Video } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { db, analytics } from '../lib/firebase';
import '../index.css';

// --- Mock Data & Simulation Models ---

const ZONES = [
  { id: 'North', capacity: 5000, path: "M50,10 L90,10 L90,30 L50,30 Z" },
  { id: 'South', capacity: 5000, path: "M50,70 L90,70 L90,90 L50,90 Z" },
  { id: 'East',  capacity: 3000, path: "M90,30 L110,30 L110,70 L90,70 Z" },
  { id: 'West',  capacity: 3000, path: "M30,30 L50,30 L50,70 L30,70 Z" },
  { id: 'Field', capacity: 1000, path: "M50,30 L90,30 L90,70 L50,70 Z" }
];

const INITIAL_QUEUES = [
  { id: 1, name: 'North Concessions', type: 'Food', waitTime: 12 },
  { id: 2, name: 'East Restrooms', type: 'Facility', waitTime: 5 },
  { id: 3, name: 'Main Merch Store', type: 'Retail', waitTime: 22 },
  { id: 4, name: 'South Concessions', type: 'Food', waitTime: 18 },
  { id: 5, name: 'West Beer Garden', type: 'Food', waitTime: 8 },
];

export default function Dashboard() {
  const [occupancy, setOccupancy] = useState<Record<string, number>>({
    North: 3200, South: 4100, East: 1200, West: 2800, Field: 50
  });
  const [queues, setQueues] = useState(INITIAL_QUEUES);
  const [alerts] = useState<{ id: string | number; type: string; title: string; msg: string; time: string }[]>([
    { id: 1, type: 'danger', title: 'High Density', msg: 'Zone C occupancy at 94%. Action suggested.', time: 'Just now' },
    { id: 2, type: 'warning', title: 'Queue Spike', msg: 'Main Merch Store wait time > 20 mins.', time: '2 mins ago' }
  ]);

  const [aiStatus, setAiStatus] = useState<string[]>([]);
  const [incidentLog, setIncidentLog] = useState(alerts);

  // Real-time API Integration
  useEffect(() => {
    // 1. Firestore for Alerts (Persistent & Real-time)
    const q = query(collection(db, "incidents"), orderBy("time", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<{ id: string | number; type: string; title: string; msg: string; time: string }>;
      setIncidentLog(docs);
    }, (error) => {
      console.warn("Firestore error (check if project is initialized):", error);
    });

    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        // Fetch AI Analytics
        const res = await fetch(`${apiUrl}/analytics/wait-times`);
        const data = await res.json();
        if (data && data.length > 0) {
          const mappedQueues = data.map((item: {stand: string; status: string; wait_time: number; prediction: string}, index: number) => ({
            id: index + 1,
            name: item.stand,
            type: item.status === 'anomaly' ? 'High Load' : 'Normal',
            waitTime: item.wait_time,
            prediction: item.prediction
          }));
          setQueues(mappedQueues);
        }

        // Fetch Health / Active Models
        const healthRes = await fetch(`${apiUrl}/health`);
        const healthData = await healthRes.json();
        setAiStatus(healthData.models_loaded || []);

      } catch {
        console.warn("Backend not yet reachable, using simulation.");
      }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
      
      // Still simulate crowd shifts for visual flair if backend count isn't hooked to a camera yet
      setOccupancy(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(zone => {
          const maxCap = ZONES.find(z => z.id === zone)?.capacity || 5000;
          const variation = (Math.random() - 0.5) * 0.04;
          next[zone] = Math.max(0, Math.min(maxCap, Math.floor(next[zone] * (1 + variation))));
        });
        return next;
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (analytics) {
      logEvent(analytics, 'select_content', {
        content_type: 'tab',
        item_id: tab
      });
    }
  };

  const totalAttendees = Object.values(occupancy).reduce((a, b) => a + b, 0);

  const getHeatColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.5) return 'rgba(16, 185, 129, 0.4)'; // Green
    if (ratio < 0.8) return 'rgba(245, 158, 11, 0.5)'; // Yellow/Orange
    return 'rgba(239, 68, 68, 0.7)'; // Red
  };

  const getQueueColorClass = (time: number) => {
    if (time < 10) return 'time-good';
    if (time < 20) return 'time-warn';
    return 'time-bad';
  };

  const renderStadiumMap = (height = '100%') => (
    <div className="heatmap-container" style={{ height, minHeight: '300px' }}>
      <svg viewBox="20 0 100 100" className="stadium-map">
        {/* Field */}
        <rect x="40" y="30" width="60" height="40" rx="5" 
              fill={getHeatColor(occupancy.Field, ZONES.find(z=>z.id==='Field')!.capacity)} 
              className="stadium-zone"/>
        {/* North Stand */}
        <path d="M40,15 L100,15 Q100,30 100,30 L40,30 Q40,30 40,15 Z" rx="5"
              fill={getHeatColor(occupancy.North, ZONES.find(z=>z.id==='North')!.capacity)} 
              className="stadium-zone"/>
        {/* South Stand */}
        <path d="M40,70 L100,70 Q100,85 100,85 L40,85 Q40,85 40,70 Z" 
              fill={getHeatColor(occupancy.South, ZONES.find(z=>z.id==='South')!.capacity)} 
              className="stadium-zone"/>
        {/* West Stand */}
        <path d="M25,30 L40,30 L40,70 L25,70 Z" 
              fill={getHeatColor(occupancy.West, ZONES.find(z=>z.id==='West')!.capacity)} 
              className="stadium-zone"/>
        {/* East Stand */}
        <path d="M100,30 L115,30 L115,70 L100,70 Z" 
              fill={getHeatColor(occupancy.East, ZONES.find(z=>z.id==='East')!.capacity)} 
              className="stadium-zone"/>
        
        <text x="70" y="50" fill="white" fontSize="4" textAnchor="middle" dominantBaseline="middle" style={{fontFamily: 'var(--font-sans)', fontWeight: 600}}>PITCH</text>
      </svg>
    </div>
  );

  return (
    <div className="app-container">
      
      {/* Sidebar */}
      <nav className="sidebar" aria-label="Main Navigation">
        <button className={`sidebar-icon ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabChange('dashboard')} title="Dashboard" aria-label="Dashboard"><LayoutDashboard /></button>
        <button className={`sidebar-icon ${activeTab === 'map' ? 'active' : ''}`} onClick={() => handleTabChange('map')} title="Map Analytics" aria-label="Map Analytics"><MapIcon /></button>
        <button className={`sidebar-icon ${activeTab === 'cameras' ? 'active' : ''}`} onClick={() => handleTabChange('cameras')} title="Live Cameras" aria-label="Live Cameras"><Video /></button>
        <button className={`sidebar-icon ${activeTab === 'people' ? 'active' : ''}`} onClick={() => handleTabChange('people')} title="Staff & Attendees" aria-label="Staff and Attendees"><Users /></button>
        <button className={`sidebar-icon ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => handleTabChange('analytics')} title="Advanced Analytics" aria-label="Advanced Analytics"><Activity /></button>
        <div style={{ flex: 1 }}></div>
        <button className={`sidebar-icon ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabChange('settings')} title="Settings" aria-label="Settings"><Settings /></button>
      </nav>

      {/* Main Content */}
      <main className="main-content" role="main">
        
        {/* Header */}
        <header className="top-header">
          <div className="header-title-container">
            <h1 className="logo-glow">VenueIQ</h1>
            <div className="event-badge">
              <div className="live-dot"></div>
              LIVE: Global Tech Arena
            </div>
            {aiStatus.length > 0 && (
              <div className="ai-active-badge">
                <Activity size={12}/> AI ACTIVE: {aiStatus.join(', ')}
              </div>
            )}
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>System Status:</span>&nbsp;
            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Optimal</span>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            {/* Stats Row */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="label"><Users size={16}/> Total Attendance</div>
                <div className="value">{totalAttendees.toLocaleString()}</div>
                <div className="trend up">+2%</div>
              </div>
              <div className="stat-card">
                <div className="label"><Activity size={16}/> Avg Wait Time</div>
                <div className="value">
                  {Math.floor(queues.reduce((a,b) => a + b.waitTime, 0) / queues.length)}m
                </div>
                <div className="trend down">-1m</div>
              </div>
              <div className="stat-card">
                <div className="label"><AlertTriangle size={16}/> Active Incidents</div>
                <div className="value">{incidentLog.length}</div>
                <div className="trend neutral">0</div>
              </div>
              <div className="stat-card">
                <div className="label"><Zap size={16}/> Staff Deployed</div>
                <div className="value">142</div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="dashboard-grid">
              
              {/* Heatmap Panel */}
              <div className="glass-panel" style={{ gridRow: 'span 2' }}>
                <div className="panel-header">
                  <h2 className="panel-title"><MapIcon size={20}/> Live Crowd Density Map</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Updating every 3s</span>
                </div>
                {renderStadiumMap()}
              </div>

              <div className="right-stack">
                {/* Queues Panel */}
                <div className="glass-panel" style={{ flex: 1, minHeight: 0 }}>
                  <div className="panel-header" style={{ marginBottom: '1rem' }}>
                    <h2 className="panel-title"><Zap size={20}/> Queue Status</h2>
                  </div>
                  <div className="queue-list">
                    {queues.sort((a,b) => b.waitTime - a.waitTime).map(q => (
                      <div key={q.id} className="queue-item">
                        <div className="queue-info">
                          <h4>{q.name}</h4>
                          <p>{q.type}</p>
                        </div>
                        <div className={`queue-time ${getQueueColorClass(q.waitTime)}`}>
                          {q.waitTime}m
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alerts Panel */}
                <div className="glass-panel" style={{ flex: 1.2, minHeight: 0 }}>
                  <div className="panel-header" style={{ marginBottom: '1rem' }}>
                    <h2 className="panel-title"><AlertTriangle size={20}/> Incident Log</h2>
                  </div>
                  <div className="alerts-feed">
                    {incidentLog.length > 0 ? incidentLog.map(a => (
                      <div key={a.id} className={`alert-card ${a.type}`}>
                        <div className="alert-header">
                          <span>{a.title}</span>
                          <span>{a.time}</span>
                        </div>
                        <div className="alert-msg">{a.msg}</div>
                        {a.type === 'critical' && (
                          <button className="dispatch-btn">
                            Dispatch Nearest Staff <ChevronRight size={14}/>
                          </button>
                        )}
                      </div>
                    )) : (
                      <div style={{ color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center' }}>No active incidents</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'map' && (
          <div className="map-view" style={{ position: 'relative', height: 'calc(100vh - 120px)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'absolute', inset: 0, background: '#0a0e14' }}>
              {renderStadiumMap('100%')}
            </div>
            
            {/* Overlay Panels */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', pointerEvents: 'none', display: 'flex', justifyContent: 'space-between' }}>
               <div className="glass-panel" style={{ pointerEvents: 'auto', padding: '1.5rem', width: '350px', background: 'rgba(10, 14, 20, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,240,255,0.1)' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapIcon size={20} color="#00F0FF" /> Live Zone Analytics
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {Object.entries(occupancy).map(([zone, count]) => {
                        const maxCap = ZONES.find(z => z.id === zone)?.capacity || 5000;
                        const percentage = Math.round((count / maxCap) * 100);
                        return (
                          <div key={zone}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{zone} Zone</span>
                                <span style={{ fontWeight: 'bold', color: percentage > 80 ? 'var(--warning)' : 'var(--text-primary)' }}>{count.toLocaleString()} / {maxCap.toLocaleString()}</span>
                             </div>
                             <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${percentage}%`, background: percentage > 80 ? 'var(--warning)' : 'var(--success)' }}></div>
                             </div>
                          </div>
                        )
                     })}
                  </div>
               </div>

               <div className="glass-panel" style={{ pointerEvents: 'auto', padding: '1.5rem', width: '300px', background: 'rgba(10, 14, 20, 0.75)', backdropFilter: 'blur(20px)', height: 'fit-content', border: '1px solid rgba(0,240,255,0.1)' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Venue Occupancy</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00F0FF', marginBottom: '0.5rem' }}>{totalAttendees.toLocaleString()}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--success)' }}>+450 in last 15 mins</div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'people' && (
          <div className="glass-panel" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div className="panel-header" style={{ marginBottom: '2rem' }}>
              <h2 className="panel-title"><Users size={20}/> Staff & Attendance Management</h2>
            </div>
            
            <div className="stats-row" style={{ marginBottom: '3rem' }}>
               <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(0,0,0,0) 100%)', borderColor: 'rgba(0,240,255,0.2)' }}>
                  <div className="label">Total Attendees</div>
                  <div className="value" style={{ color: '#00F0FF' }}>{totalAttendees.toLocaleString()}</div>
               </div>
               <div className="stat-card">
                  <div className="label">Staff On-Site</div>
                  <div className="value">142</div>
               </div>
               <div className="stat-card">
                  <div className="label">VIP Guests</div>
                  <div className="value">345</div>
               </div>
               <div className="stat-card">
                  <div className="label">Incidents Handled</div>
                  <div className="value">18</div>
               </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Active Staff Deployment</h3>
                <div className="queue-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {[
                     { id: 1, name: 'Security Team Alpha', zone: 'North Stand', status: 'Active', avatar: 'SA' },
                     { id: 2, name: 'Medical Unit 1', zone: 'West Stand', status: 'Standby', avatar: 'M1' },
                     { id: 3, name: 'Guest Services', zone: 'Main Merch Store', status: 'Busy', avatar: 'GS' },
                     { id: 4, name: 'Security Team Beta', zone: 'South Concessions', status: 'Active', avatar: 'SB' },
                     { id: 5, name: 'Maintenance Crew', zone: 'East Restrooms', status: 'Dispatched', avatar: 'MC' }
                   ].map(staff => (
                     <div key={staff.id} className="queue-item" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#00F0FF' }}>{staff.avatar}</div>
                        <div className="queue-info" style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{staff.name}</h4>
                          <p style={{ fontSize: '0.85rem' }}>{staff.zone}</p>
                        </div>
                        <div className={`queue-time ${staff.status === 'Active' ? 'time-good' : staff.status === 'Busy' ? 'time-bad' : 'time-warn'}`} style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem' }}>
                          {staff.status}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
              
              <div>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>VIP Guest Status</h3>
                <div className="queue-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {[
                     { id: 1, name: 'Michael Chen', tier: 'Platinum', location: 'VIP Lounge A', time: 'Arrived 10:45 AM' },
                     { id: 2, name: 'Sarah Jenkins', tier: 'Diamond', location: 'Suite 104', time: 'Arrived 11:15 AM' },
                     { id: 3, name: 'David Ross', tier: 'Platinum', location: 'North Entrance', time: 'Expected 1:00 PM' },
                   ].map(vip => (
                     <div key={vip.id} className="queue-item" style={{ marginBottom: 0, padding: '1rem 1.5rem' }}>
                        <div className="queue-info" style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             {vip.name}
                             <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: vip.tier === 'Diamond' ? 'rgba(0,240,255,0.15)' : 'rgba(255,86,239,0.15)', color: vip.tier === 'Diamond' ? '#00F0FF' : '#FF56EF', border: `1px solid ${vip.tier === 'Diamond' ? 'rgba(0,240,255,0.3)' : 'rgba(255,86,239,0.3)'}` }}>
                               {vip.tier}
                             </span>
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{vip.location}</p>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                           {vip.time}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glass-panel" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div className="panel-header" style={{ marginBottom: '2rem' }}>
              <h2 className="panel-title"><Activity size={20}/> Advanced Analytics</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
               <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Hourly Attendance Trend</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '10px', paddingTop: '20px' }}>
                     {[45, 60, 75, 90, 85, 95, 100, 80].map((val, i) => (
                       <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '100%', background: `linear-gradient(to top, rgba(0,240,255,0.2), rgba(0,240,255,${val/100}))`, height: `${val}%`, borderRadius: '4px 4px 0 0', position: 'relative', borderTop: '2px solid #00F0FF' }}>
                             <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{val*100}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{i+1}PM</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Queue Load Distribution</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', justifyContent: 'center', height: '200px' }}>
                     {[
                       { name: 'Food & Beverage', val: 45, color: '#FF56EF' },
                       { name: 'Merchandise', val: 30, color: '#00F0FF' },
                       { name: 'Restrooms', val: 15, color: 'var(--warning)' },
                       { name: 'Entrances', val: 10, color: 'var(--success)' },
                     ].map((item, i) => (
                        <div key={i}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                              <span>{item.name}</span>
                              <span>{item.val}%</span>
                           </div>
                           <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${item.val}%`, background: item.color }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'cameras' && (
          <div className="glass-panel" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div className="panel-header" style={{ marginBottom: '2rem' }}>
              <h2 className="panel-title"><Video size={20}/> Security & Live Camera Feeds</h2>
              <span className="ai-active-badge"><Activity size={12}/> AI Analysis Active</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
               {/* Cam 1 */}
               <div className="queue-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                   <span style={{ fontWeight: 'bold' }}><Video size={14} style={{ display: 'inline', marginRight: '5px' }}/> CAM 01 - North Gate</span>
                   <span style={{ color: 'var(--success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><div className="live-dot" style={{ position: 'static', transform: 'none' }}></div> LIVE</span>
                 </div>
                 <div style={{ width: '100%', height: '180px', background: '#0a0a0a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    [YOLOv8 Stream Feed Placeholder]
                 </div>
                 <div style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Detected: 42 people | Status: <span style={{color: 'var(--success)'}}>Normal</span></div>
               </div>
               {/* Cam 2 */}
               <div className="queue-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                   <span style={{ fontWeight: 'bold' }}><Video size={14} style={{ display: 'inline', marginRight: '5px' }}/> CAM 02 - Main Merch Store</span>
                   <span style={{ color: 'var(--success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><div className="live-dot" style={{ position: 'static', transform: 'none' }}></div> LIVE</span>
                 </div>
                 <div style={{ width: '100%', height: '180px', background: '#0a0a0a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    [YOLOv8 Stream Feed Placeholder]
                 </div>
                 <div style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--warning)' }}>Detected: 105 people | Status: <span style={{color: 'var(--warning)'}}>Crowded</span></div>
               </div>
               {/* Cam 3 */}
               <div className="queue-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                   <span style={{ fontWeight: 'bold' }}><Video size={14} style={{ display: 'inline', marginRight: '5px' }}/> CAM 03 - East Restrooms</span>
                   <span style={{ color: 'var(--success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><div className="live-dot" style={{ position: 'static', transform: 'none' }}></div> LIVE</span>
                 </div>
                 <div style={{ width: '100%', height: '180px', background: '#0a0a0a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    [YOLOv8 Stream Feed Placeholder]
                 </div>
                 <div style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Detected: 12 people | Status: <span style={{color: 'var(--success)'}}>Normal</span></div>
               </div>
               {/* Cam 4 */}
               <div className="queue-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                   <span style={{ fontWeight: 'bold' }}><Video size={14} style={{ display: 'inline', marginRight: '5px' }}/> CAM 04 - VIP Entrance</span>
                   <span style={{ color: 'var(--success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><div className="live-dot" style={{ position: 'static', transform: 'none' }}></div> LIVE</span>
                 </div>
                 <div style={{ width: '100%', height: '180px', background: '#0a0a0a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    [YOLOv8 Stream Feed Placeholder]
                 </div>
                 <div style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Detected: 8 people | Status: <span style={{color: 'var(--success)'}}>Normal</span></div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div className="panel-header" style={{ marginBottom: '2rem' }}>
              <h2 className="panel-title"><Settings size={20}/> System Settings</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
               <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ marginBottom: '1rem' }}>AI Model Configuration</h3>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.5rem 0' }}>
                     <span>YOLOv8 Crowd Detection</span>
                     <span style={{ color: 'var(--background)', background: 'var(--success)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Enabled</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.5rem 0' }}>
                     <span>Predictive Wait Times</span>
                     <span style={{ color: 'var(--background)', background: 'var(--success)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Enabled</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.5rem 0' }}>
                     <span>Facial Recognition (VIPs)</span>
                     <span style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Disabled</span>
                  </div>
               </div>

               <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Notification Preferences</h3>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.5rem 0' }}>
                     <span>Critical Incident SMS</span>
                     <span style={{ color: 'var(--background)', background: 'var(--success)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Active</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.5rem 0' }}>
                     <span>Staff Auto-Dispatch</span>
                     <span style={{ color: 'var(--background)', background: 'var(--warning)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Manual Only</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.5rem 0' }}>
                     <span>Daily Summary Reports</span>
                     <span style={{ color: 'var(--background)', background: 'var(--success)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Active</span>
                  </div>
               </div>
            </div>
            
            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
               <button className="dispatch-btn" style={{ padding: '0.8rem 2rem' }}>Save Changes</button>
               <button className="dispatch-btn" style={{ padding: '0.8rem 2rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)' }}>Reset Defaults</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
