import { Controller, Get, Post } from "@tsed/common";
import { Property, Returns, Status, Summary } from "@tsed/schema";
import { AuthAdmin } from "../../decorators/AuthRoles";
import { ParticipationService } from "../../services/ParticipationService";
import { SocketService } from "../../services/SocketService";

class EnabledStatus {
  @Property()
  enabled: boolean
}

@Controller("/admin")
export class AdminController {
  constructor(
    private participationService: ParticipationService,
    private socketService: SocketService
  ) {}

  @Get("/participations/status")
  @Status(200)
  @Summary("Is the participation creation enabled?")
  @Returns(200, EnabledStatus)
  uploadStatus(): EnabledStatus {
    return {
      enabled: this.participationService.isCreateEnabled(),
    };
  }

  @Post("/participations/deactivate")
  @Status(201)
  @AuthAdmin()
  @Summary("Deactivate the participation creation.")
  @Returns(201)
  deactivateUpload(): null {
    this.participationService.deactivateCreate();
    return null;
  }

  @Post("/participations/activate")
  @Status(201)
  @AuthAdmin()
  @Summary("Activate the participation creation.")
  @Returns(201)
  activateUpload(): null {
    this.participationService.activateCreate();
    return null;
  }
}
