import { parseTokens } from './tokenParser.js';

// Test the token parser
const tokens = parseTokens();

console.log('Parsed Tokens:');
console.log('Colors:', Object.keys(tokens.colors).slice(0, 10)); // Show first 10 colors
console.log('Spacing:', Object.keys(tokens.spacing).slice(0, 10)); // Show first 10 spacing values
console.log('Font Sizes:', Object.keys(tokens.fontSize).slice(0, 5)); // Show first 5 font sizes
console.log('Border Radius:', Object.keys(tokens.borderRadius));
console.log('Shadows:', Object.keys(tokens.boxShadow));

// Test specific token values
console.log('\nSample Token Values:');
console.log('Primary background:', tokens.colors['background-brand-brand-primary']);
console.log('Default text color:', tokens.colors['content-default']);
console.log('Medium spacing:', tokens.spacing['24']);
console.log('Small border radius:', tokens.borderRadius['sm']);

export default tokens;
