import { EntityRepository, Repository } from "typeorm";
import { Participation } from "../entity/Participation";

@EntityRepository(Participation)
export class ParticipationRepository extends Repository<Participation> {}
