import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Modal,
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    TextField,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import type { FileWithNote } from '@/types/vehicle';

interface ImageUploadModalProps {
    open: boolean;
    onClose: () => void;
    onUpload: (files: FileWithNote[]) => void;
    isFileData?: boolean; 
}

function ImageUploadModal({ open, onClose, onUpload, isFileData = false }: ImageUploadModalProps): React.ReactElement {
    const [files, setFiles] = useState<FileWithNote[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const filesWithNotes = acceptedFiles.map(file => 
            Object.assign(file, { note: '' }) as FileWithNote
        );
        setFiles(prevFiles => [...prevFiles, ...filesWithNotes]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: isFileData ? { 'application/pdf': [], 'image/*': [] } : { 'image/*': [] }
    });
    const handleUpload = () => {
        if (files && files.length > 0) {
            console.log('files', files.map(file => file.note));
            onUpload(files);
        }
        setFiles([]);
        onClose();
    };
    const handleClose = () => {
        setFiles([]);
        onClose();
    };
    const handleNoteChange = (index: number, noteText: string) => {
        console.log('Changing note for index:', index, 'to:', noteText);
        setFiles(prevFiles => {
            console.log('Previous files:', prevFiles);
            const newFiles = prevFiles.map((file, i) => {
                if (i === index) {
                    const updatedFile = Object.assign(file, { note: noteText }) as FileWithNote;
                    console.log('Updated file:', updatedFile);
                    return updatedFile;
                }
                return file;
            });
            console.log('New files:', newFiles);
            return newFiles;
        });
    };

    const handleNoteChangeAll = (noteText: string) => {
        setFiles(prevFiles => prevFiles.map(file => Object.assign(file, { note: noteText }) as FileWithNote));
    };

    const getFilePreview = (file: FileWithNote, index: number) => {
        if (file.type.startsWith('image/')) {
            return (
                <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${file.name}`}
                    style={{ width: '100%', height: 100, objectFit: 'contain', borderRadius: 4 }}
                    onLoad={() => {
                        URL.revokeObjectURL(URL.createObjectURL(file));
                    }}
                />
            );
        } else {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'max-content', bgcolor: 'grey.200', borderRadius: 1 ,padding: 1}}>
                    <InsertDriveFileIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                    <Typography variant="caption" noWrap sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</Typography>
                    <TextField
                    label="หมายเหตุ"
                    multiline
                    rows={1}
                    value={file.note || ''}
                    onChange={(e) => {
                        handleNoteChange(index, e.target.value);
                    }}
                        size="small"
                    />
                </Box>
            );
        }
    };
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '75%',
                maxWidth: 600,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%',
                height: 'max-content',
                overflow: 'hidden',
                gap: 2,
            }}>
                <Typography variant="h5" component="h2" gutterBottom margin={0}>
                    {!isFileData ? 'อัพโหลดรูปภาพ' : 'อัพโหลดไฟล์ข้อมูล'}
                </Typography>
                <Paper
                    {...getRootProps()}
                    sx={{
                        p: 2,
                        border: '2px dashed',
                        borderColor: isDragActive ? 'primary.main' : 'grey.300',
                        bgcolor: 'grey.50',
                        textAlign: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <input {...getInputProps()} />
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main'}} />
                    <Typography>
                        {isDragActive ? 'วางไฟล์ตรงนี้...' : 'ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
                    </Typography>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', overflow: 'auto' }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {files.map((file, index) => (
                            <Grid item xs={4} key={index}>
                                {getFilePreview(file, index)}
                            </Grid>
                        ))}
                    </Grid>
                    {isFileData && (
                        <Box sx={{ width: '100%' }}>                            
                            <TextField
                                label="หมายเหตุ"
                                multiline
                                rows={3}
                                maxRows={5}
                                size='small'
                                name="note"
                                onChange={(e) => {
                                    handleNoteChangeAll(e.target.value);
                                }}
                                fullWidth
                            />
                        </Box>
                    )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleClose} sx={{ mr: 1 }}>
                        ยกเลิก
                    </Button>
                    <Button variant="contained" onClick={handleUpload}>
                        อัพโหลด
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ImageUploadModal;