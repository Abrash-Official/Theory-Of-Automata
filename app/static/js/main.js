// AutomataEdu Main JavaScript Application

// Global state management
window.AutomataEdu = {
    currentTab: 'regex-to-dfa',
    currentStep: 0,
    totalSteps: 0,
    conversionData: null,
    examples: null,
    isDarkMode: false
};

// Initialize application
function initializeApp() {
    console.log('Initializing AutomataEdu...');
    
    // Load examples data
    if (window.EXAMPLES_DATA) {
        window.AutomataEdu.examples = window.EXAMPLES_DATA;
    }
    
    // Initialize theme
    initializeTheme();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize input modes
    initializeInputModes();
    
    // Setup example selectors
    setupExampleSelectors();

    // Initialize introduction DFA graph if present
    const introDfaVisualizationContainer = document.getElementById('introDfaVisualization');
    if (introDfaVisualizationContainer && typeof renderAutomaton !== 'undefined') {
        const introDfaData = {
            states: [
                { id: 'q0', label: 'q0', isStart: true, isFinal: false },
                { id: 'q1', label: 'q1', isStart: false, isFinal: true }
            ],
            transitions: [
                { from: 'q0', to: 'q0', symbol: '0' },
                { from: 'q0', to: 'q1', symbol: '1' },
                { from: 'q1', to: 'q0', symbol: '0' },
                { from: 'q1', to: 'q1', symbol: '1' }
            ]
        };
        console.log("Attempting to render Introduction DFA graph...");
        renderAutomaton('introDfaVisualization', introDfaData);
    }

    // Initialize Languages and Regular Expressions DFA graph if present
    const languagesRegexDfaVisualizationContainer = document.getElementById('languagesRegexDfaVisualization');
    if (languagesRegexDfaVisualizationContainer && typeof renderAutomaton !== 'undefined') {
        const languagesRegexDfaData = {
            states: [
                { id: 'q0', label: 'q0', isStart: true, isFinal: false },
                { id: 'q1', label: 'q1', isStart: false, isFinal: false },
                { id: 'q2', label: 'q2', isStart: false, isFinal: true }
            ],
            transitions: [
                { from: 'q0', to: 'q1', symbol: 'a' },
                { from: 'q0', to: 'q0', symbol: 'b' },
                { from: 'q1', to: 'q1', symbol: 'a' },
                { from: 'q1', to: 'q2', symbol: 'b' },
                { from: 'q2', to: 'q1', symbol: 'a' },
                { from: 'q2', to: 'q0', symbol: 'b' }
            ]
        };
        console.log("Attempting to render Languages and Regular Expressions DFA graph...");
        renderAutomaton('languagesRegexDfaVisualization', languagesRegexDfaData);
    }

    // Initialize Kleene Star diagram if present
    const kleeneStarDiagramContainer = document.getElementById('kleeneStarDiagram');
    if (kleeneStarDiagramContainer && typeof renderAutomaton !== 'undefined') {
        // Calculate center for the single node
        const containerWidth = kleeneStarDiagramContainer.offsetWidth;
        const containerHeight = kleeneStarDiagramContainer.offsetHeight;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        const kleeneStarAutomatonData = {
            states: [
                { id: 'q0', label: 'q0', isStart: true, isFinal: true, position: { x: centerX, y: centerY } }
            ],
            transitions: [
                { from: 'q0', to: 'q0', symbol: 'a' }
            ]
        };
        console.log("Attempting to render Kleene Star diagram...");
        const cyKleeneStar = renderAutomaton('kleeneStarDiagram', kleeneStarAutomatonData);
        if (cyKleeneStar) {
            // Explicitly set node position and then center and fit the graph
            cyKleeneStar.getElementById('q0').position({ x: centerX, y: centerY });
            cyKleeneStar.center(); 
            cyKleeneStar.fit(); 
        }
    }

    // Initialize Finite Automata DFA graph for strings ending with 'ab'
    const dfaEndingWithAbVisualizationContainer = document.getElementById('dfaEndingWithAbVisualization');
    if (dfaEndingWithAbVisualizationContainer && typeof renderAutomaton !== 'undefined') {
        const dfaEndingWithAbData = {
            states: [
                { id: 'q0', label: 'q0', isStart: true, isFinal: false },
                { id: 'q1', label: 'q1', isStart: false, isFinal: false },
                { id: 'q2', label: 'q2', isStart: false, isFinal: true }
            ],
            transitions: [
                { from: 'q0', to: 'q1', symbol: 'a' },
                { from: 'q0', to: 'q0', symbol: 'b' },
                { from: 'q1', to: 'q1', symbol: 'a' },
                { from: 'q1', to: 'q2', symbol: 'b' },
                { from: 'q2', to: 'q1', symbol: 'a' },
                { from: 'q2', to: 'q0', symbol: 'b' }
            ]
        };
        console.log("Attempting to render DFA for strings ending with 'ab' graph...");
        renderAutomaton('dfaEndingWithAbVisualization', dfaEndingWithAbData);
    }

    // Initialize Formal DFA Example graph
    const dfaFormalExampleVisualizationContainer = document.getElementById('dfaFormalExampleVisualization');
    if (dfaFormalExampleVisualizationContainer && typeof renderAutomaton !== 'undefined') {
        const dfaFormalExampleData = {
            states: [
                { id: 'q0', label: 'q0', isStart: true, isFinal: false },
                { id: 'q1', label: 'q1', isStart: false, isFinal: true }
            ],
            transitions: [
                { from: 'q0', to: 'q1', symbol: 'a' },
                { from: 'q0', to: 'q0', symbol: 'b' },
                { from: 'q1', to: 'q1', symbol: 'a' },
                { from: 'q1', to: 'q0', symbol: 'b' }
            ]
        };
        console.log("Attempting to render Formal DFA Example graph...");
        renderAutomaton('dfaFormalExampleVisualization', dfaFormalExampleData);
    }

    // Initialize NFA Diagram for Strings Ending with 'a'
    const nfaEndingWithAVisualizationContainer = document.getElementById('nfaEndingWithAVisualization');
    if (nfaEndingWithAVisualizationContainer && typeof renderAutomaton !== 'undefined') {
        const nfaEndingWithAData = {
            states: [
                { id: 'q0', label: 'q0', isStart: true, isFinal: false },
                { id: 'q1', label: 'q1', isStart: false, isFinal: true }
            ],
            transitions: [
                { from: 'q0', to: 'q0', symbol: 'a' },
                { from: 'q0', to: 'q1', symbol: 'a' },
                { from: 'q0', to: 'q0', symbol: 'b' }
            ]
        };
        console.log("Attempting to render NFA Diagram for Strings Ending with 'a'...");
        renderAutomaton('nfaEndingWithAVisualization', nfaEndingWithAData);
    }

    // Initialize CodeMirror for Python code input if present
    const pythonCodeEditorElement = document.getElementById('pythonCodeInput');
    if (pythonCodeEditorElement && typeof CodeMirror !== 'undefined') {
        console.log('Initializing CodeMirror for Python code editor...');
        window.AutomataEdu.codeEditorInstance = CodeMirror.fromTextArea(pythonCodeEditorElement, {
            mode: 'python',
            theme: 'dracula',
            lineNumbers: true,
            indentUnit: 4,
            tabSize: 4,
            lineWrapping: true,
            readOnly: false // Make it editable
        });
    }

    // Initialize CodeMirror for Python code input in Finite Automata page
    const pythonCodeEditorElementFA = document.getElementById('pythonCodeInputFA');
    if (pythonCodeEditorElementFA && typeof CodeMirror !== 'undefined') {
        console.log('Initializing CodeMirror for Python code editor in FA page...');
        window.AutomataEdu.codeEditorInstanceFA = CodeMirror.fromTextArea(pythonCodeEditorElementFA, {
            mode: 'python',
            theme: 'dracula',
            lineNumbers: true,
            indentUnit: 4,
            tabSize: 4,
            lineWrapping: true,
            readOnly: false // Make it editable
        });
    }
    
    // Render KaTeX math expressions after the DOM is ready
    if (typeof renderMathInElement !== 'undefined') {
        console.log('Attempting to render KaTeX math...');
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError : false
        });
    }
    
    console.log('AutomataEdu initialized successfully');
}

// Ensure initializeApp is called when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('automataEdu.theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    window.AutomataEdu.isDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    updateTheme();
}

function toggleTheme() {
    window.AutomataEdu.isDarkMode = !window.AutomataEdu.isDarkMode;
    updateTheme();
    localStorage.setItem('automataEdu.theme', window.AutomataEdu.isDarkMode ? 'dark' : 'light');
}

function updateTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    
    if (window.AutomataEdu.isDarkMode) {
        html.setAttribute('data-bs-theme', 'dark');
        if (themeIcon) themeIcon.setAttribute('data-feather', 'sun');
    } else {
        html.setAttribute('data-bs-theme', 'light');
        if (themeIcon) themeIcon.setAttribute('data-feather', 'moon');
    }
    
    // Re-render feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// Event listeners setup
function setupEventListeners() {
    // Theme toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleTheme);
    }
    
    // Tab switching
    const tabTriggers = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('shown.bs.tab', handleTabChange);
    });
    
    // Python Code Runner
    const runPythonCodeBtn = document.getElementById('runPythonCodeBtn');
    if (runPythonCodeBtn) {
        runPythonCodeBtn.addEventListener('click', runPythonCode);
    }

    // Python Code Runner for Finite Automata page
    const runPythonCodeBtnFA = document.getElementById('runPythonCodeBtnFA');
    if (runPythonCodeBtnFA) {
        runPythonCodeBtnFA.addEventListener('click', runPythonCodeFA);
    }
    
    // RegEx to DFA
    setupRegexToDfaListeners();
    
    // NFA to DFA
    setupNfaToDfaListeners();
    
    // DFA to RegEx
    setupDfaToRegexListeners();
    
    // NFA to Regex
    setupNfaToRegexListeners();
}

// RegEx to DFA event listeners
function setupRegexToDfaListeners() {
    // Convert button
    const convertBtn = document.getElementById('convertRegexBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', convertRegexToDfa);
    }
    
    // Input field - enter key
    const regexInput = document.getElementById('regexInput');
    if (regexInput) {
        regexInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                convertRegexToDfa();
            }
        });
    }
    
    // Navigation buttons
    const prevBtn = document.getElementById('regexPrevStep');
    const nextBtn = document.getElementById('regexNextStep');
    if (prevBtn) prevBtn.addEventListener('click', () => navigateStep('regex', -1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateStep('regex', 1));
    
    // Control buttons
    const showTableBtn = document.getElementById('regexShowTable');
    const exportBtn = document.getElementById('regexExport');
    const resetBtn = document.getElementById('regexReset');
    
    if (showTableBtn) showTableBtn.addEventListener('click', () => toggleTransitionTable('regex'));
    if (exportBtn) exportBtn.addEventListener('click', () => exportResults('regex'));
    if (resetBtn) resetBtn.addEventListener('click', () => resetConversion('regex'));
}

// NFA to DFA event listeners
function setupNfaToDfaListeners() {
    // Input mode radio buttons
    const inputModeRadios = document.querySelectorAll('input[name="nfaInputMode"]');
    inputModeRadios.forEach(radio => {
        radio.addEventListener('change', handleNfaInputModeChange);
    });
    
    // Convert buttons
    const convertBtn = document.getElementById('convertNfaBtn');
    const convertExampleBtn = document.getElementById('convertNfaExampleBtn');
    
    if (convertBtn) convertBtn.addEventListener('click', convertNfaToDfa);
    if (convertExampleBtn) convertExampleBtn.addEventListener('click', convertNfaExample);
    
    // Add transition button
    const addTransitionBtn = document.getElementById('addNfaTransition');
    if (addTransitionBtn) addTransitionBtn.addEventListener('click', () => addTransitionRow('nfa'));
    
    // Navigation buttons
    const prevBtn = document.getElementById('nfaPrevStep');
    const nextBtn = document.getElementById('nfaNextStep');
    if (prevBtn) prevBtn.addEventListener('click', () => navigateStep('nfa', -1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateStep('nfa', 1));
    
    // Control buttons
    const showTableBtn = document.getElementById('nfaShowTable');
    const exportBtn = document.getElementById('nfaExport');
    const resetBtn = document.getElementById('nfaReset');
    
    if (showTableBtn) showTableBtn.addEventListener('click', () => toggleTransitionTable('nfa'));
    if (exportBtn) exportBtn.addEventListener('click', () => exportResults('nfa'));
    if (resetBtn) resetBtn.addEventListener('click', () => resetConversion('nfa'));
}

// DFA to RegEx event listeners
function setupDfaToRegexListeners() {
    // Input mode radio buttons
    const inputModeRadios = document.querySelectorAll('input[name="dfaInputMode"]');
    inputModeRadios.forEach(radio => {
        radio.addEventListener('change', handleDfaInputModeChange);
    });
    
    // Convert buttons
    const convertBtn = document.getElementById('convertDfaBtn');
    const convertExampleBtn = document.getElementById('convertDfaExampleBtn');
    
    if (convertBtn) convertBtn.addEventListener('click', convertDfaToRegex);
    if (convertExampleBtn) convertExampleBtn.addEventListener('click', convertDfaExample);
    
    // Add transition button
    const addTransitionBtn = document.getElementById('addDfaTransition');
    if (addTransitionBtn) addTransitionBtn.addEventListener('click', () => addTransitionRow('dfa'));
    
    // Navigation buttons
    const prevBtn = document.getElementById('dfaPrevStep');
    const nextBtn = document.getElementById('dfaNextStep');
    if (prevBtn) prevBtn.addEventListener('click', () => navigateStep('dfa', -1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateStep('dfa', 1));
    
    // Control buttons
    const showTableBtn = document.getElementById('dfaShowTable');
    const exportBtn = document.getElementById('dfaExport');
    const resetBtn = document.getElementById('dfaReset');
    
    if (showTableBtn) showTableBtn.addEventListener('click', () => toggleTransitionTable('dfa'));
    if (exportBtn) exportBtn.addEventListener('click', () => exportResults('dfa'));
    if (resetBtn) resetBtn.addEventListener('click', () => resetConversion('dfa'));
    
    // States and alphabet input listeners
    const statesInput = document.getElementById('dfaStates');
    const alphabetInput = document.getElementById('dfaAlphabet');
    
    if (statesInput) statesInput.addEventListener('input', updateDfaTransitionOptions);
    if (alphabetInput) alphabetInput.addEventListener('input', updateDfaTransitionOptions);
}

// NFA to Regex event listeners
function setupNfaToRegexListeners() {
    // Input mode radio buttons
    const inputModeRadios = document.querySelectorAll('input[name="nfaToRegexInputMode"]');
    inputModeRadios.forEach(radio => {
        radio.addEventListener('change', handleNfaToRegexInputModeChange);
    });
    // Convert buttons
    const convertBtn = document.getElementById('convertNfaToRegexBtn');
    const convertExampleBtn = document.getElementById('convertNfaToRegexExampleBtn');
    if (convertBtn) convertBtn.addEventListener('click', convertNfaToRegex);
    if (convertExampleBtn) convertExampleBtn.addEventListener('click', convertNfaToRegexExample);
    // Add transition button
    const addTransitionBtn = document.getElementById('addNfaToRegexTransition');
    if (addTransitionBtn) {
        addTransitionBtn.addEventListener('click', () => {
            const container = document.getElementById('nfaToRegexTransitionsContainer');
            if (!container) return;
            const row = container.querySelector('.nfa-to-regex-transition-row');
            if (!row) return;
            const newRow = row.cloneNode(true);
            newRow.querySelectorAll('select').forEach(sel => sel.value = '');
            container.appendChild(newRow);
            updateNfaToRegexTransitionOptions();
        });
    }
    // States and alphabet input listeners
    const statesInput = document.getElementById('nfaToRegexStates');
    const alphabetInput = document.getElementById('nfaToRegexAlphabet');
    if (statesInput) statesInput.addEventListener('input', updateNfaToRegexTransitionOptions);
    if (alphabetInput) alphabetInput.addEventListener('input', updateNfaToRegexTransitionOptions);
}

// Tab change handler
function handleTabChange(event) {
    const tabId = event.target.getAttribute('data-bs-target').substring(1);
    window.AutomataEdu.currentTab = tabId;
    console.log('Switched to tab:', tabId);
}

// Input mode handlers
function initializeInputModes() {
    // Initialize NFA input mode
    handleNfaInputModeChange();
    
    // Initialize DFA input mode
    handleDfaInputModeChange();
}

function handleNfaInputModeChange() {
    const selectedMode = document.querySelector('input[name="nfaInputMode"]:checked');
    if (!selectedMode) return;
    
    const visualInput = document.getElementById('nfaVisualInput');
    const exampleInput = document.getElementById('nfaExampleInput');
    
    if (selectedMode.value === 'visual') {
        visualInput.classList.remove('d-none');
        exampleInput.classList.add('d-none');
    } else {
        visualInput.classList.add('d-none');
        exampleInput.classList.remove('d-none');
    }
}

function handleDfaInputModeChange() {
    const selectedMode = document.querySelector('input[name="dfaInputMode"]:checked');
    if (!selectedMode) return;
    
    const visualInput = document.getElementById('dfaVisualInput');
    const exampleInput = document.getElementById('dfaExampleInput');
    
    if (selectedMode.value === 'visual') {
        visualInput.classList.remove('d-none');
        exampleInput.classList.add('d-none');
    } else {
        visualInput.classList.add('d-none');
        exampleInput.classList.remove('d-none');
    }
}

// Example selectors setup
function setupExampleSelectors() {
    // RegEx to DFA examples
    const regexSelect = document.getElementById('regexExampleSelect');
    if (regexSelect) {
        regexSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                document.getElementById('regexInput').value = e.target.value;
            }
        });
    }
    
    // NFA to DFA examples
    const nfaSelect = document.getElementById('nfaExampleSelect');
    if (nfaSelect) {
        nfaSelect.addEventListener('change', handleNfaExampleSelect);
    }
    
    // DFA to RegEx examples
    const dfaSelect = document.getElementById('dfaExampleSelect');
    if (dfaSelect) {
        dfaSelect.addEventListener('change', handleDfaExampleSelect);
    }
}

function handleNfaExampleSelect(event) {
    // Implementation will be added when needed
    console.log('NFA example selected:', event.target.value);
}

function handleDfaExampleSelect(event) {
    // Implementation will be added when needed
    console.log('DFA example selected:', event.target.value);
}

// Utility functions
function insertSymbol(inputId, symbol) {
    const input = document.getElementById(inputId);
    if (input) {
        const cursorPos = input.selectionStart;
        const value = input.value;
        input.value = value.substring(0, cursorPos) + symbol + value.substring(cursorPos);
        input.focus();
        input.setSelectionRange(cursorPos + symbol.length, cursorPos + symbol.length);
    }
}

function showError(containerId, message) {
    const errorContainer = document.getElementById(containerId);
    const errorMessage = document.getElementById(containerId + 'Message');
    
    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('d-none');
        feather.replace();
    }
}

function hideError(containerId) {
    const errorContainer = document.getElementById(containerId);
    if (errorContainer) {
        errorContainer.classList.add('d-none');
    }
}

// Conversion functions
async function convertRegexToDfa() {
    const regexInput = document.getElementById('regexInput');
    const regex = regexInput.value.trim();
    
    if (!regex) {
        showError('regexError', 'Please enter a regular expression');
        return;
    }
    
    hideError('regexError');
    
    try {
        const response = await fetch('/api/convert/regex-to-dfa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ regex: regex })
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.AutomataEdu.conversionData = result;
            window.AutomataEdu.currentStep = 0;
            window.AutomataEdu.totalSteps = result.steps.length;
            
            displayRegexResults(result);
        } else {
            showError('regexError', result.error || 'Conversion failed');
        }
    } catch (error) {
        console.error('Conversion error:', error);
        showError('regexError', 'Network error during conversion');
    }
}

async function convertNfaToDfa() {
    const nfaData = collectNfaData();
    
    if (!nfaData) {
        showError('nfaError', 'Please fill in all required fields');
        return;
    }
    
    hideError('nfaError');
    
    try {
        const response = await fetch('/api/convert/nfa-to-dfa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nfa: nfaData })
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.AutomataEdu.conversionData = result;
            window.AutomataEdu.currentStep = 0;
            window.AutomataEdu.totalSteps = result.steps.length;
            
            displayNfaResults(result);
        } else {
            showError('nfaError', result.error || 'Conversion failed');
        }
    } catch (error) {
        console.error('Conversion error:', error);
        showError('nfaError', 'Network error during conversion');
    }
}

async function convertDfaToRegex() {
    const dfaData = collectDfaData();
    
    if (!dfaData) {
        showError('dfaError', 'Please fill in all required fields');
        return;
    }
    
    hideError('dfaError');
    
    try {
        const response = await fetch('/api/convert/dfa-to-regex', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dfa: dfaData })
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.AutomataEdu.conversionData = result;
            window.AutomataEdu.currentStep = 0;
            window.AutomataEdu.totalSteps = result.steps.length;
            
            displayDfaResults(result);
        } else {
            showError('dfaError', result.error || 'Conversion failed');
        }
    } catch (error) {
        console.error('Conversion error:', error);
        showError('dfaError', 'Network error during conversion');
    }
}

async function convertNfaExample() {
    // Implementation for converting selected NFA example
    const selectElement = document.getElementById('nfaExampleSelect');
    const selectedIndex = selectElement.value;
    
    if (!selectedIndex) {
        showError('nfaError', 'Please select an example');
        return;
    }
    
    // Get example data and convert
    const examples = window.AutomataEdu.examples['nfa-to-dfa'];
    const allExamples = [...examples.simple, ...examples.complex];
    const exampleData = allExamples[parseInt(selectedIndex)];
    
    if (exampleData && exampleData.nfa) {
        hideError('nfaError');
        
        try {
            const response = await fetch('/api/convert/nfa-to-dfa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nfa: exampleData.nfa })
            });
            
            const result = await response.json();
            
            if (result.success) {
                window.AutomataEdu.conversionData = result;
                window.AutomataEdu.currentStep = 0;
                window.AutomataEdu.totalSteps = result.steps.length;
                
                displayNfaResults(result);
            } else {
                showError('nfaError', result.error || 'Conversion failed');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            showError('nfaError', 'Network error during conversion');
        }
    }
}

async function convertDfaExample() {
    // Implementation for converting selected DFA example
    const selectElement = document.getElementById('dfaExampleSelect');
    const selectedIndex = selectElement.value;
    
    if (!selectedIndex) {
        showError('dfaError', 'Please select an example');
        return;
    }
    
    // Get example data and convert
    const examples = window.AutomataEdu.examples['dfa-to-regex'];
    const allExamples = [...examples.simple, ...examples.complex];
    const exampleData = allExamples[parseInt(selectedIndex)];
    
    if (exampleData && exampleData.dfa) {
        hideError('dfaError');
        
        try {
            const response = await fetch('/api/convert/dfa-to-regex', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dfa: exampleData.dfa })
            });
            
            const result = await response.json();
            
            if (result.success) {
                window.AutomataEdu.conversionData = result;
                window.AutomataEdu.currentStep = 0;
                window.AutomataEdu.totalSteps = result.steps.length;
                
                displayDfaResults(result);
            } else {
                showError('dfaError', result.error || 'Conversion failed');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            showError('dfaError', 'Network error during conversion');
        }
    }
}

// Data collection functions
function collectNfaData() {
    const states = document.getElementById('nfaStates').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('nfaAlphabet').value.split(',').map(s => s.trim()).filter(s => s);
    const startStates = document.getElementById('nfaStartStates').value.split(',').map(s => s.trim()).filter(s => s);
    const finalStates = document.getElementById('nfaFinalStates').value.split(',').map(s => s.trim()).filter(s => s);
    
    if (states.length === 0 || alphabet.length === 0 || startStates.length === 0) {
        return null;
    }
    
    // Parse states and alphabet
    const stateList = states.split(',').map(s => s.trim()).filter(s => s);
    const alphabetList = alphabet.split(',').map(s => s.trim()).filter(s => s);
    const startStateList = startStates.split(',').map(s => s.trim()).filter(s => s);
    const finalStateList = finalStates ? finalStates.split(',').map(s => s.trim()).filter(s => s) : [];
    
    // Collect transitions
    const transitions = [];
    const transitionRows = document.querySelectorAll('#nfaTransitionsContainer .nfa-transition-row');
    
    transitionRows.forEach(row => {
        const fromState = row.querySelector('.nfa-from-state').value;
        const symbol = row.querySelector('.nfa-symbol').value;
        const toStates = row.querySelector('.nfa-to-states').value.trim();
        
        if (fromState && symbol && toStates) {
            const toStateList = toStates.split(',').map(s => s.trim()).filter(s => s);
            toStateList.forEach(toState => {
                transitions.push({
                    from: fromState,
                    to: toState,
                    symbol: symbol
                });
            });
        }
    });
    
    return {
        states: stateList.map(id => ({
            id: id,
            label: id,
            isStart: startStateList.includes(id),
            isFinal: finalStateList.includes(id)
        })),
        transitions: transitions,
        alphabet: alphabetList,
        startStates: startStateList,
        finalStates: finalStateList
    };
}

function collectDfaData() {
    const states = document.getElementById('dfaStates').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('dfaAlphabet').value.split(',').map(s => s.trim()).filter(s => s);
    const startState = document.getElementById('dfaStartState').value;
    const finalStates = document.getElementById('dfaFinalStates').value.split(',').map(s => s.trim()).filter(s => s);
    
    if (states.length === 0 || alphabet.length === 0 || !startState) {
        return null;
    }
    
    // Parse states and alphabet
    const stateList = states.split(',').map(s => s.trim()).filter(s => s);
    const alphabetList = alphabet.split(',').map(s => s.trim()).filter(s => s);
    const finalStateList = finalStates ? finalStates.split(',').map(s => s.trim()).filter(s => s) : [];
    
    // Collect transitions
    const transitions = [];
    const transitionRows = document.querySelectorAll('#dfaTransitionsContainer .dfa-transition-row');
    
    transitionRows.forEach(row => {
        const fromState = row.querySelector('.dfa-from-state').value;
        const symbol = row.querySelector('.dfa-symbol').value;
        const toState = row.querySelector('.dfa-to-state').value;
        
        if (fromState && symbol && toState) {
            transitions.push({
                from: fromState,
                to: toState,
                symbol: symbol
            });
        }
    });
    
    return {
        states: stateList.map(id => ({
            id: id,
            label: id,
            isStart: id === startState,
            isFinal: finalStateList.includes(id)
        })),
        transitions: transitions,
        alphabet: alphabetList,
        startState: startState,
        finalStates: finalStateList
    };
}

function addTransitionRow(type) {
    const container = document.getElementById(`${type}TransitionsContainer`);
    if (!container) return;
    
    const existingRow = container.querySelector(`.${type}-transition-row`);
    if (!existingRow) return;
    
    const newRow = existingRow.cloneNode(true);
    
    // Clear values in new row
    newRow.querySelectorAll('select').forEach(select => {
        select.value = '';
    });
    
    // Add remove button if not present
    const removeBtn = newRow.querySelector('.remove-transition');
    if (!removeBtn) {
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'btn btn-outline-danger btn-sm remove-transition';
        removeButton.innerHTML = '<i data-feather="x"></i>';
        newRow.appendChild(removeButton);
    }
    
    container.appendChild(newRow);
    
    // Update transition options for new row
    if (type === 'nfa') {
        updateNfaTransitionOptions();
    } else {
        updateDfaTransitionOptions();
    }
    
    // Re-render icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function updateNfaTransitionOptions() {
    const states = document.getElementById('nfaStates').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('nfaAlphabet').value.split(',').map(s => s.trim()).filter(s => s);
    
    const stateList = states ? states.split(',').map(s => s.trim()).filter(s => s) : [];
    const alphabetList = alphabet ? alphabet.split(',').map(s => s.trim()).filter(s => s) : [];
    
    // Add epsilon transition option
    const symbolList = ['ε'].concat(alphabetList);
    
    const transitionRows = document.querySelectorAll('#nfaTransitionsContainer .nfa-transition-row');
    
    transitionRows.forEach(row => {
        const fromSelect = row.querySelector('.nfa-from-state');
        const symbolSelect = row.querySelector('.nfa-symbol');
        
        // Update from state options
        updateSelectOptions(fromSelect, stateList);
        
        // Update symbol options
        updateSelectOptions(symbolSelect, symbolList);
    });
}

function updateDfaTransitionOptions() {
    const states = document.getElementById('dfaStates').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('dfaAlphabet').value.split(',').map(s => s.trim()).filter(s => s);
    
    const stateList = states ? states.split(',').map(s => s.trim()).filter(s => s) : [];
    const alphabetList = alphabet ? alphabet.split(',').map(s => s.trim()).filter(s => s) : [];
    
    const transitionRows = document.querySelectorAll('#dfaTransitionsContainer .dfa-transition-row');
    
    transitionRows.forEach(row => {
        const fromSelect = row.querySelector('.dfa-from-state');
        const symbolSelect = row.querySelector('.dfa-symbol');
        const toSelect = row.querySelector('.dfa-to-state');
        
        // Update options
        updateSelectOptions(fromSelect, stateList);
        updateSelectOptions(symbolSelect, alphabetList);
        updateSelectOptions(toSelect, stateList);
    });
    
    // Update start state select
    const startStateSelect = document.getElementById('dfaStartState');
    if (startStateSelect) {
        updateSelectOptions(startStateSelect, stateList);
    }
}

function updateSelectOptions(selectElement, options) {
    if (!selectElement) return;
    
    const currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">Select...</option>';
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        if (option === currentValue) {
            optionElement.selected = true;
        }
        selectElement.appendChild(optionElement);
    });
}

// Add event listener for remove transition buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.remove-transition')) {
        const button = e.target.closest('.remove-transition');
        const row = button.closest('.nfa-transition-row, .dfa-transition-row');
        const container = row.parentElement;
        
        // Only remove if there's more than one row
        if (container.children.length > 1) {
            row.remove();
        }
    }
});

// Display functions for conversion results
function displayRegexResults(result) {
    const resultsContainer = document.getElementById('regexResults');
    if (!resultsContainer) return;
    
    // Show results container
    resultsContainer.classList.remove('d-none');
    
    // Remove Step Display and Progress Bar, as requested (similar to NFA -> DFA)
    const regexStepInfo = document.getElementById('regexStepInfo');
    const regexStepContent = document.getElementById('regexStepContent');
    const regexProgress = document.getElementById('regexProgress');
    if (regexStepInfo) regexStepInfo.parentElement.classList.add('d-none');
    if (regexStepContent) regexStepContent.parentElement.classList.add('d-none');
    if (regexProgress) regexProgress.classList.add('d-none');

    // Display regex result
    const regexTextElement = document.getElementById('regexText');
    const regexInput = document.getElementById('regexInput'); // Get the input element

    console.log("Result object in displayRegexResults:", result);
    // Always display the input regex, or the converted one if available
    if (regexTextElement) {
        regexTextElement.textContent = result.regex || (regexInput ? regexInput.value : '');
    }

    // Render the DFA visualization (result of Regex to DFA)
    if (result.dfa && window.renderAutomaton) {
        console.log("DFA data for Regex to DFA rendering:", result.dfa);
        renderAutomaton('regexVisualization', result.dfa);
    }

    // Show and populate the DFA transition table for Regex to DFA
    const regexTableCard = document.getElementById('regexTableCard');
    if (regexTableCard) {
        regexTableCard.classList.remove('d-none');
        if (result.dfa) {
            console.log("DFA data for Regex to DFA table:", result.dfa);
            generateTransitionTable('regex', result.dfa);
        }
    }

    // Update navigation buttons
    updateNavigationButtons('regex');
}

function displayNfaResults(result) {
    const resultsContainer = document.getElementById('nfaResults');
    if (!resultsContainer) return;
    
    // Show results container
    resultsContainer.classList.remove('d-none');
    
    // Remove Step Display and Progress Bar, as requested
    const nfaStepInfo = document.getElementById('nfaStepInfo');
    const nfaStepContent = document.getElementById('nfaStepContent');
    const nfaProgress = document.getElementById('nfaProgress');
    if (nfaStepInfo) nfaStepInfo.parentElement.classList.add('d-none');
    if (nfaStepContent) nfaStepContent.parentElement.classList.add('d-none');
    if (nfaProgress) nfaProgress.classList.add('d-none');

    // Render original NFA visualization
    if (result.originalNfa && window.renderAutomaton) {
        console.log("NFA data for rendering:", result.originalNfa);
        renderAutomaton('nfaOriginalVisualization', result.originalNfa);
    }

    // Render converted DFA visualization
    if (result.dfa && window.renderAutomaton) {
        console.log("DFA data for rendering:", result.dfa);
        renderAutomaton('nfaVisualization', result.dfa);
    }

    // Show and populate original NFA transition table
    const nfaOriginalTableCard = document.getElementById('nfaOriginalTableCard');
    if (nfaOriginalTableCard) {
        nfaOriginalTableCard.classList.remove('d-none');
        if (result.originalNfa) {
            console.log("NFA data for original table:", result.originalNfa);
            generateTransitionTable('nfaOriginal', result.originalNfa);
        }
    }

    // Show and populate converted DFA transition table
    const nfaConvertedTableCard = document.getElementById('nfaConvertedTableCard');
    if (nfaConvertedTableCard) {
        nfaConvertedTableCard.classList.remove('d-none');
        if (result.dfa) {
            console.log("DFA data for converted table:", result.dfa);
            generateTransitionTable('nfaConverted', result.dfa);
        }
    }
    
    // Update navigation buttons (now removed, but keeping the call for completeness if they were to be re-added later)
    updateNavigationButtons('nfa');
}

function displayDfaResults(result) {
    const resultsContainer = document.getElementById('dfaResults');
    if (!resultsContainer) return;
    
    // Show results container
    resultsContainer.classList.remove('d-none');
    
    // Display regex result
    const regexText = document.getElementById('dfaRegexText');
    if (regexText && result.regex) {
        regexText.textContent = result.regex;
    }

    // Render original DFA visualization
    if (result.originalDfa && window.renderAutomaton) {
        console.log("DFA data for rendering:", result.originalDfa);
        renderAutomaton('dfaOriginalVisualization', result.originalDfa);
    }

    // Show and populate original DFA transition table
    const dfaOriginalTableCard = document.getElementById('dfaOriginalTableCard');
    if (dfaOriginalTableCard) {
        dfaOriginalTableCard.classList.remove('d-none');
        if (result.originalDfa) {
            console.log("DFA data for original table:", result.originalDfa);
            generateTransitionTable('dfaOriginal', result.originalDfa);
        }
    }
    
    // Remove Step Display and Progress Bar, as requested
    const dfaStepInfo = document.getElementById('dfaStepInfo');
    const dfaStepContent = document.getElementById('dfaStepContent');
    const dfaProgress = document.getElementById('dfaProgress');
    if (dfaStepInfo) dfaStepInfo.parentElement.classList.add('d-none');
    if (dfaStepContent) dfaStepContent.parentElement.classList.add('d-none');
    if (dfaProgress) dfaProgress.classList.add('d-none');

    // Update navigation buttons
    updateNavigationButtons('dfa');
}

// Step navigation
function navigateStep(type, direction) {
    const currentStep = window.AutomataEdu.currentStep;
    const totalSteps = window.AutomataEdu.totalSteps;
    const newStep = currentStep + direction;
    
    if (newStep >= 0 && newStep < totalSteps) {
        window.AutomataEdu.currentStep = newStep;
        updateStepDisplay(type, window.AutomataEdu.conversionData);
        updateNavigationButtons(type);
    }
}

function displayStep(type, step) {
    const titleElement = document.getElementById(`${type}StepTitle`);
    const contentElement = document.getElementById(`${type}StepContent`);
    
    if (titleElement) {
        titleElement.textContent = step.title;
    }
    
    if (contentElement) {
        contentElement.innerHTML = `
            <p><strong>${step.description}</strong></p>
            <div class="step-data">
                ${formatStepData(step.data)}
            </div>
        `;
    }
}

function formatStepData(data) {
    if (!data) return '';
    
    let html = '';
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object') {
            html += `<p><strong>${key}:</strong> <pre class="small">${JSON.stringify(value, null, 2)}</pre></p>`;
        } else {
            html += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    }
    return html;
}

function updateProgress(type) {
    const progressBar = document.getElementById(`${type}Progress`);
    if (progressBar && window.AutomataEdu.totalSteps > 0) {
        const percentage = ((window.AutomataEdu.currentStep + 1) / window.AutomataEdu.totalSteps) * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
    }
}

// Control functions
function toggleTransitionTable(conversionType) {
    const conversionData = window.AutomataEdu.conversionData;
    if (!conversionData) {
        console.warn('No conversion data available to show table.');
        return;
    }

    let tableCards = [];

    switch (conversionType) {
        case 'regex':
            tableCards.push({ id: 'regexTableCard', data: conversionData.dfa });
            break;
        case 'nfa':
            tableCards.push({ id: 'nfaOriginalTableCard', data: conversionData.originalNfa });
            tableCards.push({ id: 'nfaConvertedTableCard', data: conversionData.dfa });
            break;
        case 'dfa':
            tableCards.push({ id: 'dfaOriginalTableCard', data: conversionData.originalDfa });
            break;
    }

    tableCards.forEach(item => {
        const tableCard = document.getElementById(item.id);
        if (tableCard) {
            tableCard.classList.toggle('d-none');
            if (!tableCard.classList.contains('d-none')) {
                // If table is now visible, generate its content
                const typeForGenerate = item.id.replace('TableCard', ''); // e.g., 'nfaOriginal'
                generateTransitionTable(typeForGenerate, item.data);
                console.log(`Generated table for: ${typeForGenerate}`, item.data);
            }
        }
    });
    console.log("Conversion Data for table:", conversionData);
}

function generateTransitionTable(type, automaton) {
    const tableContainer = document.getElementById(`${type}TransitionTable`);
    
    if (!tableContainer || !automaton) return;

    console.log("Automaton data for table generation:", automaton);
    if (!automaton) return;
    
    let html = '<div class="table-responsive"><table class="table table-sm table-bordered">';
    
    // Header
    html += '<thead><tr><th>State</th>';
    automaton.alphabet.forEach(symbol => {
        html += `<th class="text-center">${symbol}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Rows
    automaton.states.forEach(state => {
        html += '<tr>';
        html += `<td><span class="state-indicator">`;
        
        if (state.isStart && state.isFinal) {
            html += '<span class="state-marker start-final"></span>';
        } else if (state.isStart) {
            html += '<span class="state-marker start"></span>';
        } else if (state.isFinal) {
            html += '<span class="state-marker final"></span>';
        } else {
            html += '<span class="state-marker"></span>';
        }
        
        html += ` ${state.label}</span></td>`;
        
        automaton.alphabet.forEach(symbol => {
            const transition = automaton.transitions.find(t => 
                t.from === state.id && t.symbol === symbol
            );
            html += `<td class="text-center">${transition ? transition.to : '∅'}</td>`;
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    tableContainer.innerHTML = html;
}

function exportResults(type) {
    const data = window.AutomataEdu.conversionData;
    if (!data) return;
    
    // Create export data
    const exportData = {
        type: type,
        timestamp: new Date().toISOString(),
        input: getInputData(type),
        result: data,
        steps: data.steps
    };
    
    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automata-conversion-${type}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getInputData(type) {
    switch (type) {
        case 'regex':
            return { regex: document.getElementById('regexInput').value };
        case 'nfa':
            return collectNfaData();
        case 'dfa':
            return collectDfaData();
        default:
            return {};
    }
}

function resetConversion(type) {
    // Hide results
    const resultsContainer = document.getElementById(`${type}Results`);
    if (resultsContainer) {
        resultsContainer.classList.add('d-none');
    }
    
    // Hide errors
    hideError(`${type}Error`);
    
    // Clear input fields
    if (type === 'regex') {
        document.getElementById('regexInput').value = '';
        document.getElementById('regexExampleSelect').value = '';
    } else if (type === 'nfa') {
        document.getElementById('nfaStates').value = '';
        document.getElementById('nfaAlphabet').value = '';
        document.getElementById('nfaStartStates').value = '';
        document.getElementById('nfaFinalStates').value = '';
        document.getElementById('nfaExampleSelect').value = '';
        // Reset transitions to single row
        const container = document.getElementById('nfaTransitionsContainer');
        const rows = container.querySelectorAll('.nfa-transition-row');
        rows.forEach((row, index) => {
            if (index === 0) {
                row.querySelectorAll('select').forEach(select => select.value = '');
            } else {
                row.remove();
            }
        });
    } else if (type === 'dfa') {
        document.getElementById('dfaStates').value = '';
        document.getElementById('dfaAlphabet').value = '';
        document.getElementById('dfaStartState').value = '';
        document.getElementById('dfaFinalStates').value = '';
        document.getElementById('dfaExampleSelect').value = '';
        // Reset transitions to single row
        const container = document.getElementById('dfaTransitionsContainer');
        const rows = container.querySelectorAll('.dfa-transition-row');
        rows.forEach((row, index) => {
            if (index === 0) {
                row.querySelectorAll('select').forEach(select => select.value = '');
            } else {
                row.remove();
            }
        });
    }
    
    // Reset state
    window.AutomataEdu.conversionData = null;
    window.AutomataEdu.currentStep = 0;
    window.AutomataEdu.totalSteps = 0;
}

function updateStepDisplay(type, result) {
    const stepInfo = document.getElementById(`${type}StepInfo`);
    const stepContent = document.getElementById(`${type}StepContent`);
    
    if (!stepInfo || !stepContent) return;
    
    const currentStep = window.AutomataEdu.currentStep;
    const totalSteps = result.steps.length;
    
    // Update step counter
    stepInfo.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
    
    // Update step content
    if (result.steps[currentStep]) {
        const step = result.steps[currentStep];
        stepContent.innerHTML = `
            <h5>${step.title}</h5>
            <p>${step.description}</p>
            ${formatStepData(step)}
        `;
    }
}

function formatStepData(step) {
    if (!step.data) return '';
    
    let html = '<div class="step-data">';
    
    // Format different types of step data
    switch (step.type) {
        case 'augment':
            if (step.data.originalRegex && step.data.augmentedRegex) {
                html += `<p><strong>Original:</strong> <code>${step.data.originalRegex}</code></p>`;
                html += `<p><strong>Augmented:</strong> <code>${step.data.augmentedRegex}</code></p>`;
            }
            break;
            
        case 'syntax_tree':
            html += '<p><strong>Syntax tree constructed</strong></p>';
            break;
            
        case 'functions':
            html += '<p><strong>Node functions calculated</strong></p>';
            break;
            
        case 'followpos':
            if (step.data.followposTable) {
                html += '<p><strong>Followpos table:</strong></p>';
                html += '<table class="table table-sm">';
                html += '<thead><tr><th>Position</th><th>Followpos</th></tr></thead><tbody>';
                for (const [pos, follow] of Object.entries(step.data.followposTable)) {
                    html += `<tr><td>${pos}</td><td>{${follow.join(', ')}}</td></tr>`;
                }
                html += '</tbody></table>';
            }
            break;
            
        case 'construct_dfa':
            html += '<p><strong>DFA construction completed</strong></p>';
            break;
            
        case 'subset_construction':
            if (step.data.stateMapping) {
                html += '<p><strong>New DFA state created</strong></p>';
            }
            break;
            
        case 'state_elimination':
            if (step.data.eliminatedState) {
                html += `<p><strong>Eliminated state:</strong> ${step.data.eliminatedState}</p>`;
            }
            break;
            
        default:
            if (typeof step.data === 'object') {
                html += `<pre>${JSON.stringify(step.data, null, 2)}</pre>`;
            }
    }
    
    html += '</div>';
    return html;
}

function updateNavigationButtons(type) {
    const prevBtn = document.getElementById(`${type}PrevStep`);
    const nextBtn = document.getElementById(`${type}NextStep`);
    
    if (!prevBtn || !nextBtn) return;
    
    const currentStep = window.AutomataEdu.currentStep;
    const totalSteps = window.AutomataEdu.totalSteps;
    
    // Update button states
    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === totalSteps - 1;
}

// NFA to Regex input mode switching
function handleNfaToRegexInputModeChange() {
    const selectedMode = document.querySelector('input[name="nfaToRegexInputMode"]:checked');
    if (!selectedMode) return;
    const visualInput = document.getElementById('nfaToRegexVisualInput');
    const exampleInput = document.getElementById('nfaToRegexExampleInput');
    if (selectedMode.value === 'visual') {
        visualInput.classList.remove('d-none');
        exampleInput.classList.add('d-none');
    } else {
        visualInput.classList.add('d-none');
        exampleInput.classList.remove('d-none');
    }
}

function updateNfaToRegexTransitionOptions() {
    const statesInput = document.getElementById('nfaToRegexStates');
    const alphabetInput = document.getElementById('nfaToRegexAlphabet');
    const transitionsContainer = document.getElementById('nfaToRegexTransitionsContainer');
    if (!statesInput || !alphabetInput || !transitionsContainer) return;
    const states = statesInput.value.split(',').map(s => s.trim()).filter(Boolean);
    const alphabet = alphabetInput.value.split(',').map(a => a.trim()).filter(Boolean);
    // Update transition row selects
    const rows = transitionsContainer.querySelectorAll('.nfa-to-regex-transition-row');
    rows.forEach(row => {
        updateSelectOptions(row.querySelector('.nfa-to-regex-from-state'), states);
        updateSelectOptions(row.querySelector('.nfa-to-regex-to-state'), states);
        updateSelectOptions(row.querySelector('.nfa-to-regex-symbol'), alphabet);
    });
}

function collectNfaToRegexData() {
    const statesInput = document.getElementById('nfaToRegexStates');
    const alphabetInput = document.getElementById('nfaToRegexAlphabet');
    const startStatesInput = document.getElementById('nfaToRegexStartStates');
    const finalStatesInput = document.getElementById('nfaToRegexFinalStates');
    const transitionsContainer = document.getElementById('nfaToRegexTransitionsContainer');
    if (!statesInput || !alphabetInput || !startStatesInput || !finalStatesInput || !transitionsContainer) return null;
    const states = statesInput.value.split(',').map(s => s.trim()).filter(Boolean).map(id => ({ id, label: id, isStart: startStatesInput.value.split(',').map(f => f.trim()).includes(id), isFinal: finalStatesInput.value.split(',').map(f => f.trim()).includes(id) }));
    if (!states.length) return null;
    const alphabet = alphabetInput.value.split(',').map(a => a.trim()).filter(Boolean);
    const startStates = startStatesInput.value.split(',').map(f => f.trim()).filter(Boolean);
    const finalStates = finalStatesInput.value.split(',').map(f => f.trim()).filter(Boolean);
    const transitions = [];
    const rows = transitionsContainer.querySelectorAll('.nfa-to-regex-transition-row');
    rows.forEach(row => {
        const from = row.querySelector('.nfa-to-regex-from-state').value;
        const symbol = row.querySelector('.nfa-to-regex-symbol').value;
        const to = row.querySelector('.nfa-to-regex-to-state').value;
        if (from && symbol && to) {
            transitions.push({ from, symbol, to });
        }
    });
    return {
        states,
        alphabet,
        startStates,
        finalStates,
        transitions
    };
}

async function convertNfaToRegex() {
    const nfaData = collectNfaToRegexData();
    if (!nfaData) {
        showError('nfaToRegexError', 'Please fill in all required fields');
        return;
    }
    hideError('nfaToRegexError');
    try {
        const response = await fetch('/api/convert/nfa-to-regex', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nfa: nfaData })
        });
        const result = await response.json();
        if (result.success) {
            window.AutomataEdu.conversionData = result;
            window.AutomataEdu.currentStep = 0;
            window.AutomataEdu.totalSteps = result.steps.length;
            displayNfaToRegexResults(result);
        } else {
            showError('nfaToRegexError', result.error || 'Conversion failed');
        }
    } catch (error) {
        console.error('Conversion error:', error);
        showError('nfaToRegexError', 'Network error during conversion');
    }
}

async function convertNfaToRegexExample() {
    const selectElement = document.getElementById('nfaToRegexExampleSelect');
    const selectedIndex = selectElement.value;
    if (!selectedIndex) {
        showError('nfaToRegexError', 'Please select an example');
        return;
    }
    const examples = window.AutomataEdu.examples['nfa-to-regex'];
    const allExamples = [...examples.simple, ...examples.complex];
    const exampleData = allExamples[parseInt(selectedIndex)];
    if (exampleData && exampleData.nfa) {
        hideError('nfaToRegexError');
        try {
            const response = await fetch('/api/convert/nfa-to-regex', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nfa: exampleData.nfa })
            });
            const result = await response.json();
            if (result.success) {
                window.AutomataEdu.conversionData = result;
                window.AutomataEdu.currentStep = 0;
                window.AutomataEdu.totalSteps = result.steps.length;
                displayNfaToRegexResults(result);
            } else {
                showError('nfaToRegexError', result.error || 'Conversion failed');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            showError('nfaToRegexError', 'Network error during conversion');
        }
    }
}

function displayNfaToRegexResults(result) {
    const resultsSection = document.getElementById('nfaToRegexResults');
    if (resultsSection) resultsSection.classList.remove('d-none');
    // Show regex
    if (result.regex) {
        document.getElementById('nfaToRegexText').textContent = result.regex;
    }
    // Visualize original NFA
    if (result.originalNfa) {
        renderAutomatonGraph('nfaToRegexOriginalVisualization', result.originalNfa);
        // Show and populate original NFA transition table card (fix)
        const nfaOriginalTableCard = document.getElementById('nfaToRegexOriginalTableCard');
        if (nfaOriginalTableCard) {
            nfaOriginalTableCard.classList.remove('d-none');
            generateTransitionTable('nfaToRegexOriginal', result.originalNfa);
        }
    }
}

// Python Code Runner Function
function runPythonCode() {
    const codeEditor = window.AutomataEdu.codeEditorInstance;
    if (!codeEditor) {
        console.error("CodeMirror instance not found.");
        return;
    }

    const pythonCode = codeEditor.getValue();
    const outputElement = document.getElementById('pythonCodeOutput');
    if (!outputElement) {
        console.error("Output element not found.");
        return;
    }

    outputElement.textContent = 'Running code...';
    fetch('/run_python_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: pythonCode })
    })
    .then(response => response.json())
    .then(data => {
        outputElement.textContent = data.output;
    })
    .catch(error => {
        console.error('Error running Python code:', error);
        outputElement.textContent = `Error: ${error.message}`;
    });
}

// New function for Finite Automata page's Python code runner
function runPythonCodeFA() {
    const codeEditor = window.AutomataEdu.codeEditorInstanceFA;
    if (!codeEditor) {
        console.error("CodeMirror instance for FA not found.");
        return;
    }

    const pythonCode = codeEditor.getValue();
    const outputElement = document.getElementById('pythonCodeOutputFA');
    if (!outputElement) {
        console.error("Output element for FA not found.");
        return;
    }

    outputElement.textContent = 'Running code...';
    fetch('/run_python_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: pythonCode })
    })
    .then(response => response.json())
    .then(data => {
        outputElement.textContent = data.output;
    })
    .catch(error => {
        console.error('Error running Python code in FA page:', error);
        outputElement.textContent = `Error: ${error.message}`;
    });
}

// MCQ handling for Languages and Regular Expressions
document.addEventListener('DOMContentLoaded', () => {
    const mcqContainer = document.getElementById('mcq-container');
    if (!mcqContainer) return; // Exit if container not found

    const mcqQuestions = Array.from(mcqContainer.querySelectorAll('.mcq-question-item'));
    let currentMcqIndex = 0;
    const mcqProgress = mcqContainer.querySelector('.mcq-progress');

    function updateMcqDisplay() {
        mcqQuestions.forEach((question, index) => {
            question.style.display = index === currentMcqIndex ? 'block' : 'none';
        });

        if (prevBtn) {
            prevBtn.style.display = currentMcqIndex > 0 ? 'inline-block' : 'none';
        }

        if (mcqProgress) {
            mcqProgress.textContent = `Question ${currentMcqIndex + 1} of ${mcqQuestions.length}`;
        }
    }

    function resetQuestion(questionItem) {
        const options = questionItem.querySelectorAll('.mcq-option');
        options.forEach(option => {
            option.classList.remove('list-group-item-success', 'list-group-item-danger');
            option.disabled = false;
        });
        const feedback = questionItem.querySelector('.feedback');
        if (feedback) feedback.textContent = '';
        const submitBtn = questionItem.querySelector('.submit-mcq-btn');
        if (submitBtn) submitBtn.style.display = 'inline-block';
    }

    mcqContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('submit-mcq-btn')) {
            const questionItem = event.target.closest('.mcq-question-item');
            const selectedOption = questionItem.querySelector('.mcq-option.active');
            const correctAnswer = questionItem.dataset.correctAnswer;
            const feedback = questionItem.querySelector('.feedback');

            if (selectedOption) {
                if (selectedOption.dataset.option === correctAnswer) {
                    selectedOption.classList.add('list-group-item-success');
                    feedback.textContent = 'Correct!';
                    feedback.style.color = 'green';
                } else {
                    selectedOption.classList.add('list-group-item-danger');
                    feedback.textContent = `Incorrect. The correct answer was ${correctAnswer.toUpperCase()}.`;
                    feedback.style.color = 'red';
                    // Highlight correct answer
                    questionItem.querySelector(`[data-option="${correctAnswer}"]`).classList.add('list-group-item-success');
                }
                // Disable all options after submission
                questionItem.querySelectorAll('.mcq-option').forEach(option => option.disabled = true);
                event.target.style.display = 'none'; // Hide submit button
            } else {
                feedback.textContent = 'Please select an answer.';
                feedback.style.color = 'orange';
            }
        } else if (event.target.classList.contains('mcq-option')) {
            const questionItem = event.target.closest('.mcq-question-item');
            questionItem.querySelectorAll('.mcq-option').forEach(opt => opt.classList.remove('active'));
            event.target.classList.add('active');
            // Clear feedback when a new option is selected before submission
            questionItem.querySelector('.feedback').textContent = '';
        } else if (event.target.id === 'prevMcqBtn') {
            if (currentMcqIndex > 0) {
                resetQuestion(mcqQuestions[currentMcqIndex]);
                currentMcqIndex--;
                updateMcqDisplay();
            }
        } else if (event.target.id === 'nextMcqBtn') {
            if (currentMcqIndex < mcqQuestions.length - 1) {
                resetQuestion(mcqQuestions[currentMcqIndex]);
                currentMcqIndex++;
                updateMcqDisplay();
            }
        }
    });

    // Initial display update
    updateMcqDisplay();
});

// MCQ handling for Finite Automata page
document.addEventListener('DOMContentLoaded', () => {
    const mcqContainerFA = document.getElementById('mcq-container-fa');
    if (!mcqContainerFA) return; // Exit if container not found

    const mcqQuestionsFA = Array.from(mcqContainerFA.querySelectorAll('.mcq-question-item'));
    let currentMcqIndexFA = 0;
    const mcqProgressFA = mcqContainerFA.querySelector('.mcq-progress');

    function updateMcqDisplayFA() {
        mcqQuestionsFA.forEach((question, index) => {
            question.style.display = index === currentMcqIndexFA ? 'block' : 'none';
        });
        mcqProgressFA.textContent = `Question ${currentMcqIndexFA + 1} of ${mcqQuestionsFA.length}`;

        const prevBtnFA = mcqContainerFA.querySelector('#prevMcqBtnFA');
        if (prevBtnFA) {
            prevBtnFA.style.display = currentMcqIndexFA > 0 ? 'inline-block' : 'none';
        }

        // Enable/disable next button based on current question
        const nextBtnFA = mcqContainerFA.querySelector('#nextMcqBtnFA'); // Assuming a next button exists for navigation
        if (nextBtnFA) {
            nextBtnFA.style.display = currentMcqIndexFA < mcqQuestionsFA.length - 1 ? 'inline-block' : 'none';
        }
    }

    function resetQuestionFA(questionItem) {
        const options = questionItem.querySelectorAll('.mcq-option');
        options.forEach(option => {
            option.classList.remove('list-group-item-success', 'list-group-item-danger');
            option.disabled = false;
        });
        const feedback = questionItem.querySelector('.feedback');
        if (feedback) feedback.textContent = '';
        const submitBtn = questionItem.querySelector('.submit-mcq-btn');
        if (submitBtn) submitBtn.style.display = 'inline-block';
    }

    mcqContainerFA.addEventListener('click', (event) => {
        if (event.target.classList.contains('submit-mcq-btn')) {
            const questionItem = event.target.closest('.mcq-question-item');
            const selectedOption = questionItem.querySelector('.mcq-option.active');
            const correctAnswer = questionItem.dataset.correctAnswer;
            const feedback = questionItem.querySelector('.feedback');

                if (selectedOption) {
                    if (selectedOption.dataset.option === correctAnswer) {
                        selectedOption.classList.add('list-group-item-success');
                    feedback.textContent = 'Correct!';
                    feedback.style.color = 'green';
                    } else {
                        selectedOption.classList.add('list-group-item-danger');
                    feedback.textContent = `Incorrect. The correct answer was ${correctAnswer.toUpperCase()}.`;
                    feedback.style.color = 'red';
                        // Highlight correct answer
                    questionItem.querySelector(`[data-option="${correctAnswer}"]`).classList.add('list-group-item-success');
                }
                // Disable all options after submission
                questionItem.querySelectorAll('.mcq-option').forEach(option => option.disabled = true);
                event.target.style.display = 'none'; // Hide submit button
                } else {
                feedback.textContent = 'Please select an answer.';
                feedback.style.color = 'orange';
            }
        } else if (event.target.classList.contains('mcq-option')) {
            const questionItem = event.target.closest('.mcq-question-item');
            questionItem.querySelectorAll('.mcq-option').forEach(opt => opt.classList.remove('active'));
            event.target.classList.add('active');
            // Clear feedback when a new option is selected before submission
            questionItem.querySelector('.feedback').textContent = '';
        } else if (event.target.id === 'prevMcqBtnFA') {
            if (currentMcqIndexFA > 0) {
                resetQuestionFA(mcqQuestionsFA[currentMcqIndexFA]);
                currentMcqIndexFA--;
                updateMcqDisplayFA();
            }
        } else if (event.target.id === 'nextMcqBtnFA') {
            if (currentMcqIndexFA < mcqQuestionsFA.length - 1) {
                resetQuestionFA(mcqQuestionsFA[currentMcqIndexFA]);
                currentMcqIndexFA++;
                updateMcqDisplayFA();
            }
        }
    });

    // Initial display update
    updateMcqDisplayFA();
});
