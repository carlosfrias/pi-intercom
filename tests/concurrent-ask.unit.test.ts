/**
 * Unit Test: Concurrent Ask Map Implementation
 */

interface PendingAsk {
  from: string;
  replyTo: string;
  resolve: (message: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

const pendingAsks = new Map<string, PendingAsk>();

function simulateWaitForReply(from: string, replyTo: string, timeoutMs: number = 1000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingAsks.delete(replyTo);  // Clean up on timeout
      reject(new Error(`Timeout`));
    }, timeoutMs);
    
    pendingAsks.set(replyTo, {
      from,
      replyTo,
      resolve: (msg) => {
        clearTimeout(timeout);
        pendingAsks.delete(replyTo);
        resolve(msg);
      },
      reject: (err) => {
        clearTimeout(timeout);
        pendingAsks.delete(replyTo);
        reject(err);
      },
      timeout,
    });
  });
}

function simulateReply(replyTo: string, message: any): boolean {
  const pendingAsk = pendingAsks.get(replyTo);
  if (pendingAsk) {
    pendingAsk.resolve(message);
    return true;
  }
  return false;
}

async function testTwoConcurrentAsks(): Promise<boolean> {
  console.log('🧪 TC-01: Testing 2 concurrent asks...');
  const id1 = 'ask-1-' + Date.now();
  const id2 = 'ask-2-' + Date.now();
  
  const p1 = simulateWaitForReply('session-1', id1, 2000);
  const p2 = simulateWaitForReply('session-2', id2, 2000);
  
  if (pendingAsks.size !== 2) {
    console.error('❌ TC-01 FAIL: Expected 2 pending asks, got', pendingAsks.size);
    return false;
  }
  
  setTimeout(() => simulateReply(id1, { from: 'session-1', content: 'reply1' }), 100);
  setTimeout(() => simulateReply(id2, { from: 'session-2', content: 'reply2' }), 100);
  
  const [r1, r2] = await Promise.all([p1, p2]);
  
  if (r1.content === 'reply1' && r2.content === 'reply2' && pendingAsks.size === 0) {
    console.log('✅ TC-01 PASS: Both asks resolved, Map cleaned');
    return true;
  } else {
    console.error('❌ TC-01 FAIL');
    return false;
  }
}

async function testFiveConcurrentAsks(): Promise<boolean> {
  console.log('🧪 TC-02: Testing 5 concurrent asks...');
  const promises = [];
  const ids = [];
  
  for (let i = 0; i < 5; i++) {
    const id = 'ask-' + i + '-' + Date.now();
    ids.push(id);
    promises.push(simulateWaitForReply('session-' + i, id, 2000));
  }
  
  if (pendingAsks.size !== 5) {
    console.error('❌ TC-02 FAIL: Expected 5 pending asks, got', pendingAsks.size);
    return false;
  }
  
  ids.forEach((id, i) => {
    setTimeout(() => simulateReply(id, { from: 'session-' + i, content: 'reply' + i }), 100);
  });
  
  const results = await Promise.all(promises);
  
  if (results.length === 5 && pendingAsks.size === 0) {
    console.log('✅ TC-02 PASS: All 5 asks resolved');
    return true;
  } else {
    console.error('❌ TC-02 FAIL');
    return false;
  }
}

async function testTenConcurrentAsks(): Promise<boolean> {
  console.log('🧪 TC-03: Testing 10 concurrent asks...');
  const promises = [];
  const ids = [];
  
  for (let i = 0; i < 10; i++) {
    const id = 'ask-' + i + '-' + Date.now();
    ids.push(id);
    promises.push(simulateWaitForReply('session-' + i, id, 2000));
  }
  
  if (pendingAsks.size !== 10) {
    console.error('❌ TC-03 FAIL: Expected 10 pending asks, got', pendingAsks.size);
    return false;
  }
  
  ids.forEach((id, i) => {
    setTimeout(() => simulateReply(id, { from: 'session-' + i, content: 'reply' + i }), 100);
  });
  
  const results = await Promise.all(promises);
  
  if (results.length === 10 && pendingAsks.size === 0) {
    console.log('✅ TC-03 PASS: All 10 asks resolved');
    return true;
  } else {
    console.error('❌ TC-03 FAIL');
    return false;
  }
}

async function testTimeoutIsolation(): Promise<boolean> {
  console.log('🧪 TC-06: Testing timeout isolation...');
  const id1 = 'ask-timeout-' + Date.now();
  const id2 = 'ask-normal-' + Date.now();
  const id3 = 'ask-normal2-' + Date.now();
  
  const p1 = simulateWaitForReply('session-timeout', id1, 500);
  const p2 = simulateWaitForReply('session-normal', id2, 2000);
  const p3 = simulateWaitForReply('session-normal2', id3, 2000);
  
  if (pendingAsks.size !== 3) {
    console.error('❌ TC-06 FAIL: Expected 3 pending asks');
    return false;
  }
  
  setTimeout(() => simulateReply(id2, { content: 'ok' }), 100);
  setTimeout(() => simulateReply(id3, { content: 'ok' }), 100);
  
  const results = await Promise.allSettled([p1, p2, p3]);
  
  const timeoutFailed = results[0].status === 'rejected';
  const othersPassed = results[1].status === 'fulfilled' && results[2].status === 'fulfilled';
  
  // Wait for timeout to clean up
  await new Promise(r => setTimeout(r, 600));
  
  if (timeoutFailed && othersPassed && pendingAsks.size === 0) {
    console.log('✅ TC-06 PASS: Timeout isolated, other asks resolved, Map cleaned');
    return true;
  } else {
    console.error('❌ TC-06 FAIL: size=', pendingAsks.size, 'results=', results);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting concurrent ask unit tests...\n');
  
  const results = [];
  results.push(await testTwoConcurrentAsks());
  results.push(await testFiveConcurrentAsks());
  results.push(await testTenConcurrentAsks());
  results.push(await testTimeoutIsolation());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.error('❌ Some tests failed');
    process.exit(1);
  }
}

runAllTests();
