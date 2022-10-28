import { Enum, Groups, Ignore, Name, Property } from "@tsed/schema";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum ParticipationState {
  NONE = "none",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export type ParticipationStateType =
  | ParticipationState.ACCEPTED
  | ParticipationState.REJECTED
  | ParticipationState.NONE;

export enum BannerState {
  NONE = "none",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export type BannerStateType =
  | BannerState.ACCEPTED
  | BannerState.REJECTED
  | BannerState.NONE;

@Entity()
export class Participation {
  @Groups("map")
  @Enum("participation")
  type: "participation" = 'participation'

  @PrimaryGeneratedColumn()
  @Ignore()
  id: number;

  @Column({ unique: true, nullable: false })
  @Name("id")
  @Groups("!map")
  uuid: string;

  @Column({ unique: true, nullable: true })
  hash: string;

  @Column({ nullable: false })
  @Property()
  name: string;

  @Column({ nullable: false })
  @Property()
  zip: string;

  @Column({ name: "allow_on_banner", default: false })
  @Property()
  @Groups("!map")
  allowOnBanner: boolean;

  @Column({ name: "policy_checked", default: false })
  policy: boolean;

  // is uploaded from an ortsgruppe
  @Column({ name: "og", default: false })
  @Property()
  og: boolean;

  // is imported from parents for future
  @Column({ name: "p4f", default: false })
  @Property()
  p4f: boolean;

  @Column({ name: "image_path", default: null })
  @Property()
  imagePath: string;

  @Column({
    type: "enum",
    enum: ParticipationState,
    default: ParticipationState.NONE,
  })
  @Property()
  @Enum(ParticipationState)
  state: ParticipationStateType;

  @Column({
    type: "enum",
    enum: BannerState,
    default: BannerState.NONE,
    name: "banner_state",
  })
  @Property()
  @Enum(BannerState)
  bannerState: BannerStateType;

  @Column({ nullable: false, name: "lat" })
  @Property()
  @Groups("!map")
  lat: string;

  @Column({ nullable: false, name: "lon" })
  @Property()
  @Groups("!map")
  lon: string;
}
