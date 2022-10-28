import {useDecorators} from "@tsed/core";
import {Authenticate, AuthorizeOptions} from "@tsed/passport";
import {In, Returns, Security} from "@tsed/schema";
import {Unauthorized} from "@tsed/exceptions";

/**
 * Set BasicAuth access on decorated route
 * @param options
 */
export function BasicAuth(options: AuthorizeOptions = {}) {
  return useDecorators(
    Authenticate("basic", options),
    Security("basic"),
    Returns(401, Unauthorized).Description("Unauthorized"),
    In("header").Name("Authorization").Description("Basic authorization").Type(String).Required(false)
  );
}
