import {
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

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
  private readonly logger = new Logger(CafesService.name);
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
    if (!apiKey) {
      this.logger.error('GEOAPIFY_KEY .env faylında təyin edilməyib');
      throw new ServiceUnavailableException(
        'Xəritə xidməti konfiqurasiya edilməyib. Backend administratoru ilə əlaqə saxlayın.',
      );
    }

    const url = `https://api.geoapify.com/v2/places`;

    let response: AxiosResponse<GeoapifyResponse>;
    try {
      response = await firstValueFrom(
        this.httpService.get<GeoapifyResponse>(url, {
          timeout: 8000,
          params: {
            categories: 'catering.cafe',
            filter: `circle:${lng},${lat},${radius}`,
            limit: 20,
            apiKey,
          },
        }),
      );
    } catch (error) {
      throw this.mapGeoapifyError(error);
    }

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

  private mapGeoapifyError(error: unknown): HttpException {
    const axiosError = error as AxiosError;

    if (!axiosError.response) {
      this.logger.error(
        `Geoapify-a qoşulmaq mümkün olmadı: ${axiosError.message}`,
      );
      return new ServiceUnavailableException(
        'Kafələr xidmətinə qoşulmaq mümkün olmadı. Bir az sonra yenidən cəhd edin.',
      );
    }

    const status = axiosError.response.status;

    if (status === 401 || status === 403) {
      this.logger.error(
        `Geoapify API açarı etibarsızdır (status ${status}). GEOAPIFY_KEY-i yoxlayın.`,
      );
      return new ServiceUnavailableException(
        'Xəritə xidməti hazırda əlçatan deyil. Backend administratoru ilə əlaqə saxlayın.',
      );
    }

    if (status === 429) {
      this.logger.warn('Geoapify sorğu limiti aşılıb (429).');
      return new HttpException(
        'Hazırda çox sayda sorğu göndərilib. Bir neçə dəqiqədən sonra yenidən cəhd edin.',
        429,
      );
    }

    this.logger.error(
      `Geoapify gözlənilməz xəta qaytardı (status ${status}): ${JSON.stringify(
        axiosError.response.data,
      )}`,
    );
    return new ServiceUnavailableException(
      'Kafələr yüklənərkən gözlənilməz xəta baş verdi.',
    );
  }
}
