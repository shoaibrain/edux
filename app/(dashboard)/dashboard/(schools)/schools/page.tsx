import Link from 'next/link';
import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSchools } from '@/lib/actions/schools';


import { getSession } from '@/lib/session';
import { SchoolsClientActions } from './SchoolsClientActions';
import { School } from './columns';

export default async function AllSchoolsPage() {
  // Get session server-side instead of using useTenant()
  const session = await getSession();
  
  // Check permissions server-side
  const canCreateSchool = session.permissions.includes('school:create');
  const canEditSchool = session.permissions.includes('school:update');
  const canDeleteSchool = session.permissions.includes('school:delete');

  const schools = await getSchools();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">School Management</h1>
            <p className="text-muted-foreground">
                Select a school to manage or create a new one.
            </p>
        </div>
        {canCreateSchool && (
            <SchoolsClientActions 
              canCreateSchool={canCreateSchool}
              canEditSchool={canEditSchool}
              canDeleteSchool={canDeleteSchool}
            />
        )}
      </div>
      
      {schools.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <SchoolCard 
              key={school.id} 
              school={school} 
              canEditSchool={canEditSchool}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No schools found</h3>
            <p className="text-sm text-muted-foreground">Get started by creating your first school.</p>
            {canCreateSchool && (
              <SchoolsClientActions 
                canCreateSchool={canCreateSchool}
                canEditSchool={canEditSchool}
                canDeleteSchool={canDeleteSchool}
                showCreateButton={true}
              />
            )}
        </div>
      )}
    </div>
  );
}

// Server Component for individual school cards
function SchoolCard({ school, canEditSchool }: { school: School, canEditSchool: boolean }) {
  if (canEditSchool) {
    return (
      <Link href={`/dashboard/schools/${school.id}`}>
        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader>
            <CardTitle>{school.name}</CardTitle>
            <CardDescription>Click to manage this school.</CardDescription>
          </CardHeader>
        </Card>
      </Link>
    );
  }

  // If no edit permission, just show the card without link
  return (
    <Card className="opacity-60">
      <CardHeader>
        <CardTitle>{school.name}</CardTitle>
        <CardDescription>No permission to manage this school.</CardDescription>
      </CardHeader>
    </Card>
  );
}
