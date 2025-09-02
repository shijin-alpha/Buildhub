import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ArchitectDashboard.css';

const ArchitectDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [layoutRequests, setLayoutRequests] = useState([]);
  const [myDesigns, setMyDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // My library state
  const [libraryLayouts, setLibraryLayouts] = useState([]);
  const [showLibraryForm, setShowLibraryForm] = useState(false);
  const [libraryForm, setLibraryForm] = useState({
    title: '', layout_type: '', bedrooms: '', bathrooms: '', area: '', price_range: '', description: '', image: null, design_file: null
  });

  // Upload form state
  const [uploadData, setUploadData] = useState({
    request_id: '',
    homeowner_id: '', // optional: send directly to a homeowner
    design_title: '',
    description: '',
    files: []
  });

  useEffect(() => {
    // Get user data from session
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);

    // Strict: prevent cached back navigation showing dashboard
    import('../utils/session').then(({ preventCache, verifyServerSession }) => {
      preventCache();
      (async () => {
        const serverAuth = await verifyServerSession();
        if (!userData.id || userData.role !== 'architect' || !serverAuth) {
          sessionStorage.removeItem('user');
          localStorage.removeItem('bh_user');
          navigate('/login', { replace: true });
          return;
        }
        // proceed
        fetchLayoutRequests();
        fetchMyDesigns();
        fetchMyLibrary();
      })();
    });
  }, []);

  const fetchLayoutRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/buildhub/backend/api/architect/get_layout_requests.php');
      const result = await response.json();
      if (result.success) {
        setLayoutRequests(result.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDesigns = async () => {
    try {
      const response = await fetch('/buildhub/backend/api/architect/get_my_designs.php');
      const result = await response.json();
      if (result.success) {
        setMyDesigns(result.designs || []);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  const fetchMyLibrary = async () => {
    try {
      const res = await fetch('/buildhub/backend/api/architect/get_my_layouts.php');
      const json = await res.json();
      if (json.success) setLibraryLayouts(json.layouts || []);
    } catch (e) { console.error('Error fetching my layouts', e); }
  };

  const submitNewLibraryItem = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(libraryForm).forEach(([k,v]) => {
      if (v !== null && v !== '') fd.append(k, v);
    });
    try {
      const res = await fetch('/buildhub/backend/api/architect/create_layout_library_item.php', {
        method: 'POST',
        body: fd
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('Layout added to library');
        setShowLibraryForm(false);
        setLibraryForm({ title:'', layout_type:'', bedrooms:'', bathrooms:'', area:'', price_range:'', description:'', image:null, design_file:null });
        fetchMyLibrary();
      } else {
        setError(json.message || 'Failed to add layout');
      }
    } catch (e) {
      setError('Error adding layout');
    }
  };

  const [editLayout, setEditLayout] = useState(null);

  const openEditLayout = (item) => {
    setEditLayout({ ...item, image: null, design_file: null });
  };

  const closeEditLayout = () => setEditLayout(null);

  const saveEditLayout = async (e) => {
    e.preventDefault();
    if (!editLayout) return;
    const fd = new FormData();
    fd.append('id', editLayout.id);
    ['title','layout_type','bedrooms','bathrooms','area','price_range','description','status'].forEach(k=>{
      if (editLayout[k] !== undefined && editLayout[k] !== null && editLayout[k] !== '') fd.append(k, editLayout[k]);
    });
    if (editLayout.image) fd.append('image', editLayout.image);
    if (editLayout.design_file) fd.append('design_file', editLayout.design_file);
    try {
      const res = await fetch('/buildhub/backend/api/architect/update_layout_library_item.php', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) {
        setSuccess('Layout updated');
        setEditLayout(null);
        fetchMyLibrary();
      } else {
        setError(json.message || 'Failed to update layout');
      }
    } catch (e) {
      setError('Error updating layout');
    }
  };

  const toggleLayoutStatus = async (item) => {
    const target = item.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch('/buildhub/backend/api/architect/update_layout_library_item.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: target })
      });
      const json = await res.json();
      if (json.success) {
        setLibraryLayouts(prev => prev.map(x => x.id === item.id ? { ...x, status: target } : x));
      } else {
        setError(json.message || 'Failed to change status');
      }
    } catch (e) {
      setError('Error changing status');
    }
  };

  // Preview modal for clear viewing of image and layout file
  const [previewItem, setPreviewItem] = useState(null);
  const openPreview = (item) => setPreviewItem(item);
  const closePreview = () => setPreviewItem(null);

  const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|bmp)$/i.test(url || '');
  const isPdfUrl = (url) => /\.(pdf)$/i.test(url || '');

  const handleLogout = async () => {
    try { await fetch('/buildhub/backend/api/logout.php', { method: 'POST', credentials: 'include' }); } catch {}
    localStorage.removeItem('bh_user');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    // Only require files; backend will auto-route to the appropriate homeowner/request and default title
    if (uploadData.files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      if (uploadData.request_id) formData.append('request_id', uploadData.request_id);
      if (uploadData.homeowner_id) formData.append('homeowner_id', uploadData.homeowner_id);
      if (uploadData.design_title) formData.append('design_title', uploadData.design_title);
      if (uploadData.description) formData.append('description', uploadData.description);
      
      // Handle multiple files
      for (let i = 0; i < uploadData.files.length; i++) {
        formData.append('design_files[]', uploadData.files[i]);
      }

      const response = await fetch('/buildhub/backend/api/architect/upload_design.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Design uploaded successfully!');
        setShowUploadForm(false);
        setUploadData({
          request_id: '',
          homeowner_id: '',
          design_title: '',
          description: '',
          files: []
        });
        fetchMyDesigns();
      } else {
        setError('Failed to upload design: ' + result.message);
      }
    } catch (error) {
      setError('Error uploading design');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div>
      {/* Main Header */}
      <div className="main-header">
        <h1>Dashboard</h1>
        <p>Manage your architectural designs and connect with clients</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon requests">📋</div>
            <div className="stat-info">
              <h3>{layoutRequests.length}</h3>
              <p>Available Requests</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon designs">🎨</div>
            <div className="stat-info">
              <h3>{myDesigns.length}</h3>
              <p>Designs Created</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon approved">✅</div>
            <div className="stat-info">
              <h3>{myDesigns.filter(d => d.status === 'approved').length}</h3>
              <p>Approved Designs</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon progress">⏳</div>
            <div className="stat-info">
              <h3>{myDesigns.filter(d => d.status === 'in-progress').length}</h3>
              <p>In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-card">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>Get started with your architectural projects</p>
        </div>
        <div className="section-content">
          <div className="quick-actions">
            <button 
              className="action-card"
              onClick={() => setShowUploadForm(true)}
            >
              <div className="action-icon">📐</div>
              <h3>Upload New Design</h3>
              <p>Create and submit architectural designs for client requests</p>
            </button>
            <button 
              className="action-card"
              onClick={() => setActiveTab('requests')}
            >
              <div className="action-icon">👁️</div>
              <h3>Browse Requests</h3>
              <p>View available client requests waiting for designs</p>
            </button>
            <button 
              className="action-card"
              onClick={() => setActiveTab('designs')}
            >
              <div className="action-icon">🎨</div>
              <h3>My Portfolio</h3>
              <p>Manage your submitted designs and track their status</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-card">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <p>Latest updates on your designs and client requests</p>
        </div>
        <div className="section-content">
          <div className="item-list">
            {myDesigns.slice(0, 5).map(design => (
              <div key={design.id} className="list-item">
                <div className="item-icon">
                  {design.status === 'approved' ? '✅' : 
                   design.status === 'rejected' ? '❌' : '🎨'}
                </div>
                <div className="item-content">
                  <h4 className="item-title">{design.design_title}</h4>
                  <p className="item-subtitle">Client: {design.client_name}</p>
                  <p className="item-meta">Submitted: {new Date(design.created_at).toLocaleDateString()}</p>
                </div>
                <div className="item-actions">
                  <span className={`status-badge ${design.status}`}>
                    {design.status}
                  </span>
                </div>
              </div>
            ))}
            {myDesigns.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🎨</div>
                <h3>No Designs Yet</h3>
                <p>Start by creating your first architectural design!</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowUploadForm(true)}
                >
                  Upload Design
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div>
      <div className="main-header">
        <div className="header-content">
          <div>
            <h1>Layout Requests</h1>
            <p>Client requests sent to you and open requests</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadForm(true)}
          >
            + Upload Design
          </button>
        </div>
      </div>

      {/* Assigned to me */}
      <div className="section-card">
        <div className="section-header">
          <h2>Requests Assigned To Me</h2>
          <p>Homeowners selected you for these requests</p>
        </div>
        <AssignedRequests onCreateFromAssigned={(requestId) => { setUploadData({ ...uploadData, request_id: requestId }); setShowUploadForm(true); }} />
      </div>

      {/* Open/available requests */}
      <div className="section-card">
        <div className="section-header">
          <h2>Available Requests</h2>
          <p>Create architectural designs for these client requests</p>
        </div>
        <div className="section-content">
          {loading ? (
            <div className="loading">Loading requests...</div>
          ) : layoutRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Requests Available</h3>
              <p>Check back later for new client requests!</p>
            </div>
          ) : (
            <div className="item-list">
              {layoutRequests.map(request => (
                <RequestItem 
                  key={request.id} 
                  request={request} 
                  onCreateDesign={() => {
                    setUploadData({...uploadData, request_id: request.id});
                    setShowUploadForm(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDesigns = () => (
    <div>
      <div className="main-header">
        <div className="header-content">
          <div>
            <h1>My Designs</h1>
            <p>Track your submitted architectural designs and their progress</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadForm(true)}
          >
            + New Design
          </button>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Design Portfolio</h2>
          <p>All your submitted architectural designs</p>
        </div>
        <div className="section-content">
          {loading ? (
            <div className="loading">Loading designs...</div>
          ) : myDesigns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎨</div>
              <h3>No Designs Yet</h3>
              <p>Upload your first architectural design to get started!</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowUploadForm(true)}
              >
                Upload Design
              </button>
            </div>
          ) : (
            <div className="item-list">
              {myDesigns.map(design => (
                <DesignItem key={design.id} design={design} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div>
      <div className="main-header">
        <div className="header-content">
          <div>
            <h1>My Layout Library</h1>
            <p>Create layouts with preview images for homeowners to browse</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowLibraryForm(true)}>+ Add Layout</button>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Library Items</h2>
          <p>Your published layouts</p>
        </div>
        <div className="section-content">
          {libraryLayouts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No Layouts Yet</h3>
              <p>Add your first layout to the library so homeowners can request customizations</p>
              <button className="btn btn-primary" onClick={() => setShowLibraryForm(true)}>Add Layout</button>
            </div>
          ) : (
            <div className="item-grid">
              {libraryLayouts.map(item => (
                <div key={item.id} className="layout-card">
                  <button className="layout-image-container" onClick={()=>openPreview(item)} style={{cursor:'zoom-in'}}>
                    <img src={item.image_url || '/images/default-layout.jpg'} alt={item.title} className="layout-card-image"/>
                  </button>
                  <div className="layout-card-content">
                    <h4 className="layout-title">{item.title}</h4>
                    <p className="layout-type">{item.layout_type}</p>
                    <div className="layout-specs">
                      <span className="spec">🛏️ {item.bedrooms} BR</span>
                      <span className="spec">🚿 {item.bathrooms} BA</span>
                      <span className="spec">📐 {item.area} sq ft</span>
                    </div>
                    {item.description && (<p className="layout-description">{item.description}</p>)}
                    {item.price_range && (<div className="layout-price"><span className="price-range">₹{item.price_range}</span></div>)}
                    <div style={{display:'flex', gap:8, flexWrap:'wrap', margin:'6px 0'}}>
                      {item.image_url && (
                        <button className="btn btn-secondary" onClick={()=>openPreview(item)}>View Preview</button>
                      )}
                      {item.design_file_url && (
                        isImageUrl(item.design_file_url) || isPdfUrl(item.design_file_url) ? (
                          <button className="btn" onClick={()=>openPreview(item)}>View Layout</button>
                        ) : (
                          <a className="btn btn-link" href={item.design_file_url} target="_blank" rel="noreferrer">Download Layout</a>
                        )
                      )}
                    </div>
                    <div className="layout-actions">
                      <button className="btn btn-secondary" onClick={()=>openEditLayout(item)}>Edit</button>
                      <button className="btn" onClick={()=>toggleLayoutStatus(item)}>
                        {item.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showLibraryForm && (
        <div className="form-modal">
          <div className="form-content" style={{maxWidth:'920px'}}>
            <div className="form-header">
              <h3>Add Layout</h3>
              <p>Publish a new layout to the library</p>
            </div>
            <form onSubmit={submitNewLibraryItem}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" value={libraryForm.title} onChange={(e)=>setLibraryForm({...libraryForm, title:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <input type="text" value={libraryForm.layout_type} onChange={(e)=>setLibraryForm({...libraryForm, layout_type:e.target.value})} required/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bedrooms *</label>
                  <input type="number" value={libraryForm.bedrooms} onChange={(e)=>setLibraryForm({...libraryForm, bedrooms:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>Bathrooms *</label>
                  <input type="number" value={libraryForm.bathrooms} onChange={(e)=>setLibraryForm({...libraryForm, bathrooms:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>Area (sq ft) *</label>
                  <input type="number" value={libraryForm.area} onChange={(e)=>setLibraryForm({...libraryForm, area:e.target.value})} required/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price Range</label>
                  <input type="text" value={libraryForm.price_range} onChange={(e)=>setLibraryForm({...libraryForm, price_range:e.target.value})} placeholder="e.g., 20-30 Lakhs"/>
                </div>
                <div className="form-group">
                  <label>Preview Image</label>
                  <input type="file" accept="image/*" onChange={(e)=>setLibraryForm({...libraryForm, image:e.target.files?.[0] || null})}/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Layout Design File</label>
                  <input type="file" onChange={(e)=>setLibraryForm({...libraryForm, design_file:e.target.files?.[0] || null})}/>
                </div>
                <div className="form-group" style={{flex:1}}>
                  {libraryForm.image && (
                    <div style={{border:'1px solid #eee', padding:8, borderRadius:8}}>
                      <p style={{margin:'0 0 6px'}}>Image Preview</p>
                      <img src={URL.createObjectURL(libraryForm.image)} alt="Preview" style={{maxWidth:'100%', borderRadius:6}}/>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="4" value={libraryForm.description} onChange={(e)=>setLibraryForm({...libraryForm, description:e.target.value})}></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowLibraryForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editLayout && (
        <div className="form-modal">
          <div className="form-content" style={{maxWidth:'920px'}}>
            <div className="form-header">
              <h3>Edit Layout</h3>
              <p>Update your library item</p>
            </div>
            <form onSubmit={saveEditLayout}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" value={editLayout.title} onChange={(e)=>setEditLayout({...editLayout, title:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <input type="text" value={editLayout.layout_type} onChange={(e)=>setEditLayout({...editLayout, layout_type:e.target.value})} required/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bedrooms *</label>
                  <input type="number" value={editLayout.bedrooms} onChange={(e)=>setEditLayout({...editLayout, bedrooms:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>Bathrooms *</label>
                  <input type="number" value={editLayout.bathrooms} onChange={(e)=>setEditLayout({...editLayout, bathrooms:e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>Area (sq ft) *</label>
                  <input type="number" value={editLayout.area} onChange={(e)=>setEditLayout({...editLayout, area:e.target.value})} required/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price Range</label>
                  <input type="text" value={editLayout.price_range || ''} onChange={(e)=>setEditLayout({...editLayout, price_range:e.target.value})} placeholder="e.g., 20-30 Lakhs"/>
                </div>
                <div className="form-group">
                  <label>Replace Image</label>
                  <input type="file" accept="image/*" onChange={(e)=>setEditLayout({...editLayout, image:e.target.files?.[0] || null})}/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Replace Layout Design File</label>
                  <input type="file" onChange={(e)=>setEditLayout({...editLayout, design_file:e.target.files?.[0] || null})}/>
                </div>
                <div className="form-group" style={{flex:1}}>
                  {editLayout.image && (
                    <div style={{border:'1px solid #eee', padding:8, borderRadius:8}}>
                      <p style={{margin:'0 0 6px'}}>New Image Preview</p>
                      <img src={URL.createObjectURL(editLayout.image)} alt="Preview" style={{maxWidth:'100%', borderRadius:6}}/>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="4" value={editLayout.description || ''} onChange={(e)=>setEditLayout({...editLayout, description:e.target.value})}></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={editLayout.status} onChange={(e)=>setEditLayout({...editLayout, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeEditLayout}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <a href="#" className="sidebar-logo">
            <div className="logo-icon">🏠</div>
            <span className="logo-text">BUILDHUB</span>
          </a>
        </div>

        <nav className="sidebar-nav">
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('requests'); }}
          >
            <span className="nav-icon">📋</span>
            Layout Requests
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'designs' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('designs'); }}
          >
            <span className="nav-icon">🎨</span>
            My Designs
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('library'); }}
          >
            <span className="nav-icon">📚</span>
            My Layout Library
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            <div className="user-info">
              <h4>{user?.first_name} {user?.last_name}</h4>
              <p>Architect</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span style={{fontSize: '1.2rem'}}>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError('')} className="alert-close">×</button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            {success}
            <button onClick={() => setSuccess('')} className="alert-close">×</button>
          </div>
        )}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'designs' && renderDesigns()}
        {activeTab === 'library' && renderLibrary()}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="form-modal">
            <div className="form-content">
              <div className="form-header">
                <h3>Upload Design</h3>
                <p>Submit your architectural design for a client request</p>
              </div>
              
              <form onSubmit={handleUploadSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Send To</label>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                      <div>
                        <label style={{fontSize:'0.85rem'}}>By Request (optional)</label>
                        <select
                          value={uploadData.request_id}
                          onChange={(e) => setUploadData({...uploadData, request_id: e.target.value})}
                        >
                          <option value="">Choose a client request</option>
                          {layoutRequests.map(request => (
                            <option key={request.id} value={request.id}>
                              {request.client_name} - {request.plot_size} sq ft ({request.budget_range})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{fontSize:'0.85rem'}}>Direct Homeowner ID (optional)</label>
                        <input
                          type="number"
                          value={uploadData.homeowner_id}
                          onChange={(e) => setUploadData({...uploadData, homeowner_id: e.target.value})}
                          placeholder="e.g., 123"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Design Title *</label>
                    <input
                      type="text"
                      value={uploadData.design_title}
                      onChange={(e) => setUploadData({...uploadData, design_title: e.target.value})}
                      placeholder="e.g., Modern 3BHK Villa Design"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                    placeholder="Describe your design features, materials, and special considerations..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Design Files *</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.heic,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,.dwg,.dxf,.ifc,.rvt,.skp,.3dm,.obj,.stl,.zip,.rar,.7z,.mp4,.mov,.avi,.m4v"
                    onChange={(e) => setUploadData({...uploadData, files: Array.from(e.target.files)})}
                    required
                  />
                  <p className="form-help">Select multiple files (images, PDFs, docs, CAD/3D, archives, videos)</p>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowUploadForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Uploading...' : 'Upload Design'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Assigned Requests Component
const AssignedRequests = ({ onCreateFromAssigned }) => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Helpers: parse/normalize requirements into structured fields
  const normalizeRequirements = (reqText, reqParsed) => {
    // Prefer parsed JSON if valid
    const src = (reqParsed && typeof reqParsed === 'object') ? reqParsed : {};
    // Try to detect key info from text as best-effort
    const text = (reqText || '').toString();
    const pick = (k) => src[k] ?? null;
    const extract = (label) => {
      const m = text.match(new RegExp(label + ":\s*([^\n]+)", 'i'));
      return m ? m[1].trim() : null;
    };
    return {
      rooms: pick('rooms') ?? extract('rooms') ?? extract('bedrooms') ?? null,
      family_needs: pick('family_needs') ?? extract('family needs') ?? null,
      style: pick('preferred_style') ?? pick('style') ?? extract('style') ?? null,
      notes: pick('notes') ?? null,
      raw: text.trim()
    };
  };

  const toClipboard = async (str) => {
    try { await navigator.clipboard.writeText(str); } catch {}
  };

  const downloadText = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/buildhub/backend/api/architect/get_assigned_requests.php');
      const data = await res.json();
      if (data.success) {
        setItems(data.assignments || []);
      } else {
        setError(data.message || 'Failed to load assigned requests');
      }
    } catch (e) {
      setError('Error loading assigned requests');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const respond = async (assignment_id, action) => {
    try {
      await fetch('/buildhub/backend/api/architect/respond_assignment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id, action })
      });
      load();
    } catch {}
  };

  return (
    <div className="section-content">
      {loading ? (
        <div className="loading">Loading assigned requests...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📬</div>
          <h3>No Assigned Requests</h3>
          <p>Homeowners haven’t assigned requests to you yet.</p>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>
      ) : (
        <div className="item-list">
          {items.map(a => (
            <div key={a.assignment_id} className="list-item">
              <div className="item-icon">📌</div>
              <div className="item-content">
                <h4 className="item-title">Request #{a.layout_request.id} • {a.layout_request.plot_size} sq ft</h4>
                <p className="item-subtitle">Budget: {a.layout_request.budget_range} • From: {a.homeowner.name}</p>
                <p className="item-meta">Assigned: {new Date(a.assigned_at).toLocaleDateString()} • Status: {a.assignment_status}</p>
                {a.message && <p className="item-description">Message: {a.message}</p>}

                {/* Interactive requirement details */}
                {(() => {
                  const R = normalizeRequirements(a.layout_request.requirements, a.layout_request.requirements_parsed);
                  const chips = [
                    R.rooms ? { label: 'Rooms', value: R.rooms } : null,
                    R.family_needs ? { label: 'Family needs', value: R.family_needs } : null,
                    (a.layout_request.preferred_style || R.style) ? { label: 'Style', value: a.layout_request.preferred_style || R.style } : null,
                  ].filter(Boolean);
                  return (
                    <div className="details-card">
                      <div className="details-header">
                        <strong>Requirements</strong>
                      </div>
                      <div className="details-grid">
                        <div>
                          <h5>Site & Budget</h5>
                          <div className="chips">
                            <span className="chip"><strong>Plot:</strong> {a.layout_request.plot_size || '—'}</span>
                            <span className="chip"><strong>Budget:</strong> {a.layout_request.budget_range || '—'}</span>
                            <span className="chip"><strong>Location:</strong> {a.layout_request.location || '—'}</span>
                            <span className="chip"><strong>Timeline:</strong> {a.layout_request.timeline || '—'}</span>
                          </div>
                        </div>
                        <div>
                          <h5>Preferences</h5>
                          <div className="chips">
                            {(a.layout_request.layout_type || 'custom') && (
                              <span className="chip"><strong>Type:</strong> {a.layout_request.layout_type || 'custom'}</span>
                            )}
                            {chips.map((c, idx) => (
                              <span key={idx} className="chip"><strong>{c.label}:</strong> {c.value}</span>
                            ))}
                            {a.layout_request.library?.title && (
                              <span className="chip"><strong>Library:</strong> {a.layout_request.library.title}</span>
                            )}
                          </div>
                        </div>
                        <div className="span-2">
                          <h5>Notes</h5>
                          <p className="item-description">{R.notes || a.layout_request.requirements || '—'}</p>
                          {a.layout_request.library?.image_url && (
                            <div className="preview-row">
                              <img src={a.layout_request.library.image_url} alt="Selected layout" className="preview-image" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="item-actions">
                <button className="btn btn-secondary" onClick={load}>Refresh</button>
                {a.assignment_status === 'sent' && (
                  <>
                    <button className="btn btn-success" onClick={() => respond(a.assignment_id, 'accept')}>Accept</button>
                    <button className="btn btn-danger" onClick={() => respond(a.assignment_id, 'reject')}>Reject</button>
                  </>
                )}
                <button className="btn btn-primary" onClick={() => onCreateFromAssigned?.(a.layout_request.id)}>
                  Create Design
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Request Item Component
const RequestItem = ({ request, onCreateDesign }) => (
  <div className="list-item">
    <div className="item-icon">📋</div>
    <div className="item-content">
      <h4 className="item-title">{request.client_name} - {request.plot_size} sq ft</h4>
      <p className="item-subtitle">Budget: {request.budget_range}</p>
      <p className="item-meta">
        Location: {request.location || 'Not specified'} • 
        Submitted: {new Date(request.created_at).toLocaleDateString()}
      </p>
      <p className="item-description">{request.requirements}</p>
    </div>
    <div className="item-actions">
      <button className="btn btn-primary" onClick={onCreateDesign}>
        Create Design
      </button>
    </div>
  </div>
);

// Design Item Component
const DesignItem = ({ design }) => (
  <div className="list-item">
    <div className="item-icon">
      {design.status === 'approved' ? '✅' : 
       design.status === 'rejected' ? '❌' : '🎨'}
    </div>
    <div className="item-content">
      <h4 className="item-title">{design.design_title}</h4>
      <p className="item-subtitle">Client: {design.client_name}</p>
      <p className="item-meta">
        Plot Size: {design.plot_size} sq ft • Budget: {design.budget_range}
      </p>
      <p className="item-meta">
        Submitted: {new Date(design.created_at).toLocaleDateString()}
      </p>
      {design.description && (
        <p className="item-description">{design.description}</p>
      )}
    </div>
    <div className="item-actions">
      <span className={`status-badge ${design.status}`}>
        {design.status}
      </span>
      <button className="btn btn-secondary">
        View Files
      </button>
    </div>
  </div>
);

export default ArchitectDashboard;