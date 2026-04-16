# CivicEye 🏙️
**Real-time Solutions for Smarter Cities.**

CivicEye is a full-stack, enterprise-grade Civic Infrastructure Reporting Platform. It empowers citizens to dynamically report location-based civic issues (like potholes, broken streetlights, or waste management), while providing City Administrative Authorities with a transparent, analytics-driven dashboard to track, map, and resolve them efficiently.

---

## 🚀 Key Features

*   **Location Intelligence (GPS Integration):** Native integration with the HTML5 Geolocation API and Leaflet Maps to automatically pinpoint and map reported anomalies.
*   **Role-Based Access Control (RBAC):** Secure JWT authentication isolating standard Citizen users from authorized Admin dashboards.
*   **Media Processing:** Cloudinary integration for robust, cloud-based image hoisting of infrastructure damage.
*   **Automated Email Dispatches:** A custom Nodemailer backend SMTP pipeline that automatically emails citizens the second an Admin successfully resolves their ticket.
*   **Real-Time Analytics:** Interactive Recharts implementation for Admins, graphing system-wide metrics regarding Pending vs Resolved issues.
*   **State-of-the-art UI/UX:** Built with React, Framer Motion for cinematic page transitions, Sonner for elegant toasts, and a tokenized SaaS light-theme design system.

---

## 🛠️ Technology Stack

**Frontend Framework**
*   React.js + Vite
*   Framer Motion (Animations)
*   React-Leaflet (Mapping APIs)
*   Recharts (Data Visualization)
*   Sonner (Toast Notifications)

**Backend Architecture**
*   Node.js / Express.js
*   MongoDB Atlas / Mongoose
*   JSON Web Tokens (JWT)
*   Nodemailer (SMTP Emails)
*   Cloudinary (Image Storage)

---

## ⚙️ Local Development Setup

To boot this application on your local machine:

### 1. Root Repository Setup
Clone the repository to your local machine:
\`\`\`bash
git clone https://github.com/DEVANSHM15/CivicEye.git
\`\`\`

### 2. Backend Configuration
Navigate to the backend directory and install all node modules:
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` root and populate your sensitive environment variables securely:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_cluster_uri
JWT_SECRET=your_jwt_signing_secret
CLOUDINARY_CLOUD_NAME=your_cloud_id
CLOUDINARY_API_KEY=your_cloud_key
CLOUDINARY_API_SECRET=your_cloud_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_google_app_password
\`\`\`
Boot the server:
\`\`\`bash
node server.js
\`\`\`

### 3. Frontend Configuration
Navigate to the frontend directory and install dependencies:
\`\`\`bash
cd frontend
npm install
\`\`\`
Boot the Vite Development Server:
\`\`\`bash
npm run dev
\`\`\`

---
*Created for a smarter, cleaner tomorrow.*
