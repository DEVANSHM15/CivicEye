import React, { useState, useEffect, useRef } from 'react';
import MapPicker from './components/MapPicker';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { 
  ShieldCheck, LayoutDashboard, FileSignature, 
  LogOut, MapPin, Search, Zap, AlertTriangle, 
  Map as MapIcon, Image as ImageIcon, ChevronRight 
} from 'lucide-react';

const SkeletonCard = () => (
  <div className="ui-card flex flex-col" style={{ padding: '1.5rem', gap: '1rem', minHeight: '250px' }}>
    <div style={{ height: '14px', width: '35%', background: 'var(--border-color)', borderRadius: '4px', animation: 'pulse-mesh 2s infinite' }}></div>
    <div style={{ height: '24px', width: '75%', background: 'var(--bg-surface-elevated)', borderRadius: '6px', animation: 'pulse-mesh 2s infinite', animationDelay: '0.2s' }}></div>
    <div style={{ height: '60px', width: '100%', background: 'var(--bg-surface-elevated)', borderRadius: '6px', animation: 'pulse-mesh 2s infinite', animationDelay: '0.4s' }}></div>
    <div style={{ height: '1px', width: '100%', background: 'var(--border-color)', marginTop: 'auto' }}></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
      <div style={{ height: '14px', width: '25%', background: 'var(--border-color)', borderRadius: '4px' }}></div>
      <div style={{ height: '14px', width: '15%', background: 'var(--border-color)', borderRadius: '4px' }}></div>
    </div>
  </div>
);

const TypewriterText = ({ words }) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    let timer = setTimeout(() => {
      const i = loopNum % words.length;
      const fullText = words[i];

      if (isDeleting) {
        setText(fullText.substring(0, text.length - 1));
        setTypingSpeed(40);
      } else {
        setText(fullText.substring(0, text.length + 1));
        setTypingSpeed(100);
      }

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    }, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, words]);

  return (
    <>
      <span className="text-gradient-accent">{text}</span>
      <span className="cursor-blink"></span>
    </>
  );
};

function App() {
  const [view, setView] = useState('home');
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLists, setIsFetchingLists] = useState(false);
  const squareRef = useRef(null);

  // --- ANIME JS EFFECT ---
  useEffect(() => {
    if (view === 'home' && squareRef.current) {
      if (window.anime) {
        window.anime({
          targets: squareRef.current,
          translateX: '15rem',
          scale: 1.25,
          skew: '-45deg',
          rotate: '1turn',
          duration: 2000,
          direction: 'alternate',
          loop: true,
          easing: 'easeInOutSine'
        });
      } else {
        console.error("AnimeJS CDN script not loaded on window object.");
      }
    }
  }, [view]);

  // Auth State
  const [user, setUser] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastructure / Roads');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      setView('dashboard'); // Auto-route to dashboard if logged in
    }
  }, []);

  useEffect(() => {
    if (view === 'dashboard') {
      fetchComplaints();
    }
  }, [view, user]);

  const fetchComplaints = async () => {
    if (!user) {
      setComplaints([]);
      return;
    }
    setIsFetchingLists(true);
    try {
      // --- TEMPORARY NETWORK THROTTLE FOR TESTING SKELETONS ---
      // We force a 2.5 second delay because localhost MongoDB fetches are usually too fast (5ms) to see the skeleton!
      await new Promise(resolve => setTimeout(resolve, 2500));

      const url = user.role === 'Admin' 
        ? 'http://localhost:5000/api/complaints/all' 
        : 'http://localhost:5000/api/complaints/my';
      
      const response = await fetch(url, { headers: { Authorization: `Bearer ${user.token}` } });
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to communicate with diagnostic servers.');
    } finally {
      setIsFetchingLists(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setView('home');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const url = isLoginMode ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        setAuthForm({ name: '', email: '', password: '' });
        setView('dashboard');
        toast.success(`Welcome back, ${data.name}!`);
      } else {
        toast.error(data.message || 'Authentication sequence failed.');
      }
    } catch (error) {
      console.error('Auth Error:', error);
      toast.error('Network disconnect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to submit.");
    if (!title || !description || !location.lat) return alert("Please fill all required fields and pinpoint the map.");

    setIsLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);
    if (image) formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/api/complaints/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      if (response.ok) {
        setTitle(''); setDescription(''); setImage(null); setLocation({ lat: null, lng: null });
        setView('dashboard'); 
        toast.success('Civic Issue officially logged in the system.');
      } else {
        toast.error('Failed to submit anomaly. Please verify target variables.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Local connection lost during submission sequence.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const updatedComplaint = await response.json();
        setComplaints(complaints.map(c => (c._id === id ? updatedComplaint : c)));
      }
    } catch (err) { console.error("Status update error", err); }
  };

  // --- RENDERING HELPERS ---
  
  const renderSidebar = () => (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', color: 'var(--accent-primary)' }}>
        <ShieldCheck size={32} />
        <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>CivicEye</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: view === 'dashboard' ? 'var(--bg-surface-hover)' : 'transparent', color: view === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)' }} onClick={() => setView('dashboard')}>
          <LayoutDashboard size={18} /> {user.role === 'Admin' ? 'Admin Dashboard' : 'My Complaints'}
        </button>
        {user.role === 'Customer' && (
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: view === 'report' ? 'var(--bg-surface-hover)' : 'transparent', color: view === 'report' ? 'var(--text-primary)' : 'var(--text-secondary)' }} onClick={() => setView('report')}>
            <FileSignature size={18} /> Report an Issue
          </button>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <div style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.name}</p>
          <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          {user.role === 'Admin' && <span className="badge badge-resolved" style={{ marginTop: '0.5rem', padding: '0.2rem 0.5rem' }}>Execution Level</span>}
        </div>
        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', color: '#fca5a5' }} onClick={handleLogout}>
          <LogOut size={16} /> Secure Logout
        </button>
      </div>
    </aside>
  );

  // Prepare Admin Chart Data
  const statsData = [
    { name: 'Pending', value: complaints.filter(c => c.status === 'Pending').length, color: '#f59e0b' },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length, color: '#2563EB' },
    { name: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length, color: '#22c55e' }
  ];

  // If user is logged in, wrap the app in the Sidebar Software Layout
  if (user) {
    return (
      <div className="app-layout">
        <Toaster richColors position="bottom-right" />
        {renderSidebar()}
        <main className="main-content">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                  <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Recent Complaints</h1>
                    <p style={{ color: 'var(--text-muted)' }}>View and manage civic issues in your area.</p>
                  </div>
                  {user.role === 'Customer' && (
                    <button className="btn btn-primary" onClick={() => setView('report')}>Report an Issue <ChevronRight size={16}/></button>
                  )}
                </div>

                {/* Analytics Chart purely for Admins */}
                {user.role === 'Admin' && complaints.length > 0 && !isFetchingLists && (
                  <div className="ui-card mb-8" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                     <h3 style={{ marginBottom: '1.5rem' }}>Resolution Metrics</h3>
                     <div style={{ height: '220px', width: '100%' }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={statsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} allowDecimals={false} />
                           <Tooltip cursor={{fill: 'var(--bg-surface-elevated)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', background: 'var(--bg-surface)' }} />
                           <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                             {statsData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                  </div>
                )}

                <div className="bento-grid">
                  {isFetchingLists ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  ) : complaints.length === 0 ? (
                    <div className="ui-card flex flex-col items-center justify-center animate-enter stagger-2" style={{ gridColumn: '1 / -1', padding: '5rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
                      <Search size={48} color="var(--border-highlight)" style={{ marginBottom: '1rem' }} />
                      <h3 style={{ color: 'var(--text-secondary)' }}>No anomalies detected</h3>
                      <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>System diagnostics indicate nominal operation in your sector.</p>
                    </div>
                  ) : (
                  complaints.map((complaint, idx) => (
                    <div className={`ui-card animate-enter`} style={{ animationDelay: `${0.1 * (idx + 1)}s` }} key={complaint._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                           <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                            {complaint.category.toUpperCase()} 
                            {user.role === 'Admin' && complaint.user && ` // ${complaint.user.name}`}
                          </span>
                          <h3 style={{ fontSize: '1.15rem' }}>{complaint.title}</h3>
                        </div>
                        
                        {user.role === 'Admin' ? (
                          <select className={`badge badge-${complaint.status.toLowerCase().replace(' ', '-')}`} style={{ background: 'var(--bg-surface-hover)', cursor: 'pointer', outline: 'none' }} value={complaint.status} onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}>
                            <option value="Pending">PENDING</option>
                            <option value="In Progress">IN PROGRESS</option>
                            <option value="Resolved">RESOLVED</option>
                          </select>
                        ) : (
                          <span className={`badge badge-${complaint.status.toLowerCase().replace(' ', '-')}`}>{complaint.status}</span>
                        )}
                      </div>
                      
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        {complaint.description}
                      </p>
                      
                      {complaint.imageUrl && (
                        <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', height: '180px', border: '1px solid var(--border-color)' }}>
                          <img src={complaint.imageUrl} alt="Anomaly evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          <MapPin size={14} /> LAT:{complaint.location.lat.toFixed(3)} LNG:{complaint.location.lng.toFixed(3)}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(complaint.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {view === 'report' && user && user.role === 'Customer' && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
              style={{ maxWidth: '700px' }}
            >
              <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Report a Civic Issue</h1>
                <p style={{ color: 'var(--text-muted)' }}>Help improve your city by reporting local problems.</p>
              </div>

              <div className="ui-card p-0">
                <form onSubmit={handleSubmitComplaint} style={{ padding: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Category *</label>
                      <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option>Infrastructure / Roads</option>
                        <option>Waste Management</option>
                        <option>Water & Sewage</option>
                        <option>Electricity</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Title *</label>
                      <input type="text" className="form-input" placeholder="E.g., Broken streetlight" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="form-label">Pin Location on Map *</label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Search an address or click anywhere on the map to mark the exact location.</p>
                    <MapPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                    {location.lat && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success-glow)', padding: '0.5rem 1rem', borderRadius: '100px', marginTop: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <MapIcon size={16} color="var(--success)" />
                        <span style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 600, fontFamily: 'monospace' }}>
                          COORDINATES LOCKED: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea className="form-input" rows="4" placeholder="Provide details about the issue..." value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                    <label className="form-label">Upload Photo (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <input type="file" className="form-input" style={{ paddingLeft: '3rem', cursor: 'pointer' }} accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                      <ImageIcon size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={isLoading}>
                    {isLoading ? 'Uploading & Submitting...' : 'Submit Complaint'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // --- PUBLIC UNAUTHENTICATED LAYOUT ---
  return (
    <>
      <Toaster richColors position="bottom-right" />
      <div className="dot-pattern-bg"></div>
      <div className="mesh-bg"></div>
      
      <nav style={{ padding: '1.5rem 2rem', position: 'fixed', width: '100%', top: 0, zIndex: 50 }}>
        <div className="glass" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', cursor: 'pointer' }} onClick={() => setView('home')}>
            <ShieldCheck size={24} color="var(--accent-primary)" /> CivicEye
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }} onClick={() => setView('login')}>
            Login / Sign Up
          </button>
        </div>
      </nav>

      <main className="container" style={{ paddingTop: '8rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
               key="pub-home"
               initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
               style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '4rem' }}
            >
              <div style={{ maxWidth: '800px', margin: '0 0 0 0', textAlign: 'left', position: 'relative' }}>
                
                {/* --- ANIME JS TARGET --- */}
                <div ref={squareRef} className="square" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', position: 'absolute', top: '15%', left: '70%', zIndex: -1, opacity: 0.7 }}></div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.4rem 1rem', borderRadius: '100px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                  <Zap size={14} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>SYSTEM v2.0 ACTIVE</span>
                </div>
                
                <h1 style={{ marginBottom: '1.5rem', minHeight: '130px' }}>
                  Real-time Solutions for <br/>
                  <TypewriterText words={['Infrastructure.', 'Waste Management.', 'Clean Water.', 'Consistent Power.']} />
                </h1>
                
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '550px' }}>
                  <strong style={{ color: 'var(--text-primary)'}}>Report. Track. Resolve.</strong><br/>
                  Making civic issues visible, accountable, and fixable.
                </p>
                
                <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => setView('login')}>
                  Get Started <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="bento-grid" style={{ marginTop: '4rem' }}>
                 <div className="ui-card glass animate-enter stagger-1">
                   <AlertTriangle size={28} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                   <h3 style={{ marginBottom: '0.5rem' }}>Real-Time Reporting</h3>
                   <p style={{ fontSize: '0.9rem' }}>Instantly report issues like potholes, garbage, and infrastructure problems with location and images.</p>
                 </div>
                 <div className="ui-card glass animate-enter stagger-2">
                   <MapIcon size={28} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                   <h3 style={{ marginBottom: '0.5rem' }}>Location Intelligence</h3>
                   <p style={{ fontSize: '0.9rem' }}>Every complaint is mapped with precise geotagging for faster identification and response.</p>
                 </div>
                 <div className="ui-card glass animate-enter stagger-3">
                   <ShieldCheck size={28} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                   <h3 style={{ marginBottom: '0.5rem' }}>Transparent Governance</h3>
                   <p style={{ fontSize: '0.9rem' }}>Track complaint status in real-time and ensure accountability from authorities.</p>
                 </div>
              </div>

              {/* --- NEW CATEGORY SHOWCASE SECTION --- */}
              <div className="animate-enter stagger-2" style={{ marginTop: '5rem', textAlign: 'left', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                   <div>
                     <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Categories We Resolve</h2>
                     <p style={{ color: 'var(--text-muted)' }}>Our intelligent routing platform handles core civic infrastructure anomalies.</p>
                   </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                  
                  {/* Sector 1 */}
                  <div className="ui-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '140px', width: '100%', background: 'var(--bg-surface-elevated)' }}>
                      <img src="/road.png" alt="Road Infrastructure" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>Infrastructure / Roads</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Potholes, broken signals, and road damage.</p>
                    </div>
                  </div>

                  {/* Sector 2 */}
                  <div className="ui-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '140px', width: '100%', background: 'var(--bg-surface-elevated)' }}>
                      <img src="/waste.png" alt="Waste Management" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>Waste Management</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uncollected garbage and illegal dumping.</p>
                    </div>
                  </div>

                  {/* Sector 3 */}
                  <div className="ui-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '140px', width: '100%', background: 'var(--bg-surface-elevated)' }}>
                      <img src="/water.png" alt="Water & Sewage Infrastructure" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>Water & Sewage</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pipe leaks, drainage issues, and supply drops.</p>
                    </div>
                  </div>

                  {/* Sector 4 */}
                  <div className="ui-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '140px', width: '100%', background: 'var(--bg-surface-elevated)' }}>
                      <img src="/electric.png" alt="Electricity" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>Electricity</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Power outages and broken streetlights.</p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div 
               key="pub-login"
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
               style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div className="glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', borderRadius: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <ShieldCheck size={40} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
                  <h2 style={{ fontSize: '1.75rem' }}>{isLoginMode ? 'Welcome Back' : 'Create an Account'}</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{isLoginMode ? 'Enter credentials to log in.' : 'Enter details to sign up.'}</p>
                </div>

                <form onSubmit={handleAuthSubmit}>
                  {!isLoginMode && (
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" required 
                             value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" required 
                           value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" required 
                           value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} />
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} disabled={isLoading}>
                    {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Sign Up')}
                  </button>
                </form>

                <div className="text-center" style={{ marginTop: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <span style={{ color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600' }} onClick={() => setIsLoginMode(!isLoginMode)}>
                    {isLoginMode ? "Sign Up" : "Login"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

export default App;
