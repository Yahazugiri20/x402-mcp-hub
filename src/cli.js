import readline from "readline";
import { detectIntent, chooseService } from "./router.js";
import { executeService } from "./executor.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("");
console.log("x402 MCP Hub CLI");
console.log("type agent command, example:");
console.log("@agent summarize https://example.com");
console.log("");

function ask() {
  rl.question("mention > ", async (text) => {
    if (text.toLowerCase() === "exit") {
      rl.close();
      return;
    }

    const intent = detectIntent(text);
    const service = await chooseService(intent);
    const execution = await executeService(service, text);

    console.log("");
    console.log("intent:", intent);
    console.log("selected service:", service ? service.id : "none");

    if (execution.payment) {
      console.log("payment:", execution.payment.status);
      if (execution.payment.required) {
        console.log("amount:", execution.payment.amount, execution.payment.asset);
      }
    }

    console.log("result:", execution.result || execution.error);
    console.log("");

    ask();
  });
}

ask();
