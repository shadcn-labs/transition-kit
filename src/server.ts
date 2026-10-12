import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";

import { ROUTES } from "@/constants/routes";
import { homepageLinkHeader, routeRequest } from "@/src/server/request-routing";

const handle = createStartHandler(defaultStreamHandler);

export default createServerEntry({
  async fetch(request, options) {
    const routed = routeRequest(request);
    if (routed instanceof Response) {
      return routed;
    }

    const response = await handle(routed, options);
    if (new URL(request.url).pathname !== ROUTES.HOME) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set("Link", homepageLinkHeader);
    return new Response(response.body, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  },
});
