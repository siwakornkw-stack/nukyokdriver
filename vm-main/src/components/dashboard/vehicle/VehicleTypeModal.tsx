import React, { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Modal, Fade, Box, Stack, Typography, Button } from '@mui/material';
import SwipeableViews from 'react-swipeable-views-react-18-fix';

import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import type { Theme } from '@mui/material';
import '../../../../public/styles/modal.scss';
import '../../../../public/styles/modalinfo.scss';
import type { CreateTypeDTO, UpdateTypeDTO } from '@/types/vehicle';
import VehicleInfoTable from './VehicleInfoTable';
import type { TaxRow } from '@/types/table';
import type { GridColDef } from '@mui/x-data-grid-pro';
import 'dayjs/locale/th';
import { addFuelType, addVehicleBrand, addVehicleDepartment, addVehicleDriver, addVehicleOwner, addVehicleStatus, addVehicleType, getFuelType, getVehicleBrand, getVehicleDepartment, getVehicleDriver, getVehicleOwner, getVehicleStatus, getVehicleType, updateFuelType, updateVehicleBrand, updateVehicleDepartment, updateVehicleDriver, updateVehicleOwner, updateVehicleStatus, updateVehicleType } from '../../../../services/vehicle.service';
import { CustomToast } from '@/helpers/toast';
import { getResponseData } from '../../../../types/utils';

interface VehicleInfoModalProps {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  tab: number;
}

const style = (theme: Theme) => ({
  position: 'relative',
  background: '#fff',
  padding: '20px',
  width: '100%',
  maxWidth: '1324px',
  height: 'auto',
  maxHeight: '100vh',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: '10px',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
  display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    height: '100vh',
    margin: 0,
    borderRadius: 0,
  }
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

function VehicleTypeModal({
  open,
  onClose,
  theme,
  tab
}: VehicleInfoModalProps): JSX.Element {
  const [value, setValue] = useState(tab);
  const [rows, setRows] = useState<TaxRow[]>([]);
  const [columns, setColumns] = useState<GridColDef<TaxRow>[]>([]);

  useEffect(() => {
    setValue(tab);
  }, [tab]);

  const handleClose = () => {
    setValue(0);
    onClose();
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  const handleAddRow = (newRow: TaxRow) => {
    console.log(`Adding new row: ${JSON.stringify(newRow)}`);
    setRows(prevRows => [...prevRows, {
      ...newRow,
    }]);
  };

  const handleSaveRow = async (updatedRow: TaxRow) => {
    console.log(`Saving row with id: ${updatedRow.id}`);
    console.log(`Updated row: `, updatedRow);

    if (value === 0) {
      if (!updatedRow.Name || updatedRow?.Name?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุประเภทรถยนต์');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await addVehicleType(payload);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลประเภทรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลกระเภทรถยนต์เรียบร้อย');
          void getVehicleTypeData();
        }
      } else {
        const payload: UpdateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await updateVehicleType(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลกระเภทรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลกระเภทรถยนต์เรียบร้อย');
          void getVehicleTypeData();
        }
      }
    } else if (value === 1) {
      if (!updatedRow.Name || updatedRow?.Name?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุยี่ห้อรถยนต์');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await addVehicleBrand(payload);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลยี่ห้อรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลยี่ห้อรถยนต์เรียบร้อย');
          void getVehicleBrandData();
        }
      } else {
        const payload: UpdateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await updateVehicleBrand(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลยี่ห้อรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลกี่ห้อรถยนต์เรียบร้อย');
          void getVehicleBrandData();
        }
      }
    } else if (value === 2) {
      if (!updatedRow.Name || updatedRow?.Name?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุประเภทเชื้อเพลิง');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await addFuelType(payload);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลประเภทเชื้อเพลิงได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลประเภทเชื้อเพลิงเรียบร้อย');
          void getFuelTypeData();
        }
      } else {
        const payload: UpdateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await updateFuelType(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลประเภทเชื้อเพลิงได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลประเภทเชื้อเพลิงเรียบร้อย');
          void getFuelTypeData();
        }
      }
    } else if (value === 3) {
      if (!updatedRow.Name || updatedRow?.Name?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุเจ้าของรถยนต์');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await addVehicleOwner(payload);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลเจ้าของรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลเจ้าของรถยนต์เรียบร้อย');
          void getVehicleOwnerData();
        }
      } else {
        const payload: UpdateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await updateVehicleOwner(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลเจ้าของรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลเจ้าของรถยนต์เรียบร้อย');
          void getVehicleOwnerData();
        }
      }
    } else if (value === 4) {
      if (!updatedRow.Name || updatedRow?.Name?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุหน่วยงาน');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await addVehicleDepartment(payload);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลหน่วยงานได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลหน่วยงานเรียบร้อย');
          void getVehicleDepartmentData();
        }
      } else {
        const payload: UpdateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await updateVehicleDepartment(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลหน่วยงานได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลหน่วยงานเรียบร้อย');
          void getVehicleDepartmentData();
        }
      }
    } else if (value === 5) {
      if (!updatedRow.Name || updatedRow?.Name?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุคนขับ');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await addVehicleDriver(payload);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลคนขับได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลคนขับเรียบร้อย');
          void getVehicleDriverData();
        }
      } else {
        const payload: UpdateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await updateVehicleDriver(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลคนขับได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลคนขับเรียบร้อย');
          void getVehicleDriverData();
        }
      }
    } else if (value === 6) {
      if (!updatedRow.Name || updatedRow?.Name?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุสถานะรถยนต์');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await addVehicleStatus(payload);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลสถานะรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลสถานะรถยนต์เรียบร้อย');
          void getVehicleStatusData();
        }
      } else {
        const payload: UpdateTypeDTO = {
          name: updatedRow.Name ?? ''
        };
        const response = await updateVehicleStatus(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลสถานะรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลคถานะรถยนต์เรียบร้อย');
          void getVehicleStatusData();
        }
      }
    }

    setRows(prevRows =>
      prevRows.map(row =>
        row.id === updatedRow.id ? updatedRow : row
      )
    );
  };

  const getVehicleTypeData = async () => {
    const response = await getVehicleType();
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลประเภทรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const taxRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Name: item.name
      }));
      console.log('taxRows', taxRows);
      setRows(taxRows);
    }
  }

  const getVehicleBrandData = async () => {
    const response = await getVehicleBrand();
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลยี่ห้อรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const brandRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Name: item.name
      }));
      console.log('brandRows', brandRows);
      setRows(brandRows);
    }
  }
  const getVehicleOwnerData = async () => {
    const response = await getVehicleOwner();
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลเจ้าของรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const ownerRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Name: item.name
      }));
      console.log('ownerRows', ownerRows);
      setRows(ownerRows);
    }
  }
  const getVehicleDepartmentData = async () => {
    const response = await getVehicleDepartment();
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลหน่วยงานได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const departmentRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Name: item.name
      }));
      console.log('departmentRows', departmentRows);
      setRows(departmentRows);
    }
  }
  const getVehicleDriverData = async () => {
    const response = await getVehicleDriver();
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลคนขับได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const driverRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Name: item.name
      }));
      console.log('driverRows', driverRows);
      setRows(driverRows);
    }
  }
  const getVehicleStatusData = async () => {
    const response = await getVehicleStatus();
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลสถานะรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const statusRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Name: item.name
      }));
      console.log('statusRows', statusRows);
      setRows(statusRows);
    }
  }
  const getFuelTypeData = async () => {
    const response = await getFuelType();
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลประเภทเชื้อเพลิงได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const fuelRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Name: item.name
      }));
      console.log('fuelRows', fuelRows);
      setRows(fuelRows);
    }
  }

  useEffect(() => {
    if (value === 0) {
      void getVehicleTypeData();

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 20, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Name', headerName: 'ประเภทรถยนต์', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
      ]);
    } else if (value === 1) {
      void getVehicleBrandData();

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 20, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Name', headerName: 'ยี่ห้อ', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
      ]);
    } else if (value === 2) {      
      void getFuelTypeData();

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 20, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Name', headerName: 'ประเภทเชื้อเพลิง', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
      ]);
    } else if (value === 3) {
      
      void getVehicleOwnerData();

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 20, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Name', headerName: 'เจ้าของรถยนต์', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
      ]);
    } else if (value === 4) {
      
      void getVehicleDepartmentData();

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 20, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Name', headerName: 'หน่วยงาน', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
      ]);
    } else if (value === 5) {
      
      void getVehicleDriverData();

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 20, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Name', headerName: 'คนขับ', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
      ]);
    } else if (value === 6) {
      
      void getVehicleStatusData();

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 20, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Name', headerName: 'สถานะรถยนต์', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
      ]);
    } else {
      setRows([]);
      setColumns([]);
    }
  }, [value, open]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className='modal-overlay'
      closeAfterTransition
    >
      <Fade in={open}>
        <Box sx={{ ...style(theme) }}>
          <AppBar
            position="static"
            sx={{
              backgroundColor: 'transparent',
              boxShadow: 'none'
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              // variant="fullWidth"
              variant="standard"
              scrollButtons="auto"
              centered

              aria-label="full width tabs example"
              sx={{

                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '15px',
                },
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'space-around',
                },
                '& .MuiTab-root': {
                  minWidth: { xs: 'auto', sm: 0 },
                  marginLeft: { xs: '24px !important', sm: '0 !important' },
                  flexGrow: 1,
                  maxWidth: 'none',
                },
              }}
            >
              <Tab label="ประเภทรถยนต์" {...a11yProps(0)} />
              <Tab label="ยี่ห้อ" {...a11yProps(1)} />
              <Tab label="เชื้อเพลิง" {...a11yProps(2)} />
              <Tab label="เจ้าของรถ" {...a11yProps(3)} />
              <Tab label="หน่วยงาน" {...a11yProps(4)} />
              <Tab label="คนขับ" {...a11yProps(5)} />
            </Tabs>
          </AppBar>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={value}
            onChangeIndex={handleChangeIndex}
            style={{ width: '100%' }}
          >
            <TabPanel value={value} index={0}>
              <VehicleInfoTable title='ประเภทรถยนต์' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                type
              />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <VehicleInfoTable title='ยี่ห้อ' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                type
              />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <VehicleInfoTable title='ประเภทเชื้อเพลิง' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                type
              />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <VehicleInfoTable title='เจ้าของรถ' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                type
              />
            </TabPanel>
            <TabPanel value={value} index={4}>
              <VehicleInfoTable title='หน่วยงาน' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                type
              />
            </TabPanel>
            <TabPanel value={value} index={5}>
              <VehicleInfoTable title='คนขับ' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                type
              />
            </TabPanel>
          </SwipeableViews>
          <Stack sx={{ alignItems: 'center', justifyContent: 'flex-end' }} direction="row" spacing={1}>
            <Button onClick={onClose} variant="outlined" color="error">ปิด</Button>
          </Stack>
        </Box>
      </Fade>
    </Modal >
  );
};

export default VehicleTypeModal;