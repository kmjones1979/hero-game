import {
  isSolanaError,
  SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
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

  const message = getDeepestMessage(err);
  return message.length > 200 ? `${message.slice(0, 200)}...` : message;
}

function getDeepestMessage(err: unknown): string {
  let deepest = err instanceof Error ? err.message : String(err);
  let current: unknown = err;

  while (current instanceof Error && current.cause) {
    current = current.cause;
    if (current instanceof Error) {
      deepest = current.message;
    }
  }

  return deepest;
}
