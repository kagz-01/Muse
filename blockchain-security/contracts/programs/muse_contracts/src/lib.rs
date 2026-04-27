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
        // This will require the anchor-spl dependency and CPI calls to Token Program
        msg!("Curator rewarded with $MUSE tokens");
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

#[account]
pub struct JournalEntry {
    pub author: Pubkey,
    pub content_hash: String,
    pub timestamp: i64,
}
