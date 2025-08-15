import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeownerDashboard.css';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
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

  // Request form state
  const [requestData, setRequestData] = useState({
    plot_size: '',
    budget_range: '',
    requirements: '',
    location: '',
    timeline: '',
    selected_layout_id: null,
    layout_type: 'custom' // 'custom' or 'library'
  });

  useEffect(() => {
    // Get user data from session
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);
    
    if (userData.id) {
      fetchMyRequests();
      fetchMyProjects();
      fetchLayoutLibrary();
    }
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

  const handleLogout = () => {
    localStorage.removeItem('bh_user');
    sessionStorage.removeItem('user');
    navigate('/login');
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
          budget_range: '',
          requirements: '',
          location: '',
          timeline: '',
          selected_layout_id: null,
          layout_type: 'custom'
        });
        fetchMyRequests();
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
                <RequestItem key={request.id} request={request} />
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
        {activeTab === 'library' && renderLibrary()}
        {activeTab === 'requests' && renderRequests()}
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

                <div className="form-group">
                  <label>
                    {requestData.layout_type === 'library' 
                      ? 'Customization Requirements *' 
                      : 'Requirements & Specifications *'
                    }
                  </label>
                  <textarea
                    value={requestData.requirements}
                    onChange={(e) => setRequestData({...requestData, requirements: e.target.value})}
                    placeholder={
                      requestData.layout_type === 'library'
                        ? "Describe any modifications you'd like to make to the selected layout: room changes, additional features, material preferences, etc."
                        : "Describe your requirements: number of bedrooms, bathrooms, kitchen style, special features, etc."
                    }
                    rows="4"
                    required
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
                        isModal={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Request Item Component
const RequestItem = ({ request }) => (
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
      <p className="item-description">
        {request.layout_type === 'library' 
          ? `Customization: ${request.requirements}`
          : request.requirements
        }
      </p>
      {request.layout_type === 'library' && request.selected_layout_image && (
        <div className="request-layout-preview">
          <img 
            src={request.selected_layout_image} 
            alt={request.selected_layout_title}
            className="request-layout-image"
          />
        </div>
      )}
    </div>
    <div className="item-actions">
      <span className={`status-badge ${request.status}`}>
        {request.status}
      </span>
      <button className="btn btn-secondary">
        View Details
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
const LayoutCard = ({ layout, onSelect, isModal = false }) => (
  <div className={`layout-card ${isModal ? 'modal-card' : ''}`}>
    <div className="layout-image-container">
      <img 
        src={layout.image_url || '/images/default-layout.jpg'} 
        alt={layout.title}
        className="layout-card-image"
      />
      <div className="layout-overlay">
        <button className="btn btn-primary" onClick={onSelect}>
          Select Layout
        </button>
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