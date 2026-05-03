use anchor_lang::prelude::*;
use solana_program::hash::hashv;

declare_id!("7Yzbjo3ptcfbK1M4oTHxaGZPkZN1WYgVVjXkqAW94VF3");

#[program]
pub mod hero_game {
    use super::*;

    pub fn mint_hero(ctx: Context<MintHero>, client_seed: u64) -> Result<()> {
        let player = &mut ctx.accounts.player;
        let hero = &mut ctx.accounts.hero;
        let user_key = ctx.accounts.user.key();

        if player.owner == Pubkey::default() {
            player.owner = user_key;
            player.bump = ctx.bumps.player;
        }

        let clock = Clock::get()?;
        let index = player.heroes_minted;

        let (class, rarity, hp, attack, defense, speed) =
            roll_hero(&user_key, client_seed, index, clock.slot, clock.unix_timestamp);

        hero.owner = user_key;
        hero.index = index;
        hero.class = class;
        hero.rarity = rarity;
        hero.hp = hp;
        hero.attack = attack;
        hero.defense = defense;
        hero.speed = speed;
        hero.minted_at = clock.unix_timestamp;
        hero.bump = ctx.bumps.hero;

        player.heroes_minted = player
            .heroes_minted
            .checked_add(1)
            .ok_or(HeroError::MintCounterOverflow)?;

        Ok(())
    }
}

// WARNING: This randomness is predictable and exploitable by validators / MEV.
// Suitable for demos only. For production use Switchboard VRF or ORAO VRF.
fn roll_hero(
    user: &Pubkey,
    client_seed: u64,
    index: u64,
    slot: u64,
    unix_ts: i64,
) -> (u8, u8, u16, u16, u16, u16) {
    let digest = hashv(&[
        &slot.to_le_bytes(),
        &unix_ts.to_le_bytes(),
        user.as_ref(),
        &client_seed.to_le_bytes(),
        &index.to_le_bytes(),
    ]);
    let b = digest.to_bytes();

    let rarity_roll = b[0] % 100;
    let rarity: u8 = if rarity_roll < 60 {
        0 // Common
    } else if rarity_roll < 85 {
        1 // Rare
    } else if rarity_roll < 97 {
        2 // Epic
    } else {
        3 // Legendary
    };

    let class = b[1] % 5;

    let (base, span) = match rarity {
        0 => (50u16, 51u16),
        1 => (100u16, 51u16),
        2 => (150u16, 51u16),
        _ => (200u16, 101u16),
    };

    let roll = |hi: u8, lo: u8| -> u16 {
        let raw = u16::from_le_bytes([lo, hi]);
        base + (raw % span)
    };

    let hp = roll(b[2], b[3]);
    let attack = roll(b[4], b[5]);
    let defense = roll(b[6], b[7]);
    let speed = roll(b[8], b[9]);

    (class, rarity, hp, attack, defense, speed)
}

#[derive(Accounts)]
#[instruction(client_seed: u64)]
pub struct MintHero<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + Player::INIT_SPACE,
        seeds = [b"player", user.key().as_ref()],
        bump,
    )]
    pub player: Account<'info, Player>,

    #[account(
        init,
        payer = user,
        space = 8 + Hero::INIT_SPACE,
        seeds = [b"hero", user.key().as_ref(), &player.heroes_minted.to_le_bytes()],
        bump,
    )]
    pub hero: Account<'info, Hero>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub owner: Pubkey,
    pub heroes_minted: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Hero {
    pub owner: Pubkey,
    pub index: u64,
    pub class: u8,
    pub rarity: u8,
    pub hp: u16,
    pub attack: u16,
    pub defense: u16,
    pub speed: u16,
    pub minted_at: i64,
    pub bump: u8,
}

#[error_code]
pub enum HeroError {
    #[msg("Mint counter overflow")]
    MintCounterOverflow,
}
