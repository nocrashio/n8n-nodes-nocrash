import type {
  IAuthenticateGeneric,
  Icon,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

/**
 * NocrashApi — credential for the NoCrash platform itself.
 *
 * Used by the Heartbeat and Report Failure operations to authenticate against
 * the NoCrash API. The key is a NoCrash bearer token (starts with `nc_`),
 * created in the NoCrash dashboard under Settings -> API keys, and is sent as
 * `Authorization: Bearer <apiKey>`.
 */
export class NocrashApi implements ICredentialType {
  name = "nocrashApi";

  displayName = "NoCrash API";

  icon: Icon = { light: "file:icons/nocrash.svg", dark: "file:icons/nocrash.dark.svg" };

  documentationUrl = "https://nocrash.io/docs/api";

  properties: INodeProperties[] = [
    {
      displayName: "NoCrash API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      placeholder: "nc_...",
      description:
        "Your NoCrash API key (starts with nc_). Create one in the NoCrash dashboard under Settings -> API keys.",
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        Authorization: "=Bearer {{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://nocrash.io",
      url: "/api/v1/me",
      method: "GET",
    },
  };
}
