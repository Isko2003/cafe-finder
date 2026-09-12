import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CafeMap } from '../cafe-map/cafe-map';
import { CafeDetail } from '../cafe-detail/cafe-detail';
import { CafesService } from '../../../core/cafes/cafes.service';
import { Cafe } from '../../../core/cafes/cafe.model';
import { distanceMetres, formatDistance } from '../../../core/geo/distance';

type LocationStatus = 'locating' | 'located' | 'fallback';
type SortMode = 'distance' | 'name';

const DEFAULT_CENTER: [number, number] = [49.8671, 40.4093];

@Component({
  imports: [CafeMap, CafeDetail],
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
  protected readonly searchQuery = signal('');
  protected readonly sortMode = signal<SortMode>('distance');

  protected readonly selectedCafe = computed<Cafe | null>(
    () => this.cafes().find((cafe) => cafe.id === this.selectedCafeId()) ?? null,
  );

  protected readonly visibleCafes = computed<Array<{ cafe: Cafe; distanceM: number }>>(() => {
    const [centerLng, centerLat] = this.center();
    const query = this.searchQuery().trim().toLowerCase();

    const withDistance = this.cafes()
      .filter((cafe) => !query || cafe.name.toLowerCase().includes(query))
      .map((cafe) => ({
        cafe,
        distanceM: distanceMetres(centerLat, centerLng, cafe.lat, cafe.lng),
      }));

    if (this.sortMode() === 'name') {
      return withDistance.sort((a, b) => a.cafe.name.localeCompare(b.cafe.name, 'az'));
    }

    return withDistance.sort((a, b) => a.distanceM - b.distanceM);
  });

  protected readonly visibleCafeList = computed<Cafe[]>(() =>
    this.visibleCafes().map((entry) => entry.cafe),
  );

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

  protected closeDetail(): void {
    this.selectedCafeId.set(null);
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  protected onSortChange(value: string): void {
    this.sortMode.set(value === 'name' ? 'name' : 'distance');
  }

  protected formatDistanceM(metres: number): string {
    return formatDistance(metres);
  }

  protected formatRadius(metres: number): string {
    return metres >= 1000 ? `${metres / 1000} km` : `${metres} m`;
  }

  protected retry(): void {
    this.search();
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
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.resolveErrorMessage(err));
        console.error('Kafe sorğusu xətası:', err);
      },
    });
  }

  private resolveErrorMessage(err: HttpErrorResponse): string {
    const backendMessage = typeof err.error?.message === 'string' ? err.error.message : null;

    if (err.status === 0) {
      return 'Backend-ə qoşulmaq mümkün olmadı. Server işə salınıbmı?';
    }

    if (err.status === 429) {
      return backendMessage ?? 'Həddindən çox sorğu göndərildi. Bir az gözləyib yenidən cəhd edin.';
    }

    if (err.status === 400) {
      return backendMessage ?? 'Sorğu parametrləri yanlışdır.';
    }

    if (err.status === 503) {
      return (
        backendMessage ?? 'Kafələr xidməti hazırda əlçatan deyil. Bir az sonra yenidən cəhd edin.'
      );
    }

    return backendMessage ?? 'Kafələr yüklənə bilmədi. Bir az sonra yenidən cəhd edin.';
  }
}
