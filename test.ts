import { createWorker } from "https://deno.land/x/dectyl@0.4.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";

Deno.test({
  name: "server - renders app",
  async fn() {
    const server = await createWorker("./main.ts");
    await server.run(async () => {
      const [actual] = await server.fetch("/");

      assertEquals(
        await actual.text(),
        `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Oak Deno Deploy Example</title><meta content="Server Side Rendering oka/Nano/Deploy" name="description" />\n  </head>\n  <body>\n    <div><h2>Comments</h2><div id="comments"><ul><li>server side comment one</li></ul></div></div>\n    <script src="/bundle.js"></script>\n    <script type="module" src="/bundle.js"></script>\n  </body>\n</html>`,
      );
    });
  },
});
