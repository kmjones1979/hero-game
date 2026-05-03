import {
  getAddressEncoder,
  getBytesEncoder,
  getProgramDerivedAddress,
  getU64Encoder,
  type Address,
  type ProgramDerivedAddress,
} from "@solana/kit";
import { HERO_GAME_PROGRAM_ADDRESS } from "../generated/hero_game";

export async function findHeroPda(
  user: Address,
  index: bigint,
): Promise<ProgramDerivedAddress> {
  return getProgramDerivedAddress({
    programAddress: HERO_GAME_PROGRAM_ADDRESS,
    seeds: [
      getBytesEncoder().encode(new Uint8Array([104, 101, 114, 111])), // "hero"
      getAddressEncoder().encode(user),
      getU64Encoder().encode(index),
    ],
  });
}

export const CLASS_NAMES = ["Warrior", "Mage", "Rogue", "Cleric", "Ranger"] as const;
export const CLASS_EMOJI = ["⚔️", "🔮", "🗡️", "✨", "🏹"] as const;
export const RARITY_NAMES = ["Common", "Rare", "Epic", "Legendary"] as const;

export function classLabel(c: number): string {
  return CLASS_NAMES[c] ?? "Unknown";
}

export function classEmoji(c: number): string {
  return CLASS_EMOJI[c] ?? "❓";
}

export function rarityLabel(r: number): string {
  return RARITY_NAMES[r] ?? "Unknown";
}
