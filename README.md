# Gemini Curriculum Designer Skill

**An AI-powered instructional design assistant for the Gemini CLI.**

Turn a rough list of topics into a structured, pedagogical, and actionable course curriculum—complete with an implementation plan for your teaching tools.

## 🚀 Features

*   **Interactive Design Workflow:** A guided interview process that helps you define Prerequisites, Core Concepts, and Lesson Plans module-by-module.
*   **Pedagogical Intelligence:** Built-in knowledge of teaching patterns like *Problem-First*, *Scaffolding*, and *Theory-to-Practice* to structure your lessons effectively.
*   **Active Learning Integration:** Suggests tailored activities (e.g., "Interactive DFA Builder", "Group Proof Workshop") to make your course engaging.
*   **Delivery Strategy:** Generates a comprehensive technical roadmap (Tech Stack, Asset List, Development Plan) for building your course materials (e.g., a Web App or Slide Deck).
*   **Cross-Platform Ready:** Includes tool definitions to adapt this workflow for **Anthropic's Claude**.

## 📦 Installation

You can install this skill directly from npm or use the packaged `.skill` file if you have it locally.

### Via NPM (Recommended)
```bash
npm install -g @weihaoqu/gemini-curriculum-designer-skill
```

### Via Gemini CLI
```bash
gemini skills install @weihaoqu/gemini-curriculum-designer-skill --scope user
```

*Note: After installation, restart your CLI or run `/skills reload`.*

## 📚 Tutorial: From Zero to Course Portal

See how this skill was used to build a complete **"Program Analysis for Security" (CS336)** course from scratch.

### Step 1: Design the Curriculum
Activate the skill by stating your goal:
> "I need to create teaching materials for a course on Advanced Computing and Automata."

The agent will guide you through each topic (e.g., Deterministic Finite Automata).

**Agent:** "Let's look at Core Concepts for DFA. Please categorize: Formal Definition, State Diagrams, Regular Languages..."
**User:** `e, e, c` (Emphasize, Emphasize, Cover)

The agent then synthesizes a lesson plan:
> **Lesson 1:** Mathematical Foundations (Recap)
> **Lesson 2:** Defining and Visualizing DFAs (Emphasis on 5-tuple & Diagrams)
> ...

### Step 2: Enrich the Content
The skill helps you research and generate "Deep Dive" explanations for key takeaways, providing analogies and real-world examples (e.g., comparing a Control-Flow Graph to a subway map).

### Step 3: Plan the Delivery
Once the curriculum is set, the skill switches to **Delivery Mode**.

**Agent:** "Now that the content is defined, how do you want to deliver it?"
**User:** "I want to build an Interactive Web App."

The skill generates a `delivery-plan.md` tailored to your content:
*   **Tech Stack:** Next.js + Tailwind CSS + React Flow.
*   **Assets:** Interactive Lattice Visualizer, Prime+Probe Simulator.
*   **Roadmap:** Phase 1 (Core), Phase 2 (Visualizers), Phase 3 (Analysis Engine).

### The Result
Using this plan, we successfully built a functional Next.js portal with interactive labs for Taint Analysis and Cache Side-Channels.

## 🛠️ Usage with Claude

This skill is designed to be portable. The repository includes:
*   `claude_tool_definition.json`: The schema for the design tool.
*   `claude_system_prompt.md`: The system instructions containing the pedagogical logic.

You can feed these into the Claude API to replicate the same powerful workflow.

## License

MIT
