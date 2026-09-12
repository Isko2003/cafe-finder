import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface Cafe {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  website: string | null;
  phone: string | null;
  openingHours: string | null;
}

interface GeoapifyFeature {
  properties: {
    place_id: string;
    name?: string;
    formatted: string;
    website?: string;
    contact?: {
      phone?: string;
    };
    opening_hours?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

@Injectable()
export class CafesService {
  private cache = new Map<string, { data: Cafe[]; expires: number }>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async findNearby(
    lat: number,
    lng: number,
    radius: number = 1500,
  ): Promise<Cafe[]> {
    const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const apiKey = this.configService.get<string>('GEOAPIFY_KEY');
    const url = `https://api.geoapify.com/v2/places`;

    const response = await firstValueFrom(
      this.httpService.get<GeoapifyResponse>(url, {
        params: {
          categories: 'catering.cafe',
          filter: `circle:${lng},${lat},${radius}`,
          limit: 20,
          apiKey,
        },
      }),
    );

    const cafes: Cafe[] = response.data.features.map((f: GeoapifyFeature) => ({
      id: f.properties.place_id,
      name: f.properties.name || 'Adsız kafe',
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      address: f.properties.formatted,
      website: f.properties.website || null,
      phone: f.properties.contact?.phone || null,
      openingHours: f.properties.opening_hours || null,
    }));

    this.cache.set(cacheKey, {
      data: cafes,
      expires: Date.now() + 5 * 60 * 1000,
    });
    return cafes;
  }
}
