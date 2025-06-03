export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  let seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34524, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year']
  ];

  let i = 0;
  while (seconds >= intervals[i][0] && i < intervals.length - 1) {
    seconds /= intervals[i][0];
    i++;
  }

  const value = Math.floor(seconds);
  const unit = intervals[i][1];
  return `${value} ${unit}${value !== 1 ? 's' : ''} ago`;
}
