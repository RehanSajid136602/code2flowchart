# GEMINI.md: LogicFlow Architect [2026 Build]

## 1. PROJECT OVERVIEW
**LogicFlow** is a bidirectional visualizes high-level code programming environment that synchron with visual logic diagrams. It leverages the Gemini 2.5 and 3 series APIs (including Flash and Pro models) to parse code into flowcharts and analyze diagrams for logical consistency, complexity, and bugs.

### Core Workflows:
- **Code-to-Diagram:** Real-time synchronization using debounced updates that call Gemini-powered API routes to generate node/edge structures from raw code.
- **Diagram-to-Code:** (Planned/Active) Converting visual graph modifications back into functional code.
- **AI Analysis:** Automated bug detection (deadlocks, infinite loops) and algorithmic complexity estimation (Big O).

---

## 2. TECH STACK & ARCHITECTURE
### Frontend
- **Framework:** Next.js 16 (App Router)
- **State Management:** Zustand (`src/store/useLogicStore.ts`)
- **Visual Engine:** @xyflow/react (React Flow)
- **Editor:** @monaco-editor/react
- **Styling:** Tailwind CSS 4.0, Framer Motion
- **Icons:** Lucide React

### Backend (Serverless)
- **Runtime:** Next.js API Routes (Node.js)
- **Authentication:** Firebase Auth (Google & Email/Password)
- **Persistence:** Firebase Firestore (`users/{userId}/projects/{projectId}`)
- **AI Engine:** Dynamic Rotation (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`, `gemini-3-flash-preview`)
- **Key Strategy:** Randomized Key & Model Pool
- **Validation:** Zod

### Directory Structure
- `src/app/api/`: Gemini-powered endpoints for `analyze`, `convert`, `diagram`, and `explain`.
- `src/components/canvas/`: Custom nodes and the main React Flow canvas.
- `src/components/editor/`: Monaco editor integration.
- `src/hooks/`: Orchestration hooks like `useSyncLogic` for debounced AI sync.
- `src/types/`: Centralized TypeScript definitions for the logic graph.

---

## 3. DEVELOPMENT PROTOCOLS
### Commands
- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Linting:** `npm run lint`

### Conventions
1. **State Ownership:** The `useLogicStore` is the single source of truth for both code and nodes.
2. **AI Boundaries:** All AI interactions must happen through `src/app/api`. Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is present in `.env.local`.
3. **Typing:** Use the `LogicNode` and `LogicNodeData` types for all graph-related operations. Custom node types (`oval`, `diamond`, etc.) are mapped in `src/types/index.ts`.
4. **Debouncing:** Always debounce AI calls (min 800ms) to avoid rate limiting and excessive token usage during typing.

---

## 4. AGENTIC ORCHESTRATION [MANDATORY]
When modifying this codebase, follow the **Cognitive Pre-flight** protocol:
1. **The Topology Check:** If modifying node data, verify how it impacts the `useSyncLogic` fetch and the Gemini prompt in `api/diagram`.
2. **Security Check:** Ensure prompts in API routes are hardened against injection and correctly handle malformed user code.
3. **UI Polish:** Maintain the "Intentional Minimalism" aesthetic using Tailwind 4 utility classes and Framer Motion for node transitions.

---

## 5. RECENT UPDATES & TODOs
- [x] Initial React Flow + Monaco integration.
- [x] Gemini-powered Code-to-Diagram sync.
- [x] Firebase Authentication (Google/Email).
- [x] Implement Diagram-to-Code conversion.
- [x] Add export to PDF/Image feature.
- [x] Enhance analysis engine with suggestion/fix capability.
- [x] Implement Project Persistence (Firestore).
