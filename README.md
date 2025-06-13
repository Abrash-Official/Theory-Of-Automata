# AutomataEdu - Interactive Automata Theory Learning Tool

A comprehensive web-based educational software tool for teaching and learning Automata Theory. This Flask application provides interactive visualizations, step-by-step explanations, and rich educational content for various topics in formal language theory.

## Features

### Core Conversion Tools
- **Regular Expression to DFA**: Convert regular expressions to deterministic finite automata using direct construction
- **NFA to DFA**: Transform nondeterministic finite automata to deterministic using subset construction  
- **DFA to Regular Expression**: Extract regular expressions from deterministic finite automata using state elimination
- **NFA to Regular Expression**: Convert NFA to regular expression. These are now organized into tab-selectable sections on the conversion page.

### Educational Features
- **Comprehensive Course Topics**: 15 distinct topics covering fundamental to advanced concepts in Automata Theory, each with its dedicated page.
- **Interactive Content**: Engaging content for course topics, including:
    - **Clickable MCQs**: Multiple-choice questions with instant feedback and score tracking.
    - **State Diagrams/Graphs**: Interactive visualizations of automata using Cytoscape.js to explain concepts.
    - **Code Examples**: Practical code snippets to illustrate theoretical concepts (W3Schools-style formatting).
- **Step-by-Step Explanations**: Detailed breakdown of each conversion algorithm.
- **Interactive Visualizations**: Beautiful graph representations using Cytoscape.js for conversion tools.
- **Built-in Examples**: Numerous simple and complex examples for each conversion type.
- **Progress Tracking**: Navigate through conversion steps with Previous/Next buttons.
- **Export Functionality**: Save graphs as images and conversion steps as JSON.

### UI/UX Enhancements
- **Dark Mode**: Toggle between light and dark themes.
- **Responsive Design**: Ensures optimal viewing across desktop and mobile devices.
- **Fixed Navigation Bar**: Navbar stays visible at the top for easy access to features.
- **Professional File Structure**: Organized project layout for better maintainability and scalability.

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

## Project Structure

The project follows a modular structure to keep the codebase organized:

```
Automata-Converter/
├── app/
│   ├── algorithms/               # Automata conversion logic (RegexToDFA, NFAToDFA, etc.)
│   ├── data/                     # Example data for conversions and topics
│   ├── templates/                # HTML templates for the web application
│   ├── static/                   # Static assets (CSS, JavaScript, images)
│   ├── __init__.py               # Initializes the Flask application
│   └── routes.py                 # Defines all application routes and view functions
├── run.py                        # Main script to run the Flask application
├── requirements.txt              # Python dependencies
├── README.md                     # Project documentation
└── venv/                         # Python virtual environment (ignored by Git)
```

## Prerequisites

Before running the application, ensure you have the following installed:

- **Python 3.8 or higher**
- **pip** (Python package installer)

## Installation

1. **Clone or extract the application files** to your desired directory:
   ```bash
   cd Automata-Converter
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
   pip install -r requirements.txt
   ```

## Running the Application

To start the Flask development server:

```bash
python run.py
```

The application will typically run on `http://127.0.0.1:5000/`. Open this URL in your web browser.

## Configuration

The application uses environment variables for configuration. You can set these in your shell or create a `.env` file:

### Required Environment Variables

- `SESSION_SECRET`: Secret key for Flask sessions (defaults to development key if not set)
  ```bash
  export SESSION_SECRET="your-secret-key-here"
  ```

## Contributing

We welcome contributions! Please feel free to fork the repository, create a new branch, and submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
  