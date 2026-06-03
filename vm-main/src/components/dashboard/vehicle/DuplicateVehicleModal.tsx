import React from 'react';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Stack,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Radio,
    Chip,
    Divider,
    Alert,
} from '@mui/material';
import { getDuplicateVehicles, bulkDeleteVehicles, type DuplicateVehicleGroup } from '../../../../services/vehicle.service';
import { getResponseData } from '../../../../types/utils';

interface DuplicateVehicleModalProps {
    open: boolean;
    onClose: () => void;
    onDeleted: () => void;
}

function plateLabel(v: DuplicateVehicleGroup['vehicles'][number]): string {
    const plate = `${v.licensePlatePrefix ?? ''}${v.licensePlateSuffix ?? ''}`.trim();
    if (plate) return `${plate}${v.licensePlateProvince ? ` ${v.licensePlateProvince}` : ''}`;
    return v.model || '(ไม่มีทะเบียน)';
}

export default function DuplicateVehicleModal({ open, onClose, onDeleted }: DuplicateVehicleModalProps): React.ReactElement | null {
    const [loading, setLoading] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [groups, setGroups] = React.useState<DuplicateVehicleGroup[]>([]);
    const [keep, setKeep] = React.useState<Record<string, string>>({});
    const [error, setError] = React.useState<string | null>(null);

    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getDuplicateVehicles();
            if (res.status === 200 && res.data) {
                const body = getResponseData(res);
                const list = body?.data ?? [];
                setGroups(list);
                // default: keep the first member (oldest, lowest No)
                const defaults: Record<string, string> = {};
                for (const g of list) {
                    if (g.vehicles.length > 0) defaults[g.key] = g.vehicles[0].id;
                }
                setKeep(defaults);
            } else {
                setError(res.message ?? 'โหลดข้อมูลซ้ำไม่สำเร็จ');
            }
        } catch {
            setError('โหลดข้อมูลซ้ำไม่สำเร็จ');
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        if (open) void load();
    }, [open, load]);

    const idsToDelete = React.useMemo(() => {
        const ids: string[] = [];
        for (const g of groups) {
            const keptId = keep[g.key];
            for (const v of g.vehicles) {
                if (v.id !== keptId) ids.push(v.id);
            }
        }
        return ids;
    }, [groups, keep]);

    const handleDelete = async () => {
        if (idsToDelete.length === 0) return;
        setDeleting(true);
        setError(null);
        try {
            const res = await bulkDeleteVehicles(idsToDelete);
            if (res.status === 200) {
                onDeleted();
                onClose();
            } else {
                setError(res.message ?? 'ลบข้อมูลซ้ำไม่สำเร็จ');
            }
        } catch {
            setError('ลบข้อมูลซ้ำไม่สำเร็จ');
        }
        setDeleting(false);
    };

    if (!open) return null;

    return (
        <Dialog open={open} onClose={deleting ? undefined : onClose} maxWidth="md" fullWidth>
            <DialogTitle>ตรวจสอบข้อมูลซ้ำ</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : groups.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">ไม่พบข้อมูลซ้ำ</Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        <Alert severity="info">
                            พบ {groups.length} กลุ่มที่ซ้ำกัน เลือกรายการที่ต้องการ <b>เก็บไว้</b> ในแต่ละกลุ่ม รายการที่เหลือจะถูกลบ ({idsToDelete.length} รายการ)
                        </Alert>
                        {groups.map((g) => (
                            <Paper key={g.key} variant="outlined" sx={{ p: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2">{plateLabel(g.vehicles[0])}</Typography>
                                    <Chip size="small" label={`ซ้ำ ${g.count} รายการ`} color="warning" />
                                </Stack>
                                <Divider sx={{ mb: 1 }} />
                                <Stack spacing={0.5}>
                                    {g.vehicles.map((v) => {
                                        const kept = keep[g.key] === v.id;
                                        return (
                                            <Stack
                                                key={v.id}
                                                direction="row"
                                                alignItems="center"
                                                spacing={1}
                                                sx={{
                                                    p: 1,
                                                    borderRadius: 1,
                                                    bgcolor: kept ? 'action.hover' : 'transparent',
                                                }}
                                            >
                                                <Radio
                                                    size="small"
                                                    checked={kept}
                                                    onChange={() => setKeep((prev) => ({ ...prev, [g.key]: v.id }))}
                                                />
                                                <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                                                    <Typography variant="body2" noWrap>
                                                        #{v.no} · {v.vehicleType || '-'} · {v.brand || '-'} {v.model || ''}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap>
                                                        คนขับ: {v.driver || '-'} · สร้าง: {v.createdAt ? new Date(v.createdAt).toLocaleDateString('th-TH') : '-'}
                                                    </Typography>
                                                </Box>
                                                {kept ? (
                                                    <Chip size="small" label="เก็บไว้" color="success" />
                                                ) : (
                                                    <Chip size="small" label="ลบ" color="error" variant="outlined" />
                                                )}
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={deleting}>ปิด</Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    disabled={deleting || loading || idsToDelete.length === 0}
                    startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    ลบข้อมูลซ้ำ ({idsToDelete.length})
                </Button>
            </DialogActions>
        </Dialog>
    );
}
