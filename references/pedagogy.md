# Pedagogical Patterns for Curriculum Design

This document outlines common pedagogical (teaching) patterns. When designing a lesson plan, refer to these patterns to structure the material in a logical and effective way.

---

### 1. Problem-First (Concrete-to-Abstract)

- **Description:** Start with a concrete, relatable, and motivating problem. Let the student grapple with the "why" before introducing the "how." Once the problem is well understood, introduce the abstract theory or tools needed to solve it.
- **When to Use:** Excellent for introducing a new, complex topic. It immediately establishes relevance and provides a clear goal for the student.
- **Example Flow:**
    1.  Show a piece of code with a subtle security bug (e.g., a Use-After-Free).
    2.  Manually trace how an attacker could exploit it.
    3.  Ask: "How could we find this bug automatically?"
    4.  Introduce the theory of Path-Sensitive Analysis as the solution.

### 2. Theory-to-Practice (Abstract-to-Concrete)

- **Description:** Start by introducing the formal theory, definitions, and framework. Build the intellectual toolkit first, then apply that toolkit to a practical example.
- **When to Use:** Useful when the practical examples are too complex to understand without knowing the terminology and rules first. Good for more mathematically-inclined topics.
- **Example Flow:**
    1.  Define a Security Lattice and the rules of information flow (`L ⊑ H`).
    2.  Define the formal typing rules for a security type system.
    3.  *Then*, show a piece of code and use the rules to type-check it and find a violation.

### 3. Scaffolding / Simple-to-Complex

- **Description:** Introduce a concept in its simplest possible form. Once the student grasps the basic idea, progressively add layers of complexity, features, or edge cases.
- **When to Use:** Almost always a good idea. It's the core of good teaching. It avoids overwhelming the student and builds a strong foundation at each step.
- **Example Flow:**
    1.  **Lesson 1:** Introduce a "Taint Lite" model that only handles direct assignments.
    2.  **Lesson 2:** Add complexity by handling simple expressions (`y = x + z`).
    3.  **Lesson 3:** Add complexity by considering control flow merges (`if/else`).
    4.  **Lesson 4:** Add complexity by considering function calls (interprocedural analysis).

### 4. Recap and Refresh

- **Description:** Begin a new module or complex lesson by briefly reviewing the essential concepts from previous lessons that are prerequisites for the current topic.
- **When to Use:** At the start of every new module that builds on previous ones.
- **Example Flow:**
    - "In our last module, we discussed Control-Flow Graphs. Today, we'll use that knowledge to build a Control-Flow Integrity checker. As a reminder, a CFG consists of..."
