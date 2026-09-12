import { Component, inject, OnInit, signal } from '@angular/core';
import { CafeMap } from '../cafe-map/cafe-map';
import { CafesService } from '../../../core/cafes/cafes.service';
import { Cafe } from '../../../core/cafes/cafe.model';

type LocationStatus = 'locating' | 'located' | 'fallback';

const DEFAULT_CENTER: [number, number] = [49.8671, 40.4093];

@Component({
  imports: [CafeMap],
  selector: 'app-cafes-page',
  styleUrl: './cafes-page.css',
  templateUrl: './cafes-page.html',
})
export class CafesPage implements OnInit {
  private readonly cafesService = inject(CafesService);

  protected readonly radiusOptions = [500, 1000, 1500, 2000, 3000];

  protected readonly center = signal<[number, number]>(DEFAULT_CENTER);
  protected readonly cafes = signal<Cafe[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly locationStatus = signal<LocationStatus>('locating');
  protected readonly radius = signal(1500);
  protected readonly selectedCafeId = signal<string | null>(null);

  ngOnInit(): void {
    if (!navigator.geolocation) {
      this.locationStatus.set('fallback');
      this.search();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        this.center.set([longitude, latitude]);
        this.locationStatus.set('located');
        this.search();
      },
      (geoError) => {
        console.warn('Geolocation rədd edildi və ya alınmadı:', geoError.message);
        this.locationStatus.set('fallback');
        this.search();
      },
    );
  }

  protected onRadiusChange(value: string): void {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      this.radius.set(parsed);
      this.search();
    }
  }

  protected selectCafe(id: string): void {
    this.selectedCafeId.set(id);
  }

  protected formatRadius(metres: number): string {
    return metres >= 1000 ? `${metres / 1000} km` : `${metres} m`;
  }

  private search(): void {
    const [lng, lat] = this.center();

    this.loading.set(true);
    this.error.set(null);

    this.cafesService.findNearby(lat, lng, this.radius()).subscribe({
      next: (cafes) => {
        this.loading.set(false);
        this.cafes.set(cafes);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Kafələr yüklənə bilmədi. Backend işləyirmi?');
        console.error('Kafe sorğusu xətası:', err);
      },
    });
  }
}
