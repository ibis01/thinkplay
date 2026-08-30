# ThinkPlay

> Transforming unavoidable AI waiting time into meaningful, contextual, enjoyable interaction — without ever slowing down the AI.

##  The Problem
Generative AI is powerful, but latency is unavoidable. Users stare at spinning loaders, wasting cognitive momentum and disengaging from the workflow.

## 💡 The Solution
ThinkPlay intercepts AI latency and fills it with micro-interactions tailored to the user's intent. The AI request starts immediately in the background. While it processes, the user engages in a contextual mini-game. The moment the AI responds, the experience transitions gracefully. **We never artificially delay the AI to extend game time.**

## 🏗 Architecture
- **Framework**: Next.js 16 (App Router, Turbopack)
- **State Management**: Zustand (with request-scoped lifecycle protection using request IDs, cancellation, and transition cleanup)
- **AI Provider**: OpenRouter (Qwen 2.5 72B) via `ai` SDK
- **Routing**: Instant, multi-signal local heuristic classification with safe word-boundary topic extraction (zero latency, zero extra API calls)
- **Styling**: Tailwind CSS + Framer Motion
- **Testing**: Vitest

### Request Lifecycle
1. **User Input** → Validated on client and server.
2. **Request Starting** → `AbortController` initialized, `requestId` generated.
3. **Local Classification** → Instant heuristic routing determines the experience and extracts the topic.
4. **Waiting Active** → Contextual mini-game rendered.
5. **Generation** → Server processes request. If client aborts or 30s timeout is reached, `AbortSignal` cancels the provider call, saving resources.
6. **Transitioning** → 600ms graceful UI handoff.
7. **Response Displayed** → AI output presented.

##  Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ibis01/thinkplay.git
   cd thinkplay