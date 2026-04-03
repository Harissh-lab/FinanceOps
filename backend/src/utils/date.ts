export function monthLabel(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function lastNMonths(count: number): string[] {
  const now = new Date();
  const labels: string[] = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(monthLabel(d));
  }

  return labels;
}
