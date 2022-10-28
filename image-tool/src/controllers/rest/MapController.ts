import { Controller, Get, PathParams, UseCache } from "@tsed/common";
import { getJsonSchema, Returns, Schema, Status, Summary } from "@tsed/schema";
import { MapService } from "../../services/MapService";
import { Feature, FeatureCollection, Point } from 'geojson';
import { Participation } from "../../entity/Participation";
import { Strike } from "../../entity/Strike";
import type { JSONSchema6Definition } from 'json-schema';
import { NotFound } from "@tsed/exceptions";

const SCHEMA_GEO_JSON_FEATURE_EXTENSION: { [k: string]: JSONSchema6Definition; } = {
  id: {
    type: "string"
  },
  properties: {
    type : "object",
    oneOf : [{
      title: "Participation",
      properties: getJsonSchema(Participation, { groups: ['map'] }).properties,
    }, {
      title: "Strike",
      properties: getJsonSchema(Strike, { groups: ['map'] }).properties,
    }]
  },
  geometry: {
    $ref: "https://geojson.org/schema/Point.json"
  }
}

@Controller("/map")
export class MapController {
  constructor(private mapService: MapService) {}

  @Get("/")
  @Status(200)
  @Returns(200)
  @UseCache({ ttl: 300 })
  @Summary("Data for the participation map")
  @Returns(200).Schema({
    allOf: [{
      $ref: "https://geojson.org/schema/FeatureCollection.json"
    }],
    properties: {
      features: {
        items: {
          properties: SCHEMA_GEO_JSON_FEATURE_EXTENSION
        }
      }
    }
  })
  async getMap(): Promise<FeatureCollection<Point, Participation | Strike>> {
    return this.mapService.find();
  }

  @Get("/:id")
  @Status(200)
  @UseCache({ ttl: 300 })
  @Summary("Data about a specific entry of the map")
  @Returns(200).Schema({
    allOf: [{
      $ref: "https://geojson.org/schema/Feature.json"
    }],
    properties: SCHEMA_GEO_JSON_FEATURE_EXTENSION
  })
  async getMapEntry(@PathParams("id") id: string): Promise<Feature<Point | null, Participation | Strike | null>> {
    try {
      return this.mapService.findOne(id);
    } catch (e) {
      if (e.name === "EntityNotFound") {
        throw new NotFound("No participation found");
      } else {
        throw e;
      }
    }
  }
}
