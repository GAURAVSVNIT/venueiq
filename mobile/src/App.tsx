import React, { useState, useEffect } from 'react';
import { MapPin, Coffee, ShoppingBag, Ticket, Navigation, Compass, Map, User, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const MOCK_DATA = {
  events: {
    name: 'Global Tech Arena',
    seat: 'Block B, Row 12, Seat 45',
    time: '7:00 PM',
    venue: 'Innovation Stadium'
  },
  categories: [
    { id: 'food', label: 'Food', icon: Coffee, color: '#f59e0b' },
    { id: 'restrooms', label: 'Restrooms', icon: MapPin, color: '#10b981' },
    { id: 'merch', label: 'Merch', icon: ShoppingBag, color: '#4f46e5' },
    { id: 'tickets', label: 'Tickets', icon: Ticket, color: '#ec4899' },
  ],
  locations: [
    { id: 1, name: 'Burger Joint • Gate 2', time: 4, type: 'fast', category: 'food', distance: '50m' },
    { id: 2, name: 'Pizza Hub • Gate 4', time: 15, type: 'med', category: 'food', distance: '120m' },
    { id: 3, name: 'Main Restrooms • North', time: 2, type: 'fast', category: 'restrooms', distance: '30m' },
    { id: 4, name: 'Team Store • East', time: 25, type: 'med', category: 'merch', distance: '200m' },
    { id: 5, name: 'Fan Zone', time: 0, type: 'fast', category: 'merch', distance: '100m' },
  ]
};


export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [navigating, setNavigating] = useState(false);
  const [distance, setDistance] = useState("120m");

  // Simulate movement if navigating
  useEffect(() => {
    if (navigating) {
      let currentDist = 120;
      const interval = setInterval(() => {
        currentDist -= Math.floor(Math.random() * 5);
        if (currentDist <= 0) {
          setDistance("Arrived");
          clearInterval(interval);
          setTimeout(() => setNavigating(false), 2000);
        } else {
          setDistance(currentDist + "m");
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [navigating]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering locations for wait times list (Explore) or Search
  const filteredLocations = selectedCategory 
    ? MOCK_DATA.locations.filter(l => l.category === selectedCategory)
    : MOCK_DATA.locations;

  const searchResults = searchQuery
    ? MOCK_DATA.locations.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const renderHome = () => (
    <>
      <AnimatePresence mode="wait">
        {!navigating ? (
          <motion.div 
            key="default"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="context-card"
          >
            <span className="context-label">Current Event</span>
            <h2 className="context-title">{MOCK_DATA.events.name}</h2>
            <p className="context-sub">Your Seat: {MOCK_DATA.events.seat}</p>
            
            <button className="btn-primary" onClick={() => setNavigating(true)}>
              <Navigation size={18} /> Route to Seat
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="navigating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="context-card"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
          >
            <span className="context-label">Navigating to Seat</span>
            <h2 className="context-title">{distance}</h2>
            <p className="context-sub">Turn right at Concourse C.</p>
            
            <button 
              className="btn-primary" 
              style={{ color: '#059669' }}
              onClick={() => setNavigating(false)}
            >
              Cancel Route
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div>
        <div className="section-header">
          <h3>Quick Actions</h3>
          {selectedCategory && (
            <span className="see-all" onClick={() => setSelectedCategory(null)}>Clear</span>
          )}
        </div>
        <div className="action-grid">
          {MOCK_DATA.categories.map(cat => (
            <div 
              key={cat.id} 
              className={`action-item ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
            >
              <div className="action-icon" style={{ color: selectedCategory === cat.id ? 'white' : cat.color, backgroundColor: selectedCategory === cat.id ? cat.color : undefined }}>
                <cat.icon size={24}/>
              </div>
              <span className="action-label">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wait Times / Results */}
      <div>
        <div className="section-header">
          <h3>{selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} near you` : 'Nearest to you'}</h3>
          {!selectedCategory && <span className="see-all">See all</span>}
        </div>
        
        {filteredLocations.map(item => (
          <div key={item.id} className="time-card">
            <div className="time-info">
              <h4>{item.name}</h4>
              <p>{item.distance} • Current Flow</p>
            </div>
            <div className={`time-badge ${item.type}`}>
              {item.time}m wait
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderMap = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="map-view"
    >
      <div className="map-placeholder">
        <div className="map-grid"></div>
        <div className="venue-outline">
          <div className="venue-section">A</div>
          <div className="venue-section active">B</div>
          <div className="venue-section">C</div>
          <div className="venue-section">D</div>
        </div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="user-dot"
        />
        <div className="poi restroom" style={{ top: '20%', left: '30%' }}><MapPin size={12}/></div>
        <div className="poi food" style={{ top: '60%', left: '70%' }}><Coffee size={12}/></div>
      </div>
      <div className="map-controls">
        <button className="map-btn"><Navigation size={20}/></button>
      </div>
    </motion.div>
  );

  const renderSearch = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="search-view">
      <div className="search-bar-container">
        <Search size={20} className="search-icon-inner" />
        <input 
          type="text" 
          placeholder="Search for food, shops, or gates..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>
      
      {searchQuery ? (
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map(item => (
              <div key={item.id} className="time-card">
                <div className="time-info">
                  <h4>{item.name}</h4>
                  <p>{item.category} • {item.distance}</p>
                </div>
                <ArrowRight size={18} color="#94a3b8" />
              </div>
            ))
          ) : (
            <div className="empty-state">No locations found for "{searchQuery}"</div>
          )}
        </div>
      ) : (
        <div className="suggested-searches">
          <h4>Suggested</h4>
          <div className="pill-container">
            {['Pizza', 'Restrooms', 'Gate 2', 'Help Desk'].map(s => (
              <span key={s} className="pill" onClick={() => setSearchQuery(s)}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="profile-view">
      <div className="ticket-card">
        <div className="ticket-header">
          <h3>DIGITAL TICKET</h3>
          <p>{MOCK_DATA.events.name}</p>
        </div>
        <div className="ticket-body">
          <div className="ticket-qr">
            <div className="qr-box">
              {[...Array(9)].map((_, i) => <div key={i} className="qr-dot" />)}
            </div>
          </div>
          <div className="ticket-info">
            <div>
              <span>SECTION</span>
              <p>Block B</p>
            </div>
            <div>
              <span>ROW</span>
              <p>12</p>
            </div>
            <div>
              <span>SEAT</span>
              <p>45</p>
            </div>
          </div>
        </div>
        <div className="ticket-footer">
          <p>Doors open at 5:30 PM</p>
          <div className="barcode"></div>
        </div>
      </div>
      
      <div className="menu-list">
        <div className="menu-item"><User size={20}/> Account Settings <ArrowRight size={16}/></div>
        <div className="menu-item"><Ticket size={20}/> Past Events <ArrowRight size={16}/></div>
        <div className="menu-item"><Map size={20}/> Venue Access Map <ArrowRight size={16}/></div>
      </div>
    </motion.div>
  );

  return (
    <div className="mobile-app">
      
      {/* App Bar (Don't show in Map View for full screen feel) */}
      {activeTab !== 'map' && (
        <div className="app-bar">
          <div className="greeting">
            <p>{activeTab === 'profile' ? 'Your Identity' : 'Welcome back,'}</p>
            <h1>{activeTab === 'profile' ? 'Alex Johnson' : 'Alex! 👋'}</h1>
          </div>
          <div className="profile-pic">A</div>
        </div>
      )}

      {/* Main Content */}
      <div className={`content-area ${activeTab === 'map' ? 'full-screen' : ''}`}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'map' && renderMap()}
        {activeTab === 'search' && renderSearch()}
        {activeTab === 'profile' && renderProfile()}
      </div>


      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Compass size={24} />
          <span className="nav-label">Explore</span>
        </div>
        <div className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
          <Map size={24} />
          <span className="nav-label">Map</span>
        </div>
        <div className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
          <Search size={24} />
          <span className="nav-label">Search</span>
        </div>
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={24} />
          <span className="nav-label">Profile</span>
        </div>
      </div>
    </div>
  );
}
