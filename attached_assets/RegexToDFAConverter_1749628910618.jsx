// Regular Expression to DFA Converter Component
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Play, RotateCcw, Download, BookOpen, Lightbulb } from 'lucide-react';
import AutomatonGraph from '../visualization/AutomatonGraph.jsx';
import StepDisplay from '../visualization/StepDisplay.jsx';
import TransitionTable from '../visualization/TransitionTable.jsx';
import RegexDisplay from '../visualization/RegexDisplay.jsx';
import RegexToDFAConverter from '../../utils/regexToDFA.js';
import { RegexToDFAExamples } from '../../utils/regexToDFA.js';

const RegexToDFAConverterComponent = () => {
  const [inputRegex, setInputRegex] = useState('');
  const [selectedExample, setSelectedExample] = useState('');
  const [conversionResult, setConversionResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [showSteps, setShowSteps] = useState(true);
  const [showTable, setShowTable] = useState(false);

  // All examples (simple + complex)
  const allExamples = [
    ...RegexToDFAExamples.simple.map(ex => ({ ...ex, category: 'Simple' })),
    ...RegexToDFAExamples.complex.map(ex => ({ ...ex, category: 'Complex' }))
  ];

  const handleConvert = useCallback(async () => {
    if (!inputRegex.trim()) {
      setError('Please enter a regular expression');
      return;
    }

    setIsConverting(true);
    setError(null);
    setCurrentStep(0);

    try {
      const converter = new RegexToDFAConverter(inputRegex.trim());
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
  }, [inputRegex]);

  const handleExampleSelect = (exampleRegex) => {
    setInputRegex(exampleRegex);
    setSelectedExample(exampleRegex);
    setConversionResult(null);
    setCurrentStep(0);
    setError(null);
  };

  const handleReset = () => {
    setInputRegex('');
    setSelectedExample('');
    setConversionResult(null);
    setCurrentStep(0);
    setError(null);
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Regular Expression to DFA Conversion
          </CardTitle>
          <CardDescription>
            Convert regular expressions to deterministic finite automata using the direct construction method.
            Enter a regular expression or select from examples below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="regex-input">Regular Expression</Label>
              <div className="flex gap-2">
                <Input
                  id="regex-input"
                  value={inputRegex}
                  onChange={(e) => setInputRegex(e.target.value)}
                  placeholder="Enter regular expression (e.g., (a|b)*abb)"
                  className="font-mono"
                  onKeyPress={(e) => e.key === 'Enter' && handleConvert()}
                />
                <Button 
                  onClick={handleConvert} 
                  disabled={isConverting || !inputRegex.trim()}
                  className="flex items-center gap-2"
                >
                  {isConverting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Convert
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="example-select">Examples</Label>
              <Select value={selectedExample} onValueChange={handleExampleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an example..." />
                </SelectTrigger>
                <SelectContent>
                  {allExamples.map((example, index) => (
                    <SelectItem key={index} value={example.regex}>
                      <div className="flex items-center gap-2">
                        <Badge variant={example.category === 'Simple' ? 'default' : 'secondary'} className="text-xs">
                          {example.category}
                        </Badge>
                        <span className="font-mono text-sm">{example.regex}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Insert Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Quick insert:</span>
            {['ε', '∅', '*', '|', '(', ')', 'a', 'b', '0', '1'].map(symbol => (
              <Button
                key={symbol}
                variant="outline"
                size="sm"
                onClick={() => setInputRegex(prev => prev + symbol)}
                className="h-8 w-8 p-0 font-mono"
              >
                {symbol}
              </Button>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
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

          {/* Input Preview */}
          {inputRegex && !error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-900 mb-2">Input Regular Expression:</div>
              <RegexDisplay regex={inputRegex} inline={true} />
            </div>
          )}
        </CardContent>
      </Card>

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
                    Follow the step-by-step process of converting the regular expression to DFA
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
                    <h4 className="font-medium text-sm mb-1">Direct Construction Method</h4>
                    <p className="text-sm text-gray-600">
                      This algorithm converts regular expressions directly to DFA without 
                      creating an intermediate NFA, using syntax trees and position sets.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Key Steps</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>1. Create augmented regular expression</li>
                      <li>2. Build syntax tree</li>
                      <li>3. Calculate nullable, firstpos, lastpos</li>
                      <li>4. Calculate followpos</li>
                      <li>5. Construct DFA states and transitions</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">Time Complexity</h4>
                    <p className="text-sm text-gray-600">
                      O(n³) where n is the length of the regular expression
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
                <h4 className="font-medium mb-2">Supported Operators</h4>
                <ul className="text-sm space-y-1">
                  <li><code className="bg-gray-100 px-1 rounded">*</code> - Kleene star (zero or more)</li>
                  <li><code className="bg-gray-100 px-1 rounded">|</code> - Union (or)</li>
                  <li><code className="bg-gray-100 px-1 rounded">()</code> - Grouping</li>
                  <li><code className="bg-gray-100 px-1 rounded">ε</code> - Epsilon (empty string)</li>
                  <li><code className="bg-gray-100 px-1 rounded">∅</code> - Empty set</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Example Expressions</h4>
                <ul className="text-sm space-y-1">
                  <li><code className="bg-gray-100 px-1 rounded">a*</code> - Zero or more a's</li>
                  <li><code className="bg-gray-100 px-1 rounded">a|b</code> - Either a or b</li>
                  <li><code className="bg-gray-100 px-1 rounded">(a|b)*abb</code> - Strings ending with "abb"</li>
                  <li><code className="bg-gray-100 px-1 rounded">a*b*</code> - a's followed by b's</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegexToDFAConverterComponent;

