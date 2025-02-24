import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
import { green, cyan } from "https://deno.land/std@0.203.0/fmt/colors.ts";

import Docker from "./docker.ts";

const plugins = [new Docker()];

const history: string[] = [];

async function repl(
  message = "",
  suggestions = ["use", "help", "list", "exit", ...history],
  evaluate?: (command: string) => Promise<void>
) {
  const command = await Input.prompt({
    message,
    suggestions,
  });

  if (command === "exit") {
    if (message === "") {
      console.log("Bye!");
      return;
    }
    repl();
    return;
  }

  if (command === "list" && message === "") {
    console.log("Available plugins:");
    plugins.forEach((plugin) => console.log(green(plugin.name)));
    console.log(`type ${cyan("use <plugin>")} to use a plugin`);
    history.push("list");
    repl(message, suggestions, evaluate);
    return;
  }

  if (command === "help" && message === "") {
    console.log(`Common Commands:
    use         Use a plugin
    help        Show this message
    list        List available plugins
    exit        Exit the repl`);
    repl(message, suggestions, evaluate);
    return;
  }

  if (command.startsWith("use ")) {
    const plugin = command.split(" ")[1];
    if (plugins.find((p) => p.name === plugin)) {
      const plugin = new Docker();
      history.push(`use ${plugin.name}`);
      repl(
        plugin.name,
        [...Object.keys(plugin.commands), ...history],
        (command: string) => new Docker().evaluate(command)
      );
      return;
    } else {
      console.log(`plugin ${green(plugin)} not found`);
    }
    repl(message, suggestions, evaluate);
    return;
  }

  if (evaluate) {
    history.push(command);
    await evaluate(command);
    repl(message, [...suggestions, ...history], evaluate);
    return;
  }

  repl(message, suggestions, evaluate);
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Repl v0.2.1 🚀 ✨");
  console.log("exit using ctrl+c, or exit, type help for more info");
  repl();
}
