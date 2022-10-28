import {
  AfterRoutesInit,
  ProviderScope,
  Injectable,
  ProviderType,
} from "@tsed/common";
import { TypeORMService } from "@tsed/typeorm";
import { Connection, IsNull, Not } from "typeorm";
import { Participation, ParticipationState } from "../entity/Participation";
import { ParticipationRepository } from "../repositories/ParticipationRepository";

@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON,
})
export class BannerService implements AfterRoutesInit {
  private connection: Connection;
  private repositiory: ParticipationRepository;

  constructor(private typeORMService: TypeORMService) {}

  $afterRoutesInit() {
    this.connection = this.typeORMService.get("default")!;
    this.repositiory = this.connection.manager.getCustomRepository(
      ParticipationRepository
    );
  }

  async find(take: number = 100, skip: number = 0): Promise<string[]> {
    const results: Pick<Participation, "imagePath">[] =
      await this.repositiory.find({
        select: ["imagePath"],
        take,
        skip,
        where: {
          bannerState: ParticipationState.ACCEPTED,
          imagePath: Not(IsNull()),
        },
        order: {
          id: "DESC",
        },
      });

    return results.map(({ imagePath }) => imagePath);
  }
}
