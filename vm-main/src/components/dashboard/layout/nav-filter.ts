import type { NavItemConfig } from '@/types/nav';

export function filterNavItemsByRole(items: NavItemConfig[], role?: string): NavItemConfig[] {
  const effectiveRole = role ?? 'admin';
  return items.filter((item) => !item.roles || item.roles.includes(effectiveRole));
}
