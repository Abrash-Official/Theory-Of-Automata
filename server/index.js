import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mainRoutes from './routes/main.js';
import expressLayouts from 'express-ejs-layouts';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Set EJS as the view engine and use express-ejs-layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'base'); // base.ejs in /views

// Serve static files (CSS, JS, images)
app.use('/static', express.static(path.join(__dirname, '../app/static')));

// Mount main routes under /api
app.use('/api', mainRoutes);

// Render the homepage using EJS
app.get('/', (req, res) => {
  res.render('index', {
    title: 'AutomataEdu - Interactive Automata Theory Learning Tool',
    active_page: null,
    previous_page: null,
    next_page: '/course_intro'
  });
});

// TOA Home page route
app.get('/toa_home', (req, res) => {
  res.render('toa_home', {
    title: 'TOA Home',
    active_page: 'toa_home',
    previous_page: null,
    next_page: '/course_intro'
  });
});

// Course Introduction page route
app.get('/course_intro', (req, res) => {
  res.render('course_intro', {
    title: 'Course Introduction, Fundamentals of Automata',
    active_page: 'course_intro',
    previous_page: '/toa_home',
    next_page: '/recursive_def'
  });
});

// Recursive Definitions, Regular Expressions page route
app.get('/recursive_def', (req, res) => {
  res.render('recursive_def', {
    title: 'Recursive Definitions & Regular Expressions',
    active_page: 'recursive_def',
    previous_page: '/course_intro',
    next_page: '/languages_regex'
  });
});

// Languages and Regular Expressions page route
app.get('/languages_regex', (req, res) => {
  res.render('languages_regex', {
    title: 'Languages and Regular Expressions',
    active_page: 'languages_regex',
    previous_page: '/recursive_def',
    next_page: '/finite_automata'
  });
});

// Finite Automata (FA) page route
app.get('/finite_automata', (req, res) => {
  res.render('finite_automata', {
    title: 'Finite Automata',
    active_page: 'finite_automata',
    previous_page: '/languages_regex',
    next_page: '/nfa_dfa_graphs'
  });
});

// NFA, DFA, Transition Graphs page route
app.get('/nfa_dfa_graphs', (req, res) => {
  res.render('nfa_dfa_graphs', {
    title: 'NFA, DFA, Transition Graphs',
    active_page: 'nfa_dfa_graphs',
    previous_page: '/finite_automata',
    next_page: '/kleene_closure'
  });
});

// Kleene's Theorem, Closure Properties page route
app.get('/kleene_closure', (req, res) => {
  res.render('kleene_closure', {
    title: "Kleene's Theorem and Closure Properties of Regular Languages",
    active_page: 'kleene_closure',
    previous_page: '/nfa_dfa_graphs',
    next_page: '/mealy_moore'
  });
});

// Mealy and Moore Machines page route
app.get('/mealy_moore', (req, res) => {
  res.render('mealy_moore', {
    title: 'Mealy and Moore Machines',
    active_page: 'mealy_moore',
    previous_page: '/kleene_closure',
    next_page: '/cfg'
  });
});

// Context-Free Grammars (CFG) page route
app.get('/cfg', (req, res) => {
  res.render('cfg', {
    title: 'Context-Free Grammars (CFG)',
    active_page: 'cfg',
    previous_page: '/mealy_moore',
    next_page: '/pda'
  });
});

// Pushdown Automata (PDA) page route
app.get('/pda', (req, res) => {
  res.render('pda', {
    title: 'Pushdown Automata (PDA)',
    active_page: 'pda',
    previous_page: '/cfg',
    next_page: '/parse_trees'
  });
});

// Parse Trees, Ambiguity, and Chomsky Normal Form page route
app.get('/parse_trees', (req, res) => {
  res.render('parse_trees', {
    title: 'Parse Trees, Ambiguity, and Chomsky Normal Form',
    active_page: 'parse_trees',
    previous_page: '/pda',
    next_page: '/chomsky_hierarchy'
  });
});

// Theory of Computation page route
app.get('/theory_of_computation', (req, res) => {
  res.render('theory_of_computation', {
    title: 'Theory of Computation',
    active_page: null,
    previous_page: null,
    next_page: null
  });
});

// Pumping Lemma for CFLs page route
app.get('/pumping_lemma', (req, res) => {
  res.render('pumping_lemma', {
    title: 'Pumping Lemma for CFLs',
    active_page: 'pumping_lemma',
    previous_page: '/parse_trees',
    next_page: '/turing_machines'
  });
});

// Turing Machines and Their Variants page route
app.get('/turing_machines', (req, res) => {
  res.render('turing_machines', {
    title: 'Turing Machines and Their Variants',
    active_page: 'turing_machines',
    previous_page: '/pumping_lemma',
    next_page: '/decidability'
  });
});

// Decidability and Computability Theory page route
app.get('/decidability', (req, res) => {
  res.render('decidability', {
    title: 'Decidability and Computability Theory',
    active_page: 'decidability',
    previous_page: '/turing_machines',
    next_page: '/context_sensitive'
  });
});

// Context-Sensitive Languages, LBA, Chomsky Hierarchy page route
app.get('/context_sensitive', (req, res) => {
  res.render('context_sensitive', {
    title: 'Context-Sensitive Languages, LBA, Chomsky Hierarchy',
    active_page: 'context_sensitive',
    previous_page: '/decidability',
    next_page: '/conversion'
  });
});

// Run Python code endpoint
app.post('/run_python_code', (req, res) => {
  const code = req.body.code;
  if (!code) {
    return res.status(400).json({ error: 'No code provided.' });
  }

  // Write code to a temp file
  const tmp = os.tmpdir();
  const filePath = `${tmp}/automata_code_${Date.now()}.py`;
  fs.writeFileSync(filePath, code);

  // Run the Python code
  const py = spawn('python', [filePath]);
  let output = '';
  let error = '';

  py.stdout.on('data', (data) => {
    output += data.toString();
  });
  py.stderr.on('data', (data) => {
    error += data.toString();
  });
  py.on('close', (code) => {
    fs.unlinkSync(filePath); // Clean up temp file
    if (error) {
      res.json({ output: error });
    } else {
      res.json({ output });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 