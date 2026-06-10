'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { VehicleFilters } from '@/components/dashboard/vehicle/vehicle-filters';
import { VehicleTable } from '@/components/dashboard/vehicle/vehicle-table';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Copy as CopyIcon } from '@phosphor-icons/react/dist/ssr/Copy';
import dynamic from 'next/dynamic';

import '../../../../public/styles/modal.scss';
import { TablePagination, useTheme } from '@mui/material';
import type { ImportItemsStatus, ImportResponse, VehicleModel } from '@/types/vehicle';
import { useEffect } from 'react';
import { getVehicleAll, importVehicleCSV } from '../../../../services/vehicle.service';
import { getResponseData } from '../../../../types/utils';
import { useShareContext } from '@/contexts/share-context';
import ShareSweetAlert from '@/components/ShareSweetAlert';

// Heavy modals (x-data-grid-pro, x-date-pickers, swipeable-views) — lazy-load off the initial bundle.
const VehicleInfoModal = dynamic(() => import('./VehicleInfoModal'), { ssr: false });
const VehicleFormModal = dynamic(() => import('./VehicleFormModal'), { ssr: false });
const DuplicateVehicleModal = dynamic(() => import('./DuplicateVehicleModal'), { ssr: false });
const ModelUploadCsv = dynamic(() => import('@/components/core/ModelUploadCsv'), { ssr: false });


function applyPagination(rows: VehicleModel[], page: number, rowsPerPage: number): VehicleModel[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export default function PageVehicle(): React.JSX.Element {


  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(6);

  const { vehicle, setVehicle, openBillVehicleModal, setOpenBillVehicleModal, infoBillVehicleOpen, setInfoBillVehicleOpen } = useShareContext();
  const [vehicleSearch, setVehicleSearch] = React.useState<VehicleModel[]>([]);
  const paginatedVehicle = applyPagination(vehicleSearch, page, rowsPerPage);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [modalBillVehicleIsOpen, setModalBillVehicleIsOpen] = React.useState(false);
  const [infoBillVehicle, setInfoBillVehicle] = React.useState<VehicleModel | undefined>(undefined);
  const [actionEdit, setActionEdit] = React.useState<boolean>(false);
  
  // Import
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [importResult, setImportResult] = React.useState<ImportResponse<ImportItemsStatus[]> | null>(null);
  const [importColumns, setImportColumns] = React.useState<Record<string, string>[]>([
    {
      key: 'no',
      name: 'แถวที่'
    },
    {
      key: 'licensePlate',
      name: 'ทะเบียน'
    },
    {
      key: 'status',
      name: 'สถานะ'
    },
    
  ]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [dedupOpen, setDedupOpen] = React.useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('file', file);
    if (file) {
      setImportModalOpen(true);
      setIsUploading(true);
      try {
        const res = await importVehicleCSV<ImportItemsStatus[]>(file);
        if (res.status === 200) {
          const data = getResponseData(res);
          if (data) {
            setImportResult(data);
            void getVehicle();
          }
        } else {
          setImportResult({
            success: false,
            code: res.status ?? 500,
            message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล',
            data: undefined
          });
        }
        
        setIsUploading(false);
      } catch (error) {
        setImportResult({
          success: false,
          code: 500,
          message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล',
          data: undefined
        });
      }
    }
  };

  const handleImportClose = () => {
    setImportModalOpen(false);
    setImportResult(null);
    // Clear file input
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    
    const fileInput2 = document.getElementById('csv-upload-data-vehicle') as HTMLInputElement;
    if (fileInput2) {
      fileInput2.value = '';
    }
  };


  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const getVehicle = async () => {
    const res = await getVehicleAll();
    if (res.status === 200 && res.data) {
      const dataResponse = getResponseData(res);
      if (dataResponse) {
        setVehicle(dataResponse.data);
      }
    }
  }
  useEffect(() => {
    if (vehicle.length === 0) {
      void getVehicle();
    }
  }, []);

  useEffect(() => {
    setVehicleSearch(vehicle);
  }, [vehicle]);

  useEffect(() => {
    console.log('openBillVehicleModal', openBillVehicleModal);
    if (openBillVehicleModal && infoBillVehicleOpen) {
      handleBillVehicleOpen(infoBillVehicleOpen);
    }
  }, [openBillVehicleModal]);

  const handleBillVehicleOpen = (data: VehicleModel) => {
    setInfoBillVehicle(data);
    setModalBillVehicleIsOpen(true);
    setOpenBillVehicleModal(true);
    setInfoBillVehicleOpen(data);
  };
  const handleEditBillVehicleOpen = (data: VehicleModel) => {
    handleClose();
    setInfoBillVehicle(data);
    setActionEdit(true)
    setModalIsOpen(true);
  };
  const handleOpen = () => {
    setInfoBillVehicle(undefined);
    setModalIsOpen(true);
    setActionEdit(false);
  };

  const handleClose = () => {
    setModalIsOpen(false);
    setModalBillVehicleIsOpen(false);
    setActionEdit(false);

    setOpenBillVehicleModal(false);
    setInfoBillVehicleOpen(undefined);
  };

  const handleSearch = (value: string) => {
    const q = value.trim().toLowerCase();
    const filteredVehicle = vehicle.filter((item) => {
      const hay = [
        item.licensePlatePrefix, item.licensePlateSuffix, item.licensePlateProvince,
        item.brand, item.model, item.color, item.driver,
        item.no, `Vehicle-${item.no?.toString().padStart(5, '0')}`,
      ].map((s) => (s ?? '').toString().toLowerCase()).join(' ');
      return hay.includes(q);
    });
    setVehicleSearch(filteredVehicle);
  };

  return (
    <React.Fragment>

      <ShareSweetAlert />

      <Stack spacing={3}>

        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">ยานพาหนะ</Typography>
          </Stack>
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button 
                startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />} 
                variant="outlined" 
                component="span"
                sx={{ mr: 2 }}
              >
                นำเข้า
              </Button>
            </label>
            <Button
              startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => window.open('/templates/vehicle_ยานพาหนะ.csv', '_blank')}
            >
              Template
            </Button>
            <Button
              startIcon={<CopyIcon fontSize="var(--icon-fontSize-md)" />}
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => setDedupOpen(true)}
            >
              ข้อมูลซ้ำ
            </Button>
            <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpen}>
              เพิ่ม
            </Button>
          </div>
        </Stack>

        <VehicleInfoModal
          open={modalBillVehicleIsOpen}
          onClose={handleClose}
          infoBillVehicle={infoBillVehicle}
          onEdit={handleEditBillVehicleOpen}
          theme={theme}
          importColumns={setImportColumns}
          importResult={setImportResult}
          importModalOpen={setImportModalOpen}
          isImporting={setIsUploading}
        />

        <VehicleFormModal
          open={modalIsOpen}
          onClose={handleClose}
          actionEdit={actionEdit}
          infoVehicle={infoBillVehicle}
          theme={theme}
          onSuccess={getVehicle}
        />

        <VehicleFilters onSearch={handleSearch} />
        <VehicleTable
          rows={paginatedVehicle}
          handleBillVehicleOpen={handleBillVehicleOpen}
        />

        <TablePagination sx={{ display: 'flex', justifyContent: 'center' }}
          component="div"
          count={vehicleSearch.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[6, 12, 26]}
          labelRowsPerPage='จำนวนที่แสดง'
        />

        <ModelUploadCsv
          open={importModalOpen}
          onClose={handleImportClose}
          importResult={importResult}
          isUploading={isUploading}
          columns={importColumns}
        />

        <DuplicateVehicleModal
          open={dedupOpen}
          onClose={() => setDedupOpen(false)}
          onDeleted={getVehicle}
        />
      </Stack>
    </React.Fragment>
  );
}