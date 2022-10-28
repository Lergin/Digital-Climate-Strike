import {
  AfterRoutesInit,
  ProviderScope,
  Injectable,
  ProviderType,
} from "@tsed/common";
import { serialize } from "@tsed/json-mapper";
import { TypeORMService } from "@tsed/typeorm";
import { Connection, FindManyOptions, IsNull, Not } from "typeorm";
import { Participation } from "../entity/Participation";
import { ParticipationRepository } from "../repositories/ParticipationRepository";
import { SocketService } from "./SocketService";
import { WebSocketEvent, WebSocketParticipationMessage } from "./WebSocketMessage";
import { ZipCodeService } from "./zip/ZipCodeService";
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON,
})
export class ParticipationService implements AfterRoutesInit {
  private connection: Connection;

  private repositiory: ParticipationRepository;

  private createEnabled: boolean = true;

  constructor(
    private typeORMService: TypeORMService,
    private zipCodeService: ZipCodeService,
    private socketService: SocketService
  ) {}

  $afterRoutesInit() {
    this.connection = this.typeORMService.get("default")!;
    this.repositiory = this.connection.manager.getCustomRepository(
      ParticipationRepository
    );
  }

  async create(participation: Participation): Promise<Participation> {
    if (participation.lat == null || participation.lon == null) {
      const { lat, lon } = this.zipCodeService.zipToCoordinatesOrThrow(
        participation.zip
      );
      participation.lat = lat;
      participation.lon = lon;
    }

    participation.uuid = uuidv4();

    let result = await this.repositiory.save(participation);
    console.log("Saved a new participiton with id: " + result.id);

    this.socketService.send({
      event: WebSocketEvent.CREATE,
      type: "participation",
      data: serialize(participation)
    } as WebSocketParticipationMessage);

    return result;
  }

  async save(participiton: Participation): Promise<Participation> {
    let result = await this.repositiory.save(participiton);
    console.log("Saved a participiton with id: " + result.id);

    this.socketService.send({
      event: WebSocketEvent.UPDATE,
      type: "participation",
      data: serialize(result)
    } as WebSocketParticipationMessage);

    return result;
  }

  async find(
    participation?: Partial<Participation>,
    image?: boolean,
    take: number = 100,
    skip: number = 0
  ): Promise<Participation[]> {
    return this.repositiory.find({
      take,
      skip,
      order: {
        id: "DESC",
      },
      where: this.participationToFindOptions(participation, image)
    });
  }

  async findOne(uuid: string): Promise<Participation> {
    return await this.repositiory.findOneOrFail({
      where: {
        uuid,
      },
    });
  }

  /**
   * Does an entry exist that has an image with the given hash?
   */
  async exists(hash: string): Promise<boolean> {
    const participation = await this.repositiory.findOne({
      where: {
        hash,
      },
    });

    return participation != null;
  }

  async count(
    participation?: Partial<Participation>,
    image?: boolean
  ): Promise<number> {
    return this.repositiory.count({
      where: this.participationToFindOptions(participation, image)
    });
  }

  private participationToFindOptions(
    participation?: Partial<Participation>,
    image?: boolean
  ): FindManyOptions<Participation>['where'] {
    const where: FindManyOptions<Participation>['where'] = participation ?? {};

    if (image === true) {
      where.imagePath = Not(IsNull());
    } else if (image === false) {
      where.imagePath = IsNull();
    }

    delete where.type;

    return where;
  }

  deactivateCreate() {
    this.createEnabled = false;
  }

  activateCreate() {
    this.createEnabled = true;
  }

  isCreateEnabled() {
    return this.createEnabled;
  }
}
