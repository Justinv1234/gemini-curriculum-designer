---
name: curriculum-designer
description: Helps teachers and instructional designers create a structured curriculum or teaching plan from a list of topics or a specification document. Use when the user wants to design course materials, lesson plans, or a syllabus.
---

# Curriculum Designer

This skill guides the process of creating a structured teaching plan or curriculum from a source document outlining course topics or projects.

## Workflow

The process is iterative, tackling one module or topic at a time to ensure clarity and gather focused feedback.

### 1. Identify Source Material & Goal

- **Confirm Goal:** First, confirm with the user that their goal is to create teaching materials, a lesson plan, or a curriculum.
- **Identify Source:** Ask the user to point to the source material that contains the list of topics (e.g., a project specification markdown file, a list of chapters, etc.). If no source exists, ask the user to provide the list of topics to be covered.
- **Establish Output File:** Agree on a filename for the final teaching plan (e.g., `teaching-plan.md`).

### 2. The Core Loop (For Each Topic)

For each topic/module identified, follow this efficient, batched interview process.

#### Step A: Analyze Prerequisites

1.  **Identify & List:** Generate a numbered list of 3-5 potential prerequisite concepts.
2.  **Batch Query:** Present the full list to the user at once.
3.  **Request Batched Feedback:** Ask the user to categorize *all* items in one go using a comma-separated string of shorthands.
    *   `i` = Include as a full lesson
    *   `b` = Briefly Cover as a recap
    *   `a` = Assume Known

**Example Interaction:**
> **Agent:** Let's cover prerequisites for **DFA**. Please categorize the following:
> 1.  Set Theory
> 2.  Formal Languages
> 3.  Graph Theory
>
> Please respond with a list of shorthands corresponding to the numbers above (e.g., `b, i, a` means briefly cover #1, include #2, assume #3).

#### Step B: Analyze Core Concepts

1.  **Identify & List:** Generate a numbered list of 4-6 potential core concepts.
2.  **Batch Query:** Present the full list at once.
3.  **Request Batched Feedback:** Ask for a comma-separated string of shorthands:
    *   `c` = Cover
    *   `e` = Emphasize
    *   `s` = Skip

**Example Interaction:**
> **Agent:** Now for the core concepts of DFA:
> 1.  Formal Definition (5-tuple)
> 2.  State Transition Diagrams
> 3.  Language of a DFA
> 4.  Designing DFAs
>
> Please respond with your choices in order (e.g., `e, c, e, s`).

#### Step C: Propose and Refine the Teaching Order

1.  **Synthesize Initial Plan:** Based on the feedback, synthesize and present a logical, numbered teaching order.
2.  **Enter Modification Loop:** Ask the user what they want to do next. The loop continues until the user approves the plan.

**Example Interaction:**
> **Agent:** Here is the proposed lesson plan:
> 1.  **Lesson 1: Foundations...**
> 2.  **Lesson 2: The Formal DFA...**
> ...
> What would you like to do? You can **(m)odify** a lesson, **(r)eorder** lessons, **(d)elete** a lesson, or **(a)pprove** the plan.
> **User:** `m 2` (or just `m`)
> ...

3.  **Consult Pedagogy:** **Consult `references/pedagogy.md`** throughout.

### 3. Generate the Artifact

- Once the user approves the lesson plan for a module, append the well-formatted Markdown for that module to the designated output file.
- Use clear headings and lists to ensure the final document is readable and well-structured.

#### Step D: Design Learning Activities (Optional)

1.  **Offer Activities:** After finalizing the lesson plan content, ask: "Would you like to add specific active learning activities for this module?"
2.  **Propose Tailored Options:** If the user agrees, propose 3-4 specific activities relevant to the module's content (e.g., "Interactive DFA Builder," "Regex Golf Game," "Group Proof Workshop").
3.  **Refine & Append:** Ask the user to select or modify these activities. Append the chosen activities to the end of the module's section in the output file under an "### Active Learning" heading.

### 4. Continue to Next Topic

- After saving the progress, move to the next topic in the source material and repeat the core loop.

### 5. Phase 4: Delivery Strategy & Tooling Plan

Once all curriculum topics are covered, initiate the Delivery Strategy phase.

1.  **Assess Delivery Goals:** Ask the user: "Now that the curriculum content is defined, how do you plan to deliver it? (e.g., Interactive Web App, Slide Decks, Jupyter Notebooks, Video Series)."
2.  **Generate Implementation Plan:** Based on their choice, generate a comprehensive **Delivery Plan**.
    *   **Propose Tech Stack:** Suggest appropriate tools (e.g., React + D3.js for automata, Reveal.js for slides).
    *   **List Assets:** Identify necessary assets (e.g., JSON data for graphs, image assets, code templates).
    *   **Development Roadmap:** Create a step-by-step guide to building the delivery vehicle.
3.  **Write to File:** Save this plan to a new file named `delivery-plan.md` (or similar) in the project directory.