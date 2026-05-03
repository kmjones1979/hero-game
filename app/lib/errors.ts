import {
  isSolanaError,
  SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
  SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
} from "@solana/kit";
import {
  getHeroGameErrorMessage,
  HERO_GAME_ERROR__MINT_COUNTER_OVERFLOW,
  type HeroGameError,
} from "../generated/hero_game";

const HERO_GAME_ERROR_CODES: Record<number, HeroGameError> = {
  [HERO_GAME_ERROR__MINT_COUNTER_OVERFLOW]: HERO_GAME_ERROR__MINT_COUNTER_OVERFLOW,
};

export function parseTransactionError(err: unknown): string {
  if (err instanceof Error && err.message.includes("User rejected")) {
    return "Transaction was rejected by the wallet.";
  }

  if (
    isSolanaError(err, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM) &&
    typeof err.context?.code === "number"
  ) {
    const heroError = HERO_GAME_ERROR_CODES[err.context.code];
    if (heroError !== undefined) {
      return getHeroGameErrorMessage(heroError);
    }
  }

  if (
    isSolanaError(
      err,
      SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
    )
  ) {
    const logs = (err.context as Record<string, unknown>)?.logs;
    if (Array.isArray(logs)) {
      const programError = logs.find(
        (l: string) => l.includes("Error") || l.includes("failed"),
      );
      if (programError) return String(programError);
    }
    return "Transaction simulation failed. Check your wallet balance and network.";
  }

  const nested = extractNestedCause(err);
  if (nested && nested !== err) {
    return parseTransactionError(nested);
  }

  const message = getDeepestMessage(err);
  return message.length > 200 ? `${message.slice(0, 200)}...` : message;
}

function extractNestedCause(err: unknown): unknown {
  if (err instanceof Error && err.cause) return err.cause;
  if (err != null && typeof err === "object" && "context" in err) {
    const ctx = (err as Record<string, unknown>).context;
    if (ctx && typeof ctx === "object") {
      const result = (ctx as Record<string, unknown>).transactionPlanResult;
      if (result && typeof result === "object" && "status" in result) {
        const r = result as Record<string, unknown>;
        if (r.status === "failed" && r.error) return r.error;
      }
    }
  }
  return undefined;
}

function getDeepestMessage(err: unknown): string {
  if (err == null) return "An unknown error occurred.";

  let deepest = err instanceof Error ? err.message : String(err);
  let current: unknown = err;

  while (current instanceof Error && current.cause) {
    current = current.cause;
    if (current instanceof Error) {
      deepest = current.message;
    }
  }

  if (!deepest || deepest === "undefined" || deepest === "null") {
    if (err instanceof Error && err.name) return err.name;
    try {
      const json = JSON.stringify(err, null, 0);
      if (json && json !== "{}") return json;
    } catch {
      // fall through
    }
    return "An unknown error occurred.";
  }

  return deepest;
}
