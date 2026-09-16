import { getOpenStatus } from './opening-hours';

function at(dayOffset: number, hours: number, minutes: number): Date {
  const d = new Date(2024, 0, 1 + dayOffset, hours, minutes);
  return d;
}

describe('getOpenStatus', () => {
  it('boş və ya olmayan sahə üçün unknown qaytarır', () => {
    expect(getOpenStatus(null)).toBe('unknown');
    expect(getOpenStatus(undefined)).toBe('unknown');
    expect(getOpenStatus('')).toBe('unknown');
  });

  it('24/7 həmişə open qaytarır', () => {
    expect(getOpenStatus('24/7', at(0, 3, 0))).toBe('open');
    expect(getOpenStatus('24/7', at(5, 23, 59))).toBe('open');
  });

  it('adi gün aralığı və saat aralığını düzgün oxuyur', () => {
    const hours = 'Mo-Fr 09:00-18:00';
    expect(getOpenStatus(hours, at(0, 10, 0))).toBe('open');
    expect(getOpenStatus(hours, at(0, 8, 59))).toBe('closed');
    expect(getOpenStatus(hours, at(5, 10, 0))).toBe('closed');
  });

  it('sonrakı qayda əvvəlkini üstələyir (Mo off nümunəsi)', () => {
    const hours = 'Mo-Su 09:00-22:00; Mo off';
    expect(getOpenStatus(hours, at(0, 12, 0))).toBe('closed');
    expect(getOpenStatus(hours, at(1, 12, 0))).toBe('open');
  });

  it('gecəni keçən saat aralığını (overnight) düzgün oxuyur', () => {
    const hours = 'Fr 22:00-02:00';
    expect(getOpenStatus(hours, at(4, 23, 30))).toBe('open');
    expect(getOpenStatus(hours, at(5, 1, 0))).toBe('open');
    expect(getOpenStatus(hours, at(5, 10, 0))).toBe('closed');
  });

  it('vergüllə ayrılmış bir neçə saat aralığını dəstəkləyir', () => {
    const hours = 'Mo-Fr 08:00-12:00,13:00-20:00';
    expect(getOpenStatus(hours, at(0, 12, 30))).toBe('closed');
    expect(getOpenStatus(hours, at(0, 14, 0))).toBe('open');
  });

  it('tanımadığı formatda unknown qaytarır (səhv təxmin etmir)', () => {
    expect(getOpenStatus('PH off')).toBe('unknown');
    expect(getOpenStatus('sunrise-sunset')).toBe('unknown');
  });
});
