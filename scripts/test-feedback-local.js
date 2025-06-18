#!/usr/bin/env node

// Test script to simulate feedback submission locally
// Run with: node scripts/test-feedback-local.js

const testFeedback = {
  id: `test-${Date.now()}`,
  originalWord: 'hello',
  currentTransformation: 'HEH-LOH',
  suggestedTransformation: 'HEL-LO',
  intensity: 5,
  context: 'singing',
  reason: 'Testing locally',
  timestamp: new Date().toISOString()
};

console.log('🧪 Testing feedback submission locally...');
console.log('📝 Test feedback data:', testFeedback);

// Simulate localStorage storage
const storedFeedback = [];
storedFeedback.push(testFeedback);

console.log('✅ Feedback would be stored in localStorage:');
console.log(JSON.stringify(storedFeedback, null, 2));

console.log('\n📋 To test in browser:');
console.log('1. Go to http://localhost:4062');
console.log('2. Submit feedback through the UI');
console.log('3. Check DevTools → Application → Local Storage → vtt_feedback');
console.log('4. Visit /admin/feedback to see stored feedback');

console.log('\n🔄 To restore production API:');
console.log('Uncomment NEXT_PUBLIC_FEEDBACK_API_ENDPOINT in .env file');