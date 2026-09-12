import { Component, ElementRef, viewChild, AfterViewInit } from '@angular/core';

declare const maplibregl: any;

@Component({
  selector: 'app-cafe-map',
  standalone: true,
  templateUrl: './cafe-map.html',
  styleUrl: './cafe-map.css',
})
export class CafeMap implements AfterViewInit {
  mapContainer = viewChild.required<ElementRef>('mapContainer');

  ngAfterViewInit(): void {
    const map = new maplibregl.Map({
      container: this.mapContainer().nativeElement,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [49.8671, 40.4093],
      zoom: 12,
    });

    map.on('load', () => console.log('MAP LOADED'));
    map.on('error', (e: any) => console.error('MAP ERROR:', e));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          map.setCenter([longitude, latitude]);
          map.setZoom(14);

          new maplibregl.Marker({ color: '#3b82f6' }).setLngLat([longitude, latitude]).addTo(map);
        },
        (error) => {
          console.warn('Geolocation rədd edildi və ya alınmadı:', error.message);
        },
      );
    }
  }
}
