# AutomataEdu - Interactive Automata Theory Learning Tool

A comprehensive web-based educational software tool for teaching and learning Automata Theory. This Flask application provides interactive visualizations and step-by-step explanations for three core conversion algorithms in formal language theory.

## Features

### Core Conversion Tools
- **Regular Expression to DFA**: Convert regular expressions to deterministic finite automata using direct construction
- **NFA to DFA**: Transform nondeterministic finite automata to deterministic using subset construction  
- **DFA to Regular Expression**: Extract regular expressions from deterministic finite automata using state elimination

### Educational Features
- **Step-by-Step Explanations**: Detailed breakdown of each conversion algorithm
- **Interactive Visualizations**: Beautiful graph representations using Cytoscape.js
- **30 Built-in Examples**: 10 simple and 10 complex examples for each conversion type
- **Progress Tracking**: Navigate through conversion steps with Previous/Next buttons
- **Export Functionality**: Save graphs as images and conversion steps as JSON
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- **Flask**: Python web framework
- **Python 3.8+**: Core programming language
- **Jinja2**: Template engine

### Frontend
- **Bootstrap 5**: Responsive UI framework
- **Vanilla JavaScript**: Client-side functionality
- **Cytoscape.js**: Graph visualization library
- **Feather Icons**: Icon library
- **KaTeX**: Mathematical notation rendering

## Prerequisites

Before running the application, ensure you have the following installed:

- **Python 3.8 or higher**
- **pip** (Python package installer)

## Installation

1. **Clone or extract the application files** to your desired directory:
   ```bash
   cd automata-edu
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install required dependencies**:
   ```bash
   pip install flask werkzeug
   ```

## Configuration

The application uses environment variables for configuration. You can set these in your shell or create a `.env` file:

### Required Environment Variables

- `SESSION_SECRET`: Secret key for Flask sessions (defaults to development key if not set)
  ```bash
  export SESSION_SECRET="your-secret-key-here"
  