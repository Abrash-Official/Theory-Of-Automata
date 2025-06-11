// Main Application Component
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { BookOpen, Zap, Moon, Sun, Github, HelpCircle } from 'lucide-react';
import RegexToDFAConverter from './components/converters/RegexToDFAConverter.jsx';
import NFAToDFAConverter from './components/converters/NFAToDFAConverter.jsx';
import DFAToRegexConverter from './components/converters/DFAToRegexConverter.jsx';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('regex-to-dfa');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  AutomataEdu
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Interactive Automata Theory Learning
                </p>
              </div>
            </div>

            {/* Navigation and Controls */}
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                <BookOpen className="h-3 w-3 mr-1" />
                Educational Tool
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <Button variant="ghost" size="sm" className="p-2">
                <HelpCircle className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" className="p-2">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Welcome to AutomataEdu! 🎓
              </CardTitle>
              <CardDescription className="text-blue-100">
                Master automata theory through interactive visualizations and step-by-step explanations.
                Convert between regular expressions, NFAs, and DFAs with ease.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">📝 RegEx → DFA</h3>
                  <p className="text-sm text-blue-100">
                    Convert regular expressions to deterministic finite automata using direct construction
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🔄 NFA → DFA</h3>
                  <p className="text-sm text-blue-100">
                    Transform nondeterministic automata to deterministic using subset construction
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🔤 DFA → RegEx</h3>
                  <p className="text-sm text-blue-100">
                    Extract regular expressions from automata using state elimination algorithm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Conversion Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger 
              value="regex-to-dfa" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <span className="text-lg">📝</span>
              <span className="hidden sm:inline">RegEx → DFA</span>
              <span className="sm:hidden">R→D</span>
            </TabsTrigger>
            <TabsTrigger 
              value="nfa-to-dfa"
              className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <span className="text-lg">🔄</span>
              <span className="hidden sm:inline">NFA → DFA</span>
              <span className="sm:hidden">N→D</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dfa-to-regex"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <span className="text-lg">🔤</span>
              <span className="hidden sm:inline">DFA → RegEx</span>
              <span className="sm:hidden">D→R</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="regex-to-dfa" className="mt-0">
            <RegexToDFAConverter />
          </TabsContent>

          <TabsContent value="nfa-to-dfa" className="mt-0">
            <NFAToDFAConverter />
          </TabsContent>

          <TabsContent value="dfa-to-regex" className="mt-0">
            <DFAToRegexConverter />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About AutomataEdu
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                An interactive educational tool designed to help students understand 
                automata theory concepts through visual learning and step-by-step explanations.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Features
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Interactive graph visualizations</li>
                <li>• Step-by-step conversion explanations</li>
                <li>• 30+ built-in example problems</li>
                <li>• Export capabilities</li>
                <li>• Dark mode support</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Learning Resources
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Algorithm explanations</li>
                <li>• Interactive examples</li>
                <li>• Visual step-by-step guides</li>
                <li>• Practice problems</li>
                <li>• Theory background</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 AutomataEdu. Built for educational purposes. 
              <span className="ml-2">Made with ❤️ for students learning automata theory.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

