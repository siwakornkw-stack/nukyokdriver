'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import 'dayjs/locale/th';  // นำเข้า locale ภาษาไทย

import Grid from '@mui/material/Unstable_Grid2';
import CardContent from '@mui/material/CardContent';
import Image from 'next/image';
import type { VehicleModel } from '@/types/vehicle';

const urlImage = process.env.NEXT_PUBLIC_URL_IMAGE || '';

interface VehicleTableProps {
  count?: number;
  page?: number;
  rows?: VehicleModel[];
  rowsPerPage?: number;
  handleBillVehicleOpen: (data: VehicleModel) => void;
}

export function VehicleTable({
  rows = [],
  handleBillVehicleOpen
}: VehicleTableProps): React.JSX.Element {
  // const rowIds = React.useMemo(() => {
  //   return rows.map((customer) => customer.id);
  // }, [rows]);

  // const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  // const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  // const selectedAll = rows.length > 0 && selected?.size === rows.length;

  dayjs.locale('th');
  return (
    <Box>
      <Box marginBottom={1}>  
        <Grid container spacing={2}>
          {rows.map((row) => {
            // const isSelected = selected?.has(row.id);

            return (
            <Grid /* lg={4} md={6} xs={12} */ key={row.id} onClick={() => {handleBillVehicleOpen(row)}} flexBasis={400} flexGrow={1} flexShrink={1} flexWrap="wrap">
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent sx={{ flex: '1 1 auto' }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                      <Image src={row.img ? `${urlImage}${row.img}` : '/assets/logo.png'} alt='' width={937} height={850} layout="responsive" onError={(e) => {
                        e.currentTarget.src = '/assets/logo.png';
                      }} style={{ minHeight: '390px', maxHeight: '390px', objectFit: 'cover' }}/>
                    </Box>
                    <Stack spacing={1}>
                      <Typography align="center" variant="body2">
                        Vehicle-{row.no.toString().padStart(5, '0')}
                      </Typography>
                      <Typography align="center" variant="h5">
                        {row.licensePlatePrefix} {row.licensePlateSuffix} {row.licensePlateProvince}
                      </Typography>
                      <Typography align="center" variant="body1">
                      ยิ่ห้อ : {row.brand}, รุ่น : {row.model}, สี : {row.color}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
                <Divider />
                <Stack direction="column" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                  <Stack sx={{ alignItems: 'center' }} direction="column" spacing={1}>
                    <Typography color="text.secondary" /* display="inline" */ align="center" variant="body2">
                      อัพเดทเมื่อ {dayjs(row.updatedAt).format('DD MMMM YYYY HH:mm')}
                    </Typography>
                    <Typography color="text.secondary" /* display="inline" */ align="center" variant="body2">
                      สร้างเมื่อ {dayjs(row.createdAt).format('DD MMMM YYYY HH:mm')}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      </Box>
      <Divider />
    </Box>
  );
}
