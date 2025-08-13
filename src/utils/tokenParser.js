import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tokensPath = join(__dirname, '..', 'tokens.json');
const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));

/**
 * Recursively extracts color values from the tokens object
 * @param {Object} obj - The object to traverse
 * @param {string} prefix - The current path prefix
 * @returns {Object} - Flattened color object
 */
function extractColors(obj, prefix = '') {
  const colors = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}-${key}` : key;
    
    if (value && typeof value === 'object' && '$value' in value) {
      // This is a token with a value
      if (value.$type === 'color') {
        colors[currentPath] = value.$value;
      }
    } else if (value && typeof value === 'object' && !('$type' in value)) {
      // Recursively traverse nested objects (but not token objects)
      Object.assign(colors, extractColors(value, currentPath));
    }
  }
  
  return colors;
}

/**
 * Extracts spacing values from the tokens
 * @param {Object} tokens - The tokens object
 * @returns {Object} - Spacing object
 */
function extractSpacing(tokens) {
  const spacing = {};
  
  // Extract from Space/Mode 1
  if (tokens['Space/Mode 1']) {
    for (const [key, value] of Object.entries(tokens['Space/Mode 1'])) {
      if (value && typeof value === 'object' && '$value' in value) {
        spacing[key] = resolveTokenReferences(value.$value, tokens);
      }
    }
  }
  
  // Also extract from dimensions for additional spacing values
  if (tokens['Core/Mode 1']?.dimensions) {
    for (const [key, value] of Object.entries(tokens['Core/Mode 1'].dimensions)) {
      if (value && typeof value === 'object' && '$value' in value) {
        spacing[key] = resolveTokenReferences(value.$value, tokens);
      }
    }
  }
  
  return spacing;
}

/**
 * Extracts typography values from the tokens
 * @param {Object} tokens - The tokens object
 * @returns {Object} - Typography object with fontFamily, fontSize, fontWeight, lineHeight
 */
function extractTypography(tokens) {
  const typography = {
    fontFamily: {},
    fontSize: {},
    fontWeight: {},
    lineHeight: {},
    letterSpacing: {}
  };
  
  // Extract font family
  if (tokens['Core/Mode 1']?.typography?.['font-family']) {
    for (const [key, value] of Object.entries(tokens['Core/Mode 1'].typography['font-family'])) {
      if (value && typeof value === 'object' && '$value' in value) {
        typography.fontFamily[key] = value.$value;
      }
    }
  }
  
  // Extract font weights
  if (tokens['Core/Mode 1']?.typography?.['font-weight']) {
    for (const [key, value] of Object.entries(tokens['Core/Mode 1'].typography['font-weight'])) {
      if (value && typeof value === 'object' && '$value' in value) {
        // Convert rem to numeric value for Tailwind
        const weightValue = parseFloat(value.$value.replace('rem', ''));
        typography.fontWeight[key] = weightValue * 16; // Convert rem to px equivalent
      }
    }
  }
  
  // Extract from Typography/Desktop for font sizes and line heights
  if (tokens['Typography/Desktop']) {
    for (const [key, value] of Object.entries(tokens['Typography/Desktop'])) {
      if (value && typeof value === 'object') {
        if (value['font-size'] && value['font-size'].$value) {
          typography.fontSize[key] = resolveTokenReferences(value['font-size'].$value, tokens);
        }
        if (value['line-height'] && value['line-height'].$value) {
          typography.lineHeight[key] = resolveTokenReferences(value['line-height'].$value, tokens);
        }
        if (value['letter-spacing'] && value['letter-spacing'].$value) {
          typography.letterSpacing[key] = resolveTokenReferences(value['letter-spacing'].$value, tokens);
        }
      }
    }
  }
  
  return typography;
}

/**
 * Resolves token references like {dimensions.8} to actual values
 * @param {string} value - The value that may contain references
 * @param {Object} tokens - The tokens object for resolution
 * @param {number} depth - Current recursion depth to prevent infinite loops
 * @returns {string} - Resolved value
 */
function resolveTokenReferences(value, tokens, depth = 0) {
  if (typeof value !== 'string' || depth > 10) return value; // Prevent infinite recursion
  
  // Match patterns like {dimensions.8} or {color.neutral.white}
  const referencePattern = /\{([^}]+)\}/g;
  
  return value.replace(referencePattern, (match, path) => {
    const keys = path.split('.');
    let current = tokens;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return match; // Return original if path not found
      }
    }
    
    // If we found a token object, extract its value and resolve any nested references
    if (current && typeof current === 'object' && '$value' in current) {
      const resolvedValue = resolveTokenReferences(current.$value, tokens, depth + 1);
      return resolvedValue;
    }
    
    return match; // Return original if not a token
  });
}

/**
 * Extracts border radius values from the tokens
 * @param {Object} tokens - The tokens object
 * @returns {Object} - Border radius object
 */
function extractBorderRadius(tokens) {
  const borderRadius = {};
  
  if (tokens['Border/Mode 1']?.radius) {
    for (const [key, value] of Object.entries(tokens['Border/Mode 1'].radius)) {
      if (value && typeof value === 'object' && '$value' in value) {
        borderRadius[key] = resolveTokenReferences(value.$value, tokens);
      }
    }
  }
  
  return borderRadius;
}

/**
 * Extracts shadow values from the tokens
 * @param {Object} tokens - The tokens object
 * @returns {Object} - Shadow object
 */
function extractShadows(tokens) {
  const shadows = {};
  
  if (tokens['Shadow/Mode 1']) {
    for (const [key, value] of Object.entries(tokens['Shadow/Mode 1'])) {
      if (value && typeof value === 'object') {
        const x = value.x?.$value || '0';
        const y = value.y?.$value || '0';
        const blur = value.blur?.$value || '0';
        const spread = value.spread?.$value || '0';
        const color = value.color?.$value || '#000000';
        
        shadows[key] = `${x} ${y} ${blur} ${spread} ${color}`;
      }
    }
  }
  
  return shadows;
}

/**
 * Main function to parse all tokens and return Tailwind-compatible theme object
 * @returns {Object} - Tailwind theme configuration
 */
export function parseTokens() {
  const colors = extractColors(tokens);
  const spacing = extractSpacing(tokens);
  const typography = extractTypography(tokens);
  const borderRadius = extractBorderRadius(tokens);
  const boxShadow = extractShadows(tokens);
  
  // Create a more comprehensive color mapping
  const colorMapping = {
    // Core colors
    ...colors,
    
    // Semantic color mappings for easier use
    'background-default': colors['background-default'] || '#ffffff',
    'background-surface': colors['background-surface'] || '#f8f8f8',
    'background-surface-hover': colors['background-surface-hover'] || '#ffffff',
    'background-surface-disabled': colors['background-surface-disabled'] || '#7a738c',
    'background-subtle': colors['background-subtle'] || '#d5d4dc',
    'background-brand-brand-primary': colors['background-brand-brand-primary'] || '#eb4c6f',
    'background-brand-brand-primary-hover': colors['background-brand-brand-primary-hover'] || '#df345a',
    'background-brand-brand-primary-active': colors['background-brand-brand-primary-active'] || '#b51739',
    'background-brand-brand-primary-focus': colors['background-brand-brand-primary-focus'] || '#ffcb08',
    
    'content-default': colors['content-default'] || '#000000',
    'content-subtle': colors['content-subtle'] || '#6c6c6c',
    'content-disabled': colors['content-disabled'] || '#7a738c',
    'content-knockout': colors['content-knockout'] || '#ffffff',
    
    'border-default': colors['border-default'] || '#d5d4dc',
    'border-strong': colors['border-strong'] || '#000000',
    'border-focus': colors['border-focus'] || '#ffcb08',
    'border-utility-deactivated': colors['border-utility-deactivated'] || '#7a738c',
  };
  
  return {
    colors: colorMapping,
    spacing,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
    letterSpacing: typography.letterSpacing,
    borderRadius,
    boxShadow
  };
}

export default parseTokens;
