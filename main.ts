import { app } from "./server/main.ts";

app.addEventListener("error", (evt) => {
  if ("stack" in evt.error) {
    console.log(evt.error.stack);
  } else if ("message" in evt.error) {
    console.log(evt.error.message);
  } else {
    console.log(`An undefined application error occurred.`);
  }
});

addEventListener("fetch", app.fetchEventHandler());
