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
    
    console.log('AutomataEdu initialized successfully');
}

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
    
    // RegEx to DFA
    setupRegexToDfaListeners();
    
    // NFA to DFA
    setupNfaToDfaListeners();
    
    // DFA to RegEx
    setupDfaToRegexListeners();
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
    
    // States and alphabet input listeners
    const statesInput = document.getElementById('nfaStates');
    const alphabetInput = document.getElementById('nfaAlphabet');
    
    if (statesInput) statesInput.addEventListener('input', updateNfaTransitionOptions);
    if (alphabetInput) alphabetInput.addEventListener('input', updateNfaTransitionOptions);
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

function showLoading() {
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
}

function hideLoading() {
    const loadingModal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
    if (loadingModal) {
        loadingModal.hide();
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
    showLoading();
    
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
    } finally {
        hideLoading();
    }
}

async function convertNfaToDfa() {
    const nfaData = collectNfaData();
    
    if (!nfaData) {
        showError('nfaError', 'Please fill in all required fields');
        return;
    }
    
    hideError('nfaError');
    showLoading();
    
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
    } finally {
        hideLoading();
    }
}

async function convertDfaToRegex() {
    const dfaData = collectDfaData();
    
    if (!dfaData) {
        showError('dfaError', 'Please fill in all required fields');
        return;
    }
    
    hideError('dfaError');
    showLoading();
    
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
    } finally {
        hideLoading();
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
        showLoading();
        
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
        } finally {
            hideLoading();
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
        showLoading();
        
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
        } finally {
            hideLoading();
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
    
    const transitions = collectTransitions('nfa');
    
    return {
        states: states.map(id => ({
            id: id,
            label: id,
            isStart: startStates.includes(id),
            isFinal: finalStates.includes(id)
        })),
        transitions: transitions,
        alphabet: alphabet,
        startStates: startStates,
        finalStates: finalStates
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
    
    const transitions = collectTransitions('dfa');
    
    return {
        states: states.map(id => ({
            id: id,
            label: id,
            isStart: id === startState,
            isFinal: finalStates.includes(id)
        })),
        transitions: transitions,
        alphabet: alphabet,
        startState: startState,
        finalStates: finalStates
    };
}

function collectTransitions(type) {
    const container = document.getElementById(`${type}TransitionsContainer`);
    const rows = container.querySelectorAll(`.${type}-transition-row`);
    const transitions = [];
    
    rows.forEach(row => {
        const fromState = row.querySelector(`.${type}-from-state`).value;
        const symbol = row.querySelector(`.${type}-symbol`).value;
        const toState = row.querySelector(`.${type}-to-state`).value;
        
        if (fromState && symbol && toState) {
            transitions.push({
                from: fromState,
                to: toState,
                symbol: symbol
            });
        }
    });
    
    return transitions;
}

// Results display functions
function displayRegexResults(result) {
    const resultsContainer = document.getElementById('regexResults');
    resultsContainer.classList.remove('d-none');
    
    // Initialize visualization
    if (result.dfa) {
        renderAutomaton('regexGraph', result.dfa);
    }
    
    // Show first step
    if (result.steps.length > 0) {
        displayStep('regex', result.steps[0]);
        updateProgress('regex');
    }
}

function displayNfaResults(result) {
    const resultsContainer = document.getElementById('nfaResults');
    resultsContainer.classList.remove('d-none');
    
    // Initialize visualization
    if (result.dfa) {
        renderAutomaton('nfaGraph', result.dfa);
    }
    
    // Show first step
    if (result.steps.length > 0) {
        displayStep('nfa', result.steps[0]);
        updateProgress('nfa');
    }
}

function displayDfaResults(result) {
    const resultsContainer = document.getElementById('dfaResults');
    resultsContainer.classList.remove('d-none');
    
    // Display regex result
    const regexText = document.getElementById('dfaRegexText');
    if (regexText && result.regex) {
        regexText.textContent = result.regex;
    }
    
    // Show first step
    if (result.steps.length > 0) {
        displayStep('dfa', result.steps[0]);
        updateProgress('dfa');
    }
}

// Step navigation
function navigateStep(type, direction) {
    const data = window.AutomataEdu.conversionData;
    if (!data || !data.steps) return;
    
    const newStep = window.AutomataEdu.currentStep + direction;
    
    if (newStep >= 0 && newStep < data.steps.length) {
        window.AutomataEdu.currentStep = newStep;
        displayStep(type, data.steps[newStep]);
        updateProgress(type);
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

// Transition management
function addTransitionRow(type) {
    const container = document.getElementById(`${type}TransitionsContainer`);
    const template = container.querySelector(`.${type}-transition-row`);
    const newRow = template.cloneNode(true);
    
    // Clear values
    newRow.querySelectorAll('select').forEach(select => select.value = '');
    
    // Add remove event listener
    const removeBtn = newRow.querySelector('.remove-transition');
    removeBtn.addEventListener('click', () => {
        if (container.querySelectorAll(`.${type}-transition-row`).length > 1) {
            newRow.remove();
        }
    });
    
    container.appendChild(newRow);
    
    // Update options for the new row
    if (type === 'nfa') {
        updateNfaTransitionOptions();
    } else {
        updateDfaTransitionOptions();
    }
    
    feather.replace();
}

function updateNfaTransitionOptions() {
    const states = document.getElementById('nfaStates').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('nfaAlphabet').value.split(',').map(s => s.trim()).filter(s => s);
    
    // Add epsilon to alphabet for NFA
    const symbols = ['ε', ...alphabet];
    
    updateTransitionSelects('nfa', states, symbols);
}

function updateDfaTransitionOptions() {
    const states = document.getElementById('dfaStates').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('dfaAlphabet').value.split(',').map(s => s.trim()).filter(s => s);
    
    updateTransitionSelects('dfa', states, alphabet);
    
    // Update start state dropdown
    const startStateSelect = document.getElementById('dfaStartState');
    if (startStateSelect) {
        const currentValue = startStateSelect.value;
        startStateSelect.innerHTML = '<option value="">Select start state</option>';
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            if (state === currentValue) option.selected = true;
            startStateSelect.appendChild(option);
        });
    }
}

function updateTransitionSelects(type, states, symbols) {
    const rows = document.querySelectorAll(`.${type}-transition-row`);
    
    rows.forEach(row => {
        const fromSelect = row.querySelector(`.${type}-from-state`);
        const symbolSelect = row.querySelector(`.${type}-symbol`);
        const toSelect = row.querySelector(`.${type}-to-state`);
        
        // Update state selects
        [fromSelect, toSelect].forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select state</option>';
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                if (state === currentValue) option.selected = true;
                select.appendChild(option);
            });
        });
        
        // Update symbol select
        const currentSymbol = symbolSelect.value;
        symbolSelect.innerHTML = '<option value="">Select symbol</option>';
        symbols.forEach(symbol => {
            const option = document.createElement('option');
            option.value = symbol;
            option.textContent = symbol;
            if (symbol === currentSymbol) option.selected = true;
            symbolSelect.appendChild(option);
        });
    });
}

// Control functions
function toggleTransitionTable(type) {
    const tableCard = document.getElementById(`${type}TableCard`);
    if (tableCard) {
        tableCard.classList.toggle('d-none');
        
        if (!tableCard.classList.contains('d-none')) {
            generateTransitionTable(type);
        }
    }
}

function generateTransitionTable(type) {
    const tableContainer = document.getElementById(`${type}TransitionTable`);
    const data = window.AutomataEdu.conversionData;
    
    if (!tableContainer || !data) return;
    
    const automaton = type === 'dfa' ? data.dfa : data.dfa; // Both result in DFA
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
