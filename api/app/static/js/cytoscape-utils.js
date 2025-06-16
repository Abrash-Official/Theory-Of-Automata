// AutomataEdu Cytoscape Utilities - Helper functions for graph manipulation

/**
 * Graph layout utilities
 */
window.CytoscapeUtils = {
    
    /**
     * Apply different layout algorithms based on graph characteristics
     * @param {Object} cy - Cytoscape instance
     * @param {string} layoutName - Layout algorithm name
     * @param {Object} options - Layout options
     */
    applyLayout: function(cy, layoutName = 'auto', options = {}) {
        if (!cy || cy.destroyed()) return;
        
        const nodeCount = cy.nodes().length;
        let layout;
        
        switch (layoutName) {
            case 'auto':
                layout = this.getOptimalLayout(nodeCount, options);
                break;
            case 'circle':
                layout = this.getCircleLayout(options);
                break;
            case 'grid':
                layout = this.getGridLayout(options);
                break;
            case 'breadthfirst':
                layout = this.getBreadthFirstLayout(options);
                break;
            case 'cose':
                layout = this.getCoseLayout(options);
                break;
            case 'preset':
                layout = this.getPresetLayout(options);
                break;
            default:
                layout = this.getCircleLayout(options);
        }
        
        const layoutInstance = cy.layout(layout);
        layoutInstance.run();
        
        return layoutInstance;
    },
    
    /**
     * Get optimal layout based on node count
     * @param {number} nodeCount - Number of nodes
     * @param {Object} options - Additional options
     */
    getOptimalLayout: function(nodeCount, options = {}) {
        if (nodeCount <= 1) {
            return this.getPresetLayout(options);
        } else if (nodeCount <= 6) {
            return this.getCircleLayout(options);
        } else if (nodeCount <= 12) {
            return this.getBreadthFirstLayout(options);
        } else {
            return this.getCoseLayout(options);
        }
    },
    
    /**
     * Circle layout configuration
     */
    getCircleLayout: function(options = {}) {
        return {
            name: 'circle',
            radius: options.radius || Math.max(80, 20 * Math.sqrt(options.nodeCount || 4)),
            spacingFactor: options.spacingFactor || 1.2,
            animate: options.animate !== false,
            animationDuration: options.animationDuration || 500,
            animationEasing: options.animationEasing || 'ease-out',
            fit: options.fit !== false,
            padding: options.padding || 20,
            startAngle: options.startAngle || (3 * Math.PI / 2),
            sweep: options.sweep || (2 * Math.PI),
            clockwise: options.clockwise !== false,
            sort: options.sort || undefined,
            transform: options.transform || function(node, position) { return position; }
        };
    },
    
    /**
     * Grid layout configuration
     */
    getGridLayout: function(options = {}) {
        return {
            name: 'grid',
            rows: options.rows || undefined,
            cols: options.cols || undefined,
            position: options.position || function(node) { return {}; },
            sort: options.sort || undefined,
            animate: options.animate !== false,
            animationDuration: options.animationDuration || 500,
            animationEasing: options.animationEasing || 'ease-out',
            fit: options.fit !== false,
            padding: options.padding || 20,
            spacingFactor: options.spacingFactor || 1,
            transform: options.transform || function(node, position) { return position; }
        };
    },
    
    /**
     * Breadth-first layout configuration
     */
    getBreadthFirstLayout: function(options = {}) {
        return {
            name: 'breadthfirst',
            directed: options.directed !== false,
            roots: options.roots || undefined,
            padding: options.padding || 20,
            spacingFactor: options.spacingFactor || 1.5,
            animate: options.animate !== false,
            animationDuration: options.animationDuration || 500,
            animationEasing: options.animationEasing || 'ease-out',
            fit: options.fit !== false,
            maximal: options.maximal !== false,
            circle: options.circle || false,
            grid: options.grid || false,
            transform: options.transform || function(node, position) { return position; }
        };
    },
    
    /**
     * COSE (force-directed) layout configuration
     */
    getCoseLayout: function(options = {}) {
        return {
            name: 'cose',
            animate: options.animate !== false,
            animationDuration: options.animationDuration || 1000,
            animationEasing: options.animationEasing || 'ease-out',
            fit: options.fit !== false,
            padding: options.padding || 30,
            randomize: options.randomize || false,
            componentSpacing: options.componentSpacing || 100,
            nodeOverlap: options.nodeOverlap || 20,
            idealEdgeLength: options.idealEdgeLength || 100,
            edgeElasticity: options.edgeElasticity || 100,
            nestingFactor: options.nestingFactor || 5,
            gravity: options.gravity || 80,
            numIter: options.numIter || 1000,
            initialTemp: options.initialTemp || 200,
            coolingFactor: options.coolingFactor || 0.95,
            minTemp: options.minTemp || 1.0,
            nodeRepulsion: options.nodeRepulsion || 400000,
            refresh: options.refresh || 20,
            transform: options.transform || function(node, position) { return position; }
        };
    },
    
    /**
     * Preset layout configuration
     */
    getPresetLayout: function(options = {}) {
        return {
            name: 'preset',
            positions: options.positions || function(node) {
                return { x: 200, y: 200 };
            },
            zoom: options.zoom || undefined,
            pan: options.pan || undefined,
            fit: options.fit !== false,
            padding: options.padding || 20,
            animate: options.animate !== false,
            animationDuration: options.animationDuration || 500,
            animationEasing: options.animationEasing || 'ease-out',
            transform: options.transform || function(node, position) { return position; }
        };
    },
    
    /**
     * Auto-arrange nodes to avoid overlaps
     * @param {Object} cy - Cytoscape instance
     * @param {Object} options - Arrangement options
     */
    autoArrange: function(cy, options = {}) {
        if (!cy || cy.destroyed()) return;
        
        const nodes = cy.nodes();
        const nodeCount = nodes.length;
        
        if (nodeCount <= 1) return;
        
        // Calculate optimal spacing
        const containerWidth = cy.width();
        const containerHeight = cy.height();
        const nodeSize = 40; // Default node size
        const minSpacing = options.minSpacing || 80;
        
        // Detect overlapping nodes
        const overlaps = this.detectOverlaps(nodes, nodeSize);
        
        if (overlaps.length === 0) return; // No overlaps to fix
        
        // Apply layout to fix overlaps
        const layout = this.getOptimalLayout(nodeCount, {
            ...options,
            animate: true,
            fit: false
        });
        
        const layoutInstance = cy.layout(layout);
        layoutInstance.run();
        
        return layoutInstance;
    },
    
    /**
     * Detect overlapping nodes
     * @param {Object} nodes - Cytoscape node collection
     * @param {number} nodeSize - Size of nodes
     * @returns {Array} Array of overlapping node pairs
     */
    detectOverlaps: function(nodes, nodeSize = 40) {
        const overlaps = [];
        const threshold = nodeSize + 10; // Minimum distance between nodes
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const node1 = nodes[i];
                const node2 = nodes[j];
                
                const pos1 = node1.position();
                const pos2 = node2.position();
                
                const distance = Math.sqrt(
                    Math.pow(pos1.x - pos2.x, 2) + 
                    Math.pow(pos1.y - pos2.y, 2)
                );
                
                if (distance < threshold) {
                    overlaps.push([node1, node2]);
                }
            }
        }
        
        return overlaps;
    },
    
    /**
     * Center graph in viewport
     * @param {Object} cy - Cytoscape instance
     * @param {Object} options - Centering options
     */
    centerGraph: function(cy, options = {}) {
        if (!cy || cy.destroyed()) return;
        
        const padding = options.padding || 20;
        const animate = options.animate !== false;
        const duration = options.duration || 500;
        
        if (animate) {
            cy.animate({
                fit: {
                    eles: cy.elements(),
                    padding: padding
                }
            }, {
                duration: duration,
                easing: 'ease-out'
            });
        } else {
            cy.fit(cy.elements(), padding);
        }
    },
    
    /**
     * Zoom to fit specific elements
     * @param {Object} cy - Cytoscape instance
     * @param {Object} elements - Elements to fit
     * @param {Object} options - Zoom options
     */
    zoomToFit: function(cy, elements, options = {}) {
        if (!cy || cy.destroyed()) return;
        
        const padding = options.padding || 20;
        const animate = options.animate !== false;
        const duration = options.duration || 500;
        
        if (!elements || elements.length === 0) {
            elements = cy.elements();
        }
        
        if (animate) {
            cy.animate({
                fit: {
                    eles: elements,
                    padding: padding
                }
            }, {
                duration: duration,
                easing: 'ease-out'
            });
        } else {
            cy.fit(elements, padding);
        }
    },
    
    /**
     * Calculate optimal node positions for automaton
     * @param {Array} states - Array of state objects
     * @param {Array} transitions - Array of transition objects
     * @param {Object} options - Positioning options
     */
    calculateOptimalPositions: function(states, transitions, options = {}) {
        const nodeCount = states.length;
        const containerWidth = options.width || 600;
        const containerHeight = options.height || 400;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        if (nodeCount === 1) {
            return [{ x: centerX, y: centerY }];
        }
        
        // For small graphs, use circular layout
        if (nodeCount <= 8) {
            return this.calculateCircularPositions(nodeCount, centerX, centerY, options.radius);
        }
        
        // For larger graphs, use force-directed positioning
        return this.calculateForceDirectedPositions(states, transitions, options);
    },
    
    /**
     * Calculate circular positions
     * @param {number} nodeCount - Number of nodes
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     * @param {number} radius - Circle radius
     */
    calculateCircularPositions: function(nodeCount, centerX, centerY, radius = 120) {
        const positions = [];
        const angleStep = (2 * Math.PI) / nodeCount;
        const startAngle = -Math.PI / 2; // Start at top
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = startAngle + (i * angleStep);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            positions.push({ x: Math.round(x), y: Math.round(y) });
        }
        
        return positions;
    },
    
    /**
     * Calculate force-directed positions (simplified)
     * @param {Array} states - Array of state objects
     * @param {Array} transitions - Array of transition objects
     * @param {Object} options - Options
     */
    calculateForceDirectedPositions: function(states, transitions, options = {}) {
        const positions = [];
        const nodeCount = states.length;
        const width = options.width || 600;
        const height = options.height || 400;
        
        // Initialize with random positions
        for (let i = 0; i < nodeCount; i++) {
            positions.push({
                x: Math.random() * width,
                y: Math.random() * height
            });
        }
        
        // Simple force-directed algorithm
        const iterations = 100;
        const k = Math.sqrt((width * height) / nodeCount);
        
        for (let iter = 0; iter < iterations; iter++) {
            const forces = positions.map(() => ({ x: 0, y: 0 }));
            
            // Repulsive forces between all nodes
            for (let i = 0; i < nodeCount; i++) {
                for (let j = i + 1; j < nodeCount; j++) {
                    const dx = positions[i].x - positions[j].x;
                    const dy = positions[i].y - positions[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 0.01;
                    const force = k * k / distance;
                    
                    forces[i].x += (dx / distance) * force;
                    forces[i].y += (dy / distance) * force;
                    forces[j].x -= (dx / distance) * force;
                    forces[j].y -= (dy / distance) * force;
                }
            }
            
            // Attractive forces for connected nodes
            transitions.forEach(transition => {
                const fromIndex = states.findIndex(s => s.id === transition.from);
                const toIndex = states.findIndex(s => s.id === transition.to);
                
                if (fromIndex !== -1 && toIndex !== -1) {
                    const dx = positions[fromIndex].x - positions[toIndex].x;
                    const dy = positions[fromIndex].y - positions[toIndex].y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 0.01;
                    const force = distance * distance / k;
                    
                    forces[fromIndex].x -= (dx / distance) * force;
                    forces[fromIndex].y -= (dy / distance) * force;
                    forces[toIndex].x += (dx / distance) * force;
                    forces[toIndex].y += (dy / distance) * force;
                }
            });
            
            // Apply forces
            const temperature = 1.0 - (iter / iterations);
            for (let i = 0; i < nodeCount; i++) {
                const force = Math.sqrt(forces[i].x * forces[i].x + forces[i].y * forces[i].y);
                const maxMove = Math.min(force, temperature * 10);
                
                if (force > 0) {
                    positions[i].x += (forces[i].x / force) * maxMove;
                    positions[i].y += (forces[i].y / force) * maxMove;
                }
                
                // Keep within bounds
                positions[i].x = Math.max(50, Math.min(width - 50, positions[i].x));
                positions[i].y = Math.max(50, Math.min(height - 50, positions[i].y));
            }
        }
        
        return positions.map(pos => ({
            x: Math.round(pos.x),
            y: Math.round(pos.y)
        }));
    },
    
    /**
     * Smooth edge curves for better visualization
     * @param {Object} cy - Cytoscape instance
     */
    optimizeEdgeCurves: function(cy) {
        if (!cy || cy.destroyed()) return;
        
        const edges = cy.edges();
        
        // Group parallel edges
        const edgeGroups = {};
        edges.forEach(edge => {
            const source = edge.source().id();
            const target = edge.target().id();
            const key = source < target ? `${source}-${target}` : `${target}-${source}`;
            
            if (!edgeGroups[key]) {
                edgeGroups[key] = [];
            }
            edgeGroups[key].push(edge);
        });
        
        // Apply curve styles to parallel edges
        Object.values(edgeGroups).forEach(group => {
            if (group.length > 1) {
                group.forEach((edge, index) => {
                    const offset = (index - (group.length - 1) / 2) * 30;
                    edge.style({
                        'curve-style': 'bezier',
                        'control-point-distance': Math.abs(offset),
                        'control-point-weight': offset > 0 ? 0.5 : -0.5
                    });
                });
            }
        });
    },
    
    /**
     * Get graph statistics
     * @param {Object} cy - Cytoscape instance
     * @returns {Object} Graph statistics
     */
    getGraphStats: function(cy) {
        if (!cy || cy.destroyed()) return null;
        
        const nodes = cy.nodes();
        const edges = cy.edges();
        
        return {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            startStates: nodes.filter('[isStart = true]').length,
            finalStates: nodes.filter('[isFinal = true]').length,
            selfLoops: edges.filter('[isSelfLoop = true]').length,
            connected: cy.elements().components().length === 1,
            diameter: this.calculateDiameter(cy),
            density: this.calculateDensity(cy)
        };
    },
    
    /**
     * Calculate graph diameter
     * @param {Object} cy - Cytoscape instance
     * @returns {number} Graph diameter
     */
    calculateDiameter: function(cy) {
        if (!cy || cy.destroyed()) return 0;
        
        const nodes = cy.nodes();
        if (nodes.length <= 1) return 0;
        
        let maxDistance = 0;
        
        for (let i = 0; i < nodes.length; i++) {
            const distances = cy.elements().dijkstra(nodes[i], function(edge) {
                return 1; // Unit weight for all edges
            });
            
            for (let j = 0; j < nodes.length; j++) {
                if (i !== j) {
                    const distance = distances.distanceTo(nodes[j]);
                    if (distance !== Infinity && distance > maxDistance) {
                        maxDistance = distance;
                    }
                }
            }
        }
        
        return maxDistance;
    },
    
    /**
     * Calculate graph density
     * @param {Object} cy - Cytoscape instance
     * @returns {number} Graph density (0-1)
     */
    calculateDensity: function(cy) {
        if (!cy || cy.destroyed()) return 0;
        
        const nodeCount = cy.nodes().length;
        const edgeCount = cy.edges().length;
        
        if (nodeCount <= 1) return 0;
        
        const maxEdges = nodeCount * (nodeCount - 1); // For directed graph
        return edgeCount / maxEdges;
    }
};

// Export for global access
window.CytoscapeUtils = window.CytoscapeUtils;
