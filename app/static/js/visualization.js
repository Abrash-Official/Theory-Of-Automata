// AutomataEdu Visualization Module - Cytoscape.js Integration

// Global visualization state
window.AutomataVisualization = {
    instances: {},
    selectedNodes: new Set(),
    selectedEdges: new Set()
};

/**
 * Render automaton using Cytoscape.js
 * @param {string} containerId - ID of the container element
 * @param {Object} automatonData - Automaton data structure
 * @param {Object} options - Rendering options
 */
function renderAutomaton(containerId, automatonData, options = {}) {
    const container = document.getElementById(containerId);
    if (!container || !automatonData) {
        console.error('Invalid container or automaton data');
        return null;
    }
    
    // Destroy existing instance
    if (window.AutomataVisualization.instances[containerId]) {
        window.AutomataVisualization.instances[containerId].destroy();
    }
    
    // Prepare data for Cytoscape
    const elements = prepareAutomatonElements(automatonData);
    
    // Create Cytoscape instance
    const cy = cytoscape({
        container: container,
        elements: elements,
        style: getAutomatonStyle(),
        layout: getAutomatonLayout(automatonData.states.length),
        minZoom: 0.3,
        maxZoom: 3,
        boxSelectionEnabled: false,
        selectionType: 'single'
    });
    
    // Store instance
    window.AutomataVisualization.instances[containerId] = cy;
    
    // Setup event handlers
    setupVisualizationEvents(cy, containerId);
    
    // Apply custom positioning if available
    applyStatePositions(cy, automatonData.states);
    
    // Fit to container
    cy.fit();
    
    return cy;
}

/**
 * Prepare automaton data for Cytoscape format
 * @param {Object} automatonData - Automaton data
 * @returns {Array} Cytoscape elements array
 */
function prepareAutomatonElements(automatonData) {
    const elements = [];
    
    // Add nodes (states)
    if (automatonData.states) {
        automatonData.states.forEach(state => {
            elements.push({
                data: {
                    id: state.id,
                    label: state.label || state.id,
                    isStart: state.isStart || false,
                    isFinal: state.isFinal || false,
                    type: 'state'
                },
                position: state.position || { x: 0, y: 0 },
                classes: getStateClasses(state)
            });
        });
    }
    
    // Add edges (transitions)
    if (automatonData.transitions) {
        // Group transitions by from-to pair to handle multiple symbols
        const transitionGroups = {};
        
        automatonData.transitions.forEach(transition => {
            const key = `${transition.from}-${transition.to}`;
            if (!transitionGroups[key]) {
                transitionGroups[key] = {
                    from: transition.from,
                    to: transition.to,
                    symbols: []
                };
            }
            transitionGroups[key].symbols.push(transition.symbol);
        });
        
        // Create edges with combined labels
        Object.values(transitionGroups).forEach((group, index) => {
            const isSelfLoop = group.from === group.to;
            const label = group.symbols.join(', ');
            
            elements.push({
                data: {
                    id: `edge-${group.from}-${group.to}-${index}`,
                    source: group.from,
                    target: group.to,
                    label: label,
                    symbols: group.symbols,
                    type: 'transition',
                    isSelfLoop: isSelfLoop
                },
                classes: isSelfLoop ? 'self-loop' : 'transition'
            });
        });
    }
    
    return elements;
}

/**
 * Get CSS classes for state styling
 * @param {Object} state - State object
 * @returns {string} CSS classes
 */
function getStateClasses(state) {
    const classes = ['state'];
    
    if (state.isStart && state.isFinal) {
        classes.push('start-final');
    } else if (state.isStart) {
        classes.push('start');
    } else if (state.isFinal) {
        classes.push('final');
    }
    
    return classes.join(' ');
}

/**
 * Get Cytoscape styling configuration
 * @returns {Array} Cytoscape style array
 */
function getAutomatonStyle() {
    const isDark = window.AutomataEdu.isDarkMode;
    
    return [
        // Node styles
        {
            selector: 'node',
            style: {
                'background-color': isDark ? '#4a5568' : '#e2e8f0',
                'border-width': 2,
                'border-color': isDark ? '#718096' : '#a0aec0',
                'label': 'data(label)',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '14px',
                'font-weight': 'bold',
                'color': isDark ? '#f7fafc' : '#2d3748',
                'text-outline-width': 2,
                'text-outline-color': isDark ? '#1a202c' : '#ffffff',
                'width': '40px',
                'height': '40px',
                'overlay-opacity': 0,
                'transition-property': 'background-color, border-color',
                'transition-duration': '0.2s'
            }
        },
        
        // Start state
        {
            selector: 'node.start',
            style: {
                'background-color': '#48bb78',
                'border-color': '#38a169',
                'border-width': 3
            }
        },
        
        // Final state
        {
            selector: 'node.final',
            style: {
                'background-color': '#ed64a6',
                'border-color': '#d53f8c',
                'border-width': 3,
                'border-style': 'double'
            }
        },
        
        // Start and final state
        {
            selector: 'node.start-final',
            style: {
                'background-color': '#ed8936',
                'border-color': '#dd6b20',
                'border-width': 4,
                'border-style': 'double'
            }
        },
        
        // Highlighted node
        {
            selector: 'node:selected',
            style: {
                'border-color': '#3182ce',
                'border-width': 4,
                'background-color': '#63b3ed'
            }
        },
        
        // Edge styles
        {
            selector: 'edge',
            style: {
                'width': 2,
                'line-color': isDark ? '#a0aec0' : '#4a5568',
                'target-arrow-color': isDark ? '#a0aec0' : '#4a5568',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '12px',
                'font-weight': 'bold',
                'color': isDark ? '#f7fafc' : '#2d3748',
                'text-background-color': isDark ? '#1a202c' : '#ffffff',
                'text-background-opacity': 0.8,
                'text-background-padding': '3px',
                'text-border-width': 1,
                'text-border-color': isDark ? '#4a5568' : '#e2e8f0',
                'edge-text-rotation': 'autorotate',
                'source-distance-from-node': 5,
                'target-distance-from-node': 5
            }
        },
        
        // Self-loop edges
        {
            selector: 'edge.self-loop',
            style: {
                'curve-style': 'bezier',
                'loop-sweep': '60deg',
                'control-point-distance': 60,
                'source-endpoint': 'outside-to-node',
                'target-endpoint': 'outside-to-node'
            }
        },
        
        // Highlighted edge
        {
            selector: 'edge:selected',
            style: {
                'line-color': '#3182ce',
                'target-arrow-color': '#3182ce',
                'width': 3,
                'color': '#1a365d'
            }
        },
        
        // Parallel edges
        {
            selector: 'edge.parallel',
            style: {
                'curve-style': 'bezier',
                'control-point-step-size': 40
            }
        }
    ];
}

/**
 * Get layout configuration based on automaton size
 * @param {number} nodeCount - Number of states
 * @returns {Object} Cytoscape layout configuration
 */
function getAutomatonLayout(nodeCount) {
    if (nodeCount <= 1) {
        return {
            name: 'preset',
            positions: { 'node': { x: 200, y: 200 } }
        };
    } else if (nodeCount <= 4) {
        return {
            name: 'circle',
            radius: 80,
            spacingFactor: 1.5,
            animate: true,
            animationDuration: 500
        };
    } else if (nodeCount <= 8) {
        return {
            name: 'circle',
            radius: 120,
            spacingFactor: 1.2,
            animate: true,
            animationDuration: 500
        };
    } else {
        return {
            name: 'cose',
            idealEdgeLength: 100,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 30,
            randomize: false,
            componentSpacing: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 100,
            nestingFactor: 5,
            gravity: 80,
            numIter: 1000,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0,
            animate: true,
            animationDuration: 1000
        };
    }
}

/**
 * Setup event handlers for visualization
 * @param {Object} cy - Cytoscape instance
 * @param {string} containerId - Container ID
 */
function setupVisualizationEvents(cy, containerId) {
    // Node selection
    cy.on('tap', 'node', function(evt) {
        const node = evt.target;
        const nodeId = node.id();
        
        // Update selection state
        window.AutomataVisualization.selectedNodes.clear();
        window.AutomataVisualization.selectedNodes.add(nodeId);
        
        // Highlight related elements
        highlightNodeAndTransitions(cy, nodeId);
        
        // Trigger custom event
        dispatchVisualizationEvent('nodeSelected', {
            containerId: containerId,
            nodeId: nodeId,
            nodeData: node.data()
        });
    });
    
    // Edge selection
    cy.on('tap', 'edge', function(evt) {
        const edge = evt.target;
        const edgeId = edge.id();
        
        // Update selection state
        window.AutomataVisualization.selectedEdges.clear();
        window.AutomataVisualization.selectedEdges.add(edgeId);
        
        // Trigger custom event
        dispatchVisualizationEvent('edgeSelected', {
            containerId: containerId,
            edgeId: edgeId,
            edgeData: edge.data()
        });
    });
    
    // Background tap (deselect)
    cy.on('tap', function(evt) {
        if (evt.target === cy) {
            clearSelection(cy);
            dispatchVisualizationEvent('selectionCleared', {
                containerId: containerId
            });
        }
    });
    
    // Mouse hover effects
    cy.on('mouseover', 'node', function(evt) {
        const node = evt.target;
        node.style('border-width', '4px');
    });
    
    cy.on('mouseout', 'node', function(evt) {
        const node = evt.target;
        if (!node.selected()) {
            node.style('border-width', node.hasClass('start') || node.hasClass('final') ? '3px' : '2px');
        }
    });
    
    cy.on('mouseover', 'edge', function(evt) {
        const edge = evt.target;
        edge.style('width', '3px');
    });
    
    cy.on('mouseout', 'edge', function(evt) {
        const edge = evt.target;
        if (!edge.selected()) {
            edge.style('width', '2px');
        }
    });
}

/**
 * Apply custom positions to states if available
 * @param {Object} cy - Cytoscape instance
 * @param {Array} states - Array of state objects with positions
 */
function applyStatePositions(cy, states) {
    if (!states) return;
    
    states.forEach(state => {
        if (state.position && state.position.x !== undefined && state.position.y !== undefined) {
            const node = cy.getElementById(state.id);
            if (node.length > 0) {
                node.position(state.position);
            }
        }
    });
}

/**
 * Highlight a node and its related transitions
 * @param {Object} cy - Cytoscape instance
 * @param {string} nodeId - ID of the node to highlight
 */
function highlightNodeAndTransitions(cy, nodeId) {
    // Clear previous highlights
    cy.elements().removeClass('highlighted dimmed');
    
    const node = cy.getElementById(nodeId);
    const connectedEdges = node.connectedEdges();
    const connectedNodes = connectedEdges.connectedNodes();
    
    // Highlight selected node and connected elements
    node.addClass('highlighted');
    connectedEdges.addClass('highlighted');
    connectedNodes.addClass('highlighted');
    
    // Dim other elements
    cy.elements().not(node).not(connectedEdges).not(connectedNodes).addClass('dimmed');
}

/**
 * Clear all selections and highlights
 * @param {Object} cy - Cytoscape instance
 */
function clearSelection(cy) {
    cy.elements().removeClass('highlighted dimmed');
    window.AutomataVisualization.selectedNodes.clear();
    window.AutomataVisualization.selectedEdges.clear();
}

/**
 * Highlight specific elements by their IDs
 * @param {string} containerId - Container ID
 * @param {Array} nodeIds - Array of node IDs to highlight
 * @param {Array} edgeIds - Array of edge IDs to highlight
 */
function highlightElements(containerId, nodeIds = [], edgeIds = []) {
    const cy = window.AutomataVisualization.instances[containerId];
    if (!cy) return;
    
    // Clear previous highlights
    cy.elements().removeClass('highlighted dimmed');
    
    // Highlight specified elements
    nodeIds.forEach(nodeId => {
        const node = cy.getElementById(nodeId);
        if (node.length > 0) {
            node.addClass('highlighted');
        }
    });
    
    edgeIds.forEach(edgeId => {
        const edge = cy.getElementById(edgeId);
        if (edge.length > 0) {
            edge.addClass('highlighted');
        }
    });
    
    // Dim non-highlighted elements if any are highlighted
    if (nodeIds.length > 0 || edgeIds.length > 0) {
        const highlighted = cy.elements('.highlighted');
        cy.elements().not(highlighted).addClass('dimmed');
    }
}

/**
 * Export visualization as image
 * @param {string} containerId - Container ID
 * @param {string} format - Image format ('png' or 'jpg')
 * @param {Object} options - Export options
 * @returns {string} Data URL of the image
 */
function exportVisualization(containerId, format = 'png', options = {}) {
    const cy = window.AutomataVisualization.instances[containerId];
    if (!cy) return null;
    
    const defaultOptions = {
        output: 'blob-promise',
        bg: window.AutomataEdu.isDarkMode ? '#1a202c' : '#ffffff',
        full: true,
        scale: 2
    };
    
    const exportOptions = { ...defaultOptions, ...options };
    
    return cy.png(exportOptions);
}

/**
 * Update visualization theme
 * @param {boolean} isDark - Whether dark mode is enabled
 */
function updateVisualizationTheme(isDark) {
    Object.values(window.AutomataVisualization.instances).forEach(cy => {
        if (cy && !cy.destroyed()) {
            cy.style(getAutomatonStyle());
        }
    });
}

/**
 * Dispatch custom visualization event
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event data
 */
function dispatchVisualizationEvent(eventType, eventData) {
    const event = new CustomEvent(`automata:${eventType}`, {
        detail: eventData
    });
    document.dispatchEvent(event);
}

/**
 * Animate transition between steps
 * @param {string} containerId - Container ID
 * @param {Object} stepData - Step data containing highlights
 */
function animateStep(containerId, stepData) {
    const cy = window.AutomataVisualization.instances[containerId];
    if (!cy) return;
    
    // Clear previous animations
    cy.elements().stop();
    
    // Extract highlight information from step data
    const nodeHighlights = stepData.highlightedNodes || [];
    const edgeHighlights = stepData.highlightedEdges || [];
    
    // Animate highlights
    highlightElements(containerId, nodeHighlights, edgeHighlights);
    
    // Add pulsing animation to highlighted elements
    const highlighted = cy.elements('.highlighted');
    highlighted.animate({
        style: {
            'opacity': 0.7
        },
        duration: 500,
        complete: function() {
            highlighted.animate({
                style: {
                    'opacity': 1
                },
                duration: 500
            });
        }
    });
}

/**
 * Resize visualization to fit container
 * @param {string} containerId - Container ID
 */
function resizeVisualization(containerId) {
    const cy = window.AutomataVisualization.instances[containerId];
    if (cy && !cy.destroyed()) {
        cy.resize();
        cy.fit();
    }
}

/**
 * Destroy visualization instance
 * @param {string} containerId - Container ID
 */
function destroyVisualization(containerId) {
    const cy = window.AutomataVisualization.instances[containerId];
    if (cy && !cy.destroyed()) {
        cy.destroy();
        delete window.AutomataVisualization.instances[containerId];
    }
}

// Listen for theme changes and update visualizations
document.addEventListener('DOMContentLoaded', function() {
    // Update visualizations when theme changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-bs-theme') {
                const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
                updateVisualizationTheme(isDark);
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-bs-theme']
    });
});

// Handle window resize
window.addEventListener('resize', function() {
    Object.keys(window.AutomataVisualization.instances).forEach(containerId => {
        resizeVisualization(containerId);
    });
});

// Export functions for global access
window.renderAutomaton = renderAutomaton;
window.renderAutomatonGraph = renderAutomaton;
window.highlightElements = highlightElements;
window.exportVisualization = exportVisualization;
window.animateStep = animateStep;
window.resizeVisualization = resizeVisualization;
window.destroyVisualization = destroyVisualization;
