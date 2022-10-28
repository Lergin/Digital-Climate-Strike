import { Env } from "@tsed/core";
import { Configuration, Inject, registerProvider } from "@tsed/di";
import {
  $log,
  BeforeRoutesInit,
  PlatformApplication,
} from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import compress from "compression";
import methodOverride from "method-override";
import cors from "cors";
import "@tsed/ajv";
import "@tsed/swagger";
import "@tsed/typeorm";
import typeormConfig from "./config/typeorm";

import { PagesController } from "./controllers/PagesController";
import * as path from "path";
import * as bodyParser from "body-parser";
import { BasicAuthProtocol } from "./protocol/BasicAuthProtocol";
import { NextFunction, Request, Response } from "express";
import { ZipCodeService } from "./services/zip/ZipCodeService";
import { GeoJsonZipCodeService } from "./services/zip/GeoJsonZipCodeService";
const flash = require("express-flash");
const layout = require("express-layout");

export const rootDir = __dirname;
export const UPLOAD_DIRECTORY = path.join(rootDir, "..", "uploads");
export const IMAGE_DIRECTORY = path.join(rootDir, "..", "images");

export const isProduction = process.env.NODE_ENV === Env.PROD;

if (isProduction) {
  $log.appenders.set("stdout", {
    type: "stdout",
    levels: ["info", "debug"],
    layout: {
      type: "json",
    },
  });

  $log.appenders.set("stderr", {
    levels: ["trace", "fatal", "error", "warn"],
    type: "stderr",
    layout: {
      type: "json",
    },
  });
}

registerProvider({
  provide: ZipCodeService,
  useClass: GeoJsonZipCodeService
});

@Configuration({
  rootDir,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8090,
  httpsPort: false, // CHANGE
  logger: {
    disableRoutesSummary: isProduction,
  },
  statics: {
    "/images": [
      {
        root: IMAGE_DIRECTORY,
      },
    ],
  },
  mount: {
    "/rest": [`${rootDir}/controllers/rest/*.ts`],
    "/": [PagesController],
  },
  swagger: [
    {
      path: "/v2/docs",
      specVersion: "2.0",
    },
    {
      path: "/v3/docs",
      specVersion: "3.0.3",
    },
  ],
  views: {
    root: `${rootDir}/../views`,
    viewEngine: "ejs",
  },
  typeorm: typeormConfig,
  exclude: ["**/*.spec.ts"],
  multer: {
    dest: UPLOAD_DIRECTORY,
  },
  imports: [BasicAuthProtocol],
  componentsScan: [
    `${rootDir}/middlewares/**/**.ts`,
    `${rootDir}/services/**/**.ts`,
  ],
  cache: false/* cache: {
    ttl: 300,
    store: "memory"
  },*/
})
export class Server implements BeforeRoutesInit {
  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  $beforeRoutesInit(): void {
    function ignoreFavicon(req: Request, res: Response, next: NextFunction) {
      if (req.originalUrl.includes("favicon.ico")) {
        res.status(204).end();
      }
      next();
    }

    let superSecretKey = "super-secret-key";
    this.app
      .use(ignoreFavicon)
      .use(cors())
      .use(layout())
      //.use(express.static(path.join(__dirname, "public")))
      //.use(cookieParser(superSecretKey))
      //.use(session({ cookie: { maxAge: 60000 } }))
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json())
      //.use(csrf({ cookie: true }))
      .use(
        bodyParser.urlencoded({
          extended: true,
        })
      )
      .use(flash());
  }
}
