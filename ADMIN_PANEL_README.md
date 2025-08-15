# BuildHub Admin Panel Documentation

## 🚀 Admin Panel Features

The BuildHub Admin Panel provides comprehensive management tools for:

### 1. **User Approval System**
- Review contractor and architect registrations
- View and download submitted documents (licenses/portfolios)
- Approve or reject user applications
- Automatic email notifications to users

### 2. **Materials Management**
- Add new construction materials with pricing
- Categorize materials (cement, steel, bricks, etc.)
- Set units and prices for cost estimation
- Delete outdated materials

## 🔐 Admin Access

### Login Credentials
- **URL**: `http://localhost:3000/login` (Use the main login page)
- **Email**: `shijinthomas369@gmail.com`
- **Password**: `admin123`

> ⚠️ **Security Note**: Change these default credentials in production!

### How to Login as Admin
1. Go to the main login page: `http://localhost:3000/login`
2. Enter the admin email: `shijinthomas369@gmail.com`
3. Enter the admin password: `admin123`
4. Click "Login" - you'll be automatically redirected to the admin dashboard

> 💡 **Note**: Admin credentials are displayed on the login page for convenience during development.

## 📋 How to Use the Admin Panel

### **Step 1: Access Admin Panel**
1. Navigate to `http://localhost:3000/login`
2. Enter admin email: `shijinthomas369@gmail.com`
3. Enter admin password: `admin123`
4. Click "Login" - you'll be redirected to the admin dashboard

### **Step 2: Review Pending Users**
1. Click on "Pending Approvals" tab (default view)
2. Review user information:
   - Name, email, role, registration date
   - Download and verify documents
3. Take action:
   - **Approve**: User gets verification email and can login
   - **Reject**: User is removed and gets rejection email

### **Step 3: Manage Materials**
1. Click on "Materials Management" tab
2. **Add New Material**:
   - Fill in material name, category, unit, price
   - Add optional description
   - Click "Add Material"
3. **Delete Material**:
   - Find material in the list
   - Click "🗑️ Delete" button
   - Confirm deletion

## 📧 Email Notifications

### **Approval Email**
When you approve a user, they receive:
- Welcome message with account details
- Login link to the platform
- Information about their new privileges

### **Rejection Email**
When you reject a user, they receive:
- Explanation of rejection
- Common reasons for rejection
- Option to reapply with better documentation

## 🗂️ File Structure

```
backend/api/admin/
├── get_pending_users.php     # Fetch users awaiting approval
├── user_action.php           # Approve/reject users
├── download_document.php     # Download user documents
├── get_materials.php         # Fetch all materials
├── add_material.php          # Add new material
├── delete_material.php       # Delete material
├── admin_login.php           # Admin authentication
└── create_materials_table.php # Database setup
```

## 🛠️ Database Tables

### **Users Table**
- Stores user information
- `is_verified` field controls access
- Document paths stored in `license` and `portfolio` fields

### **Materials Table**
- Stores construction materials
- Categories for organization
- Pricing information for cost estimation

## 🔧 Setup Instructions

### **1. Database Setup**
The materials table is automatically created when first accessed, or run:
```bash
php backend/api/admin/create_materials_table.php
```

### **2. Sample Data**
Add sample materials:
```bash
php backend/api/admin/add_sample_materials.php
```

### **3. Email Configuration**
Email functionality uses PHP's `mail()` function. For production:
- Configure SMTP settings
- Update `backend/utils/send_mail.php`
- Test email delivery

## 📊 Admin Dashboard Sections

### **Pending Approvals Tab**
- **User Cards**: Display user information in organized cards
- **Document Downloads**: Direct download of uploaded files
- **Action Buttons**: Approve/Reject with confirmation
- **Real-time Updates**: List refreshes after actions

### **Materials Management Tab**
- **Add Form**: Easy material addition with validation
- **Materials Grid**: Visual display of all materials
- **Category Filtering**: Materials organized by type
- **Price Management**: Update pricing information

## 🔒 Security Features

### **Authentication**
- Session-based admin login
- Protected routes for admin pages
- Automatic logout functionality

### **File Security**
- Document downloads through secure API
- File path validation
- Access control for sensitive documents

### **Data Validation**
- Input sanitization on all forms
- SQL injection prevention
- XSS protection

## 🚨 Troubleshooting

### **Common Issues**

1. **"Database connection failed"**
   - Check XAMPP MySQL is running
   - Verify database credentials in `config/db.php`

2. **"Document not found"**
   - Ensure uploaded files exist in correct directory
   - Check file permissions

3. **Email not sending**
   - Configure PHP mail settings
   - Check server email configuration
   - Verify recipient email addresses

4. **Admin login fails**
   - Verify credentials in `admin_login.php`
   - Clear browser cache and cookies

### **File Permissions**
Ensure these directories are writable:
- `uploads/` (for user documents)
- `logs/` (for error logging)

## 🔄 Workflow Example

### **Typical Admin Workflow**

1. **Morning Review**:
   - Login to admin panel
   - Check pending user approvals
   - Review any new contractor/architect applications

2. **Document Verification**:
   - Download and verify licenses/portfolios
   - Check document authenticity
   - Verify professional credentials

3. **Decision Making**:
   - Approve qualified professionals
   - Reject incomplete applications
   - Send feedback via email

4. **Materials Update**:
   - Update material prices based on market rates
   - Add new materials as needed
   - Remove discontinued items

## 📈 Future Enhancements

### **Planned Features**
- Bulk user actions
- Advanced filtering and search
- User activity logs
- Material price history
- Export functionality
- Dashboard analytics

### **Integration Possibilities**
- SMS notifications
- Document OCR verification
- Professional license API validation
- Market price integration

## 📞 Support

For technical support or questions:
- Check error logs in browser console
- Review PHP error logs
- Verify database connections
- Test API endpoints individually

---

**Admin Panel Version**: 1.0  
**Last Updated**: January 2025  
**Compatible with**: BuildHub v1.0+