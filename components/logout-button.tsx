'use client';

import { logout } from '@/lib/actions/auth';
import { DropdownMenuItem } from './ui/dropdown-menu';

export default function LogoutButton() {
  return (
    <DropdownMenuItem onSelect={() => logout()}>
      Logout
    </DropdownMenuItem>
  );
}