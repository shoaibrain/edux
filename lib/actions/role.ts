'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verify } from 'jsonwebtoken';
import { env } from '@/env.mjs';
import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import log from '../logger';
import { roles } from '../db/schema/tenant';
import { RoleFormSchema } from '../dto/role';

interface UserSession {
  tenantId: string;
  userId: number;
}

async function getSession() {
  const token = (await cookies()).get('authToken')?.value;
  if (!token) {
    redirect('/login');
  }
  try {
    return verify(token, env.JWT_SECRET) as UserSession;
  } catch (e) {
    log.error({ error: e }, 'Invalid session token');
    redirect('/login');
  }
}

export async function getRoles() {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);
    return db.query.roles.findMany();
}

export async function upsertRole(data: unknown) {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    const validatedFields = RoleFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid role data.' };
    }

    const { id, name, description } = validatedFields.data;

    try {
        if (id) {
            await db.update(roles).set({ name, description }).where(eq(roles.id, id));
        } else {
            await db.insert(roles).values({ name, description });
        }
        revalidatePath('/dashboard/roles');
        revalidatePath('/dashboard/users'); // Also revalidate users page in case roles changed
        return { success: true, message: `Role successfully ${id ? 'updated' : 'created'}.` };
    } catch (error) {
        log.error({ error }, 'Failed to upsert role');
        return { success: false, message: 'Failed to save role.' };
    }
}

export async function deleteRole(roleId: number) {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    try {
        // You might want to add a check here to ensure the role is not in use
        await db.delete(roles).where(eq(roles.id, roleId));
        revalidatePath('/dashboard/roles');
        revalidatePath('/dashboard/users');
        return { success: true, message: 'Role deleted successfully.' };
    } catch (error) {
        log.error({ error, roleId }, 'Failed to delete role');
        return { success: false, message: 'Failed to delete role. It might be in use.' };
    }
}