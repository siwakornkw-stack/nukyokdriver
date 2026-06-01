import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { Truck as TruckIcon } from '@phosphor-icons/react/dist/ssr/Truck';
import { UploadSimple as UploadIcon } from '@phosphor-icons/react/dist/ssr/UploadSimple';
import { UserGear as UserGearIcon } from '@phosphor-icons/react/dist/ssr/UserGear';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  'user-gear': UserGearIcon,
  user: UserIcon,
  users: UsersIcon,
  truck: TruckIcon,
  upload: UploadIcon,
} as Record<string, Icon>;
