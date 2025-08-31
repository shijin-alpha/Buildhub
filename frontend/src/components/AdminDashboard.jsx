import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // User management filters
  const [userFilters, setUserFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Material form state
  const [materialForm, setMaterialForm] = useState({
    name: '',
    category: '',
    unit: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    // Strict: prevent cached back navigation
    import('../utils/session').then(({ preventCache }) => preventCache());

    fetchSystemStats();
    if (activeTab === 'pending') {
      fetchPendingUsers();
    } else if (activeTab === 'users') {
      fetchAllUsers();
    } else if (activeTab === 'materials') {
      fetchMaterials();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAllUsers();
    }
  }, [userFilters]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchSystemStats = async () => {
    try {
      // Mock system stats - replace with actual API call
      setSystemStats({
        totalUsers: 156,
        pendingApprovals: pendingUsers.length,
        totalMaterials: materials.length,
        activeProjects: 23
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/buildhub/backend/api/admin/get_pending_users.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setPendingUsers(result.users || []);
        setError('');
      } else {
        setError(result.message || 'Failed to fetch pending users');
        setPendingUsers([]);
      }
    } catch (error) {
      console.error('Fetch pending users error:', error);
      setError(`Network error: ${error.message}`);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        role: userFilters.role,
        status: userFilters.status,
        search: userFilters.search,
        sortBy: userFilters.sortBy,
        sortOrder: userFilters.sortOrder
      });

      const response = await fetch(`/buildhub/backend/api/admin/get_all_users.php?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAllUsers(result.users || []);
        setError('');
      } else {
        setError(result.message || 'Failed to fetch users');
        setAllUsers([]);
      }
    } catch (error) {
      console.error('Fetch all users error:', error);
      setError(`Network error: ${error.message}`);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch('/buildhub/backend/api/admin/get_materials.php');
      const result = await response.json();
      if (result.success) {
        setMaterials(result.materials);
      } else {
        setError(result.message || 'Failed to fetch materials');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/buildhub/backend/api/admin/user_action.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          action: action
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          fetchPendingUsers();
        }, 500);
      } else {
        setError(result.message || 'Action failed');
      }
    } catch (error) {
      console.error('User action error:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (userId, docType) => {
    try {
      const response = await fetch(`/buildhub/backend/api/admin/download_document.php?user_id=${userId}&doc_type=${docType}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${docType}_${userId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to download document');
      }
    } catch (error) {
      setError('Download failed');
    }
  };

  const viewDocument = (userId, docType) => {
    const viewUrl = `/buildhub/backend/api/admin/view_document.php?user_id=${userId}&doc_type=${docType}`;
    window.open(viewUrl, '_blank');
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/buildhub/backend/api/admin/add_material.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialForm)
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess('Material added successfully');
        setMaterialForm({ name: '', category: '', unit: '', price: '', description: '' });
        fetchMaterials();
      } else {
        setError(result.message || 'Failed to add material');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/buildhub/backend/api/admin/delete_material.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ material_id: materialId })
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess('Material deleted successfully');
        fetchMaterials();
      } else {
        setError(result.message || 'Failed to delete material');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/buildhub/backend/api/admin/update_user_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(result.message);
        fetchAllUsers();
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({...selectedUser, status: newStatus});
        }
      } else {
        setError(result.message || 'Status update failed');
      }
    } catch (error) {
      console.error('User status update error:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setUserFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setUserFilters({
      role: 'all',
      status: 'all',
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleLogout = async () => {
    try { await fetch('/buildhub/backend/api/logout.php', { method: 'POST', credentials: 'include' }); } catch {}
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_username');
    navigate('/login', { replace: true });
  };

  const renderDashboard = () => (
    <div>
      {/* Main Header */}
      <div className="main-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, materials, and monitor system activity</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon users">👥</div>
            <div className="stat-info">
              <h3>{systemStats.totalUsers || 0}</h3>
              <p>Total Users</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <h3>{pendingUsers.length}</h3>
              <p>Pending Approvals</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon materials">🧱</div>
            <div className="stat-info">
              <h3>{materials.length}</h3>
              <p>Materials Listed</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon projects">🏗️</div>
            <div className="stat-info">
              <h3>{systemStats.activeProjects || 0}</h3>
              <p>Active Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-card">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>Common administrative tasks</p>
        </div>
        <div className="section-content">
          <div className="quick-actions">
            <button 
              className="action-card"
              onClick={() => setActiveTab('users')}
            >
              <div className="action-icon">�</div>
              <h3>Manage All Users</h3>
              <p>View, filter, and manage all system users</p>
            </button>
            <button 
              className="action-card"
              onClick={() => setActiveTab('pending')}
            >
              <div className="action-icon">⏳</div>
              <h3>Review Pending Users</h3>
              <p>Approve or reject user registration requests</p>
            </button>
            <button 
              className="action-card"
              onClick={() => setActiveTab('materials')}
            >
              <div className="action-icon">🧱</div>
              <h3>Manage Materials</h3>
              <p>Add, edit, or remove construction materials</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-card">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <p>Latest system activities and user actions</p>
        </div>
        <div className="section-content">
          <div className="item-list">
            {pendingUsers.slice(0, 5).map(user => (
              <div key={user.id} className="list-item">
                <div className="item-icon">👤</div>
                <div className="item-content">
                  <h4 className="item-title">{user.first_name} {user.last_name}</h4>
                  <p className="item-subtitle">Role: {user.role} • Email: {user.email}</p>
                  <p className="item-meta">Registered: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="item-actions">
                  <span className="status-badge pending">Pending Review</span>
                </div>
              </div>
            ))}
            {pendingUsers.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h3>All Caught Up!</h3>
                <p>No pending user approvals at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div className="main-header">
        <div className="header-content">
          <div>
            <h1>User Management</h1>
            <p>View and manage all users in the system</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="section-card">
        <div className="section-header">
          <h2>Filter & Search Users</h2>
          <p>Use filters to find specific users efficiently</p>
        </div>
        <div className="section-content">
          <div className="filters-container">
            <div className="filter-row">
              <div className="filter-group">
                <label>Search Users</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={userFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>User Role</label>
                <select
                  value={userFilters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Roles</option>
                  <option value="homeowner">Homeowners</option>
                  <option value="contractor">Contractors</option>
                  <option value="architect">Architects</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={userFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-group">
                <label>Sort By</label>
                <select
                  value={userFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="filter-select"
                >
                  <option value="created_at">Registration Date</option>
                  <option value="first_name">First Name</option>
                  <option value="last_name">Last Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Order</label>
                <select
                  value={userFilters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="filter-select"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
              <div className="filter-actions">
                <button className="btn btn-secondary" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="section-card">
        <div className="section-header">
          <h2>Users ({allUsers.length})</h2>
          <p>All registered users in the system</p>
        </div>
        <div className="section-content">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : allUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No Users Found</h3>
              <p>No users match your current filters.</p>
            </div>
          ) : (
            <div className="users-table-container">
              <div className="users-table">
                <div className="table-header">
                  <div className="table-cell">User</div>
                  <div className="table-cell">Role</div>
                  <div className="table-cell">Status</div>
                  <div className="table-cell">Registered</div>
                  <div className="table-cell">Actions</div>
                </div>
                {allUsers.map(user => (
                  <UserTableRow 
                    key={user.id} 
                    user={user} 
                    onViewDetails={() => viewUserDetails(user)}
                    onStatusChange={(newStatus) => handleUserStatusChange(user.id, newStatus)}
                    onViewDocument={viewDocument}
                    onDownloadDocument={downloadDocument}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPendingUsers = () => (
    <div>
      <div className="main-header">
        <div className="header-content">
          <div>
            <h1>Pending User Approvals</h1>
            <p>Review and approve user registration requests</p>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Users Awaiting Approval</h2>
          <p>Review user documents and approve or reject registrations</p>
        </div>
        <div className="section-content">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>No Pending Approvals</h3>
              <p>All user registrations have been processed!</p>
            </div>
          ) : (
            <div className="users-grid">
              {pendingUsers.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onApprove={() => handleUserAction(user.id, 'approve')}
                  onReject={() => handleUserAction(user.id, 'reject')}
                  onViewDocument={viewDocument}
                  onDownloadDocument={downloadDocument}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMaterials = () => (
    <div>
      <div className="main-header">
        <div className="header-content">
          <div>
            <h1>Materials Management</h1>
            <p>Manage construction materials and pricing</p>
          </div>
        </div>
      </div>

      {/* Add Material Form */}
      <div className="section-card">
        <div className="section-header">
          <h2>Add New Material</h2>
          <p>Add construction materials to the system catalog</p>
        </div>
        <div className="section-content">
          <form onSubmit={handleMaterialSubmit} className="material-form">
            <div className="form-row">
              <div className="form-group">
                <label>Material Name *</label>
                <input
                  type="text"
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({...materialForm, name: e.target.value})}
                  placeholder="e.g., Portland Cement"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={materialForm.category}
                  onChange={(e) => setMaterialForm({...materialForm, category: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="cement">Cement</option>
                  <option value="steel">Steel</option>
                  <option value="bricks">Bricks</option>
                  <option value="sand">Sand</option>
                  <option value="gravel">Gravel</option>
                  <option value="wood">Wood</option>
                  <option value="tiles">Tiles</option>
                  <option value="paint">Paint</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Unit *</label>
                <input
                  type="text"
                  value={materialForm.unit}
                  onChange={(e) => setMaterialForm({...materialForm, unit: e.target.value})}
                  placeholder="kg, m³, pieces, etc."
                  required
                />
              </div>
              <div className="form-group">
                <label>Price per Unit *</label>
                <input
                  type="number"
                  step="0.01"
                  value={materialForm.price}
                  onChange={(e) => setMaterialForm({...materialForm, price: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={materialForm.description}
                onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})}
                placeholder="Optional description of the material..."
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Adding...' : 'Add Material'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Materials List */}
      <div className="section-card">
        <div className="section-header">
          <h2>Current Materials</h2>
          <p>All materials currently available in the system</p>
        </div>
        <div className="section-content">
          {loading ? (
            <div className="loading">Loading materials...</div>
          ) : materials.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧱</div>
              <h3>No Materials Added</h3>
              <p>Start by adding your first construction material!</p>
            </div>
          ) : (
            <div className="materials-grid">
              {materials.map(material => (
                <MaterialCard 
                  key={material.id} 
                  material={material} 
                  onDelete={() => deleteMaterial(material.id)}
                />
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
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}
          >
            <span className="nav-icon">👥</span>
            All Users
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('pending'); }}
          >
            <span className="nav-icon">⏳</span>
            Pending Approvals
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('materials'); }}
          >
            <span className="nav-icon">🧱</span>
            Materials
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">AD</div>
            <div className="user-info">
              <h4>Administrator</h4>
              <p>System Admin</p>
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
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'pending' && renderPendingUsers()}
        {activeTab === 'materials' && renderMaterials()}

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
            <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>User Details</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowUserModal(false)}
                >
                  ×
                </button>
              </div>
              <UserDetailsModal 
                user={selectedUser}
                onStatusChange={(newStatus) => handleUserStatusChange(selectedUser.id, newStatus)}
                onViewDocument={viewDocument}
                onDownloadDocument={downloadDocument}
                onClose={() => setShowUserModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// User Card Component
const UserCard = ({ user, onApprove, onReject, onViewDocument, onDownloadDocument, loading }) => (
  <div className="user-card">
    <div className="user-header">
      <div className="user-avatar">
        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
      </div>
      <div className="user-basic-info">
        <h4>{user.first_name} {user.last_name}</h4>
        <p className="user-role">{user.role}</p>
      </div>
    </div>
    
    <div className="user-details">
      <div className="detail-item">
        <span className="detail-label">Email:</span>
        <span className="detail-value">{user.email}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Registered:</span>
        <span className="detail-value">{new Date(user.created_at).toLocaleDateString()}</span>
      </div>
    </div>
    
    <div className="user-documents">
      <h5>Documents:</h5>
      {user.role === 'contractor' && user.license && (
        <div className="document-item">
          <span>📄 License Document</span>
          <div className="document-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onViewDocument(user.id, 'license')}
            >
              👁️ View
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onDownloadDocument(user.id, 'license')}
            >
              📥 Download
            </button>
          </div>
        </div>
      )}
      {user.role === 'architect' && user.portfolio && (
        <div className="document-item">
          <span>📁 Portfolio Document</span>
          <div className="document-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onViewDocument(user.id, 'portfolio')}
            >
              👁️ View
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onDownloadDocument(user.id, 'portfolio')}
            >
              📥 Download
            </button>
          </div>
        </div>
      )}
      {!user.license && !user.portfolio && (
        <p className="no-documents">No documents uploaded</p>
      )}
    </div>
    
    <div className="user-actions">
      <button 
        className="btn btn-success"
        onClick={onApprove}
        disabled={loading}
      >
        ✅ Approve
      </button>
      <button 
        className="btn btn-danger"
        onClick={onReject}
        disabled={loading}
      >
        ❌ Reject
      </button>
    </div>
  </div>
);

// User Table Row Component
const UserTableRow = ({ user, onViewDetails, onStatusChange, onViewDocument, onDownloadDocument }) => (
  <div className="table-row">
    <div className="table-cell user-info-cell">
      <div className="user-avatar-small">
        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
      </div>
      <div className="user-basic-info">
        <h5>{user.first_name} {user.last_name}</h5>
        <p>{user.email}</p>
        {user.phone && <p>{user.phone}</p>}
      </div>
    </div>
    <div className="table-cell">
      <span className={`role-badge ${user.role}`}>
        {user.role}
      </span>
    </div>
    <div className="table-cell">
      <span className={`status-badge ${user.status}`}>
        {user.status}
      </span>
    </div>
    <div className="table-cell">
      {new Date(user.created_at).toLocaleDateString()}
    </div>
    <div className="table-cell actions-cell">
      <div className="action-buttons">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onViewDetails}
        >
          👁️ View
        </button>
        {user.status === 'pending' && (
          <>
            <button 
              className="btn btn-success btn-sm"
              onClick={() => onStatusChange('approved')}
            >
              ✅ Approve
            </button>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => onStatusChange('rejected')}
            >
              ❌ Reject
            </button>
          </>
        )}
        {user.status === 'approved' && (
          <button 
            className="btn btn-danger btn-sm"
            onClick={() => onStatusChange('suspended')}
          >
            🚫 Suspend
          </button>
        )}
        {user.status === 'suspended' && (
          <button 
            className="btn btn-success btn-sm"
            onClick={() => onStatusChange('approved')}
          >
            ✅ Activate
          </button>
        )}
      </div>
    </div>
  </div>
);

// User Details Modal Component
const UserDetailsModal = ({ user, onStatusChange, onViewDocument, onDownloadDocument, onClose }) => (
  <div className="user-details-modal">
    <div className="user-profile-section">
      <div className="user-avatar-large">
        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
      </div>
      <div className="user-profile-info">
        <h2>{user.first_name} {user.last_name}</h2>
        <p className="user-role-large">{user.role}</p>
        <span className={`status-badge-large ${user.status}`}>
          {user.status}
        </span>
      </div>
    </div>

    <div className="user-details-grid">
      <div className="detail-section">
        <h4>Contact Information</h4>
        <div className="detail-item">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{user.email}</span>
        </div>
        {user.phone && (
          <div className="detail-item">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{user.phone}</span>
          </div>
        )}
        {user.address && (
          <div className="detail-item">
            <span className="detail-label">Address:</span>
            <span className="detail-value">{user.address}</span>
          </div>
        )}
      </div>

      <div className="detail-section">
        <h4>Account Information</h4>
        <div className="detail-item">
          <span className="detail-label">User ID:</span>
          <span className="detail-value">#{user.id}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Registered:</span>
          <span className="detail-value">{new Date(user.created_at).toLocaleDateString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Last Updated:</span>
          <span className="detail-value">{new Date(user.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      {(user.role === 'contractor' || user.role === 'architect') && (
        <div className="detail-section">
          <h4>Professional Information</h4>
          {user.company_name && (
            <div className="detail-item">
              <span className="detail-label">Company:</span>
              <span className="detail-value">{user.company_name}</span>
            </div>
          )}
          {user.experience_years && (
            <div className="detail-item">
              <span className="detail-label">Experience:</span>
              <span className="detail-value">{user.experience_years} years</span>
            </div>
          )}
          {user.specialization && (
            <div className="detail-item">
              <span className="detail-label">Specialization:</span>
              <span className="detail-value">{user.specialization}</span>
            </div>
          )}
        </div>
      )}

      <div className="detail-section">
        <h4>Documents</h4>
        {user.role === 'contractor' && user.license && (
          <div className="document-item">
            <span>📄 License Document</span>
            <div className="document-actions">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onViewDocument(user.id, 'license')}
              >
                👁️ View
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onDownloadDocument(user.id, 'license')}
              >
                📥 Download
              </button>
            </div>
          </div>
        )}
        {user.role === 'architect' && user.portfolio && (
          <div className="document-item">
            <span>📁 Portfolio Document</span>
            <div className="document-actions">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onViewDocument(user.id, 'portfolio')}
              >
                👁️ View
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onDownloadDocument(user.id, 'portfolio')}
              >
                📥 Download
              </button>
            </div>
          </div>
        )}
        {!user.license && !user.portfolio && (
          <p className="no-documents">No documents uploaded</p>
        )}
      </div>
    </div>

    <div className="modal-actions">
      {user.status === 'pending' && (
        <>
          <button 
            className="btn btn-success"
            onClick={() => onStatusChange('approved')}
          >
            ✅ Approve User
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => onStatusChange('rejected')}
          >
            ❌ Reject User
          </button>
        </>
      )}
      {user.status === 'approved' && (
        <button 
          className="btn btn-danger"
          onClick={() => onStatusChange('suspended')}
        >
          🚫 Suspend User
        </button>
      )}
      {user.status === 'suspended' && (
        <button 
          className="btn btn-success"
          onClick={() => onStatusChange('approved')}
        >
          ✅ Activate User
        </button>
      )}
      <button 
        className="btn btn-secondary"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

// Material Card Component
const MaterialCard = ({ material, onDelete }) => (
  <div className="material-card">
    <div className="material-header">
      <h4>{material.name}</h4>
      <span className="material-category">{material.category}</span>
    </div>
    <div className="material-details">
      <div className="detail-item">
        <span className="detail-label">Unit:</span>
        <span className="detail-value">{material.unit}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Price:</span>
        <span className="detail-value">₹{material.price}</span>
      </div>
      {material.description && (
        <div className="material-description">
          <p>{material.description}</p>
        </div>
      )}
    </div>
    <div className="material-actions">
      <button 
        className="btn btn-danger btn-sm"
        onClick={onDelete}
      >
        🗑️ Delete
      </button>
    </div>
  </div>
);

export default AdminDashboard;