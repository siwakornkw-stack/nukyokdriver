'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';
import { useUser } from '@/hooks/use-user';

interface AccountDetailsFormProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function AccountDetailsForm({ handleSubmit }: AccountDetailsFormProps): React.JSX.Element {
  const { user } = useUser();
  return (
    <form
      onSubmit={handleSubmit}
    >
      <Card>
        <CardHeader subheader="ข้อมูลส่วนตัว" title="โปรไฟล์" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={12} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>ชื่อ</InputLabel>
                <OutlinedInput defaultValue={user?.Name} label="First name" name="name" />
              </FormControl>
            </Grid>
            <Grid md={12} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>อีเมล์</InputLabel>
                <OutlinedInput defaultValue={user?.Email} label="Email address" name="email" />
              </FormControl>
            </Grid>
            <Grid md={12} xs={12}>
              <FormControl fullWidth>
                <InputLabel>เบอร์มือถือ</InputLabel>
                <OutlinedInput defaultValue={user?.MobileNo} label="Phone number" name="mobileNo" type="tel" />
              </FormControl>
            </Grid>
            <Grid md={12} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Line ID</InputLabel>
                <OutlinedInput defaultValue={user?.LineId} label="Line ID" name="lineId" />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">บันทึก</Button>
        </CardActions>
      </Card>
    </form>
  );
}
