import { App } from "../components/App.tsx";
import { Application, h, Helmet, proxy, renderSSR, Router } from "./deps.ts";

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

router
  .get("/", (ctx) => {
    ctx.response.body = indexHtml;
  })
  .get("/static/:path*", proxy(new URL("../static/", import.meta.url)))
  .get("/bundle.js", proxy(new URL("../build/", import.meta.url)));

export const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());
