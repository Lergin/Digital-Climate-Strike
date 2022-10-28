import { ProviderScope, Injectable, ProviderType } from "@tsed/common";
import { ZipCodeService } from "./ZipCodeService";
import zipData from "./zip_to_lat_lon.json";

@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON,
})
export class SimpleZipCodeService implements ZipCodeService {
  #zips: Map<string, { lat: string; lon: string; }>;

  constructor() {
    this.#zips = new Map(Object.entries(zipData));
  }

  zipToCoordinates(zip: string): { lat: string; lon: string; } | undefined {
    return this.#zips.get(zip);
  }

  zipToCoordinatesOrThrow(zip: string): { lat: string; lon: string; } {
    if (!this.zipExists(zip)) {
      throw new Error("Zip not found");
    }

    return this.zipToCoordinates(zip)!;
  }

  zipExists(zip: string): boolean {
    return this.#zips.has(zip);
  }

  get zips(): string[] {
    return [... this.#zips.keys()];
  }
}
