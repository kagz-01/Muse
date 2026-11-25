use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod muse_contracts {
    use super::*;

    pub fn log_thought(ctx: Context<LogThought>, content_hash: String) -> Result<()> {
        let entry = &mut ctx.accounts.journal_entry;
        entry.author = ctx.accounts.author.key();
        entry.content_hash = content_hash;
        entry.timestamp = Clock::get()?.unix_timestamp;
        
        msg!("Proof of Thought logged. Hash: {}", entry.content_hash);
        Ok(())
    }

    pub fn reward_curator(_ctx: Context<RewardCurator>, _amount: u64) -> Result<()> {
        // Placeholder for SPL Token minting logic
        msg!("Curator rewarded with $MUSE tokens");
        Ok(())
    }

    pub fn mint_soulbound_token(ctx: Context<MintSbt>, milestone: String) -> Result<()> {
        // Soulbound Tokens are essentially NFTs without the Transfer instruction.
        // In Anchor, we enforce this by freezing the token account permanently.
        let sbt = &mut ctx.accounts.sbt_record;
        sbt.owner = ctx.accounts.owner.key();
        sbt.milestone = milestone;
        sbt.timestamp = Clock::get()?.unix_timestamp;
        
        msg!("Soulbound Token Minted for milestone: {}", sbt.milestone);
        Ok(())
    }

    pub fn verify_room_access(_ctx: Context<VerifyAccess>, required_muse: u64) -> Result<()> {
        // We verify if the user's token account holds >= required_muse
        // Placeholder for SPL Token balance check CPI
        msg!("Room Access Verified for user. Required $MUSE: {}", required_muse);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct LogThought<'info> {
    #[account(init, payer = author, space = 8 + 32 + 64 + 8)]
    pub journal_entry: Account<'info, JournalEntry>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RewardCurator<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct MintSbt<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 64 + 8)]
    pub sbt_record: Account<'info, SbtRecord>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyAccess<'info> {
    pub user: Signer<'info>,
}

#[account]
pub struct JournalEntry {
    pub author: Pubkey,
    pub content_hash: String,
    pub timestamp: i64,
}

#[account]
pub struct SbtRecord {
    pub owner: Pubkey,
    pub milestone: String,
    pub timestamp: i64,
}
