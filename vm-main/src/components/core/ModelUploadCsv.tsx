import React from 'react';

import {
    Modal,
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { ImportResponse } from '@/types/vehicle';

interface ModelUploadCsvProps<T> {
    open: boolean;
    onClose: () => void;
    isUploading: boolean;
    columns: Record<string, string>[];
    importResult: ImportResponse<T> | null;
}

function ModelUploadCsv<T extends Record<string, any>>({ open, onClose, isUploading, columns, importResult }: ModelUploadCsvProps<T>): React.ReactElement | null {
    const handleClose = React.useCallback(() => {
        onClose();
    }, [onClose]);

    const totalRecords = React.useMemo(() => importResult?.data?.totalRecords || 0, [importResult?.data]);
    const added = React.useMemo(() => importResult?.data?.successCount || 0, [importResult?.data]);
    // const updated = React.useMemo(() => importResult?.data?.successCount || 0, [importResult?.data]);
    const failed = React.useMemo(() => importResult?.data?.errorCount || 0, [importResult?.data]);

    if (!open) return null;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '75%',
                maxWidth: 800,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh',
                overflow: 'auto',
                gap: 2,
            }}>
                <Typography variant="h5" component="h2" gutterBottom margin={0}>
                    นำเข้าข้อมูลยานพาหนะ
                </Typography>

                {!importResult ? (
                    <>
                        {!isUploading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <Typography>กำลังนำเข้าข้อมูล...</Typography>
                            </Box>
                        )}
                    </>
                ) : (
                    <>
                        <Box sx={{ 
                            p: 2, 
                            /* bgcolor: importResult.success ? 'success.light' : 'error.light', */
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            {importResult.success ? (
                                <CheckCircleIcon color="success" />
                            ) : (
                                <ErrorIcon color="error" />
                            )}
                            <Typography>
                                {importResult.message}
                            </Typography>
                        </Box>

                        {importResult.data && (
                            <>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                        <Typography variant="h6" color="success.main">
                                            {totalRecords}
                                        </Typography>
                                        <Typography variant="body2">รายการ</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                        <Typography variant="h6" color="success.main">
                                            {added}
                                        </Typography>
                                        <Typography variant="body2">เพิ่มใหม่</Typography>
                                    </Paper>
                                    {/* <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                        <Typography variant="h6" color="info.main">
                                            {updated}
                                        </Typography>
                                        <Typography variant="body2">อัพเดท</Typography>
                                    </Paper> */}
                                    <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                        <Typography variant="h6" color="error.main">
                                            {failed}
                                        </Typography>
                                        <Typography variant="body2">ไม่สำเร็จ</Typography>
                                    </Paper>
                                </Box>

                                {importResult.data.items && <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                {columns.map((column, index) => (
                                                    <TableCell key={`tb-csv-h-${index}`}>{column.name}</TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {importResult.data.items?.map((detail, rowIndex) => (
                                                <TableRow key={`tb-csv-r-${rowIndex}`}>
                                                    {columns.map((column, colIndex) => (
                                                        <TableCell 
                                                            key={`${detail.id}-${colIndex}`} 
                                                            sx={{ 
                                                                color: column.key === 'status' ? (detail.error ? 'error.main' : 'success.main') : 'inherit'
                                                            }}
                                                        >
                                                            {detail[column.key]}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>}
                            </>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="contained" onClick={handleClose}>
                                ปิด
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Modal>
    );
}

export default ModelUploadCsv;