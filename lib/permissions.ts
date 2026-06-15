import { Role, Permission, ROLE_PERMISSIONS } from '@/types';

export function hasPermission(role: Role, permission: Permission): boolean {
  if (role === 'store_owner') return true;
  if (role === 'super_admin') {
    return ROLE_PERMISSIONS.super_admin.includes(permission);
  }
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return hasPermission(role as Role, permission);
}
