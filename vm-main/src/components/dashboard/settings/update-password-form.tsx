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
import Stack from '@mui/material/Stack';

export function UpdatePasswordForm(): React.JSX.Element {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Card>
        <CardHeader subheader="เปลี่ยนรหัสผ่าน" title="รหัสผ่าน" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <FormControl fullWidth>
              <InputLabel>รหัสผ่าน</InputLabel>
              <OutlinedInput label="Password" name="password" type="password" />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>รหัสผ่านอีกครั้ง</InputLabel>
              <OutlinedInput label="Confirm password" name="confirmPassword" type="password" />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained">ยืนยัน</Button>
        </CardActions>
      </Card>
    </form>
  );
}
