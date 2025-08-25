# Firebase Authentication Setup Guide

## 🚀 Feature Flag System

This project now supports both **Local Authentication** and **Firebase Authentication** through a feature flag system.

## 🔧 How to Use

### **1. Local Authentication (Default)**
```bash
npm run dev          # Uses local auth
npm run build        # Builds with local auth
```

### **2. Firebase Authentication**
```bash
npm run dev:firebase # Uses Firebase auth
npm run build:firebase # Builds with Firebase auth
```

## 🌍 Environment Variables

### **Copy the template:**
```bash
cp env.template .env
```

### **For Local Auth (VITE_USE_FIREBASE_AUTH=false):**
```bash
# .env
VITE_USE_FIREBASE_AUTH=false
VITE_APP_ENV=development
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
```

### **For Firebase Auth (VITE_USE_FIREBASE_AUTH=true):**
```bash
# .env
VITE_USE_FIREBASE_AUTH=true
VITE_APP_ENV=production

# Firebase Config (from your Firebase Console)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (for server-side auth)
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# Admin Access Control
ADMIN_EMAILS=admin@hollytransport.com,dispatch@hollytransport.com

# Database (still needed)
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
```

## 🔐 Firebase Admin Setup

## 👑 Admin Access Control

The system uses a simple environment variable approach for admin access:

### **Setup Admin Access:**
1. **Add admin emails** to your `.env` file:
   ```bash
   ADMIN_EMAILS=admin@hollytransport.com,dispatch@hollytransport.com,owner@hollytransport.com
   ```

2. **Restart your server** after making changes

### **How It Works:**
- **Any email in `ADMIN_EMAILS`** gets admin access
- **Easy to add/remove** admins by updating `.env`
- **No database changes** required
- **Developer controlled** - simple and secure

### **Example Admin Emails:**
- `admin@hollytransport.com` - Main admin
- `dispatch@hollytransport.com` - Dispatch manager  
- `owner@hollytransport.com` - Business owner

### **1. Get Service Account Key:**
- Go to Firebase Console → Project Settings → Service Accounts
- Click "Generate New Private Key"
- Download the JSON file

### **2. Extract Credentials:**
```json
{
  "client_email": "firebase-adminsdk-xxxxx@holly-transportation-efb90.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

### **3. Add to .env:**
```bash
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@holly-transportation-efb90.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 🧪 Testing

### **Test Local Auth:**
```bash
npm run dev
# Visit http://localhost:3000
# Use local username/password
```

### **Test Firebase Auth:**
```bash
npm run dev:firebase
# Visit http://localhost:3000
# Use Firebase sign-in
```

## 🔄 Switching Between Auth Methods

### **Quick Switch:**
1. **Change .env:** `VITE_USE_FIREBASE_AUTH=true/false`
2. **Restart server:** The feature flag is read on startup
3. **No code changes needed!**

### **Environment-Specific:**
- **Development:** Use local auth for fast testing
- **Production:** Use Firebase auth for real users
- **Testing:** Switch between both as needed

## 📁 Files Modified

- `server/routes.ts` - Feature flag logic
- `server/firebaseAuth.ts` - Firebase server auth
- `client/src/hooks/useAuth.ts` - Client-side auth logic
- `client/src/lib/authConfig.ts` - Feature flag config
- `package.json` - New build scripts
- `env.template` - Environment template

## 🎯 Benefits

- ✅ **Keep local auth** for development/testing
- ✅ **Add Firebase auth** for production
- ✅ **Easy switching** between auth methods
- ✅ **No code changes** needed to switch
- ✅ **Best of both worlds**

## 🚨 Important Notes

- **Local auth** = Fast development, no external dependencies
- **Firebase auth** = Production-ready, scalable authentication
- **PostgreSQL** = Still your main database (not changing)
- **Feature flag** = Controls which auth method to use

## 🔥 Ready to Deploy?

1. **Set up Firebase Admin** (get service account key)
2. **Update .env** with Firebase credentials
3. **Set VITE_USE_FIREBASE_AUTH=true**
4. **Run npm run build:firebase**
5. **Deploy!**

---

## 🔄 Firebase Auth Data Flow

### **Understanding the Three User Objects:**

#### **1. `convertedFirebaseUser`**
```typescript
// This is Firebase auth data converted to our format
const convertedFirebaseUser = {
  id: firebaseUser.uid,                    // From Firebase
  email: firebaseUser.email,               // From Firebase  
  firstName: firebaseUser.displayName?.split(' ')[0] || null,  // From Firebase (usually null)
  lastName: firebaseUser.displayName?.split(' ')?.slice(1).join(' ') || null,  // From Firebase (usually null)
  profileImageUrl: firebaseUser.photoURL,  // From Firebase (usually null)
  phone: firebaseUser.phoneNumber,         // From Firebase (usually null)
  medicalNotes: null,                      // Hardcoded null
  isAdmin: false,                          // Default value - will be overridden by database
  createdAt: null,                         // Default value - will be overridden by database
  updatedAt: null,                         // Default value - will be overridden by database
}
```

#### **2. `firebaseUserData`**
```typescript
// This is the complete profile from our PostgreSQL database
const firebaseUserData = {
  id: "qhr9FEih6sOUBoGPayLsAKBXTHM2",    // From database
  email: "nzenebe@gmail.com",             // From database
  firstName: "Nahom",                     // From database
  lastName: "Zenebe",                     // From database
  phone: "(612) 500-6198",               // From database
  isAdmin: true,                          // From database
  medicalNotes: "Admin user - Business owner",  // From database
  createdAt: "2025-08-24T17:44:48.034Z", // From database
  updatedAt: "2025-08-24T18:47:00.727Z", // From database
  // ... any other profile fields
}
```

#### **3. `mergedFirebaseUser`**
```typescript
// This is the FINAL result after merging both
const mergedFirebaseUser = {
  ...convertedFirebaseUser!,              // Firebase auth as base
  ...firebaseUserData,                    // Database profile OVERRIDES base
  id: firebaseUser.uid,                   // Keep Firebase UID
}
```

### **The Key Insight:**

**`convertedFirebaseUser`** = **Firebase's limited data** (mostly nulls)  
**`firebaseUserData`** = **Our database's complete profile**  
**`mergedFirebaseUser`** = **Best of both worlds** (Firebase auth + database profile)

### **Why This Matters:**

- **Firebase only knows:** Who you are (email, uid)
- **Our database knows:** Everything about you (name, phone, admin status, etc.)
- **Merging gives us:** Complete user profile for the UI

**So `convertedFirebaseUser` is basically just a "placeholder" with Firebase auth data, while `firebaseUserData` has the real profile information!**

---

**Questions?** Check the Firebase Console or ask for help!
