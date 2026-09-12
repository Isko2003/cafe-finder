import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cafe } from './cafe.model';

@Injectable({ providedIn: 'root' })
export class CafesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cafes`;

  findNearby(lat: number, lng: number, radius = 1500): Observable<Cafe[]> {
    return this.http.get<Cafe[]>(`${this.baseUrl}/nearby`, {
      params: { lat, lng, radius },
    });
  }
}
