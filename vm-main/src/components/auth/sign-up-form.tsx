'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  name: zod.string().min(3, { message: 'กรุณาระบุชื่อ' }),
  username: zod.string().min(1, { message: 'กรุณาระบุชื่อผู้ใช้' }),
  email: zod.string().min(1, { message: 'กรุณาระบุอีเมล์' }).email(),
  password: zod.string().min(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }),
  mobileNo: zod.string().min(10, { message: 'กรุณาระบุเบอร์โทรศัพท์' }),
  lineId: zod.string().min(1, { message: 'กรุณาระบุ Line ID' }),
  terms: zod.boolean().refine((value) => value, 'คุณต้องยอมรับข้อตกลงและเงื่อนไข'),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { name: '', username: '', email: '', password: '', mobileNo: '', lineId: '', terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.signUp(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router
      // After refresh, GuestGuard will handle the redirect
      router.refresh();
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">สมัครสมาชิก</Typography>
        <Typography color="text.secondary" variant="body2">
          มีบัญชีผู้ใช้บริการอยู่แล้ว?{' '}
          <Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
            เข้าสู่ระบบ
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <FormControl error={Boolean(errors.username)}>
                <InputLabel>ชื่อผู้ใช้</InputLabel>
                <OutlinedInput {...field} label="ชื่อผู้ใช้" />
                {errors.username ? <FormHelperText>{errors.username.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormControl error={Boolean(errors.name)}>
                <InputLabel>ชื่อ</InputLabel>
                <OutlinedInput {...field} label="ชื่อ" />
                {errors.name ? <FormHelperText>{errors.name.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>อีเมล์</InputLabel>
                <OutlinedInput {...field} label="อีเมล์" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="mobileNo"
            render={({ field }) => (
              <FormControl error={Boolean(errors.mobileNo)}>
                <InputLabel>เบอร์โทรศัพท์</InputLabel>
                <OutlinedInput {...field} label="เบอร์โทรศัพท์" />
                {errors.mobileNo ? <FormHelperText>{errors.mobileNo.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="lineId"
            render={({ field }) => (
              <FormControl error={Boolean(errors.lineId)}>
                <InputLabel>Line ID</InputLabel>
                <OutlinedInput {...field} label="Line ID" />
                {errors.lineId ? <FormHelperText>{errors.lineId.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>รหัสผ่าน</InputLabel>
                <OutlinedInput {...field} label="รหัสผ่าน" type="password" />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <div>
                <FormControlLabel
                  control={<Checkbox {...field} />}
                  label={
                    <React.Fragment>
                      ฉันอ่านและยอมรับ <Link>ข้อตกลงและเงื่อนไข</Link>
                    </React.Fragment>
                  }
                />
                {errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}
              </div>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            สมัครสมาชิก
          </Button>
        </Stack>
      </form>
      {/* <Alert color="warning">ผู้ใช้ที่สมัครไม่ถูกบันทึก</Alert> */}
    </Stack>
  );
}
