import { useState, useEffect } from 'react';

import { LayoutDashboard, Users, AlertTriangle, Settings, Activity, Zap, Map as MapIcon, ChevronRight } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from './lib/firebase';
import './index.css';

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

export default function App() {
  const [occupancy, setOccupancy] = useState<Record<string, number>>({
    North: 3200, South: 4100, East: 1200, West: 2800, Field: 50
  });
  const [queues, setQueues] = useState(INITIAL_QUEUES);
  const [alerts] = useState([
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
      })) as any[];
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
          const mappedQueues = data.map((item: any, index: number) => ({
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

      } catch (err) {
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

  return (
    <div className="app-container">
      
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-icon active"><LayoutDashboard /></div>
        <div className="sidebar-icon"><MapIcon /></div>
        <div className="sidebar-icon"><Users /></div>
        <div className="sidebar-icon"><Activity /></div>
        <div style={{ flex: 1 }}></div>
        <div className="sidebar-icon"><Settings /></div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        
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
            <div className="value">3</div>
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
            <div className="heatmap-container">
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
                {incidentLog.map(a => (
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
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
