import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'แดชบอร์ด', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'vehicle', title: 'ยานพาหนะ', href: paths.dashboard.vehicle, icon: 'users' },
  { key: 'driver-jobs', title: 'สั่งงานคนขับ', href: paths.dashboard.driverJobs, icon: 'truck' },
  { key: 'import', title: 'นำเข้าข้อมูล', href: paths.dashboard.importData, icon: 'upload' },
  //{ key: 'integrations', title: 'รายงานสรุป', href: '', icon: 'plugs-connected' },/* paths.dashboard.integrations */
  { key: 'settings', title: 'ตั้งค่า', href: paths.dashboard.settings, icon: 'gear-six' },
  //{ key: 'admin', title: 'ระบบจัดการผู้ใช้งาน', href: paths.dashboard.admin, icon: 'user-gear' },
  { key: 'account', title: 'บัญชี', href: paths.dashboard.account, icon: 'user' },
  { key: 'logout', title: 'ออกจากระบบ', href: paths.dashboard.logout, icon: 'x-square' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
