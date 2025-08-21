
import { describe, it, expect } from 'vitest';
import { formatYearBuilt } from '../utils/yearFormatter';

describe('Year Built Formatting', () => {
  it('should format year built without commas', () => {
    expect(formatYearBuilt(1987)).toBe('1987');
    expect(formatYearBuilt('1987')).toBe('1987');
    expect(formatYearBuilt('1,987')).toBe('1987');
    expect(formatYearBuilt(1987.5)).toBe('1987');
  });

  it('should handle edge cases', () => {
    expect(formatYearBuilt(null)).toBe('N/A');
    expect(formatYearBuilt(undefined)).toBe('N/A');
    expect(formatYearBuilt('')).toBe('N/A');
    expect(formatYearBuilt(1799)).toBe('N/A'); // Too old
    expect(formatYearBuilt(2050)).toBe('N/A'); // Too far in future
  });

  it('should match 4-digit year pattern', () => {
    const result = formatYearBuilt(1987);
    expect(result).toMatch(/^\d{4}$/);
    expect(result).not.toContain(',');
  });
});
