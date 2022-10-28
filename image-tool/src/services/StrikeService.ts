import {
  AfterRoutesInit,
  Injectable, ProviderScope,
  ProviderType
} from "@tsed/common";
import { TypeORMService } from "@tsed/typeorm";
import { Connection } from "typeorm";
import { Strike } from "../entity/Strike";
import { StrikeRepository } from "../repositories/StrikeRepository";

@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON,
})
export class StrikeService implements AfterRoutesInit {
  private connection: Connection;

  private repositiory: StrikeRepository;

  constructor(
    private typeORMService: TypeORMService
  ) {}

  $afterRoutesInit() {
    this.connection = this.typeORMService.get("default")!;
    this.repositiory = this.connection.manager.getCustomRepository(
      StrikeRepository
    );
  }

  async find(take: number = 100, skip: number = 0): Promise<Strike[]> {
    const strikes = await this.repositiory.find({
      take,
      skip,
      order: {
        id: "DESC",
      }
    });

    return strikes;
  }

  async findOne(uuid: string): Promise<Strike | undefined> {
    const strike = await this.repositiory.findOne({
      where: {
        uuid,
      },
    });

    return strike;
  }
}
