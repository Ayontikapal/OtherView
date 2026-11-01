# Appwrite Cloud Setup Guide — OtherView

This guide provides step-by-step instructions for configuring **Appwrite Cloud** as the authentication, relational database (TablesDB), and private file storage engine for OtherView.

---

## 1. Create Appwrite Cloud Project

1. Log in or create an account at [cloud.appwrite.io](https://cloud.appwrite.io/).
2. Click **Create Project** and name it `OtherView` (or your preferred name).
3. Copy your **Project ID** from the Project Settings overview.

---

## 2. Configure Web Platform

1. In the Appwrite Console, navigate to the **Overview** tab.
2. Under **Integrations**, click **Web App**.
3. Set:
   - **Name:** `OtherView Web`
   - **Hostname:** `localhost` (for local development)
   - Add your production Vercel deployment domain (e.g. `otherview.vercel.app`) as an additional Web Platform once deployed.

---

## 3. Generate Server API Key

OtherView uses server-side Appwrite SDK operations (`node-appwrite`) to protect database tables and private photos from unauthorized client access.

1. Go to **Project Settings** → **API Keys** tab.
2. Click **Create API Key**.
3. Name: `OtherView Server Key`
4. Expiration: Choose your preference or leave blank for unlimited.
5. Grant the following **Scopes**:
   - `databases.read` and `databases.write`
   - `collections.read` and `collections.write`
   - `tables.read` and `tables.write`
   - `files.read` and `files.write`
   - `users.read` and `users.write`
   - `sessions.read` and `sessions.write`
6. Click **Create** and copy the secret key immediately. (Never commit this key or prefix it with `NEXT_PUBLIC_`).

---

## 4. Configure Environment Variables

Create or update your `.env.local` file with the following values:

```env
# Google Gemini Multimodal AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Appwrite Cloud
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_server_api_key

# Optional Custom IDs (defaults to otherview_db and inspection_images if omitted)
APPWRITE_DATABASE_ID=otherview_db
APPWRITE_STORAGE_BUCKET_ID=inspection_images
```

---

## 5. Automated Database & Storage Initialization

OtherView includes an automated initialization endpoint that provisions the database, tables, columns, indexes, and storage bucket with a single request.

### Option A: Via Browser / cURL
With your development server running (`npm run dev`), make a POST request:

```bash
curl -X POST http://localhost:3000/api/appwrite/init
```

Or trigger it from your browser or API client.

### Option B: Automatic Schema Details

If you prefer to inspect or create the resources manually in the Appwrite Console:

#### A. Database
- **Database ID:** `otherview_db`
- **Name:** `OtherView Accessibility DB`

#### B. Tables / Collections
1. **`inspections`**
   - Columns: `userId` (string 64), `title` (string 255), `sceneDescription` (string 1000), `overallSummary` (string 4000), `imageId` (string 255), `notes` (string 5000), `status` (string 32), `topRecommendations` (string 4000), `limitations` (string 4000), `afterImageId` (string 255), `createdAt` (string 64), `updatedAt` (string 64).
   - Indexes: `idx_userId` (key on `userId`), `idx_updatedAt` (key on `updatedAt`).

2. **`findings`**
   - Columns: `inspectionId` (string 64), `userId` (string 64), `perspective` (string 32), `title` (string 255), `description` (string 2000), `observedEvidence` (string 1000), `potentialImpact` (string 1000), `priority` (string 16), `confidence` (string 16), `recommendation` (string 2000), `requiresVerification` (boolean), `verificationReason` (string 1000), `boundingBox` (string 255).
   - Indexes: `idx_inspectionId` (key on `inspectionId`), `idx_userId` (key on `userId`).

3. **`checklist_items`**
   - Columns: `inspectionId` (string 64), `userId` (string 64), `findingId` (string 64), `title` (string 255), `recommendation` (string 2000), `perspective` (string 32), `priority` (string 16), `verificationRequirement` (string 1000), `status` (string 32), `notes` (string 2000).
   - Indexes: `idx_checklist_inspectionId` (key on `inspectionId`), `idx_checklist_userId` (key on `userId`).

4. **`reassessments`**
   - Columns: `inspectionId` (string 64), `userId` (string 64), `afterImageId` (string 255), `overallProgressSummary` (string 3000), `improvedCount` (integer), `stillVisibleCount` (integer), `newlyObservedCount` (integer), `requiresVerificationCount` (integer), `comparisons` (string 10000), `remainingPriorities` (string 3000), `limitations` (string 3000), `createdAt` (string 64).

#### C. Storage Bucket
- **Bucket ID:** `inspection_images`
- **Name:** `Inspection Photos`
- **File Security:** Enabled (Private file access)
- **Max File Size:** `5 MB`
- **Allowed Extensions:** `jpg`, `jpeg`, `png`, `webp`

---

## 6. Security & Ownership Architecture

1. **Authentication:**
   - Account sessions are managed via secure, HTTP-only, SameSite cookies (`appwrite-session`).
   - Browser code never has access to the raw session token or administrative credentials.

2. **Authorization Enforcement:**
   - Server route handlers (`/api/inspections/[id]`, `/api/storage/file/[id]`) read the authenticated user from the session cookie.
   - Every read, update, and delete operation verifies that `inspection.userId === currentAuthenticatedUser.$id`.
   - Modifying a URL or record ID in a request payload cannot access or mutate another user's inspection (returns `403 Forbidden`).

3. **Private Image Protection:**
   - Uploaded photographs are kept private in Appwrite Storage.
   - Images are served through `/api/storage/file/[id]` which authenticates the requester before streaming the image bytes.
