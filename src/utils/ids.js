export function generateTrackingCode() {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OD11-${year}-${randomStr}`;
}