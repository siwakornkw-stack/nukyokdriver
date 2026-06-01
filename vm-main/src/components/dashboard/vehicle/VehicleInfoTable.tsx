import React from 'react';
import type { JSX } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import '../../../../public/styles/modal.scss';
import type { GridLocaleText, GridRenderCellParams, GridCellParams, GridRowModesModel } from '@mui/x-data-grid';
import { GridRowModes } from '@mui/x-data-grid';
import type { TaxRow } from '@/types/table';
import type { GridColDef } from '@mui/x-data-grid-pro';
import ImageUploadModal from '@/components/core/ModelUpload';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { FileWithNote } from '@/types/vehicle';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

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
interface VehicleInfoTableProps {
  rows: TaxRow[];
  columns: GridColDef[];
  title: string;
  isFileData?: boolean;
  type?: boolean;
  linkTemplates?: string;
  onAddRow?: (newRow: TaxRow) => void;
  onSaveRow?: (updatedRow: TaxRow) => void;
  onUpload?: (files: FileWithNote[]) => void;
  setRows?: (rows: TaxRow[]) => void;
  onImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
function VehicleInfoTable({ title, rows, columns, isFileData = false, onAddRow, onSaveRow, onUpload, onImport, type, linkTemplates }: VehicleInfoTableProps): JSX.Element {
  const [openUpload, setOpenUpload] = React.useState(false);

  const [editRowId, setEditRowId] = React.useState<number | null>(null);
  //const [rowModesModel, setRowModesModel] = React.useState<Record<number, { mode: string; Amount?: string | number }>>({});
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const handleEditClick = (id: number) => {
    setEditRowId(id);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    console.log(`Editing row with id: ${id}`);
  };

  const handleSaveClick = (id: number) => {
    setEditRowId(null);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: number) => {
    setEditRowId(null);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };
  const handleAddRow = () => {
    const lastId = Math.max(...rows.map(row => Number(row.id)), 0);
    const newId = lastId + 1;

    const newRow: TaxRow = {
      id: newId,
      /* Year: new Date().getFullYear().toString(),
      EndDate: dayjs(new Date()).format('DD/MM/YYYY'),
      TotalPremium: '',
      InsuranceCompany: '',
      BrokerName: '' */
    };
    onAddRow?.(newRow);
    setEditRowId(newId);
    setRowModesModel({ ...rowModesModel, [newId]: { mode: GridRowModes.Edit } });
  };

  const actionColumn: GridColDef = {
    field: 'actions',
    headerName: 'ทำการ',
    width: 100,
    renderCell: (params: GridRenderCellParams<TaxRow>) => {
      const isEditing = editRowId === params.row.id;

      return (
        <Box>
          {isEditing ? (
            <>
              <IconButton
                onClick={() => handleSaveClick(params.row.id)}
                color="primary"
                size="small"
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                onClick={() => handleCancelClick(params.row.id)}
                color="error"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </>
          ) : (
            <IconButton
              onClick={() => handleEditClick(params.row.id)}
              color="warning"
              size="small"
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      );
    }
  };

  const processRowUpdate = (newRow: TaxRow) => {
    const updatedRow = { ...newRow };
    if (onSaveRow) {
      onSaveRow(updatedRow);
    }

    return updatedRow;
  };
  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    console.error('เกิดข้อผิดพลาดในการอัพเดทข้อมูล:', error.message);
  }, []);
  const columnsWithActions: GridColDef[] = [
    ...columns,
    actionColumn
  ];
  const handleOpenUpload = () => {
    setOpenUpload(true);
  };
  const handleCloseUpload = () => {
    setOpenUpload(false);
  };
  const handleUpload = (files: FileWithNote[]) => {
    onUpload?.(files);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' marginBottom={2}>
        <Typography variant='h4'>{title}</Typography>

        <div>
          {!isFileData && !type && (
            <>
              <input
                type="file"
                accept=".csv"
                onChange={onImport}
                style={{ display: 'none' }}
                id="csv-upload-data-vehicle"
              />
              <label htmlFor="csv-upload-data-vehicle">
                <Button
                  startIcon={<UploadIcon fontSize="small" />}
                  variant="outlined"
                  component="span"
                  size='small'
                  sx={{ mr: 2 }}
                >
                  นำเข้า
                </Button>
              </label>
              <Button
                startIcon={<DownloadIcon fontSize="small" />}
                variant="outlined"
                size='small'
                sx={{ mr: 2 }}
                onClick={() => window.open(linkTemplates, '_blank')}
              >
                Template
              </Button>
            </>
          )}
          <Button variant='contained' size='small' onClick={isFileData ? handleOpenUpload : handleAddRow}>
            เพิ่มข้อมูล
          </Button>
        </div>
      </Stack>
      <DataGrid
        rows={rows}
        columns={columnsWithActions}
        editMode="row"
        rowModesModel={rowModesModel}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        isCellEditable={(params: GridCellParams<TaxRow>) => {
          return params.row.id === editRowId;
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
          columns: {
            columnVisibilityModel: {
              uuid: false // ซ่อนคอลัมน์ uuid
            }
          }
        }}
        pageSizeOptions={[10]}
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
      {isFileData && (
        <ImageUploadModal
          open={openUpload}
          onClose={handleCloseUpload}
          onUpload={handleUpload}
          isFileData={isFileData}
        />
      )}
    </Box>
  );
};

export default VehicleInfoTable;