// DFA to Regular Expression Converter Component
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
import RegexDisplay, { RegexComparison } from '../visualization/RegexDisplay.jsx';
import DFAToRegexConverter from '../../utils/dfaToRegex.js';
import { DFAToRegexExamples, DFABuilder } from '../../utils/dfaToRegex.js';

const DFAToRegexConverterComponent = () => {
  const [dfaInput, setDfaInput] = useState({
    states: ['q0', 'q1', 'q2'],
    alphabet: ['a', 'b'],
    transitions: [
      { from: 'q0', symbol: 'a', to: 'q1' },
      { from: 'q0', symbol: 'b', to: 'q0' },
      { from: 'q1', symbol: 'a', to: 'q1' },
      { from: 'q1', symbol: 'b', to: 'q2' },
      { from: 'q2', symbol: 'a', to: 'q1' },
      { from: 'q2', symbol: 'b', to: 'q0' }
    ],
    startState: 'q0',
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
    ...DFAToRegexExamples.simple.map(ex => ({ ...ex, category: 'Simple' })),
    ...DFAToRegexExamples.complex.map(ex => ({ ...ex, category: 'Complex' }))
  ];

  const handleConvert = useCallback(async () => {
    setIsConverting(true);
    setError(null);
    setCurrentStep(0);

    try {
      // Create DFA from input
      const dfa = DFABuilder.createSimpleDFA(
        dfaInput.alphabet,
        dfaInput.transitions.map(t => [t.from, t.symbol, t.to]),
        dfaInput.startState,
        dfaInput.finalStates
      );

      const converter = new DFAToRegexConverter(dfa);
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
  }, [dfaInput]);

  const handleExampleSelect = (exampleName) => {
    const example = allExamples.find(ex => ex.name === exampleName);
    if (example) {
      const dfa = example.dfa;
      setDfaInput({
        states: Array.from(dfa.states.keys()),
        alphabet: Array.from(dfa.alphabet),
        transitions: Array.from(dfa.transitions.values()).map(t => ({
          from: t.from,
          symbol: t.symbol,
          to: t.to
        })),
        startState: dfa.startState,
        finalStates: Array.from(dfa.finalStates)
      });
      setSelectedExample(exampleName);
      setConversionResult(null);
      setCurrentStep(0);
      setError(null);
    }
  };

  const handleReset = () => {
    setDfaInput({
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitions: [
        { from: 'q0', symbol: 'a', to: 'q1' },
        { from: 'q0', symbol: 'b', to: 'q0' },
        { from: 'q1', symbol: 'a', to: 'q1' },
        { from: 'q1', symbol: 'b', to: 'q2' },
        { from: 'q2', symbol: 'a', to: 'q1' },
        { from: 'q2', symbol: 'b', to: 'q0' }
      ],
      startState: 'q0',
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
    setDfaInput(prev => ({
      ...prev,
      transitions: [...prev.transitions, { from: '', symbol: '', to: '' }]
    }));
  };

  const removeTransition = (index) => {
    setDfaInput(prev => ({
      ...prev,
      transitions: prev.transitions.filter((_, i) => i !== index)
    }));
  };

  const updateTransition = (index, field, value) => {
    setDfaInput(prev => ({
      ...prev,
      transitions: prev.transitions.map((t, i) => 
        i === index ? { ...t, [field]: value } : t
      )
    }));
  };

  // Create DFA for visualization
  const currentDFA = React.useMemo(() => {
    try {
      return DFABuilder.createSimpleDFA(
        dfaInput.alphabet,
        dfaInput.transitions.map(t => [t.from, t.symbol, t.to]),
        dfaInput.startState,
        dfaInput.finalStates
      );
    } catch {
      return null;
    }
  }, [dfaInput]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔤</span>
            DFA to Regular Expression Conversion
          </CardTitle>
          <CardDescription>
            Convert deterministic finite automata to regular expressions using state elimination.
            Define your DFA or select from examples below.
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

          {/* DFA Input */}
          {inputMode === 'visual' ? (
            <div className="space-y-4">
              {/* States and Alphabet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>States (comma-separated)</Label>
                  <input
                    type="text"
                    value={dfaInput.states.join(', ')}
                    onChange={(e) => setDfaInput(prev => ({
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
                    value={dfaInput.alphabet.join(', ')}
                    onChange={(e) => setDfaInput(prev => ({
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
                  <Label>Start State</Label>
                  <select
                    value={dfaInput.startState}
                    onChange={(e) => setDfaInput(prev => ({
                      ...prev,
                      startState: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  >
                    <option value="">Select start state</option>
                    {dfaInput.states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Final States (comma-separated)</Label>
                  <input
                    type="text"
                    value={dfaInput.finalStates.join(', ')}
                    onChange={(e) => setDfaInput(prev => ({
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
                  {dfaInput.transitions.map((transition, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                      <select
                        value={transition.from}
                        onChange={(e) => updateTransition(index, 'from', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                      >
                        <option value="">From</option>
                        {dfaInput.states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      
                      <span className="text-sm text-gray-500">→</span>
                      
                      <select
                        value={transition.symbol}
                        onChange={(e) => updateTransition(index, 'symbol', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                      >
                        <option value="">Symbol</option>
                        {dfaInput.alphabet.map(symbol => (
                          <option key={symbol} value={symbol}>{symbol}</option>
                        ))}
                      </select>
                      
                      <span className="text-sm text-gray-500">→</span>
                      
                      <select
                        value={transition.to}
                        onChange={(e) => updateTransition(index, 'to', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                      >
                        <option value="">To</option>
                        {dfaInput.states.map(state => (
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
              <Label>DFA Definition (JSON format)</Label>
              <Textarea
                value={JSON.stringify(dfaInput, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setDfaInput(parsed);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                className="font-mono text-sm"
                rows={10}
                placeholder="Enter DFA definition in JSON format..."
              />
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleConvert} 
              disabled={isConverting || !currentDFA}
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

      {/* Input DFA Visualization */}
      {currentDFA && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">📥</span>
              Input DFA
            </CardTitle>
            <CardDescription>
              Visualization of the input deterministic finite automaton
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <AutomatonGraph 
                automaton={currentDFA}
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
          {/* Result Column */}
          <div className="space-y-6">
            {/* Regular Expression Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Resulting Regular Expression
                </CardTitle>
                <CardDescription>
                  The regular expression equivalent to the input DFA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegexDisplay 
                  regex={conversionResult.regex}
                  title="Final Regular Expression"
                  description="This regular expression accepts the same language as the input DFA"
                />
              </CardContent>
            </Card>

            {/* Transition Table */}
            {showTable && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    Original DFA Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TransitionTable automaton={currentDFA} />
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
                    Follow the step-by-step state elimination algorithm
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
                    <h4 className="font-medium text-sm mb-1">State Elimination Method</h4>
                    <p className="text-sm text-gray-600">
                      This algorithm converts DFA to regular expression by systematically 
                      eliminating states and combining their transitions into regular expressions.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Key Steps</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>1. Convert DFA to Generalized NFA (GNFA)</li>
                      <li>2. Add new start and final states</li>
                      <li>3. Eliminate intermediate states one by one</li>
                      <li>4. Update transitions with regular expressions</li>
                      <li>5. Extract final regular expression</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">Time Complexity</h4>
                    <p className="text-sm text-gray-600">
                      O(n³ × 2^n) where n is the number of states
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
                <h4 className="font-medium mb-2">DFA Requirements</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>States:</strong> Set of all states in the automaton</li>
                  <li><strong>Alphabet:</strong> Set of input symbols</li>
                  <li><strong>Transitions:</strong> Deterministic state transitions</li>
                  <li><strong>Start State:</strong> Single initial state</li>
                  <li><strong>Final States:</strong> Set of accepting states</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Important Notes</h4>
                <ul className="text-sm space-y-1">
                  <li>Each state must have exactly one transition per symbol</li>
                  <li>Missing transitions are treated as going to a dead state</li>
                  <li>The algorithm works best with minimal DFAs</li>
                  <li>Complex DFAs may produce long regular expressions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DFAToRegexConverterComponent;

