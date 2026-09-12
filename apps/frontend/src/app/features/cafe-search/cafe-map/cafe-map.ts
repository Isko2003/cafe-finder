import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Cafe } from '../../../core/cafes/cafe.model';

declare const maplibregl: any;
@Component({
  selector: 'app-cafe-map',
  styleUrl: './cafe-map.css',
  templateUrl: './cafe-map.html',
})
export class CafeMap implements AfterViewInit {
  mapContainer = viewChild.required<ElementRef>('mapContainer');

  center = input.required<[number, number]>();

  cafes = input<Cafe[]>([]);

  focusCafeId = input<string | null>(null);

  private map: any;
  private userMarker: any;
  private cafeMarkers: Array<{ cafe: Cafe; marker: any }> = [];
  private readonly mapReady = signal(false);

  constructor() {
    effect(() => {
      const [lng, lat] = this.center();
      if (!this.mapReady()) return;

      this.map.setCenter([lng, lat]);
      this.map.setZoom(14);

      this.userMarker?.remove();
      this.userMarker = new maplibregl.Marker({ color: '#c17817' })
        .setLngLat([lng, lat])
        .addTo(this.map);
    });

    effect(() => {
      const cafes = this.cafes();
      if (!this.mapReady()) return;
      this.renderCafeMarkers(cafes);
    });

    effect(() => {
      const id = this.focusCafeId();
      if (!this.mapReady() || !id) return;

      const found = this.cafeMarkers.find((entry) => entry.cafe.id === id);
      if (!found) return;

      this.map.flyTo({ center: [found.cafe.lng, found.cafe.lat], zoom: 15.5, speed: 1.1 });

      for (const entry of this.cafeMarkers) {
        const popup = entry.marker.getPopup();
        if (entry !== found && popup?.isOpen()) entry.marker.togglePopup();
      }
      if (!found.marker.getPopup()?.isOpen()) found.marker.togglePopup();
    });
  }

  ngAfterViewInit(): void {
    const [lng, lat] = this.center();

    this.map = new maplibregl.Map({
      container: this.mapContainer().nativeElement,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [lng, lat],
      zoom: 12,
    });

    this.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    this.map.on('load', () => {
      const [currentLng, currentLat] = this.center();
      this.userMarker = new maplibregl.Marker({ color: '#c17817' })
        .setLngLat([currentLng, currentLat])
        .addTo(this.map);
      this.renderCafeMarkers(this.cafes());
      this.mapReady.set(true);
    });

    this.map.on('error', (e: any) => console.error('MAP ERROR:', e));
  }

  private renderCafeMarkers(cafes: Cafe[]): void {
    this.cafeMarkers.forEach((entry) => entry.marker.remove());
    this.cafeMarkers = [];

    for (const cafe of cafes) {
      const popup = new maplibregl.Popup({ offset: 20 }).setHTML(this.buildPopupHtml(cafe));

      const marker = new maplibregl.Marker({ color: '#8a2e3b' })
        .setLngLat([cafe.lng, cafe.lat])
        .setPopup(popup)
        .addTo(this.map);

      this.cafeMarkers.push({ cafe, marker });
    }
  }

  private buildPopupHtml(cafe: Cafe): string {
    const escape = (value: string) =>
      value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const website = cafe.website
      ? `<a href="${escape(cafe.website)}" target="_blank" rel="noopener" style="color:#c17817;font-weight:600;">Vebsayt</a>`
      : '';
    const phone = cafe.phone ? `<div style="margin-top:2px;">${escape(cafe.phone)}</div>` : '';

    return `
      <div style="min-width:180px;font-family:Manrope,sans-serif;">
        <strong style="font-family:Petrona,serif;font-size:15px;">${escape(cafe.name)}</strong>
        <div style="font-size:12px;color:#4a4136;margin:4px 0;">${escape(cafe.address)}</div>
        ${phone}
        ${website}
      </div>
    `;
  }
}
