import React, { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Modal, Fade, Box, Stack, Typography, Button, Autocomplete, TextField, InputAdornment } from '@mui/material';
import Image from 'next/image';
import SwipeableViews from 'react-swipeable-views-react-18-fix';

import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import type { Theme } from '@mui/material';
import '../../../../public/styles/modal.scss';
import '../../../../public/styles/modalinfo.scss';
import type { CreateAccidentVehicleDTO, CreateAttachFileVehicleDTO, CreateCarTiresDTO, CreateCompulsoryMotorInsuranceVehicleDTO, CreateDrainTheOilVehicleDTO, CreateGasolineCostDTO, CreateImageVehicleDTO, CreateIncomeVehicleDTO, CreateInstallmentsVehicleDTO, CreateInsurancePolicyVehicleDTO, CreateRepairVehicleDTO, CreateVehicleTaxDTO, FileWithImageVehicle, FileWithNote, ImageVehicleData, ImportItemsStatus, ImportResponse, Option, UpdateAccidentVehicleDTO, UpdateAttachFileVehicleDTO, UpdateCarTiresDTO, UpdateCompulsoryMotorInsuranceVehicleDTO, UpdateDrainTheOilVehicleDTO, UpdateGasolineCostDTO, UpdateIncomeVehicleDTO, UpdateInstallmentsVehicleDTO, UpdateInsurancePolicyVehicleDTO, UpdateRepairVehicleDTO, UpdateVehicleTaxDTO, VehicleModel } from '@/types/vehicle';
import VehicleInfoTable from './VehicleInfoTable';
import type { TaxRow } from '@/types/table';
import type { GridColDef } from '@mui/x-data-grid-pro';
import StandardImageList from './VehicleInfoImageGallery';
import { DatePicker, LocalizationProvider, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import type { GridRenderEditCellParams } from '@mui/x-data-grid';
import { addAccidentVehicle, addAttachFileVehicle, addCarTiresVehicle, addCompulsoryMotorInsuranceVehicle, addDrainTheOilVehicle, addGasolineCostVehicle, addImageVehicle, addIncomeVehicle, addInstallmentsVehicle, addInsurancePolicyVehicle, addRepairVehicle, addVehicleTax, getAccidentVehicle, getAttachFileVehicle, getCarTiresVehicle, getCompulsoryMotorInsuranceVehicle, getDrainTheOilVehicle, getGasolineCostVehicle, getImageVehicle, getIncomeVehicle, getInstallmentsVehicle, getInsurancePolicyVehicle, getOptionDriver, getOptionPaymentStatus, getRepairVehicle, getVehicleTax, importDataVehicleCSV, updateAccidentVehicle, updateAttachFileVehicle, updateCarTiresVehicle, updateCompulsoryMotorInsuranceVehicle, updateDrainTheOilVehicle, updateGasolineCostVehicle, updateIncomeVehicle, updateInstallmentsVehicle, updateInsurancePolicyVehicle, updateRepairVehicle, updateVehicleTax } from '../../../../services/vehicle.service';
import { CustomToast } from '@/helpers/toast';
import { getResponseData } from '../../../../types/utils';

const urlImage = process.env.NEXT_PUBLIC_URL_IMAGE || '';

interface VehicleInfoModalProps {
  open: boolean;
  onClose: () => void;
  infoBillVehicle: VehicleModel | undefined;
  onEdit: (data: VehicleModel) => void;
  theme: Theme;
  importColumns?: (data: Record<string, string>[]) => void;
  importResult?: (data: ImportResponse<ImportItemsStatus[]> | null) => void;
  importModalOpen?: (data: boolean) => void;
  isImporting?: (data: boolean) => void;
}

const style = (theme: Theme) => ({
  position: 'relative',
  background: '#fff',
  padding: '20px',
  width: '100%',
  maxWidth: '1624px',
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

const datePickerStyle = {
  justifyContent: 'center',
  backgroundColor: 'white',
  fontSize: '12px',
  '& .MuiInputBase-input': {
  },
  '& .MuiOutlinedInput-root': {
    height: '32px',
    fontSize: '12px',
  }
}

const AutocompleteStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
  fontSize: '12px',
  '& .MuiInputBase-input': {
    fontSize: '12px',
  },
  '& .MuiFormLabel-root': {
    fontSize: '12px',
  },
  '& .MuiOutlinedInput-root': {
    height: '32px',
    fontSize: '12px',
    paddingRight: '40px !important',
  },
}

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

function VehicleInfoModal({
  open,
  onClose,
  infoBillVehicle,
  onEdit,
  theme,
  importColumns,
  importResult,
  importModalOpen,
  isImporting
}: VehicleInfoModalProps): JSX.Element {
  const [value, setValue] = useState(0);
  const [rows, setRows] = useState<TaxRow[]>([]);
  const [columns, setColumns] = useState<GridColDef<TaxRow>[]>([]);
  const [imgVehicle, setImgVehicle] = useState<ImageVehicleData[]>([]);

  const [optionsDrivers, setOptionsDrivers] = useState<Option[] | null>(null);
  const [optionsPaymentStatus, setOptionsPaymentStatus] = useState<Option[] | null>(null);

  const handleFileImportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!infoBillVehicle) {
      return;
    }

    const file = e.target.files?.[0];
    console.log('file', file);
    if (file) {
      importModalOpen?.(true);
      isImporting?.(true);
      try {
        const res = await importDataVehicleCSV(file, value, infoBillVehicle.id);
        if (res.status === 200) {
          const data = getResponseData(res);
          if (data) {
            importResult?.(data);
            switch (value) {
              case 1:
                void getVehicleTaxData();
                break;
              case 2:
                void getCompulsoryMotorInsuranceVehicleData();
                break;
              case 3:
                void getInsurancePolicyVehicleData();
                break;
              case 6:
                void getCarTiresVehicleData();
                break;
              case 7:
                void getAccidentVehicleData();
                break;
              case 8:
                void getRepairVehicleData();
                break;
              case 9:
                void getGasolineCostVehicleData();
                break;
              case 10:
                void getDrainTheOilVehicleData();
                break;
              case 11:
                void getInstallmentsVehicleData();
                break;
              case 12:
                void getIncomeVehicleData();
                break;

              default:
                break;
            }
          }
        } else {
          importResult?.({
            success: false,
            code: res.status ?? 500,
            message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล',
            data: undefined
          });
        }

        isImporting?.(false);
      } catch (error) {
        importResult?.({
          success: false,
          code: 500,
          message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล',
          data: undefined
        });
      }
    }
  };

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
      Year: new Date().getFullYear().toString(),
      EndDate: dayjs(new Date()).format('DD/MM/YYYY'),
      TotalPremium: '',
      InsuranceCompany: '',
      BrokerName: ''
    }]);
  };

  const handleSaveRow = async (updatedRow: TaxRow) => {
    console.log(`Saving row with id: ${updatedRow.id}`);
    console.log(`Updated row: `, updatedRow);
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่พบข้อมูลรถยนต์');
      return;
    }

    if (value === 1) {
      if (updatedRow?.EndDate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่สิ้นสุดการประกันภัย');
        return;
      }
      if (updatedRow?.TotalPremium?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุค่าเบี้ยรวม');
        return;
      }
      console.log('updatedRow?.InsuranceCompany?.trim() === ""', updatedRow?.InsuranceCompany?.trim() === '');
      if (updatedRow?.InsuranceCompany?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุบริษัทประกันภัย');
        return;
      }
      if (updatedRow?.BrokerName?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุชื่อโบรกเกอร์');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateVehicleTaxDTO = {
          year: Number(updatedRow.Year),
          endDate: dayjs(updatedRow.EndDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          totalPremium: Number(updatedRow.TotalPremium),
          insuranceCompany: updatedRow.InsuranceCompany ?? '',
          brokerName: updatedRow.BrokerName ?? ''
        };
        const response = await addVehicleTax(payload, infoBillVehicle.id);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลการประกันภัยรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลการประกันภัยรถยนต์เรียบร้อย');
          void getVehicleTaxData();
        }
      } else {
        const payload: UpdateVehicleTaxDTO = {
          year: Number(updatedRow.Year),
          endDate: dayjs(updatedRow.EndDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          totalPremium: Number(updatedRow.TotalPremium),
          insuranceCompany: updatedRow.InsuranceCompany ?? '',
          brokerName: updatedRow.BrokerName ?? ''
        };
        const response = await updateVehicleTax(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลการประกันภัยรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลการประกันภัยรถยนต์เรียบร้อย');
          void getVehicleTaxData();
        }
      }
    } else if (value === 2) {
      if (updatedRow?.EndDate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่สิ้นสุดพรบ.รถยนต์');
        return;
      }
      if (updatedRow?.TotalPremium?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุค่าเบี้ยรวม');
        return;
      }
      console.log('updatedRow?.InsuranceCompany?.trim() === ""', updatedRow?.InsuranceCompany?.trim() === '');
      if (updatedRow?.InsuranceCompany?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุพรบ.รถยนต์');
        return;
      }
      if (updatedRow?.BrokerName?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุชื่อโบรกเกอร์');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateCompulsoryMotorInsuranceVehicleDTO = {
          year: Number(updatedRow.Year),
          endDate: dayjs(updatedRow.EndDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          totalPremium: Number(updatedRow.TotalPremium),
          insuranceCompany: updatedRow.InsuranceCompany ?? '',
          brokerName: updatedRow.BrokerName ?? ''
        };
        const response = await addCompulsoryMotorInsuranceVehicle(payload, infoBillVehicle.id);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลพรบ.รถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลพรบ.รถยนต์เรียบร้อย');
          void getCompulsoryMotorInsuranceVehicleData();
        }
      } else {
        const payload: UpdateCompulsoryMotorInsuranceVehicleDTO = {
          year: Number(updatedRow.Year),
          endDate: dayjs(updatedRow.EndDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          totalPremium: Number(updatedRow.TotalPremium),
          insuranceCompany: updatedRow.InsuranceCompany ?? '',
          brokerName: updatedRow.BrokerName ?? ''
        };
        const response = await updateCompulsoryMotorInsuranceVehicle(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลพรบ.รถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลพรบ.รถยนต์เรียบร้อย');
          void getCompulsoryMotorInsuranceVehicleData();
        }
      }
    } else if (value === 3) {
      if (updatedRow?.Year?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุปีกรมธรรม์รถยนต์');
        return;
      }
      if (updatedRow?.Type?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุประเภทกรมธรรม์รถยนต์');
        return;
      }
      if (updatedRow?.InsuranceCompany?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุบริษัทประกันภัย');
        return;
      }
      if (updatedRow?.BrokerName?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุชื่อโบรกเกอร์');
        return;
      }
      if (updatedRow?.StartDate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่เริ่มต้นกรมธรรม์รถยนต์');
        return;
      }
      if (updatedRow?.EndDate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่สิ้นสุดกรมธรรม์รถยนต์');
        return;
      }
      if (updatedRow?.TotalPremium?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุค่าเบี้ยรวม');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateInsurancePolicyVehicleDTO = {
          year: Number(updatedRow.Year),
          type: updatedRow.Type ?? '',
          insuranceCompany: updatedRow.InsuranceCompany ?? '',
          brokerName: updatedRow.BrokerName ?? '',
          startDate: dayjs(updatedRow.StartDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          endDate: dayjs(updatedRow.EndDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          totalPremium: Number(updatedRow.TotalPremium)
        };
        const response = await addInsurancePolicyVehicle(payload, infoBillVehicle.id);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลกรมธรรม์รถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลกรมธรรม์รถยนต์เรียบร้อย');
          void getInsurancePolicyVehicleData();
        }
      } else {
        const payload: UpdateInsurancePolicyVehicleDTO = {
          year: Number(updatedRow.Year),
          type: updatedRow.Type ?? '',
          insuranceCompany: updatedRow.InsuranceCompany ?? '',
          brokerName: updatedRow.BrokerName ?? '',
          startDate: dayjs(updatedRow.StartDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          endDate: dayjs(updatedRow.EndDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          totalPremium: Number(updatedRow.TotalPremium)
        };
        const response = await updateInsurancePolicyVehicle(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลกรมธรรม์รถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลกรมธรรม์รถยนต์เรียบร้อย');
          void getInsurancePolicyVehicleData();
        }
      }
    } else if (value === 5) {
      if (updatedRow?.FileName?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุชื่อไฟล์');
        return;
      }
      if (updatedRow?.Description?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุรายละเอียด');
        return;
      }
      if (!updatedRow.uuid) {
        CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลไฟล์รถยนต์ได้');
        return;
      }
      const payload: UpdateAttachFileVehicleDTO = {
        fileName: updatedRow.FileName ?? '',
        description: updatedRow.Description ?? '',
      };

      const response = await updateAttachFileVehicle(payload, updatedRow.uuid);
      if (!response.ok) {
        CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลไฟล์รถยนต์ได้');
        return;
      }

      const result = getResponseData(response);
      if (result) {
        CustomToast.success('Success', 'อัพเดตข้อมูลไฟล์รถยนต์เรียบร้อย');
        void getAttachFileVehicleData();
      }

    } else if (value === 6) {
      if (updatedRow?.ChangeDate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่เปลี่ยนยาง');
        return;
      }
      if (updatedRow?.Position?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุตำแหน่งยาง');
        return;
      }
      if (updatedRow?.Brand?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุยาง');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateCarTiresDTO = {
          changeDate: dayjs(updatedRow.ChangeDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          position: updatedRow.Position ?? '',
          brand: updatedRow.Brand ?? '',
        };
        const response = await addCarTiresVehicle(payload, infoBillVehicle.id);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลยางรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลยางรถยนต์เรียบร้อย');
          void getCarTiresVehicleData();
        }
      } else {
        const payload: UpdateCarTiresDTO = {
          changeDate: dayjs(updatedRow.ChangeDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          position: updatedRow.Position ?? '',
          brand: updatedRow.Brand ?? '',
        };
        const response = await updateCarTiresVehicle(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลยางรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลยางรถยนต์เรียบร้อย');
          void getCarTiresVehicleData();
        }
      }
    } else if (value === 7) {
      if (updatedRow?.Date?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่อุบัติเหตุ');
        return;
      }
      if (updatedRow?.Time?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุเวลาอุบัติเหตุ');
        return;
      }
      if (updatedRow?.Party?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุว่าเป็นฝ่ายใด');
        return;
      }
      if (updatedRow?.LicensePlate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุทะเบียนรถยนต์');
        return;
      }
      if (updatedRow?.DriverName?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุชื่อผู้ขับขี่');
        return;
      }
      if (updatedRow?.Opponent?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุชื่อคู่กรณี');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateAccidentVehicleDTO = {
          date: dayjs(updatedRow.Date, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          time: dayjs(updatedRow.Time, 'HH:mm').format('HH:mm') ?? '',
          party: updatedRow.Party ?? '',
          licensePlate: updatedRow.LicensePlate ?? '',
          driverName: updatedRow.DriverName ?? '',
          opponent: updatedRow.Opponent ?? '',
        };
        const response = await addAccidentVehicle(payload, infoBillVehicle.id);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลอุบัติเหตุรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลอุบัติเหตุรถยนต์เรียบร้อย');
          void getAccidentVehicleData();
        }
      } else {
        const payload: UpdateAccidentVehicleDTO = {
          date: dayjs(updatedRow.Date, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          time: dayjs(updatedRow.Time, 'HH:mm').format('HH:mm') ?? '',
          party: updatedRow.Party ?? '',
          licensePlate: updatedRow.LicensePlate ?? '',
          driverName: updatedRow.DriverName ?? '',
          opponent: updatedRow.Opponent ?? '',
        };
        const response = await updateAccidentVehicle(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลอุบัติเหตุรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลอุบัติเหตุรถยนต์เรียบร้อย');
          void getAccidentVehicleData();
        }
      }
    } else if (value === 8) {
      if (updatedRow?.RepairDate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่ซ่อม');
        return;
      }
      if (updatedRow?.LicensePlate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุทะเบียนรถยนต์');
        return;
      }
      if (updatedRow?.RepairShop?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุชื่อร้านซ่อม');
        return;
      }
      if (updatedRow?.ReceiveDate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่รับรถ');
        return;
      }
      if (updatedRow?.InsurancePay?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุประกันจ่าย');
        return;
      }
      if (updatedRow?.CompanyPay?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุบริษัทจ่าย');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateRepairVehicleDTO = {
          repairDate: dayjs(updatedRow.RepairDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          licensePlate: updatedRow.LicensePlate ?? '',
          repairShop: updatedRow.RepairShop ?? '',
          receiveDate: dayjs(updatedRow.ReceiveDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          insurancePay: Number(updatedRow.InsurancePay),
          companyPay: Number(updatedRow.CompanyPay)
        };
        const response = await addRepairVehicle(payload, infoBillVehicle.id);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลซ่อมรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลซ่อมรถยนต์เรียบร้อย');
          void getRepairVehicleData();
        }
      } else {
        const payload: UpdateRepairVehicleDTO = {
          repairDate: dayjs(updatedRow.RepairDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          licensePlate: updatedRow.LicensePlate ?? '',
          repairShop: updatedRow.RepairShop ?? '',
          receiveDate: dayjs(updatedRow.ReceiveDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          insurancePay: Number(updatedRow.InsurancePay),
          companyPay: Number(updatedRow.CompanyPay)
        };
        const response = await updateRepairVehicle(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลซ่อมรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลซ่อมรถยนต์เรียบร้อย');
          void getRepairVehicleData();
        }
      }
    } else if (value === 9) {
      if (updatedRow?.Item?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุชื่อรายการ');
        return;
      }
      if (updatedRow?.Liters?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุปริมาณน้ำมัน');
        return;
      }
      if (updatedRow?.Amount === undefined) {
        CustomToast.error('Error', 'กรุณาระบุจำนวนเงิน');
        return;
      }
      if (updatedRow?.OdometerStart?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุระยะทางของรถเริ่มต้น');
        return;
      }
      if (updatedRow?.OdometerEnd?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุระยะทางของรถสิ้นสุด');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateGasolineCostDTO = {
          item: updatedRow.Item ?? '',
          liters: Number(updatedRow.Liters),
          amount: Number(updatedRow.Amount),
          odometerStart: Number(updatedRow.OdometerStart),
          odometerEnd: Number(updatedRow.OdometerEnd),
          dateTime: dayjs(updatedRow.DateTime, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm') ?? ''
        };
        const response = await addGasolineCostVehicle(payload, infoBillVehicle.id);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลค่าน้ำมันรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลค่าน้ำมันรถยนต์เรียบร้อย');
          void getGasolineCostVehicleData();
        }
      } else {
        const payload: UpdateGasolineCostDTO = {
          item: updatedRow.Item ?? '',
          liters: Number(updatedRow.Liters),
          amount: Number(updatedRow.Amount),
          odometerStart: Number(updatedRow.OdometerStart),
          odometerEnd: Number(updatedRow.OdometerEnd),
          dateTime: dayjs(updatedRow.DateTime, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm') ?? ''
        };
        const response = await updateGasolineCostVehicle(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลค่าน้ำมันรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลค่าน้ำมันรถยนต์เรียบร้อย');
          void getGasolineCostVehicleData();
        }
      }
    } else if (value === 10) {
      if (updatedRow?.Date?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่ถ่ายน้ำมัน');
        return;
      }
      if (updatedRow?.TextAlert?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุข้อความที่เตือน');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateDrainTheOilVehicleDTO = {
          date: dayjs(updatedRow.Date, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          textAlert: updatedRow.TextAlert ?? ''
        };
        const response = await addDrainTheOilVehicle(payload, infoBillVehicle.id);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลถ่ายน้ำมันรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลถ่ายน้ำมันรถยนต์เรียบร้อย');
          void getDrainTheOilVehicleData();
        }
      } else {
        const payload: UpdateDrainTheOilVehicleDTO = {
          date: dayjs(updatedRow.Date, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          textAlert: updatedRow.TextAlert ?? ''
        };
        const response = await updateDrainTheOilVehicle(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลถ่ายน้ำมันรถยนต์ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลถ่ายน้ำมันรถยนต์เรียบร้อย');
          void getDrainTheOilVehicleData();
        }
      }
    } else if (value === 11) {

      if (updatedRow?.InstallmentNumber?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุงวดที่');
        return;
      }
      if (updatedRow?.DueDate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่ครบ');
        return;
      }
      if (updatedRow?.TextAlert?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุข้อความที่เตือน');
        return;
      }
      if (!updatedRow.uuid) {
        const payload: CreateInstallmentsVehicleDTO = {
          installmentNumber: Number(updatedRow.InstallmentNumber),
          dueDate: dayjs(updatedRow.DueDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          paymentEvidence: updatedRow.PaymentEvidence ?? ''
        };
        const response = await addInstallmentsVehicle(payload, infoBillVehicle.id);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลงวดที่เก็บเงินได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลงวดที่เก็บเงินเรียบร้อย');
          void getInstallmentsVehicleData();
        }
      } else {
        const payload: UpdateInstallmentsVehicleDTO = {
          installmentNumber: Number(updatedRow.InstallmentNumber),
          dueDate: dayjs(updatedRow.DueDate, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          paymentEvidence: updatedRow.PaymentEvidence ?? ''
        };
        const response = await updateInstallmentsVehicle(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลงวดที่เก็บเงินได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลงวดที่เก็บเงินเรียบร้อย');
          void getInstallmentsVehicleData();
        }
      }
    } else if (value === 12) {

      if (updatedRow?.Description?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุรายละเอียด');
        return;
      }
      if (updatedRow?.Amount === undefined) {
        CustomToast.error('Error', 'กรุณาระบุจำนวนเงิน');
        return;
      }

      if (updatedRow?.ReceiveDate?.trim() === '') {
        CustomToast.error('Error', 'กรุณาระบุวันที่รับ');
        return;
      }

      if (!updatedRow.uuid) {
        const payload: CreateIncomeVehicleDTO = {
          receiveDate: dayjs(updatedRow.ReceiveDate, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm') ?? '',
          customerName: updatedRow.CustomerName ?? '',
          description: updatedRow.Description ?? '',
          amount: Number(updatedRow.Amount),
          dateTime: dayjs(updatedRow.DateTime, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          time: updatedRow.Time ?? '',
          paymentStatusId: updatedRow.PaymentStatusId ?? '',
          workOrderNumber: updatedRow.WorkOrderNumber ?? '',
          invoiceNumber: updatedRow.InvoiceNumber ?? '',
          amountReceive: Number(updatedRow.AmountReceive),
          vehicleDriverId: updatedRow.VehicleDriverId ?? ''
        };
        const response = await addIncomeVehicle(payload, infoBillVehicle.id);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลรายได้ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'เพิ่มข้อมูลรายได้เรียบร้อย');
          void getIncomeVehicleData();
        }
      } else {
        const payload: UpdateIncomeVehicleDTO = {
          receiveDate: dayjs(updatedRow.ReceiveDate, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm') ?? '',
          customerName: updatedRow.CustomerName ?? '',
          description: updatedRow.Description ?? '',
          amount: Number(updatedRow.Amount),
          dateTime: dayjs(updatedRow.DateTime, 'DD/MM/YYYY').format('YYYY-MM-DD') ?? '',
          time: updatedRow.Time ?? '',
          paymentStatusId: updatedRow.PaymentStatusId ?? '',
          workOrderNumber: updatedRow.WorkOrderNumber ?? '',
          invoiceNumber: updatedRow.InvoiceNumber ?? '',
          amountReceive: Number(updatedRow.AmountReceive),
          vehicleDriverId: updatedRow.VehicleDriverId ?? ''
        };
        const response = await updateIncomeVehicle(payload, updatedRow.uuid);
        if (!response.ok) {
          CustomToast.error('Error', 'ไม่สามารถอัพเดตข้อมูลรายได้ได้');
          return;
        }
        const result = getResponseData(response);
        if (result) {
          CustomToast.success('Success', 'อัพเดตข้อมูลรายได้เรียบร้อย');
          void getIncomeVehicleData();
        }
      }
    }

    setRows(prevRows =>
      prevRows.map(row =>
        row.id === updatedRow.id ? updatedRow : row
      )
    );
  };
  const handleUpload4 = async (files: FileWithImageVehicle[]) => {
    console.log('files', files);
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลรูปภาพรถยนต์ได้');
      return;
    }
    if (files.length === 0) {
      CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลรูปภาพรถยนต์ได้');
      return;
    }
    const payload: CreateImageVehicleDTO = {
      files: files
    };
    const response = await addImageVehicle(payload, infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลรูปภาพรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      CustomToast.success('Success', 'เพิ่มข้อมูลรูปภาพรถยนต์เรียบร้อย');
      void getImageVehicleData();
    }
  };
  const handleUpload5 = async (files: FileWithNote[]) => {
    console.log('files', files);
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลไฟล์รถยนต์ได้');
      return;
    }
    if (files.length === 0) {
      CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลไฟล์รถยนต์ได้');
      return;
    }
    const payload: CreateAttachFileVehicleDTO = {
      files: files
    };
    const response = await addAttachFileVehicle(payload, infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถเพิ่มข้อมูลไฟล์รถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      CustomToast.success('Success', 'เพิ่มข้อมูลไฟล์รถยนต์เรียบร้อย');
      void getAttachFileVehicleData();
    }
  };

  const getVehicleTaxData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลการประกันภัยรถยนต์ได้');
      return;
    }
    const response = await getVehicleTax(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลการประกันภัยรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const taxRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Year: item.year.toString(),
        EndDate: dayjs(item.endDate).format('DD/MM/YYYY'),
        TotalPremium: item.totalPremium.toString(),
        InsuranceCompany: item.insuranceCompany,
        BrokerName: item.brokerName
      }));
      console.log('taxRows', taxRows);
      setRows(taxRows);
    }
  }
  const getCompulsoryMotorInsuranceVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลการประกันภัยรถยนต์ได้');
      return;
    }
    const response = await getCompulsoryMotorInsuranceVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลการประกันภัยรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const compulsoryMotorInsuranceVehicleRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Year: item.year.toString(),
        EndDate: dayjs(item.endDate).format('DD/MM/YYYY'),
        TotalPremium: item.totalPremium.toString(),
        InsuranceCompany: item.insuranceCompany,
        BrokerName: item.brokerName
      }));
      console.log('compulsoryMotorInsuranceVehicleRows', compulsoryMotorInsuranceVehicleRows);
      setRows(compulsoryMotorInsuranceVehicleRows);
    }
  }
  const getInsurancePolicyVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลกรมธรรม์รถยนต์ได้');
      return;
    }
    const response = await getInsurancePolicyVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลกรมธรรม์รถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const insurancePolicyVehicleRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Year: item.year.toString(),
        Type: item.type,
        InsuranceCompany: item.insuranceCompany,
        BrokerName: item.brokerName,
        StartDate: dayjs(item.startDate).format('DD/MM/YYYY'),
        EndDate: dayjs(item.endDate).format('DD/MM/YYYY'),
        TotalPremium: item.totalPremium.toString()
      }));
      console.log('insurancePolicyVehicleRows', insurancePolicyVehicleRows);
      setRows(insurancePolicyVehicleRows);
    }
  }
  const getAttachFileVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลไฟล์รถยนต์ได้');
      return;
    }
    const response = await getAttachFileVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลไฟล์รถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const attachFileVehicleRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        FileName: item.fileName,
        Description: item.description,
        Url: item.url
      }));
      console.log('attachFileVehicleRows', attachFileVehicleRows);
      setRows(attachFileVehicleRows);
    }
  }
  const getCarTiresVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลยางรถยนต์ได้');
      return;
    }
    const response = await getCarTiresVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลยางรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const carTiresVehicleRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        ChangeDate: dayjs(item.changeDate).format('DD/MM/YYYY'),
        Position: item.position,
        Brand: item.brand
      }));
      console.log('carTiresVehicleRows', carTiresVehicleRows);
      setRows(carTiresVehicleRows);
    }
  }
  const getAccidentVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลอุบัติเหตุรถยนต์ได้');
      return;
    }
    const response = await getAccidentVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลอุบัติเหตุรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const accidentVehicleRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Date: dayjs(item.date).format('DD/MM/YYYY'),
        Time: item.time,
        Party: item.party,
        LicensePlate: item.licensePlate,
        DriverName: item.driverName,
        Opponent: item.opponent
      }));
      console.log('accidentVehicleRows', accidentVehicleRows);
      setRows(accidentVehicleRows);
    }
  }
  const getRepairVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลการซ่อมรถยนต์ได้');
      return;
    }
    const response = await getRepairVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลการซ่อมรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const repairVehicleRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        RepairDate: dayjs(item.repairDate).format('DD/MM/YYYY'),
        LicensePlate: item.licensePlate,
        Description: item.description ?? '',
        RepairShop: item.repairShop,
        ReceiveDate: dayjs(item.receiveDate).format('DD/MM/YYYY'),
        InsurancePay: item.insurancePay.toString(),
        CompanyPay: item.companyPay.toString()
      }));
      console.log('repairVehicleRows', repairVehicleRows);
      setRows(repairVehicleRows);
    }
  }
  const getGasolineCostVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลค่าน้ำมันรถยนต์ได้');
      return;
    }
    const response = await getGasolineCostVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลค่าน้ำมันรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const gasolineCostVehicleRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Item: item.item,
        Liters: item.liters.toString(),
        Amount: item.amount,
        OdometerStart: item.odometerStart.toString(),
        OdometerEnd: item.odometerEnd.toString(),
        DateTime: dayjs(item.dateTime).format('DD/MM/YYYY HH:mm')
      }));
      console.log('gasolineCostVehicleRows', gasolineCostVehicleRows);
      setRows(gasolineCostVehicleRows);
    }
  }
  const getDrainTheOilVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลการถ่ายน้ำมันรถยนต์ได้');
      return;
    }
    const response = await getDrainTheOilVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลการถ่ายน้ำมันรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const drainTheOilVehicleRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        Date: dayjs(item.date).format('DD/MM/YYYY'),
        TextAlert: item.textAlert
      }));
      console.log('drainTheOilVehicleRows', drainTheOilVehicleRows);
      setRows(drainTheOilVehicleRows);
    }
  }
  const getInstallmentsVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลค่างวดรถยนต์ได้');
      return;
    }
    const response = await getInstallmentsVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลค่างวดรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const installmentsVehicleRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        InstallmentNumber: item.installmentNumber.toString(),
        DueDate: dayjs(item.dueDate).format('DD/MM/YYYY'),
        PaymentEvidence: item.paymentEvidence ?? ''
      }));
      console.log('installmentsVehicleRows', installmentsVehicleRows);
      setRows(installmentsVehicleRows);
    }
  }
  const getImageVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลรูปภาพรถยนต์ได้');
      return;
    }
    const response = await getImageVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลรูปภาพรถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      setImgVehicle(result.data);
    }
  }
  const getIncomeVehicleData = async () => {
    if (!infoBillVehicle) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลรายได้รถยนต์ได้');
      return;
    }
    const response = await getIncomeVehicle(infoBillVehicle.id);
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลรายได้รถยนต์ได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      const incomeVehicleRows = result.data.map((item, index) => ({
        uuid: item.uuid ?? undefined,
        id: index + 1,
        ReceiveDate: dayjs(item.receiveDate).format('DD/MM/YYYY HH:mm'),
        CustomerName: item.customerName ?? '',
        Description: item.description,
        Amount: item.amount,
        DateTime: dayjs(item.dateTime).format('DD/MM/YYYY'),
        Time: item.time,
        WorkOrderNumber: item.workOrderNumber,
        InvoiceNumber: item.invoiceNumber,
        PaymentStatusId: item.paymentStatusId,
        AmountReceive: item.amountReceive.toString(),
        VehicleDriverId: item.vehicleDriverId
      }));
      console.log('incomeVehicleRows', incomeVehicleRows);
      setRows(incomeVehicleRows);
    }
  }

  const getOptionDriverData = async () => {
    const response = await getOptionDriver();
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลคนขับได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      setOptionsDrivers(result.data);
    }
  }

  const getOptionPaymentStatusData = async () => {
    const response = await getOptionPaymentStatus();
    if (!response.ok) {
      CustomToast.error('Error', 'ไม่สามารถดึงข้อมูลสถานะการชำระได้');
      return;
    }
    const result = getResponseData(response);
    if (result) {
      setOptionsPaymentStatus(result.data);
    }
  }

  useEffect(() => {
    if (value === 1) {
      void getVehicleTaxData();

      importColumns?.([
        {
          key: 'no',
          name: 'แถวที่'
        },
        {
          key: 'text',
          name: 'ปี'
        },
        {
          key: 'status',
          name: 'สถานะ'
        }
      ]);

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 20, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Year', headerName: 'ปี', minWidth: 60, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        {
          field: 'EndDate', headerName: 'สิ้นสุดวันที่', minWidth: 170, flex: 0.25, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        { field: 'TotalPremium', headerName: 'ค่าเบี้ยรวม', minWidth: 100, flex: 0, headerAlign: 'center', align: 'center', editable: true },
        { field: 'InsuranceCompany', headerName: 'บริษัทประกันภัย', minWidth: 100, flex: 0.5, headerAlign: 'center', editable: true },
        { field: 'BrokerName', headerName: 'ชื่อโบรกเกอร์', minWidth: 150, flex: 1, headerAlign: 'center', editable: true },
      ]);
    } else if (value === 2) {
      void getCompulsoryMotorInsuranceVehicleData();

      importColumns?.([
        {
          key: 'no',
          name: 'แถวที่'
        },
        {
          key: 'text',
          name: 'ปี'
        },
        {
          key: 'status',
          name: 'สถานะ'
        }
      ]);

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 20, flex: 0.2, headerAlign: 'center', align: 'center' },
        { field: 'Year', headerName: 'ปี', minWidth: 60, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        {
          field: 'EndDate', headerName: 'สิ้นสุดวันที่', minWidth: 170, flex: 0.25, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        { field: 'TotalPremium', headerName: 'ค่าเบี้ยรวม', minWidth: 100, flex: 0, headerAlign: 'center', align: 'center', editable: true },
        { field: 'InsuranceCompany', headerName: 'บริษัทประกันภัย', minWidth: 100, flex: 0.5, headerAlign: 'center', editable: true },
        { field: 'BrokerName', headerName: 'ชื่อโบรกเกอร์', minWidth: 150, flex: 1, headerAlign: 'center', editable: true },
      ]);
    } else if (value === 3) {
      void getInsurancePolicyVehicleData();

      importColumns?.([
        {
          key: 'no',
          name: 'แถวที่'
        },
        {
          key: 'text',
          name: 'ปี'
        },
        {
          key: 'status',
          name: 'สถานะ'
        }
      ]);

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 40, flex: 0.2, headerAlign: 'center', align: 'center' },
        { field: 'Year', headerName: 'ปี', minWidth: 80, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Type', headerName: 'ประเภท', minWidth: 110, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        { field: 'InsuranceCompany', headerName: 'บริษัทประกันภัย', minWidth: 100, flex: 0.5, headerAlign: 'center', editable: true },
        { field: 'BrokerName', headerName: 'ชื่อโบรกเกอร์', minWidth: 150, flex: 1, headerAlign: 'center', editable: true },
        {
          field: 'StartDate', headerName: 'เริ่มต้นวันที่', minWidth: 150, flex: 0.25, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        {
          field: 'EndDate', headerName: 'สิ้นสุดวันที่', minWidth: 150, flex: 0.25, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        { field: 'TotalPremium', headerName: 'ค่าเบี้ยรวม', minWidth: 100, flex: 0, headerAlign: 'center', align: 'center', editable: true },
      ]);
    } else if (value === 4) {
      void getImageVehicleData();
    } else if (value === 5) {
      void getAttachFileVehicleData();
      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 10, flex: 0.1, headerAlign: 'center', align: 'center' },
        { field: 'FileName', headerName: 'ชื่อไฟล์', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'left', editable: true },
        { field: 'Description', headerName: 'รายละเอียด', minWidth: 110, flex: 1, headerAlign: 'center', align: 'left', editable: true }
      ]);
    } else if (value === 6) {
      void getCarTiresVehicleData();

      importColumns?.([
        {
          key: 'no',
          name: 'แถวที่'
        },
        {
          key: 'text',
          name: 'วันที่เปลี่ยน'
        },
        {
          key: 'status',
          name: 'สถานะ'
        }
      ]);

      setColumns([
        { field: 'id', headerName: 'ลำดับ', minWidth: 10, flex: 0.1, headerAlign: 'center', align: 'center' },
        {
          field: 'ChangeDate', headerName: 'วันที่เปลี่ยน', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        { field: 'Position', headerName: 'ตำแหน่ง', minWidth: 110, flex: 0.5, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Brand', headerName: 'ยี่ห้อ', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true }
      ]);
    } else if (value === 7) {
      void getAccidentVehicleData();
      setColumns([
        { field: 'id', headerName: 'ลำดับ', minWidth: 10, flex: 0.1, headerAlign: 'center', align: 'center' },
        {
          field: 'Date', headerName: 'วันที่', minWidth: 90, flex: 0.5, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        {
          field: 'Time', headerName: 'เวลา', minWidth: 105, flex: 0.25, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <TimePicker
                value={dayjs(params.value as string, 'HH:mm')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('HH:mm');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="HH:mm"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        { field: 'Party', headerName: 'เป็นฝ่าย', minWidth: 80, flex: 0.3, headerAlign: 'center', align: 'center', editable: true },
        { field: 'LicensePlate', headerName: 'ทะเบียน', minWidth: 80, flex: 0.6, headerAlign: 'center', align: 'center', editable: true },
        { field: 'DriverName', headerName: 'ชื่อผู้ขับขี่', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Opponent', headerName: 'คู่กรณี', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true }
      ]);
    } else if (value === 8) {
      void getRepairVehicleData();

      importColumns?.([
        {
          key: 'no',
          name: 'แถวที่'
        },
        {
          key: 'text',
          name: 'วันที่'
        },
        {
          key: 'status',
          name: 'สถานะ'
        }
      ]);

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 10, flex: 0.1, headerAlign: 'center', align: 'center' },
        {
          field: 'RepairDate', headerName: 'วันที่ซ่อมรถ', minWidth: 60, flex: 0.6, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        { field: 'LicensePlate', headerName: 'ทะเบียน', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Description', headerName: 'รายการซ่อม', minWidth: 120, flex: 1.4, headerAlign: 'center', align: 'left' },
        { field: 'RepairShop', headerName: 'ซ่อมที่', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
        {
          field: 'ReceiveDate', headerName: 'วันที่รับรถ', minWidth: 60, flex: 0.6, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        { field: 'InsurancePay', headerName: 'ประกันจ่าย', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true },
        { field: 'CompanyPay', headerName: 'บริษัทจ่าย', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true }
      ]);
    } else if (value === 9) {
      void getGasolineCostVehicleData();

      importColumns?.([
        {
          key: 'no',
          name: 'แถวที่'
        },
        {
          key: 'text',
          name: 'รายการ'
        },
        {
          key: 'status',
          name: 'สถานะ'
        }
      ]);

      setColumns([
        { field: 'id', headerName: 'ลำดับ', minWidth: 10, flex: 0.1, headerAlign: 'center', align: 'center' },
        { field: 'Item', headerName: 'รายการ', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Liters', headerName: 'ลิตร', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Amount', headerName: 'บาท', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true, type: 'number' },
        { field: 'OdometerStart', headerName: 'เลขไมค์ไป', minWidth: 60, flex: 0.6, headerAlign: 'center', align: 'center', editable: true },
        { field: 'OdometerEnd', headerName: 'เลขไมค์กลับ', minWidth: 60, flex: 0.6, headerAlign: 'center', align: 'center', editable: true },
        {
          field: 'DateTime', headerName: 'วัน-เวลา', minWidth: 170, flex: 0.25, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DateTimePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY HH:mm')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY HH:mm');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        }
      ]);
    } else if (value === 10) {
      void getDrainTheOilVehicleData();

      importColumns?.([
        {
          key: 'no',
          name: 'แถวที่'
        },
        {
          key: 'text',
          name: 'วันที่ครบ'
        },
        {
          key: 'status',
          name: 'สถานะ'
        }
      ]);

      setColumns([
        { field: 'uuid', headerName: 'UUID' },
        { field: 'id', headerName: 'ลำดับ', minWidth: 10, flex: 0.1, headerAlign: 'center', align: 'center' },
        {
          field: 'Date', headerName: 'วันที่ครบ', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        { field: 'TextAlert', headerName: 'ข้อความที่เตือน', minWidth: 60, flex: 1, headerAlign: 'center', align: 'left', editable: true }
      ]);
    } else if (value === 11) {
      void getInstallmentsVehicleData();

      importColumns?.([
        {
          key: 'no',
          name: 'แถวที่'
        },
        {
          key: 'text',
          name: 'งวดที่'
        },
        {
          key: 'status',
          name: 'สถานะ'
        }
      ]);

      setColumns([
        { field: 'id', headerName: 'ลำดับ', minWidth: 10, flex: 0.1, headerAlign: 'center', align: 'center' },
        { field: 'InstallmentNumber', headerName: 'งวดที่', minWidth: 60, flex: 0.2, headerAlign: 'center', align: 'center', editable: true },
        {
          field: 'DueDate', headerName: 'วันที่ครบ', minWidth: 60, flex: 0.3, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        { field: 'PaymentEvidence', headerName: 'หลักฐานการชำระ', minWidth: 60, flex: 1, headerAlign: 'center', align: 'left', editable: false }
      ]);
    } else if (value === 12) {
      void getIncomeVehicleData();
      void getOptionDriverData();
      void getOptionPaymentStatusData();

      importColumns?.([
        {
          key: 'no',
          name: 'แถวที่'
        },
        {
          key: 'text',
          name: 'รายละเอียด'
        },
        {
          key: 'status',
          name: 'สถานะ'
        }
      ]);

      setColumns([
        { field: 'id', headerName: 'ลำดับ', minWidth: 10, flex: 0.1, headerAlign: 'center', align: 'center' },
        {
          field: 'DateTime', headerName: 'วันที่', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        },
        { field: 'Description', headerName: 'รายละเอียด', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center', editable: true },
        { field: 'CustomerName', headerName: 'ชื่อลูกค้า', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true },
        { field: 'AmountReceive', headerName: 'รายได้', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true },
        { field: 'Time', headerName: 'เวลางาน', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true },
        { field: 'WorkOrderNumber', headerName: 'เลขที่ใบงาน', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true },
        {
          field: 'VehicleDriverId', headerName: 'คนขับ', minWidth: 140, flex: 0.5, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <Autocomplete
              options={optionsDrivers ?? []}
              value={params.value ? optionsDrivers?.find(option => option.id === params.value) || null : null}
              onChange={(_, newValue) => {
                void params.api.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: newValue?.id
                });
              }}
              fullWidth={true}
              sx={AutocompleteStyle}
              renderInput={(textFieldParams) => <TextField {...textFieldParams} label="คนขับ" variant="outlined"
                name="driver"
                size='small'
                InputProps={{
                  ...textFieldParams.InputProps,
                  endAdornment: (
                    <InputAdornment position="end" sx={{ fontSize: '12px', '& .MuiSvgIcon-root': { fontSize: '16px' } }}>
                      {textFieldParams.InputProps.endAdornment}
                    </InputAdornment>
                  ),
                }}
                fullWidth={true}
                sx={AutocompleteStyle} />}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, newValue) => option.id === newValue.id}
            />
          )
        },
        { field: 'InvoiceNumber', headerName: 'เลขที่ใบแจ้งหนี้', minWidth: 60, flex: 0.5, headerAlign: 'center', align: 'center', editable: true },
        {
          field: 'PaymentStatusId', headerName: 'สถานะชำระ', minWidth: 80, flex: 0.5, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <Autocomplete
              options={optionsPaymentStatus ?? []}
              value={params.value ? optionsPaymentStatus?.find(option => option.id === params.value) || null : null}
              onChange={(_, newValue) => {
                void params.api.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: newValue?.id
                });
              }}
              fullWidth={true}
              sx={AutocompleteStyle}
              renderInput={(textFieldParams) => <TextField {...textFieldParams} label="สถานะ" variant="outlined"
                name="statusPayment"
                size='small'
                InputProps={{
                  ...textFieldParams.InputProps,
                  endAdornment: (
                    <InputAdornment position="end" sx={{ fontSize: '12px', '& .MuiSvgIcon-root': { fontSize: '16px' } }}>
                      {textFieldParams.InputProps.endAdornment}
                    </InputAdornment>
                  ),
                }}
                fullWidth={true}
                sx={AutocompleteStyle} />}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, newValue) => option.id === newValue.id}
            />
          )
        },
        {
          field: 'ReceiveDate', headerName: 'วันที่รับ', minWidth: 80, flex: 0.5, headerAlign: 'center', align: 'center', editable: true,
          renderEditCell: (params: GridRenderEditCellParams) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DateTimePicker
                value={dayjs(params.value as string, 'DD/MM/YYYY HH:mm')}
                onChange={(newValue) => {
                  const formattedDate = newValue?.format('DD/MM/YYYY HH:mm');
                  void params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: formattedDate
                  }, true);
                }}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: datePickerStyle
                  }
                }}
              />
            </LocalizationProvider>
          )
        }
      ]);
    } else {
      setRows([]);
      setColumns([]);
    }
  }, [value, open]);

  useEffect(() => {
    void getOptionDriverData();
    void getOptionPaymentStatusData();
  }, []);

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
              <Tab label="รายได้" {...a11yProps(12)} />
            </Tabs>
          </AppBar>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={value}
            onChangeIndex={handleChangeIndex}
            style={{ width: '100%' }}
          >
            <TabPanel value={value} index={0}>
              <Stack sx={{ alignItems: 'center', justifyContent: 'space-between' }} direction="row" spacing={1}>
                <Typography component="div" variant="h4">ข้อมูลยานพาหนะ</Typography>
                <Button onClick={() => { infoBillVehicle ? onEdit(infoBillVehicle) : null }} variant="contained" color="warning">แก้ไข</Button>
              </Stack>
              {infoBillVehicle ? (
                <Box className='modal-info-group'>
                  <Box className='modal-info-image-box'>
                    <Image src={infoBillVehicle?.img ? `${urlImage}${infoBillVehicle?.img}` : '/assets/logo.png'} alt='' width={0} height={0} layout="responsive" onError={(e) => {
                      e.currentTarget.src = '/assets/logo.png';
                    }} />
                  </Box>
                  <Box className='modal-info-data-text-group-box-2'>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ไอดี
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        Vehicle-{infoBillVehicle.no.toString().padStart(5, '0')}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ทะเบียน
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.licensePlatePrefix} {infoBillVehicle.licensePlateSuffix} {infoBillVehicle.licensePlateProvince}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ประเภท
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.vehicleType}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ลักษณะ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.vehicleCharacteristic}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ยิ่ห้อ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.brand}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        แบบ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.model}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        รุ่น
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.generation}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        สี
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.color}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className='modal-info-data-text-group-box-2'>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        หมายเลขตัวถัง
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.chassisNumber}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        หมายเลขเครื่องยนต์
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.engineNumber}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ยี่ห้อเครื่องยนต์
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.engineBrand}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        เชื้อเพลิง
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.fuelType}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ขนาดถัง
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.tankSize}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        อัตราการสิ้นเปลือง
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.fuelConsumption}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        จำนวน/ขนาด
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.cylinderCount}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className='modal-info-data-text-group-box-2'>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        เชื้อเพลิง
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.fuelType}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        กระบอกสูบ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.cylinder}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ขนาดรถ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.vehicleSize}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ขนาดตู้
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.cargoSize}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        เลขถังแก๊ส
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.gasSerialNumber}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        น้ำหนักรถ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.vehicleWeight}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        บรรทุก
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.cargoWeight}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className='modal-info-data-text-group-box-2'>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        จำนวนล้อ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.wheelCount}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        จำนวนที่นั่ง
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.seatCount}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        วันที่จดทะเบียน
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.registrationDate ? new Date(infoBillVehicle.registrationDate).toLocaleDateString('th-TH') : ''}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        วันที่เริ่มใช้งาน
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.startDate ? new Date(infoBillVehicle.startDate).toLocaleDateString('th-TH') : ''}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        อายุ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.age}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ผู้ถือกรรมสิทธิ์
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.ownership}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className='modal-info-data-text-group-box-2'>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        เจ้าของ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.owner}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        หน่วยงาน
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.department}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        ผู้ขับรถ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.driver}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        สถานะ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.status}
                      </Typography>
                    </Box>
                    <Box className='modal-info-data-text-group'>
                      <Typography component="div" className='label-text' variant="subtitle1">
                        หมายเหตุ
                      </Typography>
                      <Typography component="div" align="left" variant="body1">
                        {infoBillVehicle.note}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : null}
            </TabPanel>
            <TabPanel value={value} index={1}>
              <VehicleInfoTable title='ภาษี' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                onImport={handleFileImportUpload}
                linkTemplates='/templates/vehicle_tax_ภาษี.csv'
              />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <VehicleInfoTable title='พรบ' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                onImport={handleFileImportUpload}
                linkTemplates='/templates/vehicle_compulsory_insurance_พรบ.csv'
              />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <VehicleInfoTable title='กรมธรรม์' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                onImport={handleFileImportUpload}
                linkTemplates='/templates/vehicle_insurance_policy_กรมธรรม์.csv'
              />
            </TabPanel>
            <TabPanel value={value} index={4}>
              <StandardImageList itemData={imgVehicle} onUpload={handleUpload4} />
            </TabPanel>
            <TabPanel value={value} index={5}>
              <VehicleInfoTable title='ไฟล์' rows={rows} columns={columns} isFileData={true}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                onUpload={handleUpload5}
              />
            </TabPanel>
            <TabPanel value={value} index={6}>
              <VehicleInfoTable title='ยาง' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                onImport={handleFileImportUpload}
                linkTemplates='/templates/vehicle_tires_ยาง.csv'
              />
            </TabPanel>
            <TabPanel value={value} index={7}>
              <VehicleInfoTable title='อุบัติเหตุ' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                onImport={handleFileImportUpload}
                linkTemplates='/templates/vehicle_accident_อุบัติเหตุ.csv'
              />
            </TabPanel>
            <TabPanel value={value} index={8}>
              <VehicleInfoTable title='ซ่อม' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                onImport={handleFileImportUpload}
                linkTemplates='/templates/vehicle_repair_ซ่อม.csv'
              />
            </TabPanel>
            <TabPanel value={value} index={9}>
              <VehicleInfoTable title='ค่าน้ำมัน' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                onImport={handleFileImportUpload}
                linkTemplates='/templates/vehicle_gasoline_ค่าน้ำมัน.csv'
              />
            </TabPanel>
            <TabPanel value={value} index={10}>
              <VehicleInfoTable title='ถ่ายน้ำมัน' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                onImport={handleFileImportUpload}
                linkTemplates='/templates/vehicle_oil_เปลี่ยนน้ำมันเครื่อง.csv'
              />
            </TabPanel>
            <TabPanel value={value} index={11}>
              <VehicleInfoTable title='ค่างวด' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                onImport={handleFileImportUpload}
                linkTemplates='/templates/vehicle_installment_ค่างวด.csv'
              />
            </TabPanel>
            <TabPanel value={value} index={12}>
              <VehicleInfoTable title='รายได้' rows={rows} columns={columns}
                onAddRow={handleAddRow}
                onSaveRow={handleSaveRow}
                setRows={setRows}
                onImport={handleFileImportUpload}
                linkTemplates='/templates/vehicle_income_รายได้.csv'
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

export default VehicleInfoModal;