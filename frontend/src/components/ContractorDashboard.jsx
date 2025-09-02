import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ContractorDashboard.css';

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [layoutRequests, setLayoutRequests] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [userSetCollapsed, setUserSetCollapsed] = useState(false);

  useEffect(() => {
    // Get user data from session
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);

    import('../utils/session').then(({ preventCache, verifyServerSession }) => {
      preventCache();
      (async () => {
        const serverAuth = await verifyServerSession();
        if (!userData.id || userData.role !== 'contractor' || !serverAuth) {
          sessionStorage.removeItem('user');
          localStorage.removeItem('bh_user');
          navigate('/login', { replace: true });
          return;
        }
        fetchLayoutRequests();
        fetchMyProposals();
      })();
    });
  }, []);

  // Close profile dropdown on outside click or ESC
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Auto-collapse on small screens unless user manually toggled
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const apply = () => {
      if (!userSetCollapsed) setCollapsed(mq.matches);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [userSetCollapsed]);

  const fetchLayoutRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/buildhub/backend/api/contractor/get_layout_requests.php');
      const result = await response.json();
      if (result.success) {
        setLayoutRequests(result.requests || []);
      }
    } catch (error) {
      console.error('Error fetching layout requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProposals = async () => {
    try {
      const response = await fetch('/buildhub/backend/api/contractor/get_my_proposals.php');
      const result = await response.json();
      if (result.success) {
        setMyProposals(result.proposals || []);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const handleLogout = async () => {
    try { await fetch('/buildhub/backend/api/logout.php', { method: 'POST', credentials: 'include' }); } catch {}
    localStorage.removeItem('bh_user');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const renderOverview = () => (
    <div>
      {/* Main Header */}
      <div className="main-header">
        <h1>Welcome back, {user?.first_name}!</h1>
        <p>Manage your cost estimates and project bids</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon pending">⏰</div>
            <div className="stat-info">
              <h3>{layoutRequests.length}</h3>
              <p>Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon estimates">📋</div>
            <div className="stat-info">
              <h3>{myProposals.length}</h3>
              <p>Estimates Sent</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon projects">✅</div>
            <div className="stat-info">
              <h3>{myProposals.filter(p => p.status === 'accepted').length}</h3>
              <p>Projects Won</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon total">💰</div>
            <div className="stat-info">
              <h3>₹{myProposals.reduce((sum, p) => sum + (parseFloat(p.total_cost) || 0), 0).toLocaleString()}</h3>
              <p>Total Bids</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cost Requests */}
      <div className="section-card">
        <div className="section-header">
          <h2>Recent Cost Requests</h2>
          <p>Latest layout approvals requiring cost estimates</p>
        </div>
        <div className="section-content">
          {loading ? (
            <div className="loading">Loading requests...</div>
          ) : layoutRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Requests Available</h3>
              <p>Check back later for new project opportunities!</p>
            </div>
          ) : (
            <div className="item-list">
              {layoutRequests.slice(0, 5).map(request => (
                <div key={request.id} className="list-item">
                  <div className="item-image">🏠</div>
                  <div className="item-content">
                    <h4 className="item-title">{request.homeowner_name}</h4>
                    <p className="item-subtitle">{request.requirements || 'Modern Home Project'}</p>
                    <p className="item-meta">{request.plot_size} • Budget: ₹{request.budget_range}</p>
                  </div>
                  <div className="item-actions">
                    <span className="status-badge pending">pending</span>
                    <button className="btn btn-primary">Submit Estimate</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAvailableProjects = () => (
    <div>
      <div className="main-header">
        <h1>Cost Requests</h1>
        <p>Browse layout requests from homeowners and submit your cost estimates</p>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Available Projects</h2>
          <p>Submit cost estimates for approved layouts</p>
        </div>
        <div className="section-content">
          {loading ? (
            <div className="loading">Loading projects...</div>
          ) : layoutRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Projects Available</h3>
              <p>Check back later for new project opportunities!</p>
            </div>
          ) : (
            <div className="item-list">
              {layoutRequests.map(request => (
                <ProjectItem key={request.id} request={request} onProposalSubmit={fetchMyProposals} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMyProposals = () => (
    <div>
      <div className="main-header">
        <h1>My Estimates</h1>
        <p>Track your submitted cost estimates and their status</p>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Submitted Estimates</h2>
          <p>Monitor the status of your cost estimates</p>
        </div>
        <div className="section-content">
          {myProposals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No Estimates Yet</h3>
              <p>Submit estimates for available projects to get started!</p>
            </div>
          ) : (
            <div className="item-list">
              {myProposals.map(proposal => (
                <ProposalItem key={proposal.id} proposal={proposal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div>
      <div className="main-header">
        <h1>Profile</h1>
        <p>Manage your account information and settings</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar-large">
            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
          </div>
          <div className="profile-info">
            <h3>{user?.first_name} {user?.last_name}</h3>
            <p className="profile-role">Contractor</p>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-card">
          <div className="section-header">
            <h2>Account Information</h2>
            <p>Your personal and professional details</p>
          </div>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Full Name</label>
              <p>{user?.first_name} {user?.last_name}</p>
            </div>
            <div className="detail-item">
              <label>Email Address</label>
              <p>{user?.email}</p>
            </div>
            <div className="detail-item">
              <label>Role</label>
              <p>Contractor</p>
            </div>
            <div className="detail-item">
              <label>Account Status</label>
              <p className="status-badge accepted">Active</p>
            </div>
            <div className="detail-item">
              <label>Total Projects</label>
              <p>{myProposals.filter(p => p.status === 'accepted').length}</p>
            </div>
            <div className="detail-item">
              <label>Success Rate</label>
              <p>{myProposals.length > 0 ? Math.round((myProposals.filter(p => p.status === 'accepted').length / myProposals.length) * 100) : 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">

          <a href="#" className="sidebar-logo">
            <div className="logo-icon">🏠</div>
            <span className="logo-text">BUILDHUB</span>
          </a>
        </div>

        <nav className="sidebar-nav">
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
            title="Dashboard"
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('projects'); }}
            title="Cost Requests"
          >
            <span className="nav-icon">📋</span>
            <span className="nav-label">Cost Requests</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'proposals' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('proposals'); }}
            title="My Estimates"
          >
            <span className="nav-icon">📄</span>
            <span className="nav-label">My Estimates</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}
            title="Profile"
          >
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profile</span>
          </a>
        </nav>

        {/* Edge toggle button */}
        <button
          className={`sidebar-edge-toggle ${collapsed ? 'collapsed' : ''}`}
          onClick={() => { setCollapsed(v => !v); setUserSetCollapsed(true); }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <span className="edge-icon">{collapsed ? '›' : '‹'}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Topbar with profile at top-right */}
        <div className="topbar" role="banner">
          <div className="topbar-spacer" />
          <div className="topbar-profile" aria-label="User profile" ref={profileRef}>
            <button className="topbar-user" onClick={() => setProfileOpen(v => !v)} aria-haspopup="menu" aria-expanded={profileOpen}>
              <div className="topbar-avatar">{user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}</div>
              <div className="topbar-meta">
                <span className="topbar-name">{user?.first_name} {user?.last_name}</span>
                <span className="topbar-role">Contractor</span>
              </div>
              <span className={`chevron ${profileOpen ? 'open' : ''}`}>▾</span>
            </button>
            <div className={`profile-menu ${profileOpen ? 'open' : ''}`} role="menu" aria-hidden={!profileOpen}>
              <button className="profile-item" role="menuitem" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'projects' && renderAvailableProjects()}
        {activeTab === 'proposals' && renderMyProposals()}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </div>
  );
};

// Project Item Component
const ProjectItem = ({ request, onProposalSubmit }) => {
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    materials: '',
    cost_breakdown: '',
    total_cost: '',
    timeline: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/buildhub/backend/api/contractor/submit_proposal.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layout_request_id: request.id,
          ...proposalData
        })
      });

      const result = await response.json();
      if (result.success) {
        setShowProposalForm(false);
        setProposalData({
          materials: '',
          cost_breakdown: '',
          total_cost: '',
          timeline: '',
          notes: ''
        });
        onProposalSubmit();
        alert('Proposal submitted successfully!');
      } else {
        alert('Failed to submit proposal: ' + result.message);
      }
    } catch (error) {
      alert('Error submitting proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="list-item">
        <div className="item-image">🏠</div>
        <div className="item-content">
          <h4 className="item-title">{request.homeowner_name}</h4>
          <p className="item-subtitle">{request.requirements || 'Modern Home Project'}</p>
          <p className="item-meta">{request.plot_size} • Budget: ₹{request.budget_range} • {new Date(request.created_at).toLocaleDateString()}</p>
        </div>
        <div className="item-actions">
          <span className="status-badge pending">pending</span>
          <button 
            onClick={() => setShowProposalForm(true)}
            className="btn btn-primary"
          >
            Submit Estimate
          </button>
        </div>
      </div>

      {showProposalForm && (
        <div className="form-modal">
          <div className="form-content">
            <div className="form-header">
              <h3>Submit Cost Estimate</h3>
              <p>Provide detailed cost breakdown for {request.homeowner_name}'s project</p>
            </div>
            
            <form onSubmit={handleSubmitProposal}>
              <div className="form-group">
                <label>Materials List *</label>
                <textarea
                  value={proposalData.materials}
                  onChange={(e) => setProposalData({...proposalData, materials: e.target.value})}
                  placeholder="List all materials needed (cement, steel, bricks, etc.)"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Cost Breakdown *</label>
                <textarea
                  value={proposalData.cost_breakdown}
                  onChange={(e) => setProposalData({...proposalData, cost_breakdown: e.target.value})}
                  placeholder="Detailed cost breakdown for materials and labor"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Cost (₹) *</label>
                  <input
                    type="number"
                    value={proposalData.total_cost}
                    onChange={(e) => setProposalData({...proposalData, total_cost: e.target.value})}
                    placeholder="Total project cost"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Timeline *</label>
                  <input
                    type="text"
                    value={proposalData.timeline}
                    onChange={(e) => setProposalData({...proposalData, timeline: e.target.value})}
                    placeholder="e.g., 3-4 months"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  value={proposalData.notes}
                  onChange={(e) => setProposalData({...proposalData, notes: e.target.value})}
                  placeholder="Any additional information or terms"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowProposalForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Estimate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Proposal Item Component
const ProposalItem = ({ proposal }) => (
  <div className="list-item">
    <div className="item-image">📄</div>
    <div className="item-content">
      <h4 className="item-title">Estimate for {proposal.homeowner_name}</h4>
      <p className="item-subtitle">Total Cost: ₹{proposal.total_cost} • Timeline: {proposal.timeline}</p>
      <p className="item-meta">Submitted: {new Date(proposal.created_at).toLocaleDateString()}</p>
    </div>
    <div className="item-actions">
      <span className={`status-badge ${proposal.status}`}>
        {proposal.status === 'accepted' ? 'accepted' :
         proposal.status === 'rejected' ? 'rejected' : 'pending'}
      </span>
    </div>
  </div>
);

export default ContractorDashboard;