import { Req } from "@tsed/common";
import { Arg, OnInstall, OnVerify, Protocol } from "@tsed/passport";
import { Strategy } from "passport";
import { BasicStrategy } from "passport-http";
import { Role } from "../decorators/AuthRoles";

/**
 * Basic example. Don't use in production
 */
const AUTH_CRENDETIALS = [
  { user: "admin", password: "admin", role: Role.ADMIN },
  { user: "user", password: "user", role: Role.MODERATOR },
  { user: "social-media", password: "social-media", role: Role.SOCIAL_MEDIA },
];

@Protocol({
  name: "basic",
  useStrategy: BasicStrategy,
  settings: {},
})
export class BasicAuthProtocol implements OnVerify, OnInstall {
  async $onVerify(
    @Req() request: Req,
    @Arg(0) login: string,
    @Arg(1) password: string
  ) {
    const user = AUTH_CRENDETIALS.find((item) => item.user === login && item.password === password);

    if (!user) {
      return false;
    }

    return { ... user, password: '' }
  }

  $onInstall(strategy: Strategy): void {
    // intercept the strategy instance to adding extra configuration
  }
}
