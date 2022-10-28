import {
  Const,
  Default,
  MaxLength,
  MinLength,
  Pattern,
  Required,
} from "@tsed/schema";
import { Participation } from "../entity/Participation";

export class CreateParticipationModel {
  @Required()
  @MinLength(3)
  @MaxLength(50)
  @Pattern(/^[\p{L}\w -]{3,50}$/)
  name: string;

  @Required()
  @Pattern(/\d{5}/)
  zip: string;

  @Required()
  @Const(true)
  policy: true;

  @Default(false)
  allowOnBanner: boolean;

  toParticipation(): Participation {
    const participation = new Participation();
    participation.name = this.name;
    participation.zip = this.zip;
    participation.allowOnBanner = this.allowOnBanner;
    participation.policy = this.policy;
    return participation;
  }
}
