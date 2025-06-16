// Test suite for automata theory algorithms
import RegexToDFAConverter from './regexToDFA.js';
import NFAToDFAConverter, { NFABuilder } from './nfaToDFA.js';
import DFAToRegexConverter, { DFABuilder } from './dfaToRegex.js';

/**
 * Test runner for all conversion algorithms
 */
export class AutomataTestSuite {
  constructor() {
    this.testResults = [];
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('🧪 Running Automata Theory Algorithm Tests...\n');
    
    this.testRegexToDFA();
    this.testNFAToDFA();
    this.testDFAToRegex();
    
    this.printResults();
    return this.testResults;
  }

  /**
   * Test Regular Expression to DFA conversion
   */
  testRegexToDFA() {
    console.log('📝 Testing RegEx to DFA Conversion...');
    
    const testCases = [
      { regex: 'a', expected: 'Should accept only "a"' },
      { regex: 'ab', expected: 'Should accept only "ab"' },
      { regex: 'a|b', expected: 'Should accept "a" or "b"' },
      { regex: 'a*', expected: 'Should accept "", "a", "aa", etc.' },
      { regex: '(a|b)*abb', expected: 'Should accept strings ending with "abb"' }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const converter = new RegexToDFAConverter(testCase.regex);
        const result = converter.convert();
        
        if (result.success) {
          console.log(`  ✅ Test ${index + 1}: ${testCase.regex} - SUCCESS`);
          console.log(`     Steps: ${result.steps.length}`);
          console.log(`     DFA States: ${result.dfa.states.size}`);
          
          this.testResults.push({
            type: 'RegexToDFA',
            input: testCase.regex,
            success: true,
            steps: result.steps.length,
            states: result.dfa.states.size
          });
        } else {
          console.log(`  ❌ Test ${index + 1}: ${testCase.regex} - FAILED`);
          console.log(`     Error: ${result.error}`);
          
          this.testResults.push({
            type: 'RegexToDFA',
            input: testCase.regex,
            success: false,
            error: result.error
          });
        }
      } catch (error) {
        console.log(`  💥 Test ${index + 1}: ${testCase.regex} - EXCEPTION`);
        console.log(`     Error: ${error.message}`);
        
        this.testResults.push({
          type: 'RegexToDFA',
          input: testCase.regex,
          success: false,
          error: error.message
        });
      }
    });
    
    console.log('');
  }

  /**
   * Test NFA to DFA conversion
   */
  testNFAToDFA() {
    console.log('🔄 Testing NFA to DFA Conversion...');
    
    const testCases = [
      {
        name: 'Simple NFA with epsilon transitions',
        nfa: NFABuilder.createSimpleNFA(
          ['a', 'b'],
          [
            ['q0', 'ε', 'q1'],
            ['q0', 'a', 'q0'],
            ['q1', 'b', 'q2']
          ],
          'q0',
          ['q2']
        )
      },
      {
        name: 'NFA with nondeterministic transitions',
        nfa: NFABuilder.createSimpleNFA(
          ['a', 'b'],
          [
            ['q0', 'a', 'q0'],
            ['q0', 'a', 'q1'],
            ['q1', 'b', 'q2']
          ],
          'q0',
          ['q2']
        )
      }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const converter = new NFAToDFAConverter(testCase.nfa);
        const result = converter.convert();
        
        if (result.success) {
          console.log(`  ✅ Test ${index + 1}: ${testCase.name} - SUCCESS`);
          console.log(`     Steps: ${result.steps.length}`);
          console.log(`     Original NFA States: ${testCase.nfa.states.size}`);
          console.log(`     Resulting DFA States: ${result.dfa.states.size}`);
          
          this.testResults.push({
            type: 'NFAToDFA',
            input: testCase.name,
            success: true,
            steps: result.steps.length,
            originalStates: testCase.nfa.states.size,
            resultStates: result.dfa.states.size
          });
        } else {
          console.log(`  ❌ Test ${index + 1}: ${testCase.name} - FAILED`);
          console.log(`     Error: ${result.error}`);
          
          this.testResults.push({
            type: 'NFAToDFA',
            input: testCase.name,
            success: false,
            error: result.error
          });
        }
      } catch (error) {
        console.log(`  💥 Test ${index + 1}: ${testCase.name} - EXCEPTION`);
        console.log(`     Error: ${error.message}`);
        
        this.testResults.push({
          type: 'NFAToDFA',
          input: testCase.name,
          success: false,
          error: error.message
        });
      }
    });
    
    console.log('');
  }

  /**
   * Test DFA to Regular Expression conversion
   */
  testDFAToRegex() {
    console.log('🔤 Testing DFA to RegEx Conversion...');
    
    const testCases = [
      {
        name: 'Single symbol DFA',
        dfa: DFABuilder.createSimpleDFA(
          ['a'],
          [['q0', 'a', 'q1']],
          'q0',
          ['q1']
        )
      },
      {
        name: 'Two symbol sequence DFA',
        dfa: DFABuilder.createSimpleDFA(
          ['a', 'b'],
          [
            ['q0', 'a', 'q1'],
            ['q1', 'b', 'q2']
          ],
          'q0',
          ['q2']
        )
      },
      {
        name: 'Strings ending with "ab"',
        dfa: DFABuilder.createMinimalDFA()
      }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const converter = new DFAToRegexConverter(testCase.dfa);
        const result = converter.convert();
        
        if (result.success) {
          console.log(`  ✅ Test ${index + 1}: ${testCase.name} - SUCCESS`);
          console.log(`     Steps: ${result.steps.length}`);
          console.log(`     Resulting RegEx: ${result.regex}`);
          
          this.testResults.push({
            type: 'DFAToRegex',
            input: testCase.name,
            success: true,
            steps: result.steps.length,
            regex: result.regex
          });
        } else {
          console.log(`  ❌ Test ${index + 1}: ${testCase.name} - FAILED`);
          console.log(`     Error: ${result.error}`);
          
          this.testResults.push({
            type: 'DFAToRegex',
            input: testCase.name,
            success: false,
            error: result.error
          });
        }
      } catch (error) {
        console.log(`  💥 Test ${index + 1}: ${testCase.name} - EXCEPTION`);
        console.log(`     Error: ${error.message}`);
        
        this.testResults.push({
          type: 'DFAToRegex',
          input: testCase.name,
          success: false,
          error: error.message
        });
      }
    });
    
    console.log('');
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('📊 Test Results Summary:');
    console.log('========================');
    
    const summary = {
      RegexToDFA: { total: 0, passed: 0, failed: 0 },
      NFAToDFA: { total: 0, passed: 0, failed: 0 },
      DFAToRegex: { total: 0, passed: 0, failed: 0 }
    };
    
    this.testResults.forEach(result => {
      summary[result.type].total++;
      if (result.success) {
        summary[result.type].passed++;
      } else {
        summary[result.type].failed++;
      }
    });
    
    Object.entries(summary).forEach(([type, stats]) => {
      const passRate = stats.total > 0 ? (stats.passed / stats.total * 100).toFixed(1) : 0;
      console.log(`${type}: ${stats.passed}/${stats.total} passed (${passRate}%)`);
    });
    
    const totalTests = this.testResults.length;
    const totalPassed = this.testResults.filter(r => r.success).length;
    const overallPassRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : 0;
    
    console.log(`\nOverall: ${totalPassed}/${totalTests} passed (${overallPassRate}%)`);
    
    if (totalPassed === totalTests) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Check the details above.');
    }
  }
}

/**
 * Quick test function for individual algorithms
 */
export const QuickTests = {
  testRegexToDFA: (regex) => {
    console.log(`Testing RegEx to DFA: ${regex}`);
    const converter = new RegexToDFAConverter(regex);
    const result = converter.convert();
    console.log('Result:', result);
    return result;
  },

  testNFAToDFA: (nfa) => {
    console.log('Testing NFA to DFA conversion');
    const converter = new NFAToDFAConverter(nfa);
    const result = converter.convert();
    console.log('Result:', result);
    return result;
  },

  testDFAToRegex: (dfa) => {
    console.log('Testing DFA to RegEx conversion');
    const converter = new DFAToRegexConverter(dfa);
    const result = converter.convert();
    console.log('Result:', result);
    return result;
  }
};

// Export test suite
export default AutomataTestSuite;

