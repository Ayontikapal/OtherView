# OtherView — Accessible Physical Spaces Platform

> **See the space differently. Design for more people.**

OtherView is an AI-powered physical accessibility inspection and remediation platform. It analyzes photographs of physical environments—such as building entrances, stairwells, corridors, and public spaces—helping architects, facilities managers, property teams, and inclusive design learners identify potential accessibility barriers across four distinct perspectives, prioritize remediation actions, and track physical improvements over time.

---

## 🔄 The Complete Improvement Cycle

OtherView transforms single-image AI inspection into a complete, closed-loop physical accessibility improvement workflow:

```
[ 1. Inspect Space ] ➔ [ 2. Multimodal AI Analysis ] ➔ [ 3. Prioritize Remediation ] ➔ [ 4. Physical Modification ] ➔ [ 5. Reassess (Before vs After) ] ➔ [ 6. Export Report ]
```

1. **Inspect Space**: Upload or capture high-resolution photographs of any physical environment.
2. **Multimodal AI Analysis**: Grounded analysis evaluating visible barriers without fabricating measurements.
3. **Prioritize Remediation**: Action plan checklist categorizing findings by urgency and review priority.
4. **Physical Modification**: Facilities teams apply real-world interventions (e.g., contrast nosings, handrails, directional signage).
5. **Before vs. After Reassessment**: Upload follow-up photography to verify whether interventions resolved barriers.
6. **Executive Export**: Generate print-ready PDF reports for stakeholders, architects, and compliance officers.

---

## 🌟 Core Platform Capabilities

### 1. Four Accessibility Perspectives
Every photograph is evaluated across four distinct viewpoints:
- ♿ **Wheelchair Accessibility (`wheelchair_access`)**: Steps and stairs, visible ramps, door clearance, threshold bevels, and route continuity.
- 👁️ **Low Vision (`low_vision`)**: Visual contrast on step nosings, wayfinding legibility, visual clutter, and lighting conditions.
- 🚶 **Mobility Support (`mobility`)**: Trip hazards, uneven surface joints, handrail availability, and ground surface transitions.
- 🧠 **Sensory Accessibility (`sensory_access`)**: Visual complexity, overwhelming signage, and presence of calmer transition zones.

### 2. Grounded Visual Evidence & Annotations
- **Interactive Bounding Boxes**: Findings are directly anchored to normalized coordinate zones on the photograph.
- **Evidence-Based Reporting**: Clear distinction between observable physical evidence and AI interpretation.
- **Physical Verification Flags**: Explicitly identifies features requiring physical on-site measurement (e.g., slope angles with an inclinometer, door opening resistance with a force gauge).

### 3. Action Plan Checklist & Field Notes
- Interactive checklist state machine: `pending` ➔ `in_progress` ➔ `completed`.
- Field notes for facilities teams to log maintenance schedules, contractor assignments, and measurements.

### 4. Closed-Loop Before vs. After Reassessment
- Upload a follow-up photograph after physical modifications have been made.
- Strict change classification:
  - **Appears Improved**: Visual evidence suggests remediation was effective.
  - **Still Visible**: The barrier remains unaddressed or partially modified.
  - **Newly Observed**: New features or potential hazards identified in the follow-up photo.
  - **Requires Verification**: Ambiguous features requiring on-site physical measurement.

### 5. Dual-Storage Persistence (Cloud + Local First)
- **Appwrite Cloud**: Secure authentication, relational TablesDB (`inspections`, `findings`, `checklist_items`, `reassessments`), and private image storage.
- **Local-First IndexedDB Fallback**: Guest users can inspect and save reviews locally without an account.
- **One-Click Cloud Migration**: Seamlessly migrate local inspections to an Appwrite account upon login.

### 6. Strict Security & Cryptographic Privacy Isolation
- Server-side token validation with HTTP-only, SameSite cookies.
- Strict multi-tenant isolation: User A cannot read, update, or access User B's inspections or photographs (`403 Forbidden`).
- Serverless image validation enforcing MIME types and image magic byte signatures.

### 7. Zero-Setup Demo Experience
- Built-in entrance demo dataset complete with photographic evidence, grounded annotations, action plan, and follow-up reassessment.
- Testable immediately without API keys or database configuration.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Route Handlers) |
| **Frontend** | [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Multimodal AI** | [Google Gemini](https://ai.google.dev/) (`@google/generative-ai` with `gemini-2.5-flash`) |
| **Runtime Validation** | [Zod](https://zod.dev/) |
| **Cloud Backend** | [Appwrite Cloud](https://cloud.appwrite.io/) (`node-appwrite` SDK: Auth, TablesDB, Storage) |
| **Local Persistence** | Browser IndexedDB |
| **Language** | TypeScript (Strict Mode) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.18+ or 20+
- Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))
- *(Optional)* Appwrite Cloud account for cloud synchronization ([cloud.appwrite.io](https://cloud.appwrite.io/))

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your credentials:
```env
# Google Gemini Multimodal AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Appwrite Cloud (Optional for guest mode, required for cloud sync)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_server_api_key
APPWRITE_DATABASE_ID=otherview_db
APPWRITE_STORAGE_BUCKET_ID=inspection_images
```

*(See [APPWRITE_SETUP.md](./APPWRITE_SETUP.md) for step-by-step Appwrite console instructions).*

### 3. Installation & Local Development
```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Initialize Cloud Infrastructure (One Click)
When using Appwrite Cloud, automatically provision the database, normalized tables, and private bucket:
```bash
curl -X POST http://localhost:3000/api/appwrite/init
```

---

## 🧪 Testing & Validation

Run the comprehensive test suite (38 automated unit & integration tests):
```bash
npm test
```

Run TypeScript and production build checks:
```bash
npx tsc --noEmit
npm run build
```

---

## ⚠️ Important Accessibility & Professional Notice

> **OtherView is an educational and preliminary accessibility review assistant, NOT a certified building audit or legal compliance assessment.**
> 
> A photograph cannot capture exact slope gradients, door opening forces, tactile paving specifications, or ambient acoustic levels. This application does not replace physical audits by certified accessibility specialists, applicable regulations (such as ADA or European Standard EN 301 549), or direct consultation and co-design with people with disabilities.
