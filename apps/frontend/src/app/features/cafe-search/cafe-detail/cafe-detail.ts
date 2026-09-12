import { Component, computed, input, output } from '@angular/core';
import { Cafe } from '../../../core/cafes/cafe.model';

@Component({
  imports: [],
  selector: 'app-cafe-detail',
  styleUrl: './cafe-detail.css',
  templateUrl: './cafe-detail.html',
})
export class CafeDetail {
  cafe = input<Cafe | null>(null);

  closed = output<void>();

  protected readonly openingHoursLines = computed<string[]>(() => {
    const raw = this.cafe()?.openingHours;
    if (!raw) return [];

    return raw
      .split(';')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);
  });

  protected close(): void {
    this.closed.emit();
  }
}
