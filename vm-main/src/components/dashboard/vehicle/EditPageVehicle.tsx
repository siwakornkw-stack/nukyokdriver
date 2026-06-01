'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import '../../../../public/styles/modal.scss';
import { Card, Tab, Tabs,} from '@mui/material';

import { Box} from '@mui/system';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`} 
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function EditPageVehicle(): React.JSX.Element {
  
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">แก้ไขข้อมูลยานพาหนะ</Typography>
        </Stack>
      </Stack>
      
      <Card sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" variant="fullWidth">
            <Tab label="หน้าหลัก" {...a11yProps(0)} />
            <Tab label="ภาษี" {...a11yProps(1)} />
            <Tab label="พรบ" {...a11yProps(2)} />
            <Tab label="กรมธรรม์" {...a11yProps(3)} />
            <Tab label="รูป" {...a11yProps(4)} />
            <Tab label="แนบไฟล์" {...a11yProps(5)} />
            <Tab label="ยาง" {...a11yProps(6)} />
            <Tab label="อุบัติเหตุ" {...a11yProps(7)} />
            <Tab label="ซ่อม" {...a11yProps(8)} />
            <Tab label="ค่าน้ำมัน" {...a11yProps(9)} />
            <Tab label="ถ่ายน้ำมัน" {...a11yProps(10)} />
            <Tab label="ค่างวด" {...a11yProps(11)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          หน้าหลัก
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          ภาษี
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          พรบ
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          กรมธรรม์
        </CustomTabPanel>
        <CustomTabPanel value={value} index={4}>
          รูป
        </CustomTabPanel>
        <CustomTabPanel value={value} index={5}>
          แนบไฟล์
        </CustomTabPanel>
        <CustomTabPanel value={value} index={6}>
          ยาง
        </CustomTabPanel>
        <CustomTabPanel value={value} index={7}>
          อุบัติเหตุ
        </CustomTabPanel>
        <CustomTabPanel value={value} index={8}>
          ซ่อม
        </CustomTabPanel>
        <CustomTabPanel value={value} index={9}>
          ค่าน้ำมัน
        </CustomTabPanel>
        <CustomTabPanel value={value} index={10}>
          ถ่ายน้ำมัน
        </CustomTabPanel>
        <CustomTabPanel value={value} index={11}>
          ค่างวด
        </CustomTabPanel>
      </Card>
    </Stack>
  );
}
