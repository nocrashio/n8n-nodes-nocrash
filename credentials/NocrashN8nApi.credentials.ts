import type {
  IAuthenticateGeneric,
  Icon,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

/**
 * NocrashN8nApi — credential for the user's OWN n8n instance.
 *
 * Used by the "Audit my n8n" operation to list and read workflow design JSON
 * from the operator's instance. The API key is sent as the `X-N8N-API-KEY`
 * header on every request. This key never leaves the user's n8n — only the
 * credential-stripped design JSON is forwarded to the NoCrash Grader.
 */
export class NocrashN8nApi implements ICredentialType {
  name = "nocrashN8nApi";

  // eslint-disable-next-line n8n-nodes-base/cred-class-field-display-name-miscased -- "n8n" is the brand's canonical lowercase spelling
  displayName = "NoCrash - Your n8n Instance API";

  icon: Icon = { light: "file:icons/nocrash.svg", dark: "file:icons/nocrash.dark.svg" };

  documentationUrl = "https://docs.n8n.io/api/authentication/";

  properties: INodeProperties[] = [
    {
      displayName: "n8n Instance URL",
      name: "instanceUrl",
      type: "string",
      default: "",
      required: true,
      placeholder: "https://your-instance.app.n8n.cloud",
      description:
        "The base URL of your own n8n instance (no trailing slash needed)",
    },
    {
      displayName: "n8n API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      description:
        "Create one in your n8n under Settings -> API. NoCrash reads workflow design only; credentials are stripped before anything is sent.",
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        "X-N8N-API-KEY": "={{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "={{$credentials.instanceUrl.replace(/\\/+$/, '')}}",
      url: "/api/v1/workflows",
      method: "GET",
      qs: { limit: 1 },
    },
  };
}
