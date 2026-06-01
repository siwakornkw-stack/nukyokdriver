import React from 'react';
import type { JSX } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Stack, Typography } from '@mui/material';
import '../../../../public/styles/modal.scss';
import type { GridLocaleText } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid-pro';

const thTH: Partial<GridLocaleText> = {
  // กำหนดค่า locale ภาษาไทยตามต้องการ
  // ตัวอย่าง:
  columnMenuLabel: 'เมนู',
  columnMenuShowColumns: 'แสดงคอลัมน์',
  columnMenuFilter: 'ตัวกรอง',
  columnMenuHideColumn: 'ซ่อนคอลัมน์',
  columnMenuUnsort: 'เลิกเรียงลำดับ',
  columnMenuSortAsc: 'เรียงจากน้อยไปมาก',
  columnMenuSortDesc: 'เรียงจากมากไปน้อย',
  // เพิ่มค่าอื่นๆ ตามต้องการ
};
interface DataGridThTH {
  components?: {
    MuiDataGrid?: {
      defaultProps?: {
        localeText?: Partial<GridLocaleText>;
      };
    };
  };
};
interface TaxRow {
  id: number;
  Year: string;
  EndDate: string;
  TotalPremium: string;
  InsuranceCompany: string;
  BrokerName: string;
  Action: string;
}
function VehicleInfoTax(): JSX.Element {
  const rows: TaxRow[] = [
    { id: 1, Year: '2566', EndDate: '31/12/2566', TotalPremium: '1,200.00', InsuranceCompany: 'บริษัท ก', BrokerName: 'นายสมชาย', Action: 'แก้ไข' },
    { id: 2, Year: '2565', EndDate: '31/12/2565', TotalPremium: '1,150.00', InsuranceCompany: 'บริษัท ข', BrokerName: 'นางสาวสมหญิง', Action: 'แก้ไข' },
    { id: 3, Year: '2564', EndDate: '31/12/2564', TotalPremium: '1,100.00', InsuranceCompany: 'บริษัท ค', BrokerName: 'นายสมศักดิ์', Action: 'แก้ไข' },
    { id: 4, Year: '2563', EndDate: '31/12/2563', TotalPremium: '1,050.00', InsuranceCompany: 'บริษัท ง', BrokerName: 'นางสาวสมใจ', Action: 'แก้ไข' },
    { id: 5, Year: '2562', EndDate: '31/12/2562', TotalPremium: '1,000.00', InsuranceCompany: 'บริษัท จ', BrokerName: 'นายสมพงษ์', Action: 'แก้ไข' },
    { id: 6, Year: '2561', EndDate: '31/12/2561', TotalPremium: '950.00', InsuranceCompany: 'บริษัท ฉ', BrokerName: 'นางสาวสมศรี', Action: 'แก้ไข' },
    { id: 7, Year: '2560', EndDate: '31/12/2560', TotalPremium: '900.00', InsuranceCompany: 'บริษัท ช', BrokerName: 'นายสมคิด', Action: 'แก้ไข' },
    { id: 8, Year: '2559', EndDate: '31/12/2559', TotalPremium: '850.00', InsuranceCompany: 'บริษัท ซ', BrokerName: 'นางสาวสมปอง', Action: 'แก้ไข' },
    { id: 9, Year: '2558', EndDate: '31/12/2558', TotalPremium: '800.00', InsuranceCompany: 'บริษัท ฌ', BrokerName: 'นายสมหมาย', Action: 'แก้ไข' },
  ];

  const columns: GridColDef<TaxRow>[] = [
    { field: 'id', headerName: 'ลำดับ', minWidth: 20 , flex: 0.2,headerAlign: 'center',align: 'center'},
    { field: 'Year', headerName: 'ปี', minWidth: 40, flex: 0.2,headerAlign: 'center',align: 'center'},
    { field: 'EndDate', headerName: 'สิ้นสุดวันที่', minWidth: 110, flex: 0.2,headerAlign: 'center',align: 'center'},
    { field: 'TotalPremium', headerName: 'ค่าเบี้ยรวม', minWidth: 100, flex: 0,headerAlign: 'center',align: 'center'},
    { field: 'InsuranceCompany', headerName: 'บริษัทประกันภัย', minWidth: 100, flex: 0.5,headerAlign: 'center'},
    { field: 'BrokerName', headerName: 'ชื่อโบรกเกอร์', minWidth: 150, flex: 1,headerAlign: 'center'},
    { field: 'Action', headerName: 'ทำการ', minWidth: 80, flex: 0, sortable: false,headerAlign: 'center',align: 'center',
      renderCell: () => (
        <Button
          variant="contained"
          size="small"
          color="warning"
        >
          แก้ไข
        </Button>
      )
    },
  ];
  const customLocaleText: Partial<GridLocaleText> = {
    ...(thTH as DataGridThTH).components?.MuiDataGrid?.defaultProps?.localeText,
    columnMenuSortAsc: 'เรียงจากน้อยไปมาก',
    columnMenuSortDesc: 'เรียงจากมากไปน้อย',
    columnMenuUnsort: 'ยกเลิกการเรียงลำดับ',
    columnMenuFilter: 'ตัวกรอง',
    columnMenuHideColumn: 'ซ่อนคอลัมน์',
    columnMenuShowColumns: 'แสดงคอลัมน์',
    columnMenuManageColumns: 'จัดการคอลัมน์',
    columnsManagementSearchTitle: 'ค้นหาคอลัมน์',
    columnsManagementReset: 'รีเซ็ตคอลัมน์',
    columnHeaderFiltersLabel: 'ตัวกรอง',
    filterPanelColumns: 'คอลัมน์',
    filterPanelOperator: 'ตัวดำเนินการ',
    filterPanelInputLabel: 'ค่า',
    filterPanelInputPlaceholder: 'ค่า',
  };
  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' marginBottom={2}>
        <Typography variant='h4'>ภาษีรถยนต์</Typography>
        <Button variant='contained' size='small'>
          เพิ่มข้อมูล
        </Button>
      </Stack>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        pageSizeOptions={[5]}
        sx={{
          boxShadow: 2,
          border: 2,
          borderColor: 'primary.light',
          '& .MuiDataGrid-cell:hover': {
            color: 'primary.main',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: 'transparent',
          },
          '& .MuiDataGrid-row.Mui-selected:hover': {
            backgroundColor: 'transparent',
          },
        }}
        showColumnVerticalBorder={false}
        showCellVerticalBorder={false}
        disableRowSelectionOnClick
        localeText={customLocaleText}
      />
    </Box>
  );
};

export default VehicleInfoTax;