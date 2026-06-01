'use client';
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useUser } from '@/hooks/use-user';

const urlImage = process.env.NEXT_PUBLIC_URL_IMAGE || '';

export function AccountInfo(): React.JSX.Element {
  const { user } = useUser();
  const [fileBlob, setFileBlob] = React.useState<string | null>(null);
  const handleImageClick = () => {
    const inputElement = document.querySelector('input[type="file"]');
    if (inputElement) {
        (inputElement as HTMLInputElement).click();
    }
}

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setFileBlob(URL.createObjectURL(e.target.files[0]));
    }
}

console.log('fileBlob', fileBlob ? fileBlob : user?.ImageUrl ? `${urlImage}${user?.ImageUrl}` : '/assets/avatar.png');
  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            {/* <Avatar src={user.avatar} sx={{ height: '80px', width: '80px' }} /> */}
            <Avatar
              sx={{ height: '80px', width: '80px' }}
            >
              <Image
                src={fileBlob ? fileBlob : user?.ImageUrl ? `${urlImage}${user?.ImageUrl}` : '/assets/avatar.png'}
                onError={(e) => {
                  e.currentTarget.src = '/assets/avatar.png';
                }}
                alt="User Avatar"
                /* layout="fill" */
                width={0} height={0} layout="responsive" 
                objectFit={'contain'}
              />
            </Avatar>
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user?.Name}</Typography>
            <Typography color="text.secondary" variant="body2">
              {user?.Email}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {user?.MobileNo}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text" onClick={handleImageClick}>
          อัพโหลดรูปโปรไฟล์
        </Button>
        <input id="img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
      </CardActions>
    </Card>
  );
}
