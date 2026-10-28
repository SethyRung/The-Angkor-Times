import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

// The transport refuses a body over 4 MiB. An 8 MB image is about 11 MB of base64, which is this site's upload limit.
const bodyLimit = 12 * 1024 * 1024;

type TransportProto = {
  handleRequest: (
    this: { _maxRequestBodySize: number },
    req: Request,
    options?: unknown,
  ) => Promise<Response>;
  _maxRequestBodySize: number;
};

let raised = false;

export function allowAgentImageUploads() {
  if (raised) return;
  raised = true;
  const proto = WebStandardStreamableHTTPServerTransport.prototype as unknown as TransportProto;
  const original = proto.handleRequest;
  proto.handleRequest = function (req, options) {
    this._maxRequestBodySize = bodyLimit;
    return original.call(this, req, options);
  };
}
