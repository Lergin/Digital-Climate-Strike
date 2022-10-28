import { Controller, Get, UseCache } from "@tsed/common";
import { Status, Summary, Returns } from "@tsed/schema";
import { BannerService } from "../../services/BannerService";

@Controller("/banner")
export class BannerController {
  constructor(private bannerService: BannerService) {}

  @Get()
  @Get("/")
  @Status(200)
  @UseCache({ ttl: 300 })
  @Summary("List of links to the images for the banner.")
  @Returns(200, Array).Of(String)
  async allParticipation(): Promise<string[]> {
    return this.bannerService.find(1000, 0);
  }
}
