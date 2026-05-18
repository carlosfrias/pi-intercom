/**
 * Concurrent Ask Test Harness for pi-intercom
 * 
 * Tests parallel intercom({ action: "ask", ... }) calls to verify
 * the fix for "Already waiting for a reply" error.
 * 
 * Run with: npm test -- concurrent-ask.test.ts
 * 
 * Prerequisites:
 * - pi-intercom fork installed with parallel ask support
 * - Multiple pi sessions running (orchestrator + assistants)
 * - Intercom connectivity verified
 */

import { intercom } from '../index.ts';

// Test configuration
const CONFIG = {
  timeoutMs: 30000,        // Timeout for each ask
  replyDelayMs: 1000,      // Simulated reply delay
  batchSize: 10,           // Max concurrent asks
};

// Test result tracking
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: string;
}

/**
 * Helper: Wait for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper: Generate unique session name for testing
 */
function generateSessionName(prefix: string, index: number): string {
  return `${prefix}-test-${index}-${Date.now()}`;
}

/**
 * TC-01: Two Concurrent Asks
 * 
 * Verifies basic parallel ask functionality with 2 assistants.
 */
async function testTwoConcurrentAsks(): Promise<TestResult> {
  const startTime = Date.now();
  const results: string[] = [];
  
  try {
    console.log('🧪 TC-01: Testing 2 concurrent asks...');
    
    // List available sessions first
    const sessions = await intercom({ action: 'list' });
    console.log('Available sessions:', sessions);
    
    // Find 2 assistant sessions (exclude self)
    // In real test, these would be actual session names
    const assistant1 = 'assistant-1'; // Replace with actual session name
    const assistant2 = 'assistant-2'; // Replace with actual session name
    
    // Execute concurrent asks
    const [reply1, reply2] = await Promise.all([
      intercom({ 
        action: 'ask', 
        to: assistant1, 
        message: 'TC-01: Status check 1' 
      }),
      intercom({ 
        action: 'ask', 
        to: assistant2, 
        message: 'TC-01: Status check 2' 
      })
    ]);
    
    results.push(`Reply from ${assistant1}: ${reply1}`);
    results.push(`Reply from ${assistant2}: ${reply2}`);
    
    return {
      name: 'TC-01: Two Concurrent Asks',
      passed: true,
      duration: Date.now() - startTime,
      details: results.join('\n')
    };
    
  } catch (error) {
    return {
      name: 'TC-01: Two Concurrent Asks',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * TC-02: Five Concurrent Asks
 * 
 * Verifies scalability to small team coordination (5 assistants).
 */
async function testFiveConcurrentAsks(): Promise<TestResult> {
  const startTime = Date.now();
  const results: string[] = [];
  
  try {
    console.log('🧪 TC-02: Testing 5 concurrent asks...');
    
    const assistants = [
      'assistant-1',
      'assistant-2',
      'assistant-3',
      'assistant-4',
      'assistant-5'
    ];
    
    const asks = assistants.map((assistant, index) => 
      intercom({ 
        action: 'ask', 
        to: assistant, 
        message: `TC-02: Status check ${index + 1}` 
      })
    );
    
    const replies = await Promise.all(asks);
    
    replies.forEach((reply, index) => {
      results.push(`Reply from ${assistants[index]}: ${reply}`);
    });
    
    return {
      name: 'TC-02: Five Concurrent Asks',
      passed: true,
      duration: Date.now() - startTime,
      details: results.join('\n')
    };
    
  } catch (error) {
    return {
      name: 'TC-02: Five Concurrent Asks',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * TC-03: Ten Concurrent Asks
 * 
 * Verifies scalability to large team coordination (10 assistants).
 */
async function testTenConcurrentAsks(): Promise<TestResult> {
  const startTime = Date.now();
  const results: string[] = [];
  
  try {
    console.log('🧪 TC-03: Testing 10 concurrent asks...');
    
    const assistants = Array.from({ length: 10 }, (_, i) => `assistant-${i + 1}`);
    
    const asks = assistants.map((assistant, index) => 
      intercom({ 
        action: 'ask', 
        to: assistant, 
        message: `TC-03: Status check ${index + 1}` 
      })
    );
    
    const replies = await Promise.all(asks);
    
    replies.forEach((reply, index) => {
      results.push(`Reply from ${assistants[index]}: ${reply}`);
    });
    
    return {
      name: 'TC-03: Ten Concurrent Asks',
      passed: true,
      duration: Date.now() - startTime,
      details: results.join('\n')
    };
    
  } catch (error) {
    return {
      name: 'TC-03: Ten Concurrent Asks',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * TC-04: Mixed Ask and Send
 * 
 * Verifies ask and send can coexist without interference.
 */
async function testMixedAskAndSend(): Promise<TestResult> {
  const startTime = Date.now();
  const results: string[] = [];
  
  try {
    console.log('🧪 TC-04: Testing mixed ask and send...');
    
    // Execute concurrent asks
    const askPromises = [
      intercom({ action: 'ask', to: 'assistant-1', message: 'TC-04: Ask 1' }),
      intercom({ action: 'ask', to: 'assistant-2', message: 'TC-04: Ask 2' })
    ];
    
    // Execute fire-and-forget sends
    const sendPromises = [
      intercom({ action: 'send', to: 'assistant-1', message: 'TC-04: Send 1' }),
      intercom({ action: 'send', to: 'assistant-2', message: 'TC-04: Send 2' }),
      intercom({ action: 'send', to: 'assistant-3', message: 'TC-04: Send 3' })
    ];
    
    // Wait for asks to complete
    const replies = await Promise.all(askPromises);
    replies.forEach((reply, index) => {
      results.push(`Reply from assistant-${index + 1}: ${reply}`);
    });
    
    // Wait for sends to complete
    await Promise.all(sendPromises);
    results.push('All send operations completed');
    
    return {
      name: 'TC-04: Mixed Ask and Send',
      passed: true,
      duration: Date.now() - startTime,
      details: results.join('\n')
    };
    
  } catch (error) {
    return {
      name: 'TC-04: Mixed Ask and Send',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * TC-05: Sequential Then Parallel
 * 
 * Verifies state management across multiple batches.
 */
async function testSequentialThenParallel(): Promise<TestResult> {
  const startTime = Date.now();
  const results: string[] = [];
  
  try {
    console.log('🧪 TC-05: Testing sequential → parallel → sequential...');
    
    // Batch 1: Sequential asks
    console.log('  Batch 1: Sequential asks...');
    for (let i = 1; i <= 3; i++) {
      const reply = await intercom({ 
        action: 'ask', 
        to: `assistant-${i}`, 
        message: `TC-05 Batch 1: Ask ${i}` 
      });
      results.push(`Batch 1, Ask ${i}: ${reply}`);
    }
    
    // Batch 2: Parallel asks
    console.log('  Batch 2: Parallel asks...');
    const parallelReplies = await Promise.all([
      intercom({ action: 'ask', to: 'assistant-1', message: 'TC-05 Batch 2: Ask 1' }),
      intercom({ action: 'ask', to: 'assistant-2', message: 'TC-05 Batch 2: Ask 2' }),
      intercom({ action: 'ask', to: 'assistant-3', message: 'TC-05 Batch 2: Ask 3' })
    ]);
    parallelReplies.forEach((reply, index) => {
      results.push(`Batch 2, Ask ${index + 1}: ${reply}`);
    });
    
    // Batch 3: Sequential asks again
    console.log('  Batch 3: Sequential asks...');
    for (let i = 1; i <= 3; i++) {
      const reply = await intercom({ 
        action: 'ask', 
        to: `assistant-${i}`, 
        message: `TC-05 Batch 3: Ask ${i}` 
      });
      results.push(`Batch 3, Ask ${i}: ${reply}`);
    }
    
    return {
      name: 'TC-05: Sequential Then Parallel',
      passed: true,
      duration: Date.now() - startTime,
      details: results.join('\n')
    };
    
  } catch (error) {
    return {
      name: 'TC-05: Sequential Then Parallel',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * TC-06: Timeout Handling
 * 
 * Verifies timeout behavior with concurrent asks.
 */
async function testTimeoutHandling(): Promise<TestResult> {
  const startTime = Date.now();
  const results: string[] = [];
  
  try {
    console.log('🧪 TC-06: Testing timeout handling...');
    
    // Note: This test requires one assistant to NOT reply
    // In practice, you'd either:
    // 1. Use a mock session that doesn't reply
    // 2. Use a real session but instruct it not to reply
    // 3. Use a session that's not monitoring intercom
    
    const asks = [
      intercom({ action: 'ask', to: 'assistant-1', message: 'TC-06: Ask 1 (will reply)' }),
      intercom({ action: 'ask', to: 'assistant-2', message: 'TC-06: Ask 2 (will reply)' }),
      intercom({ action: 'ask', to: 'assistant-3', message: 'TC-06: Ask 3 (NO REPLY - timeout test)' })
    ];
    
    const results = await Promise.allSettled(asks);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(`Ask ${index + 1}: Fulfilled - ${result.value}`);
      } else {
        results.push(`Ask ${index + 1}: Rejected - ${result.reason}`);
      }
    });
    
    // Verify: 2 fulfilled, 1 rejected (timeout)
    const fulfilled = results.filter(r => r.status === 'fulfilled').length;
    const rejected = results.filter(r => r.status === 'rejected').length;
    
    if (fulfilled === 2 && rejected === 1) {
      return {
        name: 'TC-06: Timeout Handling',
        passed: true,
        duration: Date.now() - startTime,
        details: results.join('\n')
      };
    } else {
      return {
        name: 'TC-06: Timeout Handling',
        passed: false,
        duration: Date.now() - startTime,
        error: `Expected 2 fulfilled + 1 rejected, got ${fulfilled} fulfilled + ${rejected} rejected`,
        details: results.join('\n')
      };
    }
    
  } catch (error) {
    return {
      name: 'TC-06: Timeout Handling',
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Main Test Runner
 */
async function runAllTests(): Promise<void> {
  console.log('🚀 Starting Concurrent Ask Test Harness\n');
  console.log('Configuration:', CONFIG);
  console.log('');
  
  const allResults: TestResult[] = [];
  
  // Run all test cases
  allResults.push(await testTwoConcurrentAsks());
  allResults.push(await testFiveConcurrentAsks());
  allResults.push(await testTenConcurrentAsks());
  allResults.push(await testMixedAskAndSend());
  allResults.push(await testSequentialThenParallel());
  allResults.push(await testTimeoutHandling());
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  allResults.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${index + 1}. ${result.name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Duration: ${result.duration}ms`);
    
    if (result.passed) {
      passed++;
      if (result.details) {
        console.log(`   Details: ${result.details.split('\n')[0]}...`);
      }
    } else {
      failed++;
      console.log(`   Error: ${result.error}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`SUMMARY: ${passed} passed, ${failed} failed, ${allResults.length} total`);
  console.log('='.repeat(60));
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Review errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

// Export for Jest or other test runners
export {
  testTwoConcurrentAsks,
  testFiveConcurrentAsks,
  testTenConcurrentAsks,
  testMixedAskAndSend,
  testSequentialThenParallel,
  testTimeoutHandling,
  runAllTests
};
