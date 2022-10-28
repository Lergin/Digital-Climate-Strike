import {Constant, Controller, Get, HeaderParams, Req, View} from "@tsed/common";
import {Hidden, SwaggerSettings} from "@tsed/swagger";
import {Returns} from "@tsed/schema";

interface RegisteringViewData {
  data: any;
  errors: any;
  csrfToken: string;
}

@Hidden()
@Controller("/")
export class PagesController {
  @Constant("swagger")
  swagger: SwaggerSettings[];

  @Get("/")
  @View("index.ejs")
  @(Returns(200, String).ContentType("text/html"))
  get(
    @HeaderParams("x-forwarded-proto") protocol: string,
    @HeaderParams("host") host: string
  ) {
    const hostUrl = `${protocol || "http"}://${host}`;

    return {
      BASE_URL: hostUrl,
      docs: this.swagger.map((conf) => {
        return {
          url: hostUrl + conf.path,
          ...conf,
        };
      }),
    };
  }

  @Get("/admin")
  @View("admin.ejs")
  @(Returns(200, String).ContentType("text/html"))
  getAdmin(
    @HeaderParams("x-forwarded-proto") protocol: string,
    @HeaderParams("host") host: string
  ) {
    const hostUrl = `${protocol || "http"}://${host}`;

    return {
      BASE_URL: hostUrl,
    };
  }

  @Get("/socialmedia")
  @View("socialmedia.ejs")
  @(Returns(200, String).ContentType("text/html"))
  getSocialMedia(
    @HeaderParams("x-forwarded-proto") protocol: string,
    @HeaderParams("host") host: string
  ) {
    const hostUrl = `${protocol || "http"}://${host}`;

    return {
      BASE_URL: hostUrl,
    };
  }

  @Get("/register")
  @View("register.ejs")
  @(Returns(200, String).ContentType("text/html"))
  registerForm(
    @Req() req: any,
    @HeaderParams("x-forwarded-proto") protocol: string,
    @HeaderParams("host") host: string
  ): Promise<RegisteringViewData> {
    const hostUrl = `${protocol || "http"}://${host}`;

    return Promise.resolve({
      data: {},
      errors: {},
      csrfToken: "", //req.csrfToken() as string
      BASE_URL: hostUrl,
    });
  }
}
