# Working Prototype: LLD Practice Platform

**Deliverable**: Working Prototype Guide & Walkthrough  
**Status**: Deployed & Live on Vercel  

---

## 1. Quick Links

- **Live Application**: [https://lld-practice-platform-git-main-utkarshs-projects-5d161d13.vercel.app](https://lld-practice-platform-git-main-utkarshs-projects-5d161d13.vercel.app)
- **GitHub Repository**: [https://github.com/utkarshofficial999/LLD-Practice-Platform-assignment](https://github.com/utkarshofficial999/LLD-Practice-Platform-assignment)
- **Tech Stack**:
  - **Frontend**: React 19, TypeScript, Vite, Mermaid.js, Lucide Icons, Pure CSS Design System
  - **Backend**: Node.js, Express, Vercel Serverless Functions
  - **AI Engine**: Groq LLM (`llama-3.3-70b-versatile`) + Local Heuristic Evaluation Fallback
  - **Automated Testing**: Vitest (4 test suites, 9 tests covering domain invariants and change tests)

---

## 2. Try It Yourself: Step-by-Step Practice Walkthrough

You can test the complete end-to-end learning loop in under 2 minutes:

### Step 1: Explore the Problem
- Open the live URL.
- Use the dropdown at the top center to view available challenges:
  - **"Design a Multi-Floor Parking Lot System"** (Medium)
  - **"Design a High-Rise Elevator Dispatching System"** (Hard)
- Notice the Left Panel:
  - Problem statement & real-world scenario
  - Required Domain Concepts checklist (e.g. `ParkingSpot`, `Ticket`, `PaymentStrategy`)
  - Behavioral expectations & concurrency requirements
  - Scoring rubrics

### Step 2: Inspect the Three-Tab Studio (Center Panel)
- **[Code] Tab**: Starter TypeScript skeleton with class and enum definitions. As you add or edit classes, the left checklist updates its checkmarks in real time.
- **[UML] Tab**: Live interactive Mermaid class diagram showing class boxes, methods, and relationships.
- **[Rationale] Tab**: Architectural trade-offs, pattern choices, and concurrency locking strategy.

### Step 3: Run the Evaluation (Version 1)
- Click the blue **"Run Evaluation"** button at the bottom right.
- The Right Panel ("AI Architect") loads the scorecard:
  - Overall Design Quality Score (e.g., `8.0/10 — Production Ready`)
  - Domain entity coverage verification
  - Anti-pattern flags (God Class, missing interfaces)
  - 5 Rubric Criteria breakdown with direct quotes cited from your submission

### Step 4: Refactor & Submit Version 2
- In the Code tab, make an adjustment (for example, introduce a new interface or extract a method to improve separation of concerns).
- Click **"Run Evaluation"** again.
- The version counter updates to **"v2"** and the updated evaluation is displayed.

### Step 5: Compare Your Versions
- With 2 versions submitted, click the **"Compare (v1 vs v2)"** button in the header.
- An interactive modal displays your progression:
  - Overall score delta (+/- points)
  - Concerns that were resolved in Version 2
  - Detailed criteria comparison side-by-side

---

## 3. Extra Studio Features

- **Dark / Light Theme**: Opens in clean White mode by default. Toggle between Day and Night modes using the moon/sun icon in the top right. Preference is saved in `localStorage`.
- **Reset Template**: Click "Reset" to cleanly revert back to the original starter template for the selected problem.
- **Offline / Serverless Resilience**: Built-in browser fallback ensures the platform continues evaluating and testing designs locally even during network drops.

---

## 4. Running the Project Locally

```powershell
# 1. Clone the repository
git clone https://github.com/utkarshofficial999/LLD-Practice-Platform-assignment.git
cd LLD-Practice-Platform-assignment

# 2. Install dependencies
npm install

# 3. Optional: Set up environment
# Create a .env file if you want live Groq AI evaluation (falls back to local evaluator if blank):
# GROQ_API_KEY=your_groq_api_key_here

# 4. Start Server & Client concurrently
npm run dev

# 5. Open your browser
# Web UI: http://localhost:5173
```
