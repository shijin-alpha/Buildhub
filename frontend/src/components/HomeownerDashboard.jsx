import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeownerDashboard.css';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [receivedDesigns, setReceivedDesigns] = useState([]);
  const [comments, setComments] = useState({}); // designId -> list
  const [commentDrafts, setCommentDrafts] = useState({}); // designId -> text
  const [commentRatings, setCommentRatings] = useState({}); // designId -> 1..5
  const [user, setUser] = useState(null);
  const [layoutRequests, setLayoutRequests] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [layoutLibrary, setLayoutLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [selectedLibraryLayout, setSelectedLibraryLayout] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Image/Layout preview modal state
  const [previewLayout, setPreviewLayout] = useState(null);
  const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|bmp)$/i.test(url || '');
  const isPdfUrl = (url) => /\.(pdf)$/i.test(url || '');

  // Architect selection state
  const [showArchitectModal, setShowArchitectModal] = useState(false);
  const [architects, setArchitects] = useState([]);
  const [archLoading, setArchLoading] = useState(false);
  const [archError, setArchError] = useState('');
  const [archSearch, setArchSearch] = useState('');
  const [archSpec, setArchSpec] = useState('');
  const [archMinExp, setArchMinExp] = useState('');
  const [selectedArchitectId, setSelectedArchitectId] = useState(null);
  const [assignMessage, setAssignMessage] = useState('');
  const [selectedRequestForAssign, setSelectedRequestForAssign] = useState(null);

  // Request form state
  const [requestData, setRequestData] = useState({
    // Site details
    plot_size: '',
    plot_shape: '',
    topography: '',
    development_laws: '',
    // Family needs
    family_needs: '',
    rooms: '',
    // Budget & aesthetics
    budget_range: '',
    aesthetic: '',
    // Other
    requirements: '', // additional notes
    location: '',
    timeline: '',
    selected_layout_id: null,
    layout_type: 'custom' // 'custom' or 'library'
  });

  useEffect(() => {
    // Get user data from session
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);

    import('../utils/session').then(({ preventCache, verifyServerSession }) => {
      preventCache();
      (async () => {
        const serverAuth = await verifyServerSession();
        if (!userData.id || userData.role !== 'homeowner' || !serverAuth) {
          sessionStorage.removeItem('user');
          localStorage.removeItem('bh_user');
          navigate('/login', { replace: true });
          return;
        }
        fetchMyRequests();
        fetchMyProjects();
        fetchLayoutLibrary();
        fetchReceivedDesigns();
      })();
    });
  }, []);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/buildhub/backend/api/homeowner/get_my_requests.php');
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

  const fetchMyProjects = async () => {
    try {
      const response = await fetch('/buildhub/backend/api/homeowner/get_my_projects.php');
      const result = await response.json();
      if (result.success) {
        setMyProjects(result.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchLayoutLibrary = async () => {
    try {
      const response = await fetch('/buildhub/backend/api/homeowner/get_layout_library.php');
      const result = await response.json();
      if (result.success) {
        setLayoutLibrary(result.layouts || []);
      }
    } catch (error) {
      console.error('Error fetching layout library:', error);
    }
  };

  const fetchReceivedDesigns = async () => {
    try {
      const response = await fetch('/buildhub/backend/api/homeowner/get_received_designs.php');
      const result = await response.json();
      if (result.success) setReceivedDesigns(result.designs || []);
    } catch (e) {
      console.error('Error fetching designs:', e);
    }
  };

  const handleDeleteDesign = async (designId) => {
    if (!designId) return;
    if (!window.confirm('Delete this design? This cannot be undone.')) return;
    try {
      const res = await fetch('/buildhub/backend/api/homeowner/delete_design.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: designId })
      });
      const json = await res.json();
      if (json.success) {
        setReceivedDesigns(prev => prev.filter(d => d.id !== designId));
      } else {
        setError(json.message || 'Failed to delete design');
      }
    } catch (e) {
      setError('Error deleting design');
    }
  };

  const updateSelection = async (designId, action) => {
    try {
      const res = await fetch('/buildhub/backend/api/homeowner/update_design_selection.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: designId, action })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(action === 'finalize' ? 'Design finalized' : action === 'shortlist' ? 'Added to shortlist' : 'Removed from shortlist');
        fetchReceivedDesigns();
      } else {
        setError(json.message || 'Failed to update selection');
      }
    } catch (e) {
      setError('Error updating selection');
    }
  };

  const fetchComments = async (designId) => {
    try {
      const res = await fetch(`/buildhub/backend/api/comments/get_comments.php?design_id=${designId}`);
      const json = await res.json();
      if (json.success) setComments(prev => ({ ...prev, [designId]: json.comments }));
    } catch {}
  };

  const postComment = async (designId) => {
    const text = (commentDrafts[designId] || '').trim();
    const rating = Number(commentRatings[designId] || 0);
    if (!text) return;
    try {
      // 1) Post design comment
      const res = await fetch('/buildhub/backend/api/comments/post_comment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: designId, message: text })
      });
      const json = await res.json();

      // 2) Also post a review with optional rating
      const design = receivedDesigns.find(d => d.id === designId);
      if (design?.architect_id) {
        try {
          await fetch('/buildhub/backend/api/reviews/post_review.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ architect_id: design.architect_id, design_id: designId, rating: rating > 0 ? rating : 5, comment: text })
          });
        } catch {}
      }

      if (json.success) {
        setCommentDrafts(prev => ({ ...prev, [designId]: '' }));
        setCommentRatings(prev => ({ ...prev, [designId]: 0 }));
        fetchComments(designId);
        setSuccess('Comment & review posted');
      } else {
        setError(json.message || 'Failed to post comment');
      }
    } catch {
      setError('Error posting comment');
    }
  };

  // Architect directory + assignment
  const fetchArchitects = async (params = {}) => {
    setArchLoading(true);
    setArchError('');
    try {
      const q = new URLSearchParams({
        ...(params.search ? { search: params.search } : {}),
        ...(params.specialization ? { specialization: params.specialization } : {}),
        ...(params.min_experience ? { min_experience: params.min_experience } : {}),
        ...(params.layout_request_id ? { layout_request_id: params.layout_request_id } : {}),
      }).toString();
      const response = await fetch(`/buildhub/backend/api/homeowner/get_architects.php${q ? `?${q}` : ''}`);
      const result = await response.json();
      if (result.success) {
        setArchitects(result.architects || []);
      } else {
        setArchError(result.message || 'Failed to load architects');
      }
    } catch (e) {
      setArchError('Error loading architects');
    } finally {
      setArchLoading(false);
    }
  };

  const openArchitectModal = (request) => {
    setSelectedRequestForAssign(request);
    setSelectedArchitectId(null);
    setAssignMessage('');
    setShowArchitectModal(true);
    // Pass layout_request_id so backend can mark already assigned architects
    fetchArchitects({ search: archSearch, specialization: archSpec, min_experience: archMinExp, layout_request_id: request?.id });
  };

  const handleAssignArchitect = async () => {
    if (!selectedRequestForAssign) {
      setArchError('No request selected');
      return;
    }
    // Collect selected architect IDs (multi-select)
    const selectedIds = Array.isArray(selectedArchitectId)
      ? selectedArchitectId
      : (selectedArchitectId ? [selectedArchitectId] : []);
    if (selectedIds.length === 0) {
      setArchError('Please select at least one architect');
      return;
    }
    try {
      setArchLoading(true);
      // Guard: require layout_request_id
      if (!selectedRequestForAssign?.id) {
        setArchError('Please select a request first');
        setArchLoading(false);
        return;
      }
      const response = await fetch('/buildhub/backend/api/homeowner/assign_architect.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout_request_id: selectedRequestForAssign.id,
          architect_ids: selectedIds,
          message: assignMessage
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Request sent to selected architect(s)');
        setShowArchitectModal(false);
        setSelectedRequestForAssign(null);
        setSelectedArchitectId(null);
      } else {
        setArchError(result.message || 'Failed to send request');
      }
    } catch (e) {
      setArchError('Error sending request');
    } finally {
      setArchLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await fetch('/buildhub/backend/api/logout.php', { method: 'POST', credentials: 'include' }); } catch {}
    localStorage.removeItem('bh_user');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestData.plot_size || !requestData.budget_range || !requestData.requirements) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/buildhub/backend/api/homeowner/submit_request.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Layout request submitted successfully!');
        setShowRequestForm(false);
        setRequestData({
          plot_size: '',
          plot_shape: '',
          topography: '',
          development_laws: '',
          family_needs: '',
          rooms: '',
          budget_range: '',
          aesthetic: '',
          requirements: '',
          location: '',
          timeline: '',
          selected_layout_id: null,
          layout_type: 'custom'
        });
        fetchMyRequests();
        // Open architect selection modal right after submit
        setSelectedRequestForAssign({ id: result.request_id });
        setSelectedArchitectId(null);
        setAssignMessage('');
        setShowArchitectModal(true);
        fetchArchitects({ search: archSearch, specialization: archSpec, min_experience: archMinExp });
      } else {
        setError('Failed to submit request: ' + result.message);
      }
    } catch (error) {
      setError('Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromLibrary = (layout) => {
    setSelectedLibraryLayout(layout);
    setRequestData({
      ...requestData,
      selected_layout_id: layout.id,
      layout_type: 'library'
    });
    setShowLibraryModal(false);
    setShowRequestForm(true);
  };

  const renderDashboard = () => (
    <div>
      {/* Main Header */}
      <div className="main-header">
        <h1>Dashboard</h1>
        <p>Manage your construction projects and connect with professionals</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon requests">📋</div>
            <div className="stat-info">
              <h3>{layoutRequests.length}</h3>
              <p>Layout Requests</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon projects">🏗️</div>
            <div className="stat-info">
              <h3>{myProjects.length}</h3>
              <p>Active Projects</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon library">📚</div>
            <div className="stat-info">
              <h3>{layoutLibrary.length}</h3>
              <p>Available Layouts</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon completed">✅</div>
            <div className="stat-info">
              <h3>{layoutRequests.filter(r => r.status === 'approved').length}</h3>
              <p>Approved Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-card">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>Get started with your construction project</p>
        </div>
        <div className="section-content">
          <div className="quick-actions">
            <button 
              className="action-card"
              onClick={() => setShowRequestForm(true)}
            >
              <div className="action-icon">📐</div>
              <h3>Request Custom Design</h3>
              <p>Get professional architectural designs for your plot</p>
            </button>
            <button 
              className="action-card"
              onClick={() => setShowLibraryModal(true)}
            >
              <div className="action-icon">📚</div>
              <h3>Browse Layout Library</h3>
              <p>Choose from pre-designed layouts and customize them</p>
            </button>
            <button 
              className="action-card"
              onClick={() => setActiveTab('requests')}
            >
              <div className="action-icon">👁️</div>
              <h3>View My Requests</h3>
              <p>Track the status of your layout requests</p>
            </button>
            <button 
              className="action-card"
              onClick={() => setActiveTab('projects')}
            >
              <div className="action-icon">🏠</div>
              <h3>Manage Projects</h3>
              <p>Monitor your ongoing construction projects</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-card">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <p>Latest updates on your requests and projects</p>
        </div>
        <div className="section-content">
          <div className="item-list">
            {layoutRequests.slice(0, 5).map(request => (
              <div key={request.id} className="list-item">
                <div className="item-icon">
                  {request.status === 'approved' ? '✅' : 
                   request.status === 'rejected' ? '❌' : '⏳'}
                </div>
                <div className="item-content">
                  <h4 className="item-title">Layout Request - {request.plot_size}</h4>
                  <p className="item-subtitle">Budget: {request.budget_range}</p>
                  <p className="item-meta">Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
                </div>
                <div className="item-actions">
                  <span className={`status-badge ${request.status}`}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
            {layoutRequests.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Requests Yet</h3>
                <p>Start by submitting your first layout request!</p>
                <div className="empty-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowRequestForm(true)}
                  >
                    Request Custom Design
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowLibraryModal(true)}
                  >
                    Browse Library
                  </button>
                </div>
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
            <h1>My Layout Requests</h1>
            <p>Track your architectural design requests and their progress</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowLibraryModal(true)}
            >
              📚 Browse Library
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowRequestForm(true)}
            >
              + Custom Request
            </button>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Request History</h2>
          <p>All your submitted layout requests</p>
        </div>
        <div className="section-content">
          {loading ? (
            <div className="loading">Loading requests...</div>
          ) : layoutRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Requests Yet</h3>
              <p>Submit your first layout request to get started!</p>
              <div className="empty-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowRequestForm(true)}
                >
                  Request Custom Design
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowLibraryModal(true)}
                >
                  Browse Library
                </button>
              </div>
            </div>
          ) : (
            <div className="item-list">
              {layoutRequests.map(request => (
                <RequestItem key={request.id} request={request} onAssignArchitect={() => openArchitectModal(request)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderReceivedDesigns = () => (
    <div>
      <div className="main-header">
        <div className="header-content">
          <div>
            <h1>Received Designs</h1>
            <p>Review designs, shortlist your favorites, and finalize one</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchReceivedDesigns}>↻ Refresh</button>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>All Designs</h2>
          <p>Designs sent by architects directly or for your requests</p>
        </div>
        <div className="section-content">
          {receivedDesigns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎨</div>
              <h3>No Designs Yet</h3>
              <p>Assigned architects will send designs here for your review.</p>
            </div>
          ) : (
            <div className="item-list">
              {receivedDesigns.map(d => (
                <div key={d.id} className="list-item">
                  <div className="item-icon">{d.status === 'finalized' ? '🏁' : d.status === 'shortlisted' ? '⭐' : '🎨'}</div>
                  <div className="item-content" style={{flex:1}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:10}}>
                      <div>
                        <h4 className="item-title" style={{margin:0}}>{d.design_title}</h4>
                        <p className="item-subtitle" style={{margin:'2px 0 0 0'}}>By {d.architect?.name || 'Architect'} • {new Date(d.created_at).toLocaleString()}</p>
                      </div>
                      <button className="btn btn-danger" onClick={() => handleDeleteDesign(d.id)}>🗑️ Delete</button>
                    </div>
                    <p className="item-meta" style={{marginTop:6}}>
                      Status: <span className={`status-badge ${d.status}`}>{d.status}</span>
                    </p>

                    {/* Files grid */}
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'10px', marginTop:'10px'}}>
                      {(d.files || []).map((f, idx) => {
                        const href = f.path || `/buildhub/backend/uploads/designs/${f.stored || f.original}`;
                        const ext = (f.ext || '').toLowerCase();
                        const isImage = ['jpg','jpeg','png','gif','webp','svg','heic'].includes(ext);
                        return (
                          <div key={idx} className="file-card" style={{cursor:'default'}}>
                            {isImage ? (
                              <img src={href} alt={f.original} style={{width:'100%', height:120, objectFit:'cover', borderRadius:6}} onClick={() => setViewer({ open: true, src: href, title: f.original || f.stored })} />
                            ) : (
                              <div className="file-thumb" style={{height:120, display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7', borderRadius:6}}>
                                <span style={{fontSize:'2rem'}}>📄</span>
                              </div>
                            )}
                            <div className="file-name" style={{fontSize:'0.85rem', marginTop:6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={f.original || f.stored}>{f.original || f.stored}</div>
                            <div style={{display:'flex', gap:8, marginTop:6}}>
                              {isImage ? (
                                <button type="button" className="btn btn-secondary" style={{padding:'6px 10px'}} onClick={() => setViewer({ open: true, src: href, title: f.original || f.stored })}>View</button>
                              ) : (
                                <a href={href} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{padding:'6px 10px'}}>Open</a>
                              )}
                              <a href={href} download className="btn" style={{padding:'6px 10px'}}>Download</a>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Comments */}
                    <div style={{marginTop:12}}>
                      <button className="btn btn-secondary" onClick={() => fetchComments(d.id)}>Load comments</button>
                      <div style={{marginTop:8}}>
                        {(comments[d.id] || []).map(c => (
                          <div key={c.id} className="comment-item" style={{padding:'8px 10px', background:'#fafafa', border:'1px solid #eee', borderRadius:6, marginBottom:6}}>
                            <div style={{fontWeight:600}}>{c.author}</div>
                            <div>{c.message}</div>
                            <div style={{fontSize:'0.8rem', color:'#666'}}>{new Date(c.created_at).toLocaleString()}</div>
                          </div>
                        ))}
                        <div className="comment-compose" style={{display:'flex', gap:8, marginTop:6, alignItems:'center'}}>
                          <div className="star-input" style={{display:'flex', gap:2}}>
                            {[1,2,3,4,5].map(star => (
                              <span
                                key={star}
                                role="button"
                                onClick={() => setCommentRatings(prev => ({ ...prev, [d.id]: star }))}
                                style={{cursor:'pointer', color: (commentRatings[d.id] || 0) >= star ? '#f5a623' : '#ddd', fontSize:'18px'}}
                                title={`${star} star${star>1?'s':''}`}
                              >★</span>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={commentDrafts[d.id] || ''}
                            onChange={(e) => setCommentDrafts(prev => ({ ...prev, [d.id]: e.target.value }))}
                            placeholder="Write a comment... (will also be posted as a review)"
                            style={{flex:1}}
                          />
                          <button className="btn btn-primary" onClick={() => postComment(d.id)}>Post</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="item-actions" style={{display:'flex', flexDirection:'column', gap:6}}>
                    {d.status !== 'shortlisted' && d.status !== 'finalized' && (
                      <button className="btn" onClick={() => updateSelection(d.id, 'shortlist')}>⭐ Shortlist</button>
                    )}
                    {d.status === 'shortlisted' && (
                      <button className="btn" onClick={() => updateSelection(d.id, 'remove-shortlist')}>Remove shortlist</button>
                    )}
                    {d.status !== 'finalized' && (
                      <button className="btn btn-primary" onClick={() => updateSelection(d.id, 'finalize')}>🏁 Finalize</button>
                    )}
                  </div>
                </div>
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
            <h1>Layout Library</h1>
            <p>Browse and select from our collection of pre-designed layouts</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRequestForm(true)}
          >
            + Custom Request
          </button>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Available Layouts</h2>
          <p>Choose from professionally designed layouts and customize them for your needs</p>
        </div>
        <div className="section-content">
          {loading ? (
            <div className="loading">Loading layouts...</div>
          ) : layoutLibrary.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No Layouts Available</h3>
              <p>Check back later for new layout designs!</p>
            </div>
          ) : (
            <div className="layout-grid">
              {layoutLibrary.map(layout => (
                <LayoutCard 
                  key={layout.id} 
                  layout={layout} 
                  onSelect={() => handleSelectFromLibrary(layout)}
                  onPreview={() => setPreviewLayout(layout)}
                  isImageUrl={isImageUrl}
                  isPdfUrl={isPdfUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div>
      <div className="main-header">
        <h1>My Projects</h1>
        <p>Monitor your ongoing construction projects</p>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Active Projects</h2>
          <p>Your current construction projects</p>
        </div>
        <div className="section-content">
          {myProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏗️</div>
              <h3>No Projects Yet</h3>
              <p>Your approved layout requests will appear here as projects!</p>
            </div>
          ) : (
            <div className="item-list">
              {myProjects.map(project => (
                <ProjectItem key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
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
            className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('library'); }}
          >
            <span className="nav-icon">📚</span>
            Layout Library
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('requests'); }}
          >
            <span className="nav-icon">📋</span>
            My Requests
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'designs' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('designs'); fetchReceivedDesigns(); }}
          >
            <span className="nav-icon">🎨</span>
            Received Designs
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('projects'); }}
          >
            <span className="nav-icon">🏗️</span>
            My Projects
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            <div className="user-info">
              <h4>{user?.first_name} {user?.last_name}</h4>
              <p>Homeowner</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span style={{fontSize: '1.2rem'}}>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* In-page alerts */}
        <div style={{position:'fixed', top:20, right:20, zIndex:1000, display:'flex', flexDirection:'column', gap:10}}>
          {error && (
            <div className="alert alert-error" style={{minWidth:280}}>
              {error}
              <button onClick={() => setError('')} className="alert-close">×</button>
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{minWidth:280}}>
              {success}
              <button onClick={() => setSuccess('')} className="alert-close">×</button>
            </div>
          )}
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'library' && renderLibrary()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'designs' && renderReceivedDesigns()}
        {activeTab === 'projects' && renderProjects()}

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="form-modal">
            <div className="form-content">
              <div className="form-header">
                <h3>
                  {requestData.layout_type === 'library' ? 'Customize Selected Layout' : 'Submit Layout Request'}
                </h3>
                <p>
                  {requestData.layout_type === 'library' 
                    ? 'Provide your requirements to customize the selected layout'
                    : 'Get professional architectural designs for your construction project'
                  }
                </p>
              </div>

              {/* Selected Layout Display */}
              {requestData.layout_type === 'library' && selectedLibraryLayout && (
                <div className="selected-layout-display">
                  <h4>Selected Layout: {selectedLibraryLayout.title}</h4>
                  <div className="layout-preview">
                    <img 
                      src={selectedLibraryLayout.image_url || '/images/default-layout.jpg'} 
                      alt={selectedLibraryLayout.title}
                      className="layout-image"
                    />
                    <div className="layout-details">
                      <p><strong>Type:</strong> {selectedLibraryLayout.layout_type}</p>
                      <p><strong>Bedrooms:</strong> {selectedLibraryLayout.bedrooms}</p>
                      <p><strong>Bathrooms:</strong> {selectedLibraryLayout.bathrooms}</p>
                      <p><strong>Area:</strong> {selectedLibraryLayout.area} sq ft</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleRequestSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Plot Size (sq ft) *</label>
                    <input
                      type="number"
                      value={requestData.plot_size}
                      onChange={(e) => setRequestData({...requestData, plot_size: e.target.value})}
                      placeholder="e.g., 1200"
                      required
                      min="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Budget Range *</label>
                    <select
                      value={requestData.budget_range}
                      onChange={(e) => setRequestData({...requestData, budget_range: e.target.value})}
                      required
                    >
                      <option value="">Select budget range</option>
                      <option value="5-10 Lakhs">₹5-10 Lakhs</option>
                      <option value="10-20 Lakhs">₹10-20 Lakhs</option>
                      <option value="20-50 Lakhs">₹20-50 Lakhs</option>
                      <option value="50+ Lakhs">₹50+ Lakhs</option>
                    </select>
                  </div>
                </div>

                {/* Site details */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Plot Shape</label>
                    <input
                      type="text"
                      value={requestData.plot_shape}
                      onChange={(e) => setRequestData({...requestData, plot_shape: e.target.value})}
                      placeholder="e.g., Rectangular, Square, Irregular"
                    />
                  </div>
                  <div className="form-group">
                    <label>Topography</label>
                    <input
                      type="text"
                      value={requestData.topography}
                      onChange={(e) => setRequestData({...requestData, topography: e.target.value})}
                      placeholder="e.g., Flat, Sloped, Rocky"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Local Development Laws / Restrictions</label>
                  <input
                    type="text"
                    value={requestData.development_laws}
                    onChange={(e) => setRequestData({...requestData, development_laws: e.target.value})}
                    placeholder="e.g., Setbacks, FSI/FAR, height limits"
                  />
                </div>

                {/* Family needs */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Family Needs</label>
                    <input
                      type="text"
                      value={requestData.family_needs}
                      onChange={(e) => setRequestData({...requestData, family_needs: e.target.value})}
                      placeholder="e.g., Elder-friendly, Work-from-home, Kids play area"
                    />
                  </div>
                  <div className="form-group">
                    <label>Rooms</label>
                    <input
                      type="text"
                      value={requestData.rooms}
                      onChange={(e) => setRequestData({...requestData, rooms: e.target.value})}
                      placeholder="e.g., 3 Bedrooms, 1 Study, 1 Puja Room"
                    />
                  </div>
                </div>

                {/* Aesthetic */}
                <div className="form-group">
                  <label>House Aesthetic / Style</label>
                  <input
                    type="text"
                    value={requestData.aesthetic}
                    onChange={(e) => setRequestData({...requestData, aesthetic: e.target.value})}
                    placeholder="e.g., Modern, Traditional, Minimalist"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={requestData.location}
                      onChange={(e) => setRequestData({...requestData, location: e.target.value})}
                      placeholder="e.g., Bangalore, Karnataka"
                    />
                  </div>
                  <div className="form-group">
                    <label>Timeline</label>
                    <select
                      value={requestData.timeline}
                      onChange={(e) => setRequestData({...requestData, timeline: e.target.value})}
                    >
                      <option value="">Select timeline</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="1+ year">1+ year</option>
                    </select>
                  </div>
                </div>

                {/* Additional notes */}
                <div className="form-group">
                  <label>
                    {requestData.layout_type === 'library' 
                      ? 'Customization Requirements *' 
                      : 'Additional Notes'
                    }
                  </label>
                  <textarea
                    value={requestData.requirements}
                    onChange={(e) => setRequestData({...requestData, requirements: e.target.value})}
                    placeholder={
                      requestData.layout_type === 'library'
                        ? "Describe any modifications you'd like to make to the selected layout: room changes, additional features, material preferences, etc."
                        : "Any other preferences or constraints"
                    }
                    rows="4"
                    required={requestData.layout_type === 'library'}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowRequestForm(false);
                      setSelectedLibraryLayout(null);
                      setRequestData({
                        plot_size: '',
                        budget_range: '',
                        requirements: '',
                        location: '',
                        timeline: '',
                        selected_layout_id: null,
                        layout_type: 'custom'
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Submitting...' : 
                     requestData.layout_type === 'library' ? 'Submit Customization Request' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Architect Selection Modal */}
        {showArchitectModal && (
          <div className="form-modal">
            <div className="form-content architect-modal">
              <div className="form-header">
                <h3>Select Architect</h3>
                <p>Choose an architect to send your request</p>
                <button className="modal-close" onClick={() => setShowArchitectModal(false)}>×</button>
              </div>

              {/* Request selection fallback */}
              {(!selectedRequestForAssign || !selectedRequestForAssign.id) ? (
                <div className="form-group">
                  <label>Select one of your requests</label>
                  <select
                    value={selectedRequestForAssign?.id || ''}
                    onChange={(e) => {
                      const req = layoutRequests.find(r => String(r.id) === e.target.value);
                      setSelectedRequestForAssign(req || null);
                    }}
                  >
                    <option value="">-- Select request --</option>
                    {layoutRequests.map(r => (
                      <option key={r.id} value={r.id}>
                        #{r.id} • {r.layout_type === 'library' ? (r.selected_layout_title || 'Library') : 'Custom'} • {r.plot_size} sq ft
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="info-row">
                  <span className="status-chip">For Request #{selectedRequestForAssign.id}</span>
                </div>
              )}

              <div className="filters-row">
                <input
                  type="text"
                  placeholder="Search name/company/email"
                  value={archSearch}
                  onChange={(e) => setArchSearch(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Specialization (optional)"
                  value={archSpec}
                  onChange={(e) => setArchSpec(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Min experience"
                  value={archMinExp}
                  onChange={(e) => setArchMinExp(e.target.value)}
                  min="0"
                />
                <button className="btn btn-secondary" onClick={() => fetchArchitects({ search: archSearch, specialization: archSpec, min_experience: archMinExp })}>
                  Search
                </button>
              </div>

              {archError && <div className="alert alert-error">{archError}</div>}

              <div className="architects-list">
                {archLoading ? (
                  <div className="loading">Loading architects...</div>
                ) : architects.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🧑‍🎨</div>
                    <h3>No architects found</h3>
                    <p>Adjust your filters and try again</p>
                  </div>
                ) : (
                  <div className="item-list">
                    {architects.map(a => {
                      const already = !!a.already_assigned;
                      const status = a.assignment_status; // sent | accepted | declined | null
                      return (
                        <label key={a.id} className={`list-item ${already ? 'disabled' : ''} ${Array.isArray(selectedArchitectId) ? selectedArchitectId.includes(a.id) ? 'selected' : '' : (selectedArchitectId === a.id ? 'selected' : '')}`}>
                          <div className="item-icon">🧑‍🎨</div>
                          <div className="item-content">
                            <h4 className="item-title">{a.first_name} {a.last_name} {a.company_name ? `• ${a.company_name}` : ''}</h4>
                            <p className="item-subtitle">{a.specialization || 'General'}</p>
                            <p className="item-meta">Experience: {a.experience_years ?? 'N/A'} yrs • {a.email}</p>
                            <div className="rating-row" style={{marginTop:4}}>
                              <span title={a.avg_rating ? `${a.avg_rating} / 5` : 'No ratings yet'}>
                                {[1,2,3,4,5].map(star => (
                                  <span key={star} style={{color: (a.avg_rating || 0) >= star ? '#f5a623' : '#ddd'}}>★</span>
                                ))}
                              </span>
                              <span style={{marginLeft:8, color:'#666', fontSize:'0.9rem'}}>({a.review_count || 0})</span>
                            </div>
                            {already && (
                              <div className="status-row">
                                <span className={`status-chip ${status === 'accepted' ? 'success' : status === 'declined' ? 'danger' : ''}`}>
                                  {status ? `Already ${status}` : 'Sent already'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="item-actions">
                            <input 
                              type="checkbox" 
                              disabled={already}
                              checked={Array.isArray(selectedArchitectId) ? selectedArchitectId.includes(a.id) : selectedArchitectId === a.id}
                              onChange={(e) => {
                                if (Array.isArray(selectedArchitectId)) {
                                  setSelectedArchitectId(
                                    e.target.checked
                                      ? [...selectedArchitectId, a.id]
                                      : selectedArchitectId.filter(id => id !== a.id)
                                  );
                                } else {
                                  setSelectedArchitectId(e.target.checked ? [a.id] : []);
                                }
                              }}
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Message to architect (optional)</label>
                <textarea
                  value={assignMessage}
                  onChange={(e) => setAssignMessage(e.target.value)}
                  placeholder="Add any notes for the architect"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => setShowArchitectModal(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={archLoading || !selectedArchitectId} onClick={handleAssignArchitect}>
                  {archLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Library Modal */}
        {showLibraryModal && (
          <div className="form-modal">
            <div className="form-content library-modal">
              <div className="form-header">
                <h3>Layout Library</h3>
                <p>Choose from our collection of professionally designed layouts</p>
                <button 
                  className="modal-close"
                  onClick={() => setShowLibraryModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="library-content">
                {loading ? (
                  <div className="loading">Loading layouts...</div>
                ) : layoutLibrary.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h3>No Layouts Available</h3>
                    <p>Check back later for new layout designs!</p>
                  </div>
                ) : (
                  <div className="layout-grid">
                    {layoutLibrary.map(layout => (
                      <LayoutCard 
                        key={layout.id} 
                        layout={layout} 
                        onSelect={() => handleSelectFromLibrary(layout)}
                        onPreview={() => setPreviewLayout(layout)}
                        isImageUrl={isImageUrl}
                        isPdfUrl={isPdfUrl}
                        isModal={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview modal for image + layout */}
        {previewLayout && (
          <div className="form-modal" onClick={() => setPreviewLayout(null)}>
            <div className="form-content" onClick={(e)=>e.stopPropagation()} style={{maxWidth:'min(1200px, 96vw)'}}>
              <div className="form-header">
                <h3>{previewLayout.title}</h3>
                <p>Preview Image and Layout</p>
              </div>
              <div className="form-row" style={{gap:'16px'}}>
                <div className="form-group" style={{flex:1}}>
                  <label>Preview Image</label>
                  {isImageUrl(previewLayout.image_url) ? (
                    <img src={previewLayout.image_url} alt="Preview" style={{width:'100%', maxHeight:'70vh', objectFit:'contain', borderRadius:8}}/>
                  ) : (
                    <div style={{padding:12, background:'#fafafa', border:'1px dashed #ddd', borderRadius:8}}>No image</div>
                  )}
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label>Layout</label>
                  {isImageUrl(previewLayout.design_file_url) ? (
                    <img src={previewLayout.design_file_url} alt="Layout" style={{width:'100%', maxHeight:'70vh', objectFit:'contain', borderRadius:8}}/>
                  ) : isPdfUrl(previewLayout.design_file_url) ? (
                    <iframe title="Layout PDF" src={previewLayout.design_file_url} style={{width:'100%', height:'70vh', border:'1px solid #eee', borderRadius:8}} />
                  ) : previewLayout.design_file_url ? (
                    <a className="btn btn-link" href={previewLayout.design_file_url} target="_blank" rel="noreferrer">Open/Download Layout</a>
                  ) : (
                    <div style={{padding:12, background:'#fafafa', border:'1px dashed #ddd', borderRadius:8}}>No layout file</div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={() => setPreviewLayout(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Request Item Component
const RequestItem = ({ request, onAssignArchitect }) => (
  <div className="list-item">
    <div className="item-icon">
      {request.layout_type === 'library' ? '📚' : 
       request.status === 'approved' ? '✅' : 
       request.status === 'rejected' ? '❌' : '⏳'}
    </div>
    <div className="item-content">
      <h4 className="item-title">
        {request.layout_type === 'library' 
          ? `Library Layout: ${request.selected_layout_title || 'Selected Layout'}` 
          : `Custom Layout Request - ${request.plot_size} sq ft`
        }
      </h4>
      <p className="item-subtitle">
        Budget: {request.budget_range}
        {request.layout_type === 'library' && request.selected_layout_type && (
          <span className="layout-type-badge"> • {request.selected_layout_type}</span>
        )}
      </p>
      <p className="item-meta">
        Submitted: {new Date(request.created_at).toLocaleDateString()}
        {request.location && ` • ${request.location}`}
        • Designs: {request.design_count} • Proposals: {request.proposal_count}
      </p>
      <div className="status-row">
        <span className="status-chip">Sent: {request.sent_count || 0}</span>
        <span className="status-chip success">Accepted: {request.accepted_count || 0}</span>
        <span className="status-chip danger">Rejected: {request.rejected_count || 0}</span>
      </div>
      {/* Minimal homeowner view: hide requirements & large preview */}
    </div>
    <div className="item-actions">
      <span className={`status-badge ${request.status}`}>
        {request.status}
      </span>
      <button className="btn btn-secondary" onClick={() => alert('Details modal coming soon')}>View Details</button>
      <button 
        className="btn btn-primary"
        onClick={onAssignArchitect}
        title="Send this request to a selected architect"
      >
        Send to Architect
      </button>
    </div>
  </div>
);

// Project Item Component
const ProjectItem = ({ project }) => (
  <div className="list-item">
    <div className="item-icon">🏗️</div>
    <div className="item-content">
      <h4 className="item-title">{project.project_name}</h4>
      <p className="item-subtitle">Contractor: {project.contractor_name}</p>
      <p className="item-meta">
        Started: {new Date(project.start_date).toLocaleDateString()}
        • Progress: {project.progress}%
      </p>
    </div>
    <div className="item-actions">
      <span className={`status-badge ${project.status}`}>
        {project.status}
      </span>
      <button className="btn btn-primary">
        View Project
      </button>
    </div>
  </div>
);

// Layout Card Component
const LayoutCard = ({ layout, onSelect, onPreview, isImageUrl, isPdfUrl, isModal = false }) => (
  <div className={`layout-card ${isModal ? 'modal-card' : ''}`}>
    <div className="layout-image-container">
      <button className="layout-image-button" onClick={onPreview} style={{cursor:'zoom-in'}}>
        <img 
          src={layout.image_url || '/images/default-layout.jpg'} 
          alt={layout.title}
          className="layout-card-image"
        />
      </button>
      <div className="layout-overlay">
        <div style={{display:'flex', gap:8}}>
          {(layout.design_file_url && (isImageUrl(layout.design_file_url) || isPdfUrl(layout.design_file_url))) && (
            <button className="btn" onClick={onPreview}>View Layout</button>
          )}
          <button className="btn btn-primary" onClick={onSelect}>
            Select Layout
          </button>
        </div>
      </div>
    </div>
    <div className="layout-card-content">
      <h4 className="layout-title">{layout.title}</h4>
      <p className="layout-type">{layout.layout_type}</p>
      <div className="layout-specs">
        <span className="spec">🛏️ {layout.bedrooms} BR</span>
        <span className="spec">🚿 {layout.bathrooms} BA</span>
        <span className="spec">📐 {layout.area} sq ft</span>
      </div>
      {layout.architect_name && (
        <p className="layout-author" style={{margin: '6px 0', color: '#555'}}>By {layout.architect_name}</p>
      )}
      {layout.description && (
        <p className="layout-description">{layout.description}</p>
      )}
      <div className="layout-price">
        {layout.price_range && (
          <span className="price-range">₹{layout.price_range}</span>
        )}
      </div>
    </div>
  </div>
);



export default HomeownerDashboard;