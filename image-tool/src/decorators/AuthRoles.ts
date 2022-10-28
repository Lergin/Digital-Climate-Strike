import {UseBefore, Middleware, Req, Context, UseBeforeEach} from "@tsed/common";
import {StoreSet, useDecorators} from "@tsed/core";
import {Forbidden} from "@tsed/exceptions";
import {Returns} from "@tsed/schema";
import { AuthRolesMiddleware } from "../middlewares/AuthRolesMiddleware";
import { BasicAuth } from "./BasicAuth";

export enum Role {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SOCIAL_MEDIA = 'social-media'
}

function createAuthRoleDecorator(... roles: Role[]) {
  return useDecorators(
    UseBefore(AuthRolesMiddleware),
    UseBeforeEach(AuthRolesMiddleware),
    StoreSet(AuthRolesMiddleware, roles),
    BasicAuth(),
    Returns(403, Forbidden).Description("Forbidden")
  )
}

export function AuthAdmin() {
  return createAuthRoleDecorator(Role.ADMIN);
}

export function AuthModerator() {
  return createAuthRoleDecorator(Role.ADMIN, Role.MODERATOR);
}

export function AuthSocialMedia() {
  return createAuthRoleDecorator(Role.ADMIN, Role.SOCIAL_MEDIA);
}
