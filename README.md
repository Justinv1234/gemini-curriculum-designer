# Curriculum Designer Skill

[![npm version](https://img.shields.io/npm/v/@weihaoqu/curriculum-designer-skill.svg)](https://www.npmjs.com/package/@weihaoqu/curriculum-designer-skill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Turn your rough course ideas into structured curriculums and technical delivery plans.**

The `curriculum-designer` is a powerful agentic skill for **Gemini CLI** and **Claude Code**. It acts as an expert instructional designer, interviewing you to build high-quality educational content and then generating the technical roadmap to build it.

---

## 📦 Installation & Setup

Choose your platform below:

### Option A: Gemini CLI

#### Prerequisites
1.  **Install Node.js:** Download and install the latest LTS version from [nodejs.org](https://nodejs.org/).
2.  **Install Gemini CLI:**
    ```bash
    npm install -g @google/gemini-cli
    ```

#### Install the Skill
```bash
npm install -g @weihaoqu/curriculum-designer-skill
```

#### Register with Gemini CLI
```bash
# From your local NPM installation (Best for Mac)
gemini skills install $(npm root -g)/@weihaoqu/curriculum-designer-skill --scope user

# Or directly from GitHub (Works for Windows & Mac)
gemini skills install https://github.com/weihaoqu/gemini-curriculum-designer --scope user
```

#### Verify Installation
```bash
gemini skills list
```
*You should see `curriculum-designer` in the output.*

#### Activate in Session
If you are already in a chat session, reload the skills:
```
/skills reload
```

---

### Option B: Claude Code

#### Prerequisites
1.  **Install Claude Code:** Follow the installation guide at [claude.ai/claude-code](https://claude.ai/claude-code).

#### Install the Skill

**Method 1: Via NPM (Recommended)**

```bash
npm install -g @weihaoqu/curriculum-designer-skill
```

The skill is automatically installed to `~/.claude/skills/` during npm install.

If you need to reinstall manually:
```bash
curriculum-designer-install
```

**Method 2: Manual Download**

```bash
mkdir -p ~/.claude/skills
curl -o ~/.claude/skills/curriculum-designer.md https://raw.githubusercontent.com/weihaoqu/gemini-curriculum-designer/main/SKILL.md
```

#### Verify Installation
Start a new Claude Code session and the skill will be available. You can ask:
```
Help me design a curriculum for [your topic]
```

---

## 🧠 How It Works

The skill adapts to your situation—whether creating from scratch or enhancing existing materials.

### Two Modes

```
Agent: What would you like to do?

       [Create new curriculum from scratch]
       [Enhance existing course materials]
       [Update outdated content with latest practices]
       [Add new delivery format to existing curriculum]
```

---

### Mode A: Enhance Existing Materials

Already have a course? The skill becomes your **upgrade assistant**:

```
User: "I have slides from my 2022 Python course. Help me update it."

Agent: [Reads your existing materials]
       [Analyzes content inventory]
       [Researches what's changed since 2022]

       ## Course Analysis
       ✅ Current: Data types, functions, OOP basics
       ⚠️ Needs update: Package management (pip → uv/poetry)
       ❌ Outdated: Python 3.8 examples (now at 3.12)
       💡 Missing: Type hints, async/await, match statements

       ## What's New in Python (2024-2025)
       🆕 Pattern matching is now widely adopted
       🆕 Type hints are expected in production code
       ⚠️ setup.py is deprecated; use pyproject.toml

       Which enhancements would you like?
       [Update outdated content] [Add new modules] [Refresh examples]
       [Add new delivery format] [Enhance assessments]
```

---

### Mode B: Create New Curriculum

Starting fresh? The skill researches, designs, and builds:

```
User: "I want to create a course on Kubernetes for DevOps engineers."

Agent: [Researches latest K8s trends, tools, certifications]

       ## Topic Landscape: Kubernetes (2025)
       Current Trends: GitOps, Platform Engineering, AI/ML workloads
       Essential Tools: Helm, ArgoCD, Crossplane
       Certifications: CKA, CKAD, CKS

       [Proposes complete modules with lessons, activities, assessments]
       [Approve] [Modify] [Start over]
```

---

### Assessment Design

The skill generates **complete, ready-to-use assessments**:

| Type | What You Get |
|------|--------------|
| **Quizzes** | Questions, answer keys, explanations, rubrics |
| **Labs** | Instructions, starter code, grading criteria, solutions |
| **Projects** | Milestones, deliverables, detailed rubrics |
| **Peer Reviews** | Structured feedback forms, evaluation criteria |

```
Agent: Generated assessments.md with:
       - 5 module quizzes (20 questions each)
       - 4 hands-on labs with autograder tests
       - 1 midterm project with milestone rubrics
       - 1 capstone with peer review forms
```

---

### Delivery Templates

Choose your format and get **production-ready templates**:

| Format | What's Generated |
|--------|-----------------|
| **Slide Decks** | Reveal.js/Markdown slides with speaker notes |
| **Jupyter Notebooks** | Interactive notebooks with exercises and solutions |
| **LMS Package** | Canvas/Moodle-ready export structure |
| **Video Scripts** | Full scripts with timestamps, visuals, B-roll cues |
| **GitHub Repo** | Complete course repository structure |

```
Agent: Which delivery formats do you need?
       [Interactive Web App] [Slide Decks] [Jupyter Notebooks]
       [LMS Package] [Video Scripts] [GitHub Repository]

User: Slides + Jupyter Notebooks

Agent: [Generates slide deck for each module]
       [Creates interactive notebooks with exercises]
       [Provides setup instructions for both]
```

---

## 🏆 Case Study: Building the "CS336 Portal"

We used this skill to build a complete course on **Program Analysis for Security & Privacy**.

### The Challenge
We needed to teach complex topics like **Static Taint Analysis**, **Symbolic Execution**, and **Control-Flow Integrity** to advanced students.

### The Process
1.  **Research & Planning:** The skill researched current program analysis tools and techniques, suggesting we include modern frameworks like CodeQL alongside traditional theory.
2.  **Curriculum Design:** Approved 9 rigorous modules with rich content—the skill generated complete lesson plans with explanations, exercises, and assessments.
3.  **Implementation:** Chose "Interactive Web App" delivery. The skill generated the full tech stack (Next.js + Monaco Editor + React Flow) and helped build interactive components.

### The Result
A fully functional educational portal with:
- Interactive code visualizations
- Hands-on labs (Lattice Visualizer, Cache Simulator)
- Complete curriculum content

👉 **View the Implementation:** [github.com/weihaoqu/paprojectsimplementation](https://github.com/weihaoqu/paprojectsimplementation)

---

## 🛠️ Platform-Specific Features

### Claude Code (Recommended)

Claude Code unlocks the full potential of this skill:

| Feature | How It Works |
|---------|--------------|
| **Smart Questions** | Uses `AskUserQuestion` for structured, clickable choices |
| **Topic Research** | Uses `WebSearch` to find latest trends, tools, and resources |
| **Material Analysis** | Reads and analyzes your existing course files |
| **Complete Proposals** | Presents full module designs for approval, not piecemeal questions |
| **Assessment Generation** | Creates quizzes, labs, projects with rubrics and solutions |
| **Delivery Templates** | Generates slides, notebooks, LMS packages, video scripts |
| **Implementation** | Actually builds your course—creates files, writes code, sets up projects |

### Gemini CLI

- Uses shorthand notation for quick responses (`i`, `b`, `a`, `e`, `c`, `s`)
- Text-based interview flow
- Research features depend on available tools

### Claude API (Advanced)

For programmatic use with the Claude API, the repository includes:
*   `claude_tool_definition.json`: A JSON schema defining the curriculum design tool.
*   `claude_system_prompt.md`: A system prompt containing the pedagogical logic.

You can use these with the **Anthropic Workbench** or Claude API directly.

## Changelog

### v1.1.1 (2025-02-03)

- **Easy Install for Claude Code** - Running `npm install -g` now automatically installs the skill to `~/.claude/skills/`
- Added `curriculum-designer-install` command for manual reinstallation

### v1.1.0 (2025-02-03)

**New Features:**
- **Claude Code Support** - Full compatibility with `AskUserQuestion`, `WebSearch`, and other Claude Code tools
- **Mode A: Enhance Existing Materials** - Analyze existing courses, research what's changed, apply targeted updates
- **Assessment Templates** - Complete templates for quizzes, labs, projects, and peer reviews with rubrics
- **Delivery Templates** - Production-ready templates for slides, Jupyter notebooks, LMS packages, video scripts, and GitHub repos

**Improvements:**
- Streamlined workflow with complete module proposals instead of piecemeal questions
- Proactive topic research before curriculum design
- Changelog tracking for course updates

### v1.0.x

- Initial release for Gemini CLI
- Basic curriculum design workflow
- Prerequisite and core concept analysis

## License

MIT
