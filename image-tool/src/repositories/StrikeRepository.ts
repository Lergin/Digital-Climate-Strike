import { EntityRepository, Repository } from "typeorm";
import { Strike } from "../entity/Strike";

@EntityRepository(Strike)
export class StrikeRepository extends Repository<Strike> {}
