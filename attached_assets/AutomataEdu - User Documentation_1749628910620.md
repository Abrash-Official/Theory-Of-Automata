# AutomataEdu - User Documentation

## Overview

AutomataEdu is a comprehensive web-based educational software tool designed for teaching and learning Automata Theory. The application provides interactive visualizations and step-by-step explanations for three core conversion algorithms in formal language theory.

## Features

### Core Conversion Tools

1. **Regular Expression to DFA**
   - Convert regular expressions to deterministic finite automata using direct construction
   - Supports all standard operators: *, |, (), ε, ∅
   - Visual syntax tree construction and position calculation

2. **NFA to DFA**
   - Transform nondeterministic finite automata to deterministic using subset construction
   - Handles epsilon transitions and multiple start states
   - Shows epsilon closure calculations

3. **DFA to Regular Expression**
   - Extract regular expressions from deterministic finite automata using state elimination
   - Step-by-step state removal process
   - Generalized NFA intermediate representations

### Educational Features

- **Step-by-Step Explanations**: Detailed breakdown of each conversion algorithm
- **Interactive Visualizations**: Beautiful graph representations of automata
- **30 Built-in Examples**: 10 simple and 10 complex examples for each conversion type
- **Progress Tracking**: Navigate through conversion steps with Previous/Next buttons
- **Export Functionality**: Save graphs as images and conversion steps as PDF

### User Interface

- **Tabbed Navigation**: Easy switching between conversion modes
- **Visual Editor**: Interactive forms for defining automata
- **Quick Insert Buttons**: Fast input of common symbols (ε, ∅, *, |, etc.)
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### Regular Expression to DFA Conversion

1. Navigate to the "RegEx → DFA" tab
2. Enter a regular expression in the input field
3. Use quick insert buttons for special symbols
4. Click "Convert" to start the conversion
5. View the resulting DFA graph and step-by-step explanation
6. Use "Show Table" to see the transition table
7. Export results using the "Export" button

**Supported Operators:**
- `*` - Kleene star (zero or more)
- `|` - Union (or)
- `()` - Grouping
- `ε` - Epsilon (empty string)
- `∅` - Empty set

**Example Expressions:**
- `a*` - Zero or more a's
- `a|b` - Either a or b
- `(a|b)*abb` - Strings ending with "abb"
- `a*b*` - a's followed by b's

### NFA to DFA Conversion

1. Navigate to the "NFA → DFA" tab
2. Choose "Visual Editor" input mode
3. Define your NFA:
   - Enter states (comma-separated): `q0, q1, q2`
   - Enter alphabet symbols: `a, b`
   - Set start states: `q0`
   - Set final states: `q2`
   - Add transitions using the dropdown menus
4. Click "Convert" to perform subset construction
5. View the resulting DFA and conversion steps

### DFA to Regular Expression Conversion

1. Navigate to the "DFA → RegEx" tab
2. Use the Visual Editor to define your DFA:
   - Enter states: `q0, q1, q2`
   - Enter alphabet: `a, b`
   - Select single start state
   - Enter final states
   - Add deterministic transitions
3. Click "Convert" to start state elimination
4. View the resulting regular expression

### Using Examples

Each conversion mode includes 20 built-in examples (10 simple, 10 complex):

1. Click the "Choose an example..." dropdown
2. Browse through Simple and Complex categories
3. Select an example to automatically load it
4. Click "Convert" to see the solution
5. Study the step-by-step explanation

## Example Problems

### Simple Examples (RegEx → DFA)
- Single symbol: `a`
- Simple concatenation: `ab`
- Simple union: `a|b`
- Kleene star: `a*`
- Union with Kleene star: `(a|b)*`

### Complex Examples (RegEx → DFA)
- Strings ending with "abb": `(a|b)*abb`
- Zero or more a's followed by zero or more b's: `a*b*`
- Strings with 'a' as third-to-last symbol: `(a|b)*a(a|b)(a|b)`
- Even length strings: `((a|b)(a|b))*`
- Strings starting and ending with same symbol: `a(a|b)*a|b(a|b)*b`

## Technical Specifications

- **Framework**: React with Vite
- **Visualization**: Cytoscape.js for graph rendering
- **Math Rendering**: KaTeX for mathematical expressions
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Static hosting with permanent URL

## Educational Applications

AutomataEdu is designed for:

- **Undergraduate Computer Science Courses**: Formal Languages and Automata Theory
- **Self-Study**: Interactive learning with immediate feedback
- **Homework and Assignments**: Built-in examples for practice
- **Classroom Demonstrations**: Visual explanations for complex concepts
- **Research**: Understanding algorithm implementations

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Support and Feedback

For questions, bug reports, or feature requests, please contact the development team.

---

**Made with Manus AI** - Advanced educational software for computer science learning.

