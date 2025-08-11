import { env } from '@/env.mjs';
import log from '@/lib/logger';

const NEON_API_BASE = 'https://console.neon.tech/api/v2';

const getHeaders = () => ({
  'Authorization': `Bearer ${env.NEON_API_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

export async function createNeonProject(tenantId: string) {
  log.info({ tenantId }, '[NeonAPI] Starting project creation process.');

  const projectResponse = await fetch(`${NEON_API_BASE}/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      project: { name: `edux-tenant-${tenantId}` },
    }),
  });

  if (!projectResponse.ok) {
    const errorBody = await projectResponse.text();
    log.error({ tenantId, status: projectResponse.status, errorBody }, '[NeonAPI] Failed to create project.');
    throw new Error(`Failed to create Neon project: ${errorBody}`);
  }

  const responseData = await projectResponse.json();
  const project = responseData.project;
  const connectionDetails = responseData.connection_uris?.[0];
  const connection_uri = connectionDetails?.connection_uri;

  if (!connection_uri) {
    log.error({ responseData }, '[NeonAPI] Connection URI could not be extracted from the response.');
    throw new Error('Connection URI could not be extracted from the Neon API response.');
  }

  log.info({ tenantId, projectId: project.id }, '[NeonAPI] Project created successfully.');

  return {
    projectId: project.id,
    connectionString: connection_uri,
  };
}

/**
 * Deletes a Neon project by its ID.
 * This is used for cleanup if the tenant setup process fails after project creation.
 * @param {string} projectId - The ID of the Neon project to delete.
 */
export async function deleteNeonProject(projectId: string) {
  log.warn({ projectId }, '[NeonAPI] Deleting Neon project due to setup failure.');
  
  const deleteResponse = await fetch(`${NEON_API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!deleteResponse.ok) {
    const errorBody = await deleteResponse.text();
    // Log this as an error, as it requires manual cleanup, but don't throw,
    // as we still want to inform the user that the initial signup failed.
    log.error({ projectId, status: deleteResponse.status, errorBody }, '[NeonAPI] CRITICAL: Failed to delete orphaned project. Manual cleanup required.');
  } else {
    log.info({ projectId }, '[NeonAPI] Successfully deleted orphaned project.');
  }
}
