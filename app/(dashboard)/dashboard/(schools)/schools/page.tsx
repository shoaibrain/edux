import Link from 'next/link';
import React, { Suspense } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSchools } from '@/lib/actions/schools';


import { getSession } from '@/lib/session';
import { SchoolsClientActions } from './SchoolsClientActions';
import { School } from './columns';
import { SchoolGridSkeleton } from './_components/school-card-skeleton';
import { EnhancedSchoolCard } from './_components/enhanced-school-card';
import { EmptyState } from './_components/empty-state';
import { Badge, Building2, Filter, Grid3X3, List, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default async function AllSchoolsPage() {
  // Get session server-side instead of using useTenant()
  const session = await getSession();
  
  // Check permissions server-side
  const canCreateSchool = session.permissions.includes('school:create');
  const canEditSchool = session.permissions.includes('school:update');
  const canDeleteSchool = session.permissions.includes('school:delete');

  const schools = await getSchools();

  return (
      <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/*Header*/}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {canCreateSchool && (
                <SchoolsClientActions
                    canCreateSchool={canCreateSchool}
                    canEditSchool={canEditSchool}
                    canDeleteSchool={canDeleteSchool}
                />
            )}
          </div>
        </div>
        {/* Search and Filter Bar - only show if there are schools */}
        {schools.length > 0 && (
          <div className="mb-8">
            <Card className="border-0 shadow-sm backdrop-blur-sm">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                    <Input
                      placeholder="Search schools by name, location, or contact..."
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <div className="flex border rounded-lg p-1">
                      <Button variant="ghost" size="sm" className="p-2">
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2">
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Content Section */}
        {schools.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
            {schools.map((school) => (
              <EnhancedSchoolCard
                key={school.id}
                school={school}
                canEditSchool={canEditSchool}
                canDeleteSchool={canDeleteSchool}
              />
            ))}
          </div>
        ) : (
          <EmptyState canCreateSchool={canCreateSchool} />
        )}
      </div>
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
