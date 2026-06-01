'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import { usePopover } from '@/hooks/use-popover';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import Image from 'next/image';
import { useUser } from '@/hooks/use-user';

import { useShareContext } from '@/contexts/share-context';
// เพิ่ม import ด้านบนของไฟล์
import {
  CarProfile,
  Engine,
  GasPump,
  Money,
  Wrench,
  Warning
} from "@phosphor-icons/react";
import { alpha } from '@mui/material/styles';
import { Button, useTheme } from '@mui/material';
import { Typography } from '@mui/material';
import ShareSweetAlert from '@/components/ShareSweetAlert';
import { getNotification } from '../../../../services/vehicle.service';
import { CustomToast } from '@/helpers/toast';
import { getResponseData } from '../../../../types/utils';
import { useEffect } from 'react';
import { NotificationData } from '@/types/vehicle';

interface MenuItem {
  icon: React.ReactElement;
  label: string;
  date: string;
  color: string;
}
const urlImage = process.env.NEXT_PUBLIC_URL_IMAGE || '';

export function MainNav(): React.JSX.Element {


  const theme = useTheme();
  const { user } = useUser();
  const [openNav, setOpenNav] = React.useState<boolean>(false);

  const { swalRef, vehicle, setOpenBillVehicleModal, setInfoBillVehicleOpen } = useShareContext();
  const [notificationData, setNotificationData] = React.useState<NotificationData[]>([]);

  const userPopover = usePopover<HTMLDivElement>();

  const getNotificationData = async () => {
    const res = await getNotification();
    if (!res.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลแจ้งเตือนได้');
      return;
    }
    const result = getResponseData(res);
    if (result) {
      setNotificationData(result.data);
    }
  }

  useEffect(() => {
    void getNotificationData();
  }, []);

  async function openAlert() {
    try {
      // เพิ่ม console.log เพื่อดีบัก
      console.log('Attempting to open alert');

      if (!swalRef.current) {
        console.error('swalRef is not available');
        return;
      }
      
      if (notificationData.length === 0) {
        CustomToast.warning('Alert', 'ไม่มีแจ้งเตือน');
        return;
      }

      const alertContent = (
        <Stack spacing={2} direction="row" flexWrap="wrap" sx={{
          overflowY: 'auto',
          marginBottom: 2
        }}>
          {notificationData.map((item) => (
            <Box
              key={item.VehicleId}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.paper',
                boxShadow: 1,
                border: '1px solid',
                borderColor: 'divider',
                flex: '1 1 200px',
                width: '100%',
                minWidth: 'max-content'
              }}
            >
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CarProfile size={24} weight="duotone" />
                  <Typography variant="h6">
                    Vehicle-{item.VehicleNo.toString().padStart(5, '0')}
                  </Typography>
                </Stack>
                <Button
                  size='small'
                  variant="outlined"
                  endIcon={<Warning />}
                  sx={{ borderRadius: 2 }}
                  onClick={() => {
                    setInfoBillVehicleOpen(vehicle.find((v) => v.id === item.VehicleId));
                    setOpenBillVehicleModal(true);
                  }}
                >
                  ดูเพิ่มเติม
                </Button>
              </Box>

              <Stack spacing={1.5}>
                {[
                  item.Tax && {
                    icon: <Money size={20} />,
                    label: 'ภาษีรถยนต์',
                    date: item.Tax,
                    color: theme.palette.error.main
                  },
                  item.CmInsurance && {
                    icon: <Warning size={20} />,
                    label: 'พรบ',
                    date: item.CmInsurance,
                    color: theme.palette.warning.main
                  },
                  item.InsurancePolicy && {
                    icon: <Warning size={20} />,
                    label: 'กรมธรรม์',
                    date: item.InsurancePolicy,
                    color: theme.palette.warning.main
                  },
                  item.RepairVehicle && {
                    icon: <Wrench size={20} />,
                    label: 'ซ่อมรถยนต์',
                    date: item.RepairVehicle,
                    color: theme.palette.info.main
                  },
                  item.DrainTheOilVehicle && {
                    icon: <GasPump size={20} />,
                    label: 'ถ่ายน้ำมัน',
                    date: item.DrainTheOilVehicle,
                    color: theme.palette.success.main
                  },
                  item.InstallmentsVehicle && {
                    icon: <Engine size={20} />,
                    label: 'ค่างวด',
                    date: item.InstallmentsVehicle,
                    color: theme.palette.primary.main
                  }
                ].filter((menuEntry): menuEntry is MenuItem => Boolean(menuEntry)).map((menuItem, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(menuItem.color, 0.1),
                    }}
                  >
                    <Box sx={{ color: menuItem.color }}>
                      {menuItem.icon}
                    </Box>
                    <Typography sx={{ flex: 1 }}>
                      {menuItem.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: menuItem.color,
                        fontWeight: 'medium'
                      }}
                    >
                      หมดอายุ {menuItem.date}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      );
      const result = await swalRef.current.open({
        // icon: "/assets/logo.png",
        title: "ระบบแจ้งเตือน",
        cancelText: "ปิด",
        html: alertContent,
        showConfirmButton: false
      });

      console.log('Alert result:', result);
    } catch (error) {
      console.error('Error opening alert:', error);
    }
  }
  return (
    <React.Fragment>

      <ShareSweetAlert />

      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
            <Tooltip title="Search">
              <IconButton>
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title="Contacts" onClick={() => {
              window.open('https://lin.ee/dvfbcAO', '_blank');
            }}>
              <IconButton>
                <UsersIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications" onClick={openAlert}>
              <Badge badgeContent={notificationData.length} color="success" variant="dot">
                <IconButton>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              sx={{ cursor: 'pointer' }} // กำหนดขนาด Avatar
            >
              <Image
                src={user?.ImageUrl ? `${urlImage}${user?.ImageUrl}` : '/assets/avatar.png'}
                alt="User Avatar"
                onError={(e) => {
                  e.currentTarget.src = '/assets/avatar.png';
                }}
                width={0} height={0} 
                layout="responsive" 
                objectFit={'contain'}
              />
            </Avatar>
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
