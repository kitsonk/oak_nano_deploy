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
        `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    \n  </head>\n  <body>\n    \n    \n    <script type="module" src="/bundle.js"></script>\n  </body>\n</html>`,
      );
    });
  },
});
