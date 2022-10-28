import { Const, Default, Enum, Example, Groups, Ignore, Name, Property } from "@tsed/schema";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Strike {
  @Groups("map")
  @Enum("strike")
  @Default("strike")
  readonly type: "strike" = 'strike'

  @PrimaryGeneratedColumn()
  @Ignore()
  id: number;

  @Column({ unique: true, nullable: false })
  @Name("id")
  @Groups("!map")
  uuid: string;

  @Column({ nullable: false })
  @Property()
  name: string;

  @Column({ nullable: true })
  @Property()
  zip: string;

  @Column({ nullable: true })
  @Property()
  text: string;

  @Column({ nullable: true, name: "link_instagram" })
  @Property()
  linkInstagram: string;

  @Column({ nullable: true, name: "link_facebook" })
  @Property()
  linkFacebook: string;

  @Column({ nullable: true, name: "link_twitter" })
  @Property()
  linkTwitter: string;

  @Column({ nullable: true, name: "link_website" })
  @Property()
  linkWebsite: string;

  @Column({ nullable: false })
  @Property()
  @Groups("!map")
  lat: string;

  @Column({ nullable: false })
  @Property()
  @Groups("!map")
  lon: string;
}
