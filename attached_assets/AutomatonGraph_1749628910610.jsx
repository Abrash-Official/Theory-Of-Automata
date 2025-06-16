// Automaton Graph Visualization Component using Cytoscape.js
import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';
import { AutomataUtils } from '../../utils/automataStructures.js';

// Register layout extensions
cytoscape.use(dagre);
cytoscape.use(coseBilkent);

/**
 * AutomatonGraph Component
 * Renders finite automata using Cytoscape.js
 */
const AutomatonGraph = ({ 
  automaton, 
  highlightedStates = [], 
  highlightedTransitions = [],
  annotations = [],
  layout = 'dagre',
  interactive = true,
  onStateClick = null,
  onTransitionClick = null,
  className = ''
}) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Cytoscape instance
  useEffect(() => {
    if (!containerRef.current || !automaton) return;

    // Convert automaton to Cytoscape format
    const elements = AutomataUtils.toCytoscapeFormat(automaton);

    // Create Cytoscape instance
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: getCytoscapeStyles(),
      layout: getLayoutConfig(layout),
      userZoomingEnabled: interactive,
      userPanningEnabled: interactive,
      boxSelectionEnabled: false,
      selectionType: 'single',
      minZoom: 0.5,
      maxZoom: 3
    });

    // Add event listeners
    if (interactive) {
      cyRef.current.on('tap', 'node', (event) => {
        const node = event.target;
        if (onStateClick) {
          onStateClick(node.data());
        }
      });

      cyRef.current.on('tap', 'edge', (event) => {
        const edge = event.target;
        if (onTransitionClick) {
          onTransitionClick(edge.data());
        }
      });
    }

    setIsLoading(false);

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [automaton, layout, interactive]);

  // Update highlights when props change
  useEffect(() => {
    if (!cyRef.current) return;

    // Reset all highlights
    cyRef.current.elements().removeClass('highlighted');

    // Highlight states
    highlightedStates.forEach(stateId => {
      cyRef.current.getElementById(stateId).addClass('highlighted');
    });

    // Highlight transitions
    highlightedTransitions.forEach(transitionId => {
      cyRef.current.getElementById(transitionId).addClass('highlighted');
    });
  }, [highlightedStates, highlightedTransitions]);

  // Handle layout changes
  const changeLayout = (newLayout) => {
    if (!cyRef.current) return;
    
    const layoutConfig = getLayoutConfig(newLayout);
    cyRef.current.layout(layoutConfig).run();
  };

  // Export graph as image
  const exportAsImage = (format = 'png') => {
    if (!cyRef.current) return null;
    
    return cyRef.current.png({
      output: 'blob',
      bg: 'white',
      full: true,
      scale: 2
    });
  };

  // Fit graph to container
  const fitToContainer = () => {
    if (!cyRef.current) return;
    cyRef.current.fit();
  };

  // Center graph
  const centerGraph = () => {
    if (!cyRef.current) return;
    cyRef.current.center();
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Graph Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full bg-white border border-gray-200 rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading graph...</p>
          </div>
        </div>
      )}

      {/* Graph Controls */}
      {interactive && !isLoading && (
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={fitToContainer}
            className="p-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-xs"
            title="Fit to container"
          >
            📐
          </button>
          <button
            onClick={centerGraph}
            className="p-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-xs"
            title="Center graph"
          >
            🎯
          </button>
          <button
            onClick={() => changeLayout('dagre')}
            className="p-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-xs"
            title="Hierarchical layout"
          >
            📊
          </button>
          <button
            onClick={() => changeLayout('cose-bilkent')}
            className="p-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-xs"
            title="Force-directed layout"
          >
            🌐
          </button>
        </div>
      )}

      {/* Annotations */}
      {annotations.length > 0 && (
        <div className="absolute top-2 left-2 bg-white border border-gray-300 rounded p-2 shadow-sm max-w-xs">
          {annotations.map((annotation, index) => (
            <div key={index} className="text-xs text-gray-700 mb-1 last:mb-0">
              {annotation.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Get Cytoscape styles for automata visualization
 */
function getCytoscapeStyles() {
  return [
    // Node styles
    {
      selector: 'node',
      style: {
        'background-color': '#ffffff',
        'border-color': '#2563eb',
        'border-width': 2,
        'color': '#1f2937',
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '14px',
        'font-weight': 'bold',
        'width': '40px',
        'height': '40px',
        'overlay-opacity': 0
      }
    },
    
    // Start state style
    {
      selector: 'node.start-state',
      style: {
        'border-color': '#059669',
        'border-width': 3,
        'background-color': '#ecfdf5'
      }
    },
    
    // Final state style
    {
      selector: 'node.final-state',
      style: {
        'border-style': 'double',
        'border-width': 4,
        'border-color': '#dc2626',
        'background-color': '#fef2f2'
      }
    },
    
    // Start and final state
    {
      selector: 'node.start-state.final-state',
      style: {
        'border-color': '#7c3aed',
        'background-color': '#f3e8ff'
      }
    },
    
    // Highlighted state
    {
      selector: 'node.highlighted',
      style: {
        'background-color': '#fbbf24',
        'border-color': '#f59e0b',
        'border-width': 4
      }
    },
    
    // Edge styles
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#6b7280',
        'target-arrow-color': '#6b7280',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '12px',
        'color': '#374151',
        'text-background-color': '#ffffff',
        'text-background-opacity': 0.8,
        'text-background-padding': '2px',
        'text-border-color': '#e5e7eb',
        'text-border-width': 1,
        'text-border-opacity': 0.5,
        'edge-text-rotation': 'autorotate'
      }
    },
    
    // Self-loop edges
    {
      selector: 'edge[source = target]',
      style: {
        'curve-style': 'loop',
        'loop-direction': '0deg',
        'loop-sweep': '45deg',
        'control-point-distance': '50px'
      }
    },
    
    // Highlighted edge
    {
      selector: 'edge.highlighted',
      style: {
        'line-color': '#f59e0b',
        'target-arrow-color': '#f59e0b',
        'width': 3,
        'color': '#92400e'
      }
    },
    
    // Epsilon transitions
    {
      selector: 'edge[label = "ε"], edge[label = "epsilon"]',
      style: {
        'line-style': 'dashed',
        'line-color': '#9ca3af',
        'target-arrow-color': '#9ca3af'
      }
    }
  ];
}

/**
 * Get layout configuration
 */
function getLayoutConfig(layoutName) {
  const layouts = {
    dagre: {
      name: 'dagre',
      rankDir: 'LR',
      nodeSep: 50,
      rankSep: 100,
      animate: true,
      animationDuration: 500
    },
    
    'cose-bilkent': {
      name: 'cose-bilkent',
      animate: true,
      animationDuration: 1000,
      nodeRepulsion: 4500,
      idealEdgeLength: 100,
      edgeElasticity: 0.45,
      nestingFactor: 0.1,
      gravity: 0.25,
      numIter: 2500,
      tile: true,
      tilingPaddingVertical: 10,
      tilingPaddingHorizontal: 10
    },
    
    circle: {
      name: 'circle',
      animate: true,
      animationDuration: 500,
      radius: 150
    },
    
    grid: {
      name: 'grid',
      animate: true,
      animationDuration: 500,
      rows: 3,
      cols: 3
    },
    
    breadthfirst: {
      name: 'breadthfirst',
      animate: true,
      animationDuration: 500,
      directed: true,
      spacingFactor: 1.5
    }
  };
  
  return layouts[layoutName] || layouts.dagre;
}

export default AutomatonGraph;

