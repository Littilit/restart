export function samePersonByName(a: string, b: string): boolean {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (na === nb) return true;
  const [shorter, longer] = na.length <= nb.length ? [na, nb] : [nb, na];
  return shorter.length >= 3 && longer.includes(shorter);
}
