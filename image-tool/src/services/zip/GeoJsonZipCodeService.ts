import { ProviderScope, Injectable, ProviderType } from "@tsed/common";
import { ZipCodeService } from "./ZipCodeService";
import _zipData from "./geojson_zip_areas.json";
import { Geometry, Position } from "geojson";
const zipData: GeoJSON.FeatureCollection<Geometry, {plz: string, note: string, qkm: number, einwohner: number}> = _zipData as any;

@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON,
})
export class GeoJsonZipCodeService implements ZipCodeService {
  #zips: Map<string, GeoJSON.Geometry>;

  constructor() {
    this.#zips = new Map(
      zipData.features.map(feature => ([feature.properties.plz, feature.geometry]))
    );
  }

  zipToCoordinates(zip: string): { lat: string; lon: string; } | undefined {
    const geometry = this.#zips.get(zip);

    switch(geometry?.type) {
      case "Polygon":
        return this.positionToLatLon(
          this.randomPositionInPolygon(
            geometry.coordinates
          )
        );
      case "MultiPolygon":
        return this.positionToLatLon(
          this.randomPositionInPolygon(
            geometry.coordinates.sort(a => a.length)[0]
          )
        );
    }

    return { lat: "0", lon: "0" }
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

  private positionToLatLon(position: Position): { lon: string, lat: string } {
    return {
      lon: position[0].toString(),
      lat: position[1].toString()
    }
  }

  /**
   * Get a random position inside of a polygon.
   *
   * 1. Create a bounding box
   * 2. Find a random position in this bounding box
   * 3. Check if this position is in the polygon, if not go back to 2
   */
  private randomPositionInPolygon(polygon: Position[][]): Position {
    const {min, max} = this.minMaxCoordinates(polygon[0]);

    let randomPosition;
    do {
      randomPosition = this.randomPosition(min, max);
    } while (!this.isInPolygon(polygon, randomPosition))

    return randomPosition;
  }

  private randomPosition(min: Position, max: Position): Position {
    return [
      Math.random()*(max[0]-min[0])+min[0],
      Math.random()*(max[1]-min[1])+min[1]
    ]
  }

  private minMaxCoordinates(positions: Position[]): {min: Position, max: Position} {
    const min: Position = [180, 180];
    const max: Position = [-180, -180];

    for (const position of positions) {
      if (min[0] > position[0]) {
        min[0] = position[0]
      }
      if (min[1] > position[1]) {
        min[1] = position[1]
      }
      if (max[0] < position[0]) {
        max[0] = position[0]
      }
      if (max[1] < position[1]) {
        max[1] = position[1]
      }
    }

    return {min, max}
  }

  private isInPolygon(polygon: Position[][], position: Position): boolean {
    if (!this.isInLinearRingPolygon(polygon[0], position)) {
      return false;
    }

    for (const linearRing of polygon.slice(1)) {
      if (this.isInLinearRingPolygon(linearRing, position)) {
        return false;
      }
    }

    return true;
  }

  private createAdjencendPairsFromRing(ring: Position[]): [Position, Position][] {
    return ring.map((position, index) => ([position, ring[(index + 1) % ring.length]]));
  }

  /**
   * Simplified version of https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
   * Does not support holes.
   */
  private isInLinearRingPolygon(polygon: Position[], position: Position): boolean {
    for (const posPair of this.createAdjencendPairsFromRing(polygon)) {
      const [posA, posB] = posPair;

      if (
        ((posA[1] > position[1]) !== (posB[1] > position[1])) &&
        (position[0] < (posB[0] - posA[0]) * (position[1]-posA[1]) / (posB[1] - posA[1]) + posA[0])
      ) {
        return true;
      }
    }
  }
}
