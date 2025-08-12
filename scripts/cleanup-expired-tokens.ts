import { getTenantDb } from '@/lib/db';
import { verificationTokens } from '@/lib/db/schema/tenant';
import { lte } from 'drizzle-orm';
import log from '@/lib/logger';

// This script would need access to a list of all tenant IDs.
// For this example, we'll assume you pass it as an argument.

/**
 * @description Cleans up expired verification tokens for a specific tenant.
 */
async function cleanupTokensForTenant(tenantId: string) {
  log.info({ tenantId }, 'Starting cleanup of expired tokens.');
  try {
    const db = await getTenantDb(tenantId);
    const now = new Date();

    // Delete all verification tokens where the expiration date is less than or equal to now
    const result = await db.delete(verificationTokens).where(lte(verificationTokens.expiresAt, now)).returning({ id: verificationTokens.id });

    log.info({ tenantId, count: result.length }, 'Successfully cleaned up expired tokens.');
  } catch (error) {
    log.error({ error, tenantId }, 'Failed to cleanup expired tokens for tenant.');
  }
}

// Example of how you might run this for all tenants
async function runCleanupForAllTenants() {
    // In a real scenario, you would fetch all tenant IDs from your main database.
    const allTenantIds = ['your-first-tenant', 'your-second-tenant']; // Replace with actual logic
    
    log.info('Starting cleanup job for all tenants.');
    for (const tenantId of allTenantIds) {
        await cleanupTokensForTenant(tenantId);
    }
    log.info('Cleanup job finished for all tenants.');
}

// To run this script: tsx scripts/cleanup-expired-tokens.ts
runCleanupForAllTenants().catch(console.error);
