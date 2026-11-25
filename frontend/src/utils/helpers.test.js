import { describe, it, expect } from 'vitest';
import { grade, prevClassLabel, buildPrevPerf } from './helpers';

describe('grade()', () => {
  it('maps percentages to the right letter at each boundary', () => {
    expect(grade(95).letter).toBe('A+');
    expect(grade(90).letter).toBe('A+');
    expect(grade(89).letter).toBe('A');
    expect(grade(80).letter).toBe('A');
    expect(grade(79).letter).toBe('B');
    expect(grade(70).letter).toBe('B');
    expect(grade(69).letter).toBe('C');
    expect(grade(60).letter).toBe('C');
    expect(grade(59).letter).toBe('D');
    expect(grade(45).letter).toBe('D');
    expect(grade(44).letter).toBe('F');
    expect(grade(0).letter).toBe('F');
  });

  it('always returns a color and background', () => {
    const g = grade(85);
    expect(g.color).toBeTruthy();
    expect(g.bg).toBeTruthy();
  });
});

describe('prevClassLabel()', () => {
  it('returns the grade one below the given class', () => {
    expect(prevClassLabel('10A')).toBe('9th');
    expect(prevClassLabel('9B')).toBe('8th');
    expect(prevClassLabel('8A')).toBe('7th');
  });

  it('returns empty string for a non-numeric class', () => {
    expect(prevClassLabel('')).toBe('');
    expect(prevClassLabel('Nursery')).toBe('');
  });
});

describe('buildPrevPerf()', () => {
  it('combines the previous class and percentage', () => {
    expect(buildPrevPerf('10A', '85')).toBe('9th - 85%');
    expect(buildPrevPerf('8B', 72)).toBe('7th - 72%');
  });

  it('returns empty when no percentage is given', () => {
    expect(buildPrevPerf('10A', '')).toBe('');
    expect(buildPrevPerf('10A', null)).toBe('');
  });
});
