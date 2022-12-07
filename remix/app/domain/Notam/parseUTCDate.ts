import parse from 'date-fns/parse';
import { zonedTimeToUtc } from 'date-fns-tz';

export const parseUTCDate = (s: string, format: string, baseDate: Date) => {
    const parsedDate = parse(s.replace(/\s+/g, ' '), format, baseDate);
    return zonedTimeToUtc(parsedDate, 'UTC');
};
