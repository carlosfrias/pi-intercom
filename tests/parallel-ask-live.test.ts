/**
 * Live Parallel Ask Test - 3 Agent Team
 * 
 * Tests concurrent intercom({ action: "ask", ... }) calls
 * with 3 actual pi sessions running in tmux.
 * 
 * Run with: tsx tests/parallel-ask-live.test.ts
 * 
 * Note: intercom is a global tool provided by pi at runtime
 */

// intercom is provided globally by pi extension
declare const intercom: (options: any) => Promise<any>;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testParallelAsk3Agents(): Promise<void> {
  console.log('🧪 Starting 3-agent parallel ask test...\n');
  
  // List available sessions
  console.log('Step 1: Listing sessions...');
  const sessions = await intercom({ action: 'list' });
  console.log('Available sessions:', JSON.stringify(sessions, null, 2));
  
  // Verify all 3 assistants are available
  const assistantNames = ['assistant-1', 'assistant-2', 'assistant-3'];
  const availableSessions = (sessions as any).sessions || [];
  
  for (const name of assistantNames) {
    const found = availableSessions.find((s: any) => s.name === name);
    if (!found) {
      console.warn(`⚠️  Warning: ${name} not found in session list`);
    } else {
      console.log(`✅ Found: ${name} (status: ${found.status})`);
    }
  }
  
  console.log('\nStep 2: Sending parallel asks to all 3 assistants...\n');
  
  const startTime = Date.now();
  
  // Send parallel asks to all 3 assistants
  const askPromises = assistantNames.map((name, index) => 
    intercom({ 
      action: 'ask', 
      to: name, 
      message: `Parallel Test: Assistant ${index + 1}, what is your status?` 
    }).then(reply => ({
      assistant: name,
      reply,
      success: true,
      duration: Date.now() - startTime
    })).catch(error => ({
      assistant: name,
      error: error instanceof Error ? error.message : String(error),
      success: false,
      duration: Date.now() - startTime
    }))
  );
  
  const results = await Promise.all(askPromises);
  const totalTime = Date.now() - startTime;
  
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  results.forEach((result, index) => {
    if (result.success) {
      passed++;
      console.log(`\n✅ ${result.assistant}: ${result.reply}`);
      console.log(`   Response time: ${result.duration}ms`);
    } else {
      failed++;
      console.log(`\n❌ ${result.assistant}: FAILED`);
      console.log(`   Error: ${result.error}`);
      console.log(`   Time: ${result.duration}ms`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`Total time: ${totalTime}ms`);
  console.log('='.repeat(60));
  
  if (failed > 0) {
    console.log('\n❌ Test FAILED - Some asks did not complete successfully');
    process.exit(1);
  } else {
    console.log('\n✅ Test PASSED - All 3 parallel asks completed!');
    process.exit(0);
  }
}

// Run test
testParallelAsk3Agents().catch(error => {
  console.error('Test crashed:', error);
  process.exit(1);
});
