// Pure, framework-free helpers shared across pages — easy to unit test.

// Letter grade + colors from a percentage (0–100).
export function grade(pct) {
  if (pct >= 90) return { letter:'A+', color:'#1b5e20', bg:'#e8f5e9' };
  if (pct >= 80) return { letter:'A',  color:'#2e7d32', bg:'#f1f8e9' };
  if (pct >= 70) return { letter:'B',  color:'#1565c0', bg:'#e3f2fd' };
  if (pct >= 60) return { letter:'C',  color:'#e65100', bg:'#fff3e0' };
  if (pct >= 45) return { letter:'D',  color:'#b71c1c', bg:'#fce4ec' };
  return                 { letter:'F',  color:'#c62828', bg:'#ffebee' };
}

// The grade a student came from, derived from the class they're joining.
// "10A" -> "9th", "8B" -> "7th". Non-numeric classes -> "".
export function prevClassLabel(className) {
  const num = parseInt(className);
  return isNaN(num) ? '' : `${num - 1}th`;
}

// Build the stored "previous performance" string from class + percentage.
export function buildPrevPerf(className, pct) {
  if (!pct) return '';
  return `${prevClassLabel(className)} - ${pct}%`;
}
