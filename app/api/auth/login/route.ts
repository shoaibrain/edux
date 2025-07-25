import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginWithTenantDto } from '@/lib/dto/tenant';
import { getTenantDb } from '@/lib/db';
import * as tenantSchema from '@/lib/db/schema/tenant';
import { env } from '@/env.mjs';
import log from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, email, password } = LoginWithTenantDto.parse(body);

    log.info({ tenantId, email }, '[API] Login attempt.');

    const tenantDb = await getTenantDb(tenantId);
    // Fetch user with all associated roles and their permissions
    const userResult = await tenantDb.query.users.findFirst({
      where: eq(tenantSchema.users.email, email),
      with: {
        usersToRoles: {
          with: {
            role: {
              with: {
                rolesToPermissions: {
                  with: {
                    permission: true, // Ensure full permission object is fetched
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userResult) {
      log.warn({ tenantId, email }, '[API] Login failed: User not found.');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, userResult.password);
    if (!isPasswordValid) {
      log.warn({ tenantId, email }, '[API] Login failed: Invalid password.');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Aggregate all unique permission names for the user
    const userPermissions = new Set<string>();
    userResult.usersToRoles.forEach(userRole => {
      userRole.role.rolesToPermissions.forEach(rolePermission => {
        userPermissions.add(rolePermission.permission.name); // Add only the name to the set
      });
    });

    // Create JWT payload with tenantId, userId, name, email, and permissions
    const tokenPayload = {
      tenantId,
      userId: userResult.id,
      name: userResult.name, // Include name from DB fetch
      email: userResult.email, // Include email from DB fetch
      permissions: Array.from(userPermissions), // Include permission names in the token
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, { expiresIn: '8h' });
    log.info({ tenantId, userId: userResult.id }, '[API] Login successful.');

    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    console.log('Setting cookie for domain:', process.env.NODE_ENV === 'development' ? '.localhost' : '.yourdomain.com');
    console.log('Request host:', request.headers.get('host'));
    console.log('Response Set-Cookie:', response.headers.get('set-cookie'));

    return response;

  } catch (err) {
    log.error({ error: err }, '[API] Login process failed.');
    if (err instanceof Error && err.message === 'Tenant not found') {
      return NextResponse.json({ error: 'Invalid tenant specified' }, { status: 404 });
    }
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}
