'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Avatar, Button } from '@mui/material';
import { Box } from '@mui/system';
import { DataGrid } from '@mui/x-data-grid';
import type { AdminRow } from '@/types/table';
import type { GridColDef } from '@mui/x-data-grid-pro';
import type { GridLocaleText } from '@mui/x-data-grid';
import ImageUploadModal from '@/components/core/ModelUpload';
import Image from 'next/image';

const thTH: Partial<GridLocaleText> = {
  columnMenuLabel: 'เมนู',
  columnMenuShowColumns: 'แสดงคอลัมน์',
  columnMenuFilter: 'ตัวกรอง',
  columnMenuHideColumn: 'ซ่อนคอลัมน์',
  columnMenuUnsort: 'เลิกเรียงลำดับ',
  columnMenuSortAsc: 'เรียงจากน้อยไปมาก',
  columnMenuSortDesc: 'เรียงจากมากไปน้อย',
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

export default function AdminList(): React.JSX.Element {

  const [rows, setRows] = React.useState<AdminRow[]>([]);
  const [columns, setColumns] = React.useState<GridColDef<AdminRow>[]>([]);
  const [openUpload, setOpenUpload] = React.useState(false);

  const handleOpenUpload = () => {
    setOpenUpload(true);
  };

  const handleCloseUpload = () => {
    setOpenUpload(false);
  };

  const handleUpload = (files: File[]) => {
    console.log('upload', files);
  };

  const handleEdit = (id: number) => {
    console.log(`Editing row with id: ${id}`);
  };

  React.useEffect(() => {

    setRows([
      { id: 1, Image: '/assets/avatar.png', Username: 'สมชาย', Login: 'somchai', Password: '********', Admin: 'ใช่', Action: 'แก้ไข' },
      { id: 2, Image: '/assets/avatar.png', Username: 'สมหญิง', Login: 'somying', Password: '********', Admin: 'ไม่', Action: 'แก้ไข' },
      { id: 3, Image: '/assets/avatar.png', Username: 'สมศักดิ์', Login: 'somsak', Password: '********', Admin: 'ใช่', Action: 'แก้ไข' },
      { id: 4, Image: '/assets/avatar.png', Username: 'สมใจ', Login: 'somjai', Password: '********', Admin: 'ไม่', Action: 'แก้ไข' },
      { id: 5, Image: '/assets/avatar.png', Username: 'สมพงษ์', Login: 'sompong', Password: '********', Admin: 'ใช่', Action: 'แก้ไข' },
      { id: 6, Image: '/assets/avatar.png', Username: 'สมศรี', Login: 'somsri', Password: '********', Admin: 'ไม่', Action: 'แก้ไข' },
      { id: 7, Image: '/assets/avatar.png', Username: 'สมคิด', Login: 'somkid', Password: '********', Admin: 'ใช่', Action: 'แก้ไข' },
      { id: 8, Image: '/assets/avatar.png', Username: 'สมปอง', Login: 'sompong', Password: '********', Admin: 'ไม่', Action: 'แก้ไข' },
      { id: 9, Image: '/assets/avatar.png', Username: 'สมหมาย', Login: 'sommai', Password: '********', Admin: 'ใช่', Action: 'แก้ไข' },
    ]);

    setColumns([
      { field: 'id', headerName: 'ลำดับ', minWidth: 20, flex: 0.2, headerAlign: 'center', align: 'center' },
      {
        field: 'Image', headerName: 'รูป', minWidth: 60, flex: 0.2, headerAlign: 'center', align: 'center',
        renderCell: (params) => (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Avatar
              sx={{
                height: '40px', width: '40px'
              }}
            >
              <Image
                src={params.row.Image}
                alt={params.row.Username}
                width={40}
                height={40}
              />
            </Avatar>
          </div>
        )
      },
      { field: 'Username', headerName: 'ชื่อผู้ใช้งาน', minWidth: 60, flex: 1, headerAlign: 'center', align: 'center' },
      { field: 'Login', headerName: 'Login', minWidth: 60, flex: .5, headerAlign: 'center', align: 'center' },
      { field: 'Password', headerName: 'Password', minWidth: 60, flex: .5, headerAlign: 'center', align: 'center' },
      { field: 'Admin', headerName: 'Admin', minWidth: 60, flex: .4, headerAlign: 'center', align: 'center' },
      {
        field: 'Action', headerName: 'ทำการ', minWidth: 80, flex: 0, sortable: false, headerAlign: 'center', align: 'center',
        renderCell: (params) => (
          <Button
            variant="contained"
            size="small"
            color="warning"
            onClick={() => { handleEdit(params.row.id) }}
          >
            แก้ไข
          </Button>
        )
      },
    ]);
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='h4'>ระบบจัดการผู้ใช้งาน</Typography>
        <Button variant='contained' size='small' onClick={handleOpenUpload}>
          เพิ่มข้อมูล
        </Button>
      </Stack>
      <Box sx={{ width: '100%' }}>
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
        <ImageUploadModal
          open={openUpload}
          onClose={handleCloseUpload}
          onUpload={handleUpload}
        />
      </Box>
    </Stack>
  );
}
 