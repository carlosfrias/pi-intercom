/**
 * Auto-Reply Worker for pi-intercom Live Testing
 * 
 * This script runs INSIDE a pi session and automatically replies to incoming asks.
 * Use this for automated parallel ask testing.
 * 
 * Usage: Copy/paste this code into each worker pi session
 * 
 * Note: intercom is provided globally by pi at runtime
 */

declare const intercom: (options: any) => Promise<any>;

// Worker configuration
const WORKER_ID = process.env.PI_WORKER_ID || 'worker-' + Math.random().toString(36).slice(2, 8);
const AUTO_REPLY_DELAY_MS = 500; // Simulate processing time
const VERBOSE = true;

interface IntercomMessage {
  action: string;
  from?: string;
  to?: string;
  message?: string;
  replyTo?: string;
}

// Track pending asks for this session
const pendingAsks = new Map<string, {
  from: string;
  message: string;
  timestamp: number;
}>();

/**
 * Auto-reply to incoming asks
 */
async function handleIncomingAsk(from: string, message: string, replyTo: string): Promise<void> {
  if (VERBOSE) {
    console.log(`\n📨 Received ask from ${from}:`);
    console.log(`   Message: ${message}`);
    console.log(`   ReplyTo: ${replyTo}`);
  }
  
  // Track the ask
  pendingAsks.set(replyTo, {
    from,
    message,
    timestamp: Date.now(),
  });
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, AUTO_REPLY_DELAY_MS));
  
  // Generate auto-reply
  const reply = `[${WORKER_ID}] Auto-reply: Received "${message.slice(0, 50)}..."`;
  
  if (VERBOSE) {
    console.log(`\n📤 Sending reply to ${from}:`);
    console.log(`   Reply: ${reply}`);
  }
  
  try {
    const result = await intercom({
      action: 'reply',
      message: reply,
    });
    
    if (VERBOSE) {
      console.log(`   ✅ Reply sent successfully`);
    }
    
    // Clean up
    pendingAsks.delete(replyTo);
    
  } catch (error) {
    console.error(`   ❌ Reply failed:`, error);
  }
}

/**
 * Monitor for incoming asks by periodically checking pending status
 * 
 * Note: In a real pi session, asks arrive as tool calls, not messages.
 * This is a simplified auto-reply for testing.
 */
async function startAutoReplyWorker(): Promise<void> {
  console.log(`\n🤖 Auto-Reply Worker Started`);
  console.log(`   Worker ID: ${WORKER_ID}`);
  console.log(`   Auto-reply delay: ${AUTO_REPLY_DELAY_MS}ms`);
  console.log(`   Verbose: ${VERBOSE}`);
  console.log(`\n   This worker will automatically reply to incoming asks.`);
  console.log(`   Press Ctrl+C to stop.\n`);
  
  // List sessions to verify connectivity
  try {
    const sessions = await intercom({ action: 'list' });
    console.log('📋 Connected sessions:');
    if (sessions && sessions.sessions) {
      sessions.sessions.forEach((s: any) => {
        console.log(`   - ${s.name || s.id} (${s.status || 'unknown'})`);
      });
    } else {
      console.log('   (No sessions listed)');
    }
  } catch (error) {
    console.error('❌ Failed to list sessions:', error);
  }
  
  console.log('\n✅ Worker ready. Waiting for asks...\n');
}

// Start the worker
startAutoReplyWorker().catch(console.error);

// Export for potential reuse
export { handleIncomingAsk, startAutoReplyWorker, WORKER_ID };
