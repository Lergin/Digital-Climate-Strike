import {
  BodyParams,
  Controller,
  Get,
  Inject,
  MulterOptions,
  MultipartFile,
  PathParams,
  Post,
  QueryParams,
} from "@tsed/common";
import { BadRequest, NotFound, ServiceUnvailable } from "@tsed/exceptions";
import { Returns, Status, Summary } from "@tsed/schema";
import { unlink } from "fs";
import { randomBytes } from "crypto";
import { AuthModerator, AuthSocialMedia } from "../../decorators/AuthRoles";
import {
  BannerState,
  Participation,
  ParticipationState,
} from "../../entity/Participation";
import { CreateParticipationModel } from "../../models/ParticipationModel";
import { ImageService } from "../../services/ImageService";
import { ParticipationService } from "../../services/ParticipationService";
import { SocketService } from "../../services/SocketService";
import { ZipCodeService } from "../../services/zip/ZipCodeService";
import { EntityNotFoundError } from "typeorm";

@Controller("/participations")
export class ParticipationController {
  @Inject()
  zipCodeService: ZipCodeService;

  @Inject()
  imageService: ImageService;

  @Inject()
  participationService: ParticipationService;

  @Inject()
  socketService: SocketService;

  @Get()
  @Get("/")
  @AuthModerator()
  @AuthSocialMedia()
  @Summary("List participations")
  @(Returns(200, Array).Of(Participation))
  async get(
    @QueryParams(Participation) participation?: Partial<Participation>,
    @QueryParams("image") image?: boolean,
    @QueryParams("take") take: number = 100,
    @QueryParams("skip") skip: number = 0
  ): Promise<Participation[]> {
    return this.participationService.find(participation, image, take, skip);
  }

  @Post()
  @Post("/")
  @MulterOptions({
    limits: {
      fieldSize: 10000000,
    },
  })
  @Summary("Create a new participation")
  @Returns(201, Participation).Description("The newly created participation")
  async create(
    @MultipartFile("file") file: MultipartFile,
    @BodyParams(CreateParticipationModel) model: CreateParticipationModel
  ): Promise<Participation> {
    try {
      console.log(model);

      if (!this.participationService.isCreateEnabled()) {
        throw new ServiceUnvailable(
          "Es können aktuell leider keine neuen Einträge hinzugefügt werden."
        );
      }

      if (!this.zipCodeService.zipExists(model.zip)) {
        throw new BadRequest("Diese PLZ kennen wir leider nicht.");
      }

      if (!file) {
        const participation = model.toParticipation();
        participation.state = ParticipationState.ACCEPTED;
        participation.hash = randomBytes(20).toString("hex");
        return this.participationService.create(participation);
      }

      if (!file.mimetype.startsWith("image/")) {
        throw new BadRequest("Du kannst nur Bilder hochladen.");
      }

      const hash = await this.imageService.createSha1Hash(file);

      if (await this.participationService.exists(hash)) {
        throw new BadRequest("Dieses Bild wurde schon hochgeladen!");
      }

      const imagePath = await this.imageService.processParticipationImage(
        file,
        hash
      );

      const participation = model.toParticipation();
      participation.imagePath = imagePath;
      participation.hash = hash;

      return this.participationService.create(participation);
    } finally {
      if (file) {
        unlink(file.path, (err) => err && console.error(err));
      }
    }
  }

  @Get("/count")
  @Status(200)
  @AuthSocialMedia()
  @AuthModerator()
  @Summary("Count participations")
  @Returns(200, Number)
  async count(
    @QueryParams(Participation) participation?: Partial<Participation>,
    @QueryParams("image") image?: boolean
  ): Promise<string> {
    return (await this.participationService.count(participation, image)).toString();
  }

  @Get("/websocket/auth")
  @Status(200)
  @AuthModerator()
  @Summary("Get a new websocket auth key")
  @Returns(200, String)
  websocketAuth(): string {
    return this.socketService.generateNewAuthToken();
  }

  @Get("/:id")
  @Status(200)
  @AuthModerator()
  @Returns(200, Participation)
  @Summary("Get a participation")
  async getOne(@PathParams("id") id: string): Promise<Participation> {
    return this.participationService.findOne(id);
  }

  @Post("/:id/accept")
  @Status(201)
  @AuthModerator()
  @Summary("Accept a participation")
  @Returns(201)
  async postAcceptParticipation(
    @PathParams("id") id: string
  ): Promise<void> {
    try {
      let participation = await this.participationService.findOne(id);
      participation.state = ParticipationState.ACCEPTED;
      await this.participationService.save(participation);
    } catch (e) {
      if (e.name === "EntityNotFound") {
        throw new NotFound("No participation found");
      } else {
        throw e;
      }
    }
  }

  @Post("/:id/reject")
  @Status(201)
  @AuthModerator()
  @Summary("Reject a participation")
  @Returns(201)
  async postRejectParticipation(
    @PathParams("id") id: string
  ): Promise<void> {
    let participation = await this.participationService.findOne(id);

    if (null === participation) {
      throw new NotFound("No participation found");
    }

    participation.state = ParticipationState.REJECTED;
    await this.participationService.save(participation);
  }

  @Post("/:id/banner/accept")
  @Status(201)
  @AuthModerator()
  @Summary("Select a participation for the banner")
  @Returns(201)
  async postAcceptParticipationBanner(
    @PathParams("id") id: string
  ): Promise<void> {
    let participation = await this.participationService.findOne(id);

    if (null === participation) {
      throw new NotFound("No participation found");
    }

    participation.bannerState = BannerState.ACCEPTED;
    await this.participationService.save(participation);
  }

  @Post("/:id/banner/reject")
  @Status(201)
  @AuthModerator()
  @Summary("Remove a participation from the banner")
  @Returns(201)
  async postRejectParticipationBanner(
    @PathParams("id") id: string
  ): Promise<void> {
    let participation = await this.participationService.findOne(id);

    if (null === participation) {
      throw new NotFound("No participation found");
    }

    participation.bannerState = BannerState.REJECTED;
    await this.participationService.save(participation);
  }
}
