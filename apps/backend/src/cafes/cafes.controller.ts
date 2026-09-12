import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { CafesService } from './cafes.service';

const MIN_RADIUS_METRES = 100;
const MAX_RADIUS_METRES = 20_000;
const DEFAULT_RADIUS_METRES = 1500;

@Controller('cafes')
export class CafesController {
  constructor(private readonly cafesService: CafesService) {}

  @Get('nearby')
  async getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    const parsedLat = this.parseCoordinate(lat, 'lat', -90, 90);
    const parsedLng = this.parseCoordinate(lng, 'lng', -180, 180);
    const parsedRadius = this.parseRadius(radius);

    return this.cafesService.findNearby(parsedLat, parsedLng, parsedRadius);
  }

  private parseCoordinate(
    value: string,
    fieldName: string,
    min: number,
    max: number,
  ): number {
    if (value === undefined || value === '') {
      throw new BadRequestException(`"${fieldName}" parametri tələb olunur`);
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`"${fieldName}" düzgün ədəd deyil`);
    }

    if (parsed < min || parsed > max) {
      throw new BadRequestException(
        `"${fieldName}" ${min} ilə ${max} arasında olmalıdır`,
      );
    }

    return parsed;
  }

  private parseRadius(value?: string): number {
    if (value === undefined || value === '') {
      return DEFAULT_RADIUS_METRES;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      throw new BadRequestException('"radius" tam ədəd olmalıdır');
    }

    if (parsed < MIN_RADIUS_METRES || parsed > MAX_RADIUS_METRES) {
      throw new BadRequestException(
        `"radius" ${MIN_RADIUS_METRES} ilə ${MAX_RADIUS_METRES} metr arasında olmalıdır`,
      );
    }

    return parsed;
  }
}
