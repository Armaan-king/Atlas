# Atlas Intelligence: The Autonomous Student OS

Current maintainer: `Samjam25`

> An autonomous academic command center for an **NTU Singapore Computer Science** undergraduate. Academic data in this demo is mock/sample data - it is ready for a future NTULearn / LMS connector but does not yet integrate one.

## Inspiration
Students today are drowning in a sea of notifications, dead-end dashboards, and disjointed information. Between emails, LMS platforms, and project trackers, the "intelligence" of our academic life is scattered. We were inspired by the idea of an **Autonomous Intelligence OS** - a single, unified Command Center that doesn't just list your tasks, but *navigates* them for you. We wanted to build the "Jarvis" for academia.

## What it does
Atlas is an intelligent command center designed to turn academic chaos into autonomous clarity:
- **Morning Brief**: A personalized dashboard that summarizes your day, highlights upcoming deadlines, and provides cross-domain insights.
- **Autonomous Triage**: An AI-powered engine that scans your academic ecosystem and "triages" assignments into Healthy or Danger states based on priority and time.
- **Fluid Workspace**: A state-driven interface that seamlessly transitions between a high-level briefing and a deep-focus AI chat environment.
- **Atlas Orb**: A visual AI core that anchors the experience, providing real-time feedback and high-performance animations.
- **Exa Course Search**: Semantic search over NTU's module catalog - Atlas fetches live course descriptions, prerequisites, and reading resources on demand.
- **ZO Email Agent**: Monitors your NTU inbox for announcements and deadline changes, surfacing digested summaries directly into the Command Center.

## How we built it
- **Intelligence Layer**: Powered by **OpenAI GPT-5.4** for deep reasoning and structured academic automation across the dashboard, study tools, and digest flows.
- **Course Discovery**: **Exa Search Engine** provides semantic search over academic content, enabling live NTU module catalog lookups and resource enrichment for the knowledge graph.
- **Email Agent**: **ZO** monitors the student's NTU inbox, parses announcements and deadline shifts, and pushes structured updates into the triage engine.
- **Backend**: A robust **FastAPI** architecture orchestrating multiple AI agents, including **ElevenLabs TTS** for voice-first briefings.
- **Frontend**: A premium React experience built with **Vite**, **Tailwind CSS**, and **Framer Motion**.
- **Design System**: A custom "Atmospheric" UI using mesh overlays, glassmorphism, and interactive particle systems (`@tsparticles`).

## Challenges we ran into
- **State-Driven Geometry**: Implementing the "Pill" transition required complex layout calculations to ensure the interface could move from a full dashboard to a compact top-bar without layout jitter or performance hits.
- **Orb Animation**: Scaling the Atlas Orb while preserving its interactive glows and high-performance SVG filters was a significant mathematical challenge.
- **Information Density**: Balancing a "Premium Minimalist" aesthetic with the high information density needed for academic triage required multiple rounds of design iteration.
- **Multi-Agent Orchestration**: Coordinating Exa, ZO, OpenAI, and ElevenLabs as distinct agents with shared state required careful schema design and a unified context-injection layer.

## Accomplishments that we're proud of
- **Fluid UI Transitions**: The transition from the "Morning Brief" to the "Chat-focused workspace" is entirely seamless, using the top-bar Pill as a persistent navigation anchor.
- **Visual Identity**: Creating a "wow" factor through atmospheric backgrounds, mesh gradients, and micro-animations that make a productivity tool feel alive.
- **The "Triage" System**: Successfully mapping raw task data into a high-visibility, color-coded health system for academic performance.
- **Live Agent Pipeline**: Exa and ZO feed real data into the graph and announcements panel, making Atlas feel genuinely autonomous rather than demo-ware.

## What we learned
- **Layout Animations**: We mastered the use of `framer-motion`'s Layout API to handle structural shifts in the DOM.
- **Agent Orchestration**: We learned how to bridge multiple specialized AI agents (Exa, ZO, OpenAI, ElevenLabs) into a single, cohesive user persona.
- **Human-Centric AI Design**: That the most effective AI isn't just smart - it's accessible, persistent, and visually calming.

## What's next for Atlas
- **Voice-First Interaction**: Full bidirectional voice support for hands-free "Command Base" briefings.
- **Predictive Learning**: Implementing predictive analysis to estimate how long a specific student will take on an assignment based on complexity and historical data.
- **NTULearn Integration**: A live connector to NTU's LMS so Atlas pulls real grades, announcements, and deadlines without manual data entry.
- **Collaborative Study War-Rooms**: Shared AI-driven spaces for team projects and peer-to-peer accountability.
