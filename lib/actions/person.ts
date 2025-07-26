'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import log from '../logger';
import { enforcePermission, getSession, hasPermission } from '../session';
import { people, users, usersToRoles, roles, schools, personTypeEnum } from '../db/schema/tenant';
import { PersonFormSchema, type PersonFormInput } from '@/lib/dto/person';

function isDatabaseError(error: unknown): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

export async function getPeople() {
    await enforcePermission('person:read');
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    try {
        // Fetch people and eager load their associated user record (with usersToRoles) and school record
        const result = await db.query.people.findMany({
            with: {
                user: {
                    with: {
                        usersToRoles: true, // Load usersToRoles to get user's roles for defaultUserRoles in form
                    }
                },
                school: true,
            },
        });
        return result;
    } catch (error) {
        log.error({ error, tenantId: session.tenantId }, 'Failed to fetch people.');
        throw new Error('Failed to retrieve people.');
    }
}

export async function upsertPersonAction(data: PersonFormInput) {
    const session = await getSession();

    const validatedFields = PersonFormSchema.safeParse(data);

    if (!validatedFields.success) {
        log.warn({ errors: validatedFields.error.flatten(), data }, 'Invalid person data provided for upsert.');
        return { success: false, message: 'Invalid person data.' };
    }

    const {
        id, schoolId, firstName, lastName, middleName, dateOfBirth, gender,
        contactEmail, contactPhone, address, personType, profilePictureUrl,
        createUserAccount, userEmail, userPassword, userRoles
    } = validatedFields.data;

    const requiredPermission = id ? 'person:update' : 'person:create';
    await enforcePermission(requiredPermission);

    const db = await getTenantDb(session.tenantId);

    // Fetch `canAssignRoles` and `hasUserAccount` within the action scope
    const canAssignRoles = await hasPermission('user:assign_roles');
    const hasUserAccount = id ? !!(await db.query.users.findFirst({ where: eq(users.personId, id) })) : false;


    try {
        let personId: number;
        await db.transaction(async (tx) => {
            // 1. Upsert Person Record
            if (id) { // Update existing person
                await tx.update(people).set({
                    schoolId: schoolId,
                    firstName,
                    lastName,
                    middleName,
                    // Convert string to Date object, or null if empty string/null/undefined
                    //@ts-expect-error('ignore')
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    gender,
                    contactEmail,
                    contactPhone,
                    address,
                    // Cast personType to the exact enum value type expected by Drizzle
                    personType: personType as typeof personTypeEnum.enumValues[number],
                    profilePictureUrl,
                    updatedAt: new Date(),
                }).where(eq(people.id, id));
                personId = id;
                log.info({ personId, firstName, lastName, tenantId: session.tenantId }, 'Person updated.');
            } else { // Create new person
                //@ts-expect-error('expected')
                const [newPerson] = await tx.insert(people).values({
                    schoolId: schoolId,
                    firstName,
                    lastName,
                    middleName,
                    // Convert string to Date object, or null if empty string/null/undefined
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    gender,
                    contactEmail,
                    contactPhone,
                    address,
                    // Cast personType to the exact enum value type expected by Drizzle
                    personType: personType as typeof personTypeEnum.enumValues[number],
                    profilePictureUrl,
                }).returning({ id: people.id });
                personId = newPerson.id;
                log.info({ personId, firstName, lastName, tenantId: session.tenantId }, 'Person created.');
            }

            // 2. Handle User Account Creation/Update if requested
            if (createUserAccount) {
                await enforcePermission('user:grant_access');

                if (!userEmail) {
                    throw new Error("User email is required to create a user account.");
                }

                const existingUser = await tx.query.users.findFirst({ where: eq(users.personId, personId) });

                let currentUserId: number;

                if (existingUser) {
                    // Update existing user account
                    const userUpdateData: { email: string; password?: string } = { email: userEmail };
                    if (userPassword) { // Only update password if provided
                        userUpdateData.password = await bcrypt.hash(userPassword, 12);
                    }
                    await tx.update(users).set(userUpdateData).where(eq(users.personId, personId));
                    currentUserId = existingUser.id;
                    log.info({ personId, userEmail, tenantId: session.tenantId }, 'User account updated for person.');
                } else {
                    // Create new user account
                    if (!userPassword) {
                        throw new Error("User password is required to create a new user account.");
                    }
                    const hashedPassword = await bcrypt.hash(userPassword, 12);
                    const [newUser] = await tx.insert(users).values({
                        personId,
                        email: userEmail,
                        password: hashedPassword,
                    }).returning({ id: users.id });
                    currentUserId = newUser.id;
                    log.info({ personId, userEmail, userId: newUser.id, tenantId: session.tenantId }, 'User account created for person.');
                }

                // 3. Assign Roles to User
                // `canAssignRoles` is already fetched at the top of the function
                if (canAssignRoles && userRoles && userRoles.length > 0) {
                    await enforcePermission('user:assign_roles');
                    const roleIds = userRoles.map(Number);

                    // Clear existing roles for this user and re-insert
                    await tx.delete(usersToRoles).where(eq(usersToRoles.userId, currentUserId));

                    await tx.insert(usersToRoles).values(roleIds.map(roleId => ({
                        userId: currentUserId,
                        roleId: roleId,
                        schoolId: schoolId || null,
                    })));
                    log.info({ userId: currentUserId, assignedRoles: userRoles, tenantId: session.tenantId }, 'Roles assigned to user.');
                } else if (canAssignRoles && userRoles && userRoles.length === 0 && existingUser) {
                    // If user has permission to assign roles and no roles are selected, remove existing roles
                    await enforcePermission('user:assign_roles');
                    await tx.delete(usersToRoles).where(eq(usersToRoles.userId, currentUserId));
                    log.info({ userId: currentUserId, tenantId: session.tenantId }, 'All roles removed from user.');
                }
            } else if (hasUserAccount && !createUserAccount) { // `hasUserAccount` is already fetched at the top
                // If user unchecks "Grant System Access" and an account exists, delete the user account
                await enforcePermission('user:grant_access');
                await tx.delete(users).where(eq(users.personId, personId));
                log.info({ personId, tenantId: session.tenantId }, 'User account revoked for person.');
            }
        });
    } catch (error: unknown) {
        log.error({ error, tenantId: session.tenantId, userId: session.userId, data }, 'Failed to upsert person or create/update user account');
        if (isDatabaseError(error) && error.code === '23505') {
            if (error.message.includes('contact_email')) {
                return { success: false, message: "A person with this contact email already exists.", errors: { contactEmail: ["This email is already in use."] } };
            }
            if (error.message.includes('email')) {
                return { success: false, message: "A user with this email already exists.", errors: { userEmail: ["This email is already in use."] } };
            }
        }
        return { success: false, message: "An unexpected error occurred while saving person." };
    }

    revalidatePath('/dashboard/people');
    revalidatePath('/dashboard/users');
    return { success: true, message: `Person successfully ${id ? 'updated' : 'created'}.` };
}

export async function deletePersonAction(personId: number) {
    await enforcePermission('person:delete');
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    try {
        await db.delete(people).where(eq(people.id, personId));
        log.info({ personId, tenantId: session.tenantId }, 'Person deleted.');
        revalidatePath('/dashboard/people');
        revalidatePath('/dashboard/users');
        return { success: true, message: "Person deleted successfully." };
    } catch (error) {
        log.error({ error, personId, tenantId: session.tenantId }, 'Failed to delete person');
        return { success: false, message: "Failed to delete person." };
    }
}
