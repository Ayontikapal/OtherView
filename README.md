# OtherView (V3) — Accessible Physical Spaces Platform

> **See the space differently. Design for more people.**

OtherView is an AI-powered physical accessibility inspection and remediation platform built for the **Shinchan Online Hackathon** and the **Appwrite Database Hackathon**. It analyzes photographs of physical environments (such as building entrances, corridors, stairwells, and public rooms) to help users identify potential accessibility barriers across four distinct perspectives, prioritize remediation actions, and track changes over time.

---

## 🔄 The Complete Improvement Cycle

OtherView V3 transforms single-image AI inspection into a full physical accessibility improvement cycle:

```
[ 1. Inspect ] ➔ [ 2. Identify Barriers ] ➔ [ 3. Prioritize Actions ] ➔ [ 4. Make Improvements ] ➔ [ 5. Reassess (Before vs After) ] ➔ [ 6. Track Progress ]
```

---

## 🌟 What's New in V3

### 1. Appwrite Cloud Authentication & Session Management
- **Secure Account System**: Sign up, sign in, and sign out with email and password.
- **Session Persistence**: Appwrite session tokens are handled using secure, HTTP-only, SameSite cookies (`appwrite-session`), preventing token theft via XSS.
- **Protected Cloud Workspace**: Signed-in users have access to cloud synchronization across devices, while guest users can still test the app locally using browser IndexedDB.
- **Seamless Local-to-Cloud Sync**: Easily migrate inspections saved in guest mode into your new Appwrite Cloud account with a single click.

### 2. Appwrite TablesDB Relational Persistence
- **Normalized Schema**: Structured storage partitioned across four relational tables:
  - `inspections`: Metadata, scene descriptions, summaries, notes, and file pointers.
  - `findings`: Evidence-backed accessibility observations with confidence, priority, and visual coordinates.
  - `checklist_items`: Actionable remediation plan with statuses (`pending`, `in_progress`, `completed`).
  - `reassessments`: Before-vs-after comparison outcomes with itemized status breakdowns.
- **Strict Server-Side Ownership**: Every read, update, and delete operation cryptographically verifies that the current user owns the inspection (`inspection.userId === user.$id`). Cross-user URL parameter tampering is blocked (`403 Forbidden`).

### 3. Private Image Storage (Appwrite Storage)
- Private storage bucket (`inspection_images`) with user-level file permissions.
- Images are served through an authenticated proxy (`/api/storage/file/[id]`) that validates access permissions before streaming image bytes.

### 4. Automated Infrastructure Initializer
- One-click setup endpoint (`POST /api/appwrite/init`) that automatically provisions the database (`otherview_db`), all four tables with defined columns and indexes, and the private storage bucket.

---

## 🛡️ Core Features Preserved from V1 & V2

1. **AI Multimodal Analysis (Google Gemini)**:
   - Evaluates photographs against visible evidence without inventing measurements.
   - Structured JSON output validated at runtime via **Zod**.
2. **Four Accessibility Perspectives**:
   - ♿ **Wheelchair Accessibility (`wheelchair_access`)**: Steps, ramps, door clearance, thresholds, level transitions.
   - 👁️ **Low Vision (`low_vision`)**: Visual contrast on stair nosings, lighting conditions, wayfinding clarity.
   - 🚶 **Mobility Support (`mobility`)**: Trip hazards, walking surface evenness, handrail availability.
   - 🧠 **Sensory Accessibility (`sensory_access`)**: Visual complexity, overwhelming signage, and busy zones.
3. **Grounded Visual Evidence & Annotations**:
   - Interactive bounding boxes overlaying the photo to ground AI findings in visual reality.
4. **Interactive Action Plan**:
   - Track remediation checklist with live status toggles and field notes.
5. **Closed-Loop Before vs. After Reassessment**:
   - Follow-up photo comparisons categorized into: *Appears Improved*, *Still Observed*, *Newly Observed*, or *Requires Verification*.
6. **Print & PDF Export**:
   - Professional report export with printable layout (`@media print`).
7. **Offline Demo Mode**:
   - Bundled pre-analyzed entrance photo and follow-up review for testing without API keys.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **UI & Components**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Backend & Persistence**: [Appwrite Cloud](https://cloud.appwrite.io/) (`node-appwrite` SDK: Auth, TablesDB, Storage)
- **Local Fallback**: Browser IndexedDB (`lib/storage/indexed-db.ts`)
- **AI Multimodal Model**: [Google Gemini](https://ai.google.dev/) (`@google/generative-ai` with `gemini-2.5-flash`)
- **Validation**: [Zod](https://zod.dev/)
- **Language**: TypeScript (strict mode)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.18+ or 20+
- Google Gemini API key ([Get one at Google AI Studio](https://aistudio.google.com/))
- Appwrite Cloud account ([Create one at cloud.appwrite.io](https://cloud.appwrite.io/))

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:
```env
# Google Gemini Multimodal AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Appwrite Cloud
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_server_api_key
APPWRITE_DATABASE_ID=otherview_db
APPWRITE_STORAGE_BUCKET_ID=inspection_images
```

*(Refer to [APPWRITE_SETUP.md](./APPWRITE_SETUP.md) for detailed Appwrite console instructions).*

### 3. Install & Initialize
```bash
npm install
npm run dev
```

Initialize your Appwrite database and storage with a single command:
```bash
curl -X POST http://localhost:3000/api/appwrite/init
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run the automated test suite:
```bash
npm test
```

Run TypeScript and build validation:
```bash
npx tsc --noEmit
npm run build
```

---

## ⚠️ Important Accessibility & Legal Disclaimer

> **OtherView is an educational and preliminary accessibility review assistant, NOT a certified building audit or legal compliance assessment.**
> 
> A photograph cannot capture exact slope gradients, door opening forces, tactile paving specifications, or ambient acoustic levels. This application does not replace physical audits by certified accessibility specialists, applicable regulations (such as ADA or European Standard EN 301 549), or direct consultation and co-design with people with disabilities.
