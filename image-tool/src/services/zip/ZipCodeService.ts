export abstract class ZipCodeService {
  abstract zipToCoordinates(zip: string): { lat: string; lon: string } | undefined;
  abstract zipToCoordinatesOrThrow(zip: string): { lat: string; lon: string };
  abstract zipExists(zip: string): boolean;
  abstract get zips(): string[];

  constructor() {
    console.error("Cannot instanciate abstract class ZipCodeService, is a provider registered?")
    throw new Error("Cannot instanciate abstract class ZipCodeService, is a provider registered?")
  }
}
