# Google Signup Troubleshooting Guide

## Quick Test Steps:

### 1. Test the Backend API Directly
Visit: `http://localhost/buildhub/test_google_frontend.html`
- This will test the Google signup flow independently
- Check browser console for any errors
- Try signing up as a homeowner first (no documents required)

### 2. Check Browser Console
Open Developer Tools (F12) and check for:
- Google API loading errors
- Network request failures
- JavaScript errors during signup

### 3. Common Issues & Solutions:

#### Issue: Google button doesn't appear
**Solution:** 
- Check if Google API script is loaded: `window.google?.accounts?.id`
- Verify client ID is correct
- Check for CORS/security policy errors

#### Issue: "Google user information is missing"
**Solution:**
- Check browser console for Google API errors
- Try refreshing the page and signing in again
- Verify Google account has required permissions

#### Issue: "Server error" or network failures
**Solution:**
- Check if XAMPP is running
- Verify database connection
- Check PHP error logs in XAMPP

#### Issue: Data not saving to database
**Solution:**
- Check database connection in `backend/config/db.php`
- Verify `buildhub` database exists
- Check PHP error logs

### 4. Debug Steps:

1. **Test with simple homeowner signup** (no file uploads)
2. **Check browser network tab** for failed requests
3. **Check PHP error logs** in XAMPP control panel
4. **Use the test page** at `/test_google_frontend.html`

### 5. Expected Flow:

1. User clicks Google signup button
2. Google popup appears for authentication
3. User selects role (and uploads documents if needed)
4. Data is sent to `/buildhub/backend/api/google_register.php`
5. User is created in database
6. Homeowners → redirect to dashboard
7. Others → redirect to login (await verification)

### 6. Files Modified:
- `frontend/src/components/Register.jsx` - Enhanced error handling and logging
- `backend/api/google_register.php` - Improved validation and session management
- `test_google_frontend.html` - Standalone test page

### 7. If Still Not Working:
1. Check browser console errors
2. Check XAMPP PHP error logs
3. Try the standalone test page
4. Verify Google OAuth client ID is active