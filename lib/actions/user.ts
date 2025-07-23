'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verify } from 'jsonwebtoken';
import { env } from '@/env.mjs';
import { getTenantDb } from '@/lib/db';
import { UserFormSchema, type UserFormInput } from '@/lib/dto/user';
import { users, usersToRoles } from '@/lib/db/schema/tenant';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import log from '../logger';

interface UserSession {
  tenantId: string;
  userId: number;
}

function isDatabaseError(error: unknown): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
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

export async function getUsersWithRoles() {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);
    
    const usersWithRoles = await db.query.users.findMany({
        with: {
            usersToRoles: {
                with: {
                    role: true
                }
            }
        }
    });

    return usersWithRoles.map(user => ({
       ...user,
        roles: user.usersToRoles.map(ur => ur.role.name).join(', ')
    }));
}

// The invalid re-export has been removed from here.

export async function upsertUserAction(data: UserFormInput) {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    const { id, name, email, password, roles: roleIdsStr } = data;
    const roleIds = roleIdsStr.map(Number);
    
    try {
        await db.transaction(async (tx) => {
            if (id) { // Update existing user
                const userToUpdate: { name: string; email: string; password?: string } = { name, email };
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 12);
                    userToUpdate.password = hashedPassword;
                }
                
                await tx.update(users).set(userToUpdate).where(eq(users.id, id));
                
                await tx.delete(usersToRoles).where(eq(usersToRoles.userId, id));
                if (roleIds.length > 0) {
                    await tx.insert(usersToRoles).values(roleIds.map(roleId => ({
                        userId: id,
                        roleId: roleId
                    })));
                }

            } else { // Create new user
                if (!password) throw new Error("Password is required for new users.");
                
                const hashedPassword = await bcrypt.hash(password, 12);
                
                const [newUser] = await tx.insert(users).values({
                    name,
                    email,
                    password: hashedPassword,
                }).returning({ id: users.id });

                if (roleIds.length > 0) {
                    await tx.insert(usersToRoles).values(roleIds.map(roleId => ({
                        userId: newUser.id,
                        roleId: roleId
                    })));
                }
            }
        });
    } catch (error: unknown) {
        log.error({ error }, 'Failed to upsert user');
        if (isDatabaseError(error) && error.code === '23505') {
            return { 
                success: false, 
                message: "A user with this email already exists.",
                errors: { email: ["This email is already in use."] }
            };
        }
        return { success: false, message: "An unexpected error occurred." };
    }

    revalidatePath('/dashboard/users');
    return { success: true, message: `User successfully ${id ? 'updated' : 'created'}.` };
}

export async function deleteUserAction(userId: number) {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    if (userId === session.userId) {
        return { success: false, message: "You cannot delete your own account." };
    }

    try {
        await db.delete(users).where(eq(users.id, userId));
        revalidatePath('/dashboard/users');
        return { success: true, message: "User deleted successfully." };
    } catch (error) {
        log.error({ error, userId }, 'Failed to delete user');
        return { success: false, message: "Failed to delete user." };
    }
}