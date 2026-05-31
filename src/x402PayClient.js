import "dotenv/config";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { createPaymentHeader, selectPaymentRequirements } from "x402/client";

export async function createX402PaymentHeader(paymentRequirementsResponse) {
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("PRIVATE_KEY is missing in .env");
  }

  const account = privateKeyToAccount(privateKey);

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http()
  });

  const selected = selectPaymentRequirements(
    paymentRequirementsResponse.accepts,
    "base-sepolia",
    "exact"
  );

  return await createPaymentHeader(
    walletClient,
    paymentRequirementsResponse.x402Version,
    selected
  );
}
