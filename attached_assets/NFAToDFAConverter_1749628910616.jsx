// NFA to DFA Converter Component
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Play, RotateCcw, Download, BookOpen, Lightbulb, Plus, Trash2 } from 'lucide-react';
import AutomatonGraph from '../visualization/AutomatonGraph.jsx';
import StepDisplay from '../visualization/StepDisplay.jsx';
import TransitionTable from '../visualization/TransitionTable.jsx';
import NFAToDFAConverter from '../../utils/nfaToDFA.js';
import { NFAToDFAExamples, NFABuilder } from '../../utils/nfaToDFA.js';

const NFAToDFAConverterComponent = () => {
  const [nfaInput, setNfaInput] = useState({
    states: ['q0', 'q1', 'q2'],
    alphabet: ['a', 'b'],
    transitions: [
      { from: 'q0', symbol: 'ε', to: 'q1' },
      { from: 'q0', symbol: 'a', to: 'q0' },
      { from: 'q1', symbol: 'b', to: 'q2' }
    ],
    startStates: ['q0'],
    finalStates: ['q2']
  });
  const [selectedExample, setSelectedExample] = useState('');
  const [conversionResult, setConversionResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [showSteps, setShowSteps] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [inputMode, setInputMode] = useState('visual'); // 'visual' or 'text'

  // All examples (simple + complex)
  const allExamples = [
    ...NFAToDFAExamples.simple.map(ex => ({ ...ex, category: 'Simple' })),
    ...NFAToDFAExamples.complex.map(ex => ({ ...ex, category: 'Complex' }))
  ];

  const handleConvert = useCallback(async () => {
    setIsConverting(true);
    setError(null);
    setCurrentStep(0);

    try {
      // Create NFA from input
      const nfa = NFABuilder.createSimpleNFA(
        nfaInput.alphabet,
        nfaInput.transitions.map(t => [t.from, t.symbol, t.to]),
        nfaInput.startStates[0],
        nfaInput.finalStates
      );

      const converter = new NFAToDFAConverter(nfa);
      const result = converter.convert();
      
      if (result.success) {
        setConversionResult(result);
      } else {
        setError(result.error || 'Conversion failed');
        setConversionResult(null);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setConversionResult(null);
    } finally {
      setIsConverting(false);
    }
  }, [nfaInput]);

  const handleExampleSelect = (exampleName) => {
    const example = allExamples.find(ex => ex.name === exampleName);
    if (example) {
      const nfa = example.nfa;
      setNfaInput({
        states: Array.from(nfa.states.keys()),
        alphabet: Array.from(nfa.alphabet),
        transitions: Array.from(nfa.transitions.values()).map(t => ({
          from: t.from,
          symbol: t.symbol,
          to: t.to
        })),
        startStates: Array.from(nfa.startStates),
        finalStates: Array.from(nfa.finalStates)
      });
      setSelectedExample(exampleName);
      setConversionResult(null);
      setCurrentStep(0);
      setError(null);
    }
  };

  const handleReset = () => {
    setNfaInput({
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitions: [
        { from: 'q0', symbol: 'ε', to: 'q1' },
        { from: 'q0', symbol: 'a', to: 'q0' },
        { from: 'q1', symbol: 'b', to: 'q2' }
      ],
      startStates: ['q0'],
      finalStates: ['q2']
    });
    setSelectedExample('');
    setConversionResult(null);
    setCurrentStep(0);
    setError(null);
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const addTransition = () => {
    setNfaInput(prev => ({
      ...prev,
      transitions: [...prev.transitions, { from: '', symbol: '', to: '' }]
    }));
  };

  const removeTransition = (index) => {
    setNfaInput(prev => ({
      ...prev,
      transitions: prev.transitions.filter((_, i) => i !== index)
    }));
  };

  const updateTransition = (index, field, value) => {
    setNfaInput(prev => ({
      ...prev,
      transitions: prev.transitions.map((t, i) => 
        i === index ? { ...t, [field]: value } : t
      )
    }));
  };

  // Create NFA for visualization
  const currentNFA = React.useMemo(() => {
    try {
      return NFABuilder.createSimpleNFA(
        nfaInput.alphabet,
        nfaInput.transitions.map(t => [t.from, t.symbol, t.to]),
        nfaInput.startStates[0],
        nfaInput.finalStates
      );
    } catch {
      return null;
    }
  }, [nfaInput]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            NFA to DFA Conversion
          </CardTitle>
          <CardDescription>
            Convert nondeterministic finite automata to deterministic finite automata using subset construction.
            Define your NFA or select from examples below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Example Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="example-select">Examples</Label>
              <Select value={selectedExample} onValueChange={handleExampleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an example..." />
                </SelectTrigger>
                <SelectContent>
                  {allExamples.map((example, index) => (
                    <SelectItem key={index} value={example.name}>
                      <div className="flex items-center gap-2">
                        <Badge variant={example.category === 'Simple' ? 'default' : 'secondary'} className="text-xs">
                          {example.category}
                        </Badge>
                        <span className="text-sm">{example.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Input Mode</Label>
              <Select value={inputMode} onValueChange={setInputMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual Editor</SelectItem>
                  <SelectItem value="text">Text Input</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* NFA Input */}
          {inputMode === 'visual' ? (
            <div className="space-y-4">
              {/* States and Alphabet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>States (comma-separated)</Label>
                  <input
                    type="text"
                    value={nfaInput.states.join(', ')}
                    onChange={(e) => setNfaInput(prev => ({
                      ...prev,
                      states: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    placeholder="q0, q1, q2"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Alphabet (comma-separated)</Label>
                  <input
                    type="text"
                    value={nfaInput.alphabet.join(', ')}
                    onChange={(e) => setNfaInput(prev => ({
                      ...prev,
                      alphabet: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    placeholder="a, b"
                  />
                </div>
              </div>

              {/* Start and Final States */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start States (comma-separated)</Label>
                  <input
                    type="text"
                    value={nfaInput.startStates.join(', ')}
                    onChange={(e) => setNfaInput(prev => ({
                      ...prev,
                      startStates: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    placeholder="q0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Final States (comma-separated)</Label>
                  <input
                    type="text"
                    value={nfaInput.finalStates.join(', ')}
                    onChange={(e) => setNfaInput(prev => ({
                      ...prev,
                      finalStates: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    placeholder="q2"
                  />
                </div>
              </div>

              {/* Transitions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Transitions</Label>
                  <Button variant="outline" size="sm" onClick={addTransition}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Transition
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {nfaInput.transitions.map((transition, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                      <select
                        value={transition.from}
                        onChange={(e) => updateTransition(index, 'from', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                      >
                        <option value="">From</option>
                        {nfaInput.states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      
                      <span className="text-sm text-gray-500">→</span>
                      
                      <input
                        type="text"
                        value={transition.symbol}
                        onChange={(e) => updateTransition(index, 'symbol', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm font-mono text-center"
                        placeholder="ε"
                      />
                      
                      <span className="text-sm text-gray-500">→</span>
                      
                      <select
                        value={transition.to}
                        onChange={(e) => updateTransition(index, 'to', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                      >
                        <option value="">To</option>
                        {nfaInput.states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeTransition(index)}
                        className="p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>NFA Definition (JSON format)</Label>
              <Textarea
                value={JSON.stringify(nfaInput, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setNfaInput(parsed);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                className="font-mono text-sm"
                rows={10}
                placeholder="Enter NFA definition in JSON format..."
              />
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleConvert} 
              disabled={isConverting || !currentNFA}
              className="flex items-center gap-2"
            >
              {isConverting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Play className="h-4 w-4" />
              )}
              Convert
            </Button>
            
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            
            {conversionResult && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSteps(!showSteps)}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  {showSteps ? 'Hide' : 'Show'} Steps
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowTable(!showTable)}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  {showTable ? 'Hide' : 'Show'} Table
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Input NFA Visualization */}
      {currentNFA && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">📥</span>
              Input NFA
            </CardTitle>
            <CardDescription>
              Visualization of the input nondeterministic finite automaton
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <AutomatonGraph 
                automaton={currentNFA}
                layout="dagre"
                interactive={true}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {conversionResult && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Visualization Column */}
          <div className="space-y-6">
            {/* DFA Graph */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Resulting DFA
                </CardTitle>
                <CardDescription>
                  Interactive visualization of the converted deterministic finite automaton
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <AutomatonGraph 
                    automaton={conversionResult.dfa}
                    layout="dagre"
                    interactive={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transition Table */}
            {showTable && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    Transition Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TransitionTable automaton={conversionResult.dfa} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Steps Column */}
          {showSteps && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    Conversion Steps
                  </CardTitle>
                  <CardDescription>
                    Follow the step-by-step subset construction algorithm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StepDisplay
                    steps={conversionResult.steps}
                    currentStep={currentStep}
                    onStepChange={handleStepChange}
                    autoPlay={false}
                    autoPlaySpeed={3000}
                  />
                </CardContent>
              </Card>

              {/* Algorithm Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Algorithm Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Subset Construction</h4>
                    <p className="text-sm text-gray-600">
                      This algorithm converts NFA to DFA by creating DFA states that represent 
                      sets of NFA states, handling epsilon transitions through closure operations.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Key Steps</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>1. Calculate epsilon closures for all states</li>
                      <li>2. Create initial DFA state from start state closure</li>
                      <li>3. For each symbol, compute reachable states</li>
                      <li>4. Create new DFA states as needed</li>
                      <li>5. Mark final states and minimize</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">Time Complexity</h4>
                    <p className="text-sm text-gray-600">
                      O(2^n) where n is the number of NFA states (worst case)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      {!conversionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">NFA Components</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>States:</strong> Set of all states in the automaton</li>
                  <li><strong>Alphabet:</strong> Set of input symbols</li>
                  <li><strong>Transitions:</strong> State transitions on symbols</li>
                  <li><strong>Start States:</strong> Initial states (can be multiple)</li>
                  <li><strong>Final States:</strong> Accepting states</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Special Symbols</h4>
                <ul className="text-sm space-y-1">
                  <li><code className="bg-gray-100 px-1 rounded">ε</code> - Epsilon transition (no input)</li>
                  <li><code className="bg-gray-100 px-1 rounded">epsilon</code> - Alternative epsilon notation</li>
                  <li>Multiple transitions on same symbol allowed</li>
                  <li>Multiple start states supported</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NFAToDFAConverterComponent;

