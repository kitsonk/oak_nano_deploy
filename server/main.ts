import { App } from "../components/App.tsx";
import {
  Application,
  contentType,
  h,
  Helmet,
  lookup,
  proxy,
  renderSSR,
  Router,
} from "./deps.ts";
import type { ProxyOptions } from "./deps.ts";

const comments = ["server side comment one"];

const ssr = renderSSR(h(App, { comments }));
const { body, head, footer } = Helmet.SSR(ssr);

const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${head.join("\n")}
  </head>
  <body>
    ${body}
    ${footer.join("\n")}
    <script type="module" src="/bundle.js"></script>
  </body>
</html>`;

const router = new Router();

const proxyOptions: ProxyOptions = {
  contentType(url, ct) {
    if (ct) {
      ct = contentType(ct);
    }
    const impliedContentType = contentType(lookup(url) ?? "");
    if (ct !== impliedContentType) {
      return impliedContentType;
    }
  },
};

router
  .get("/", (ctx) => {
    ctx.response.body = indexHtml;
  })
  .get("/static/:path*", proxy(new URL("../static/", import.meta.url)))
  .get(
    "/bundle.js*",
    proxy(new URL("../build/", import.meta.url), proxyOptions),
  );

export const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (ctx, next) => {
  ctx.response.headers.delete("content-security-policy");
  await next();
});
