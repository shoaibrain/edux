"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from '@/components/ui/card';
import { School } from '../columns';


interface SchoolCardProps {
  school: School;
  canEditSchool: boolean;
}

export function SchoolCard({ school, canEditSchool }: SchoolCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (!canEditSchool) {
      toast.error("You do not have permission to access this school.");
      return;
    }
    router.push(`/dashboard/schools/${school.id}`);
  };

  return (
    <Card 
      className="w-[80%] mx-auto cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm"
      onClick={handleCardClick}
    >
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          {/* Left Section - Main Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {school.name}
                  </h3>

                </div>
                
                {school.name && (
                  <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                    {school.address}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-500">
              {school.email && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{school.email}</span>
                </div>
              )}
              
              {school.phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{school.phone}</span>
                </div>
              )}
              
              {school.address && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate max-w-xs">{school.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Stats */}
          <div className="flex flex-col items-end space-y-4">
            <div className="flex gap-6">
              <p>School Student count</p>
            </div>

            {/* Action Indicator */}
            <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
              <span className="text-xs font-medium">Click to manage</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
