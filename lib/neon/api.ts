import { env } from '@/env.mjs';
import log from '@/lib/logger';

const NEON_API_BASE = 'https://console.neon.tech/api/v2';

export async function createNeonProject(tenantId: string) {
  log.info({ tenantId }, '[NeonAPI] Starting project creation process.');

  const headers = {
    'Authorization': `Bearer ${env.NEON_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const projectResponse = await fetch(`${NEON_API_BASE}/projects`, {
    method: 'POST',
    headers,
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

  // The modification to create a pooled string has been removed.
  // We will now return the original, direct connection string.

  return {
    projectId: project.id,
    connectionString: connection_uri,
  };
}