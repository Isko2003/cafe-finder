export type OpenStatus = 'open' | 'closed' | 'unknown';

const DAY_CODES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const;

function toMondayFirstIndex(jsDay: number): number {
  return (jsDay + 6) & 7;
}

function parseDayToken(token: string): number[] | null {
  const days: number[] = [];

  for (const part of token.split(',')) {
    const [fromRaw, toRaw] = part.split('-');
    const from = DAY_CODES.indexOf(fromRaw as (typeof DAY_CODES)[number]);
    if (from === -1) return null;

    if (!toRaw) {
      days.push(from);
      continue;
    }

    const to = DAY_CODES.indexOf(toRaw as (typeof DAY_CODES)[number]);
    if (to === -1) return null;

    if (from <= to) {
      for (let i = from; i <= to; i++) days.push(i);
    } else {
      for (let i = from; i <= 6; i++) days.push(i);
      for (let i = 0; i <= to; i++) days.push(i);
    }
  }

  return [...new Set(days)];
}

interface TimeRange {
  startMinutes: number;
  endMinutes: number;
}

function parseTimeRanges(timePart: string): TimeRange[] | null {
  const ranges: TimeRange[] = [];

  for (const piece of timePart.split(',')) {
    const match = piece.trim().match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
    if (!match) return null;

    const [, h1, m1, h2, m2] = match;
    const startMinutes = Number(h1) * 60 + Number(m1);
    let endMinutes = Number(h2) * 60 + Number(m2);

    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    ranges.push({ startMinutes, endMinutes });
  }

  return ranges;
}

interface DayRule {
  days: number[];
  isClosed: boolean;
  ranges: TimeRange[];
}

const DAY_TOKEN_PATTERN =
  /^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:,(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)\s+(.*)$/;

function parseSegment(segment: string): DayRule | null {
  const trimmed = segment.trim();
  if (!trimmed || trimmed.includes('PH') || trimmed.includes('SH')) return null;

  const dayMatch = trimmed.match(DAY_TOKEN_PATTERN);
  const dayToken = dayMatch ? dayMatch[1] : null;
  const timePart = dayMatch ? dayMatch[2] : trimmed;

  const days = dayToken ? parseDayToken(dayToken) : [0, 1, 2, 3, 4, 5, 6];
  if (!days) return null;

  if (timePart.toLowerCase() === 'off' || timePart.toLowerCase() === 'closed') {
    return { days, isClosed: true, ranges: [] };
  }

  const ranges = parseTimeRanges(timePart);
  if (!ranges) return null;

  return { days, isClosed: false, ranges };
}

function isMinuteInRange(minutes: number, range: TimeRange): boolean {
  return minutes >= range.startMinutes && minutes < range.endMinutes;
}

export function getOpenStatus(raw: string | null | undefined, now: Date = new Date()): OpenStatus {
  if (!raw || !raw.trim()) return 'unknown';

  const trimmed = raw.trim();
  if (trimmed === '24/7') return 'open';

  const segments = trimmed.split(';');
  const rules = segments.map(parseSegment);

  if (rules.every((rule) => rule === null)) return 'unknown';

  const todayIndex = toMondayFirstIndex(now.getDay());
  const yesterdayIndex = (todayIndex + 6) % 7;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let status: OpenStatus = 'unknown';

  for (const rule of rules) {
    if (!rule || rule.isClosed || !rule.days.includes(yesterdayIndex)) continue;
    const carriesOver = rule.ranges.some(
      (r) => r.endMinutes > 24 * 60 && nowMinutes < r.endMinutes - 24 * 60,
    );
    if (carriesOver) status = 'open';
  }

  for (const rule of rules) {
    if (!rule || !rule.days.includes(todayIndex)) continue;

    if (rule.isClosed) {
      status = 'closed';
      continue;
    }

    status = rule.ranges.some((r) => isMinuteInRange(nowMinutes, r)) ? 'open' : 'closed';
  }

  return status;
}
