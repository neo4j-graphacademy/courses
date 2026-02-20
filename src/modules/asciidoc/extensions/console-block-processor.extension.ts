import { CONSOLE_URL } from "../../../constants";

/* eslint-disable */
export function consoleBlockProcessor(registry: any) {
  registry.blockMacro(function () {
    // @ts-ignore
    const self: any = this;

    self.named("console");
    self.process(function (parent: any, text: any, attrs: any) {
      // Replace backticks
      text = text.replace(/`(.*)`/, "<code>$1</code>");

      const { guide, model, arg, cmd, tab, tool } = attrs;

      const url = new URL(CONSOLE_URL);

      if (tab) {
        url.pathname = `/${tab}`;
      }

      if (tool) {
        url.pathname = `/tools/${tool}`;
      }

      const connectUrl = attrs["connect-url"];

      if (connectUrl) {
        url.searchParams.set("connectURL", connectUrl);
      }

      if (guide) {
        url.searchParams.set("cmd", "guide");
        url.searchParams.set("arg", guide);
        url.searchParams.set("guide", guide);
      }

      if (cmd) {
        url.searchParams.set("cmd", cmd);
      }
      if (arg) {
        url.searchParams.set("arg", arg);
      }

      if (model) {
        url.searchParams.set("model", model);
      }

      // Always set attribution to graphacademy
      url.searchParams.set("attribution", "graphacademy");

      const link = `<a class="btn btn-console" target="_blank" href="${url.toString()}">${text} &rarr;</a>`;

      return self.createBlock(parent, "pass", link);
    });
  });
}
