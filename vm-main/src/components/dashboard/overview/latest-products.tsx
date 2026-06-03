'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import type { SxProps } from '@mui/material/styles';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { DotsThreeVertical as DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import type { VehicleModel } from '@/types/vehicle';
import { useRouter } from 'next/navigation';

const urlImage = process.env.NEXT_PUBLIC_URL_IMAGE || '';

export interface Product {
  id: string;
  image: string;
  name: string;
  updatedAt: Date;
}

export interface LatestProductsProps {
  products?: VehicleModel[];
  sx?: SxProps;
}

export function LatestProducts({ products = [], sx }: LatestProductsProps): React.JSX.Element {
  const router = useRouter();
  dayjs.locale('th');
  return (
    <Card sx={sx}>
      <CardHeader title="รายงานยานพาหนะล่าสุด" />
      <Divider />
      <List>
        {products.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="ยังไม่มีข้อมูลยานพาหนะ"
              secondary="ยานพาหนะที่อัพเดทล่าสุดจะแสดงที่นี่"
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', align: 'center' }}
              secondaryTypographyProps={{ variant: 'caption', align: 'center' }}
            />
          </ListItem>
        ) : null}
        {products.slice(0,5).map((product, index) => (
          <ListItem divider={index < products.length - 1} key={product.id}>
            <ListItemAvatar>
              {product.img ? (
                <Box
                  component="img"
                  loading="lazy"
                  alt={product.licensePlatePrefix + ' ' + product.licensePlateSuffix}
                  width={48}
                  height={48}
                  src={product.img ? `${urlImage}${product.img}` : '/assets/logo.png'}
                  sx={{ borderRadius: 1, height: '48px', width: '48px', objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    borderRadius: 1,
                    backgroundColor: 'var(--mui-palette-neutral-200)',
                    height: '48px',
                    width: '48px',
                  }}
                />
              )}
            </ListItemAvatar>
            <ListItemText
              primary={product.licensePlatePrefix + ' ' + product.licensePlateSuffix + ' ' + product.licensePlateProvince}
              primaryTypographyProps={{ variant: 'subtitle1' }}
              secondary={`${dayjs(product.updatedAt).format('DD MMMM YYYY HH:mm')} `}
              secondaryTypographyProps={{ variant: 'body2' }}
            />
            <IconButton edge="end">
              <DotsThreeVerticalIcon weight="bold" />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
          onClick={() => router.push('/dashboard/vehicle')}
        >
          ดูทั้งหมด
        </Button>
      </CardActions>
    </Card>
  );
}
