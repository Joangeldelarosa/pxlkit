import type { PxlKitData } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates a PxlKitData object for correctness.
 *
 * Checks:
 * - Grid has exactly `size` rows
 * - Each row has exactly `size` characters
 * - All non-"." characters in the grid have a corresponding palette entry
 * - Name is non-empty kebab-case
 * - Palette values are valid hex colors
 *
 * @param icon - The icon data to validate
 * @returns Array of validation errors (empty = valid)
 */
export function validateIconData(icon: PxlKitData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Name check
  if (!icon.name || !/^[a-z][a-z0-9-]*$/.test(icon.name)) {
    errors.push({
      field: 'name',
      message: 'Name must be non-empty kebab-case (e.g., "trophy", "fire-sword")',
    });
  }

  // Size check
  const VALID_SIZES = [8, 16, 24, 32, 48, 64];
  if (!VALID_SIZES.includes(icon.size)) {
    errors.push({
      field: 'size',
      message: `Size must be one of ${VALID_SIZES.join(', ')}. Got: ${icon.size}`,
    });
  }

  // Grid row count
  if (icon.grid.length !== icon.size) {
    errors.push({
      field: 'grid',
      message: `Grid must have exactly ${icon.size} rows. Got: ${icon.grid.length}`,
    });
  }

  // Grid row lengths & character validation
  const usedChars = new Set<string>();
  for (let y = 0; y < icon.grid.length; y++) {
    const row = icon.grid[y];
    if (row.length !== icon.size) {
      errors.push({
        field: `grid[${y}]`,
        message: `Row ${y} must have ${icon.size} characters. Got: ${row.length}`,
      });
    }
    for (const char of row) {
      if (char !== '.') {
        usedChars.add(char);
      }
    }
  }

  // Check all used chars have palette entries
  for (const char of usedChars) {
    if (!icon.palette[char]) {
      errors.push({
        field: 'palette',
        message: `Character "${char}" used in grid but missing from palette`,
      });
    }
  }

  // Validate palette hex colors — supports #RGB, #RRGGBB, and #RRGGBBAA
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  for (const [key, value] of Object.entries(icon.palette)) {
    if (key === '.') {
      errors.push({
        field: 'palette',
        message: '"." is reserved for transparent and should not appear in palette',
      });
    }
    if (key.length !== 1) {
      errors.push({
        field: `palette.${key}`,
        message: `Palette key must be a single character. Got: "${key}"`,
      });
    }
    if (!hexPattern.test(value)) {
      errors.push({
        field: `palette.${key}`,
        message: `Invalid hex color: "${value}". Expected #RGB, #RRGGBB, or #RRGGBBAA`,
      });
    }
    // Warn about fully transparent palette entries (alpha = 00)
    if (value.length === 9) {
      const alpha = value.slice(7, 9).toLowerCase();
      if (alpha === '00') {
        errors.push({
          field: `palette.${key}`,
          message: `Palette entry "${key}" has 0 opacity (#...00). Use "." for transparent pixels instead`,
        });
      }
    }
  }

  // Category check
  if (!icon.category || icon.category.trim().length === 0) {
    errors.push({
      field: 'category',
      message: 'Category must be non-empty',
    });
  }

  return errors;
}

/**
 * Returns true if the icon data is valid.
 */
export function isValidIconData(icon: PxlKitData): boolean {
  return validateIconData(icon).length === 0;
}
