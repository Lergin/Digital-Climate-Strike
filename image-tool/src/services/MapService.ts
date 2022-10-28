import {
  AfterRoutesInit,
  ProviderScope,
  Injectable,
  ProviderType,
} from "@tsed/common";
import { serialize } from "@tsed/json-mapper";
import { TypeORMService } from "@tsed/typeorm";
import { Feature, FeatureCollection, Point } from "geojson";
import { Connection, Not } from "typeorm";
import { Participation, ParticipationState } from "../entity/Participation";
import { Strike } from "../entity/Strike";
import { ParticipationRepository } from "../repositories/ParticipationRepository";
import { StrikeService } from "./StrikeService";

@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON,
})
export class MapService implements AfterRoutesInit {
  private connection: Connection;
  private repositiory: ParticipationRepository;

  constructor(private typeORMService: TypeORMService, private strikeService: StrikeService) {}

  $afterRoutesInit() {
    this.connection = this.typeORMService.get("default")!;
    this.repositiory = this.connection.manager.getCustomRepository(
      ParticipationRepository
    );
  }

  async find(): Promise<FeatureCollection<Point, Participation | Strike>> {
    const [participations, strikes] = await Promise.all([
      this.repositiory.find({
        where: {
          state: Not(ParticipationState.REJECTED),
        },
        order: {
          id: "DESC",
        },
      }),
      this.strikeService.find()
    ]);

    const participationFeatures: Feature<Point, Participation>[] = participations
      .map(participation => this.participationToFeature(participation))

    const strikeFeatures: Feature<Point, Strike>[] = strikes.map(strike => this.strikeToFeature(strike));

    return {
      type: "FeatureCollection",
      features: [
        ... participationFeatures,
        ... strikeFeatures
      ]
    };
  }

  async findOne(uuid: string): Promise<Feature<Point | null, Participation | Strike | null>> {
    const participation = await this.repositiory.findOne({
      where: {
        uuid,
        state: Not(ParticipationState.REJECTED),
      },
    });

    if (participation != null) {
      const feature = this.participationToFeature(participation);

      // Always include the image even if the moderation is still pending
      if (!feature.properties.imagePath) {
        feature.properties.imagePath = participation.imagePath;
      }

      return feature;
    }

    const strike = await this.strikeService.findOne(uuid);

    if (strike != null) {
      return this.strikeToFeature(strike);
    }

    return {
      type: "Feature",
      geometry: null,
      properties: null
    };
  }

  private participationToFeature(participation: Participation): Feature<Point, Participation> {
    const feature: Feature<Point, Participation> = {
      type: "Feature",
      id: participation.uuid,
      geometry: {
        type: "Point",
        coordinates: [
          parseFloat(participation.lon),
          parseFloat(participation.lat)
        ]
      },
      properties: serialize(participation, {type: Participation, groups: 'map'})
    }

    if (participation.state !== ParticipationState.ACCEPTED) {
      feature.properties.imagePath = '';
    }

    return feature;
  }

  private strikeToFeature(strike: Strike): Feature<Point, Strike> {
    return {
      type: "Feature",
      id: strike.uuid,
      geometry: {
        type: "Point",
        coordinates: [
          parseFloat(strike.lon), parseFloat(strike.lat)
        ]
      },
      properties: serialize(strike, {type: Strike, groups: 'map'})
    }
  }
}
