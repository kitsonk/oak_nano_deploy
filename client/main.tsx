/// <reference lib="dom" />

import { h, hydrate } from "./deps.ts";
import { Comments } from "../components/Comments.tsx";

const comments = ["client side comment one", "client side comment two"];

function start() {
  hydrate(
    <Comments comments={comments} />,
    document.getElementById("comments"),
  );
}

addEventListener("load", () => start());
