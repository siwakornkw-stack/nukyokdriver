'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';
import { AccountInfo } from '@/components/dashboard/account/account-info';
import { UploadImageUserDTO, UserUpdate } from '@/types/user';
import { getResponseData } from '../../../../types/utils';
import { updateUser, uploadUserImage } from '../../../../services/auth.service';
import { CustomToast } from '@/helpers/toast';

export default function Page(): React.JSX.Element {
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted');
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const imgInput = document.getElementById('img-input');
    if (imgInput && imgInput instanceof HTMLInputElement && imgInput.files?.[0]) {
        console.log('imgInput', imgInput.files[0]);
        const payload: UploadImageUserDTO = {
            file: [imgInput.files[0]]
        };
        const res = await uploadUserImage(payload);
        if (res.status === 200 && res.data) {
            const dataResponse = getResponseData(res);
            if (dataResponse) {
                data.img = dataResponse.data.url;
            }
        } else {
            CustomToast.error('Error', 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
        }
    } else {
        data.img = '/uploads/users/avatar.png';
    }

    const payload: UserUpdate = {
        Name: data.name as string,
        Email: data.email as string,
        MobileNo: data.mobileNo as string,
        LineId: data.lineId as string,
        ImageUrl: data.img as string
    };
    const res = await updateUser(payload);
    if (res.ok && res.status === 200) {
      CustomToast.success('Success', 'อัพเดทข้อมูลสำเร็จ');
    } else {
        CustomToast.error('Error', 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
    }
  };
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">บัญชี</Typography>
      </div>
      <Grid container spacing={3}>
        <Grid lg={4} md={6} xs={12}>
          <AccountInfo />
        </Grid>
        <Grid lg={8} md={6} xs={12}>
          <AccountDetailsForm handleSubmit={handleSubmit} />
        </Grid>
      </Grid>
    </Stack>
  );
}
