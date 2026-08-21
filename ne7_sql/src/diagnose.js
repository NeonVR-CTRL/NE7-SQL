console.log('🔍 Diagnosing ESM initialization chain...\n');
try {
  const main = await import('./main.js');
  console.log('✅ SUCCESS! main.js loaded. Exports:', Object.keys(main));
} catch (e) {
  console.error('❌ FATAL ERROR in main.js or its dependencies:');
  console.error(e.stack || e);
}
