import * as colors from "https://deno.land/std@0.99.0/fmt/colors.ts";

/**
 * Format bytes as human-readable text.
 *
 * Adapted from: https://stackoverflow.com/a/14919494/145214
 */
function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

const encoder = new TextEncoder();

async function write(path: string, text: string): Promise<void> {
  const url = new URL(path, import.meta.url);
  const u8 = encoder.encode(text);
  await Deno.writeFile(url, u8, { mode: parseInt("0766", 8) });
  console.log(
    colors.brightGreen("Emitted"),
    path,
    colors.gray(`(${humanFileSize(u8.length)})`),
  );
}

console.log(colors.brightGreen("Building"), "client bundle...");

Deno.permissions.request({ name: "net", host: "deno.land" });
Deno.permissions.request({ name: "read", path: "." });
Deno.permissions.request({ name: "write", path: "./build/" });

const { files, diagnostics } = await Deno.emit("./client/main.tsx", {
  bundle: "module",
  compilerOptions: {
    jsx: "react",
    jsxFactory: "h",
    jsxFragmentFactory: "Fragment",
    lib: [
      "es2020",
      "dom",
      "dom.iterable",
      "dom.asynciterable",
      "deno.ns",
      "deno.unstable",
    ],
    target: "es2020",
    useDefineForClassFields: true,
  },
});

if (diagnostics.length) {
  console.log("errors");
}

console.log(colors.brightGreen("Writing"), "client bundle...");
await write(
  "./build/bundle.js",
  `${files["deno:///bundle.js"]}\n//# sourceMappingURL=./bundle.js.map`,
);
await write("./build/bundle.js.map", files["deno:///bundle.js.map"]);
