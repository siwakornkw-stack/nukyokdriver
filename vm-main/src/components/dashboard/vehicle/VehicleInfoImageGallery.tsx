import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Image from 'next/image';
import { Box, Button, ImageListItemBar, Modal, Stack, Typography } from '@mui/material';
import ImageUploadModal from '@/components/core/ModelUpload';
import type { ImageVehicleData } from '@/types/vehicle';

const urlImage = process.env.NEXT_PUBLIC_URL_IMAGE || '';

interface StandardImageListProps {
    itemData: ImageVehicleData[];
    onUpload: (files: File[]) => void;
}

export default function StandardImageList({ itemData, onUpload }: StandardImageListProps): React.ReactElement {
    const [open, setOpen] = React.useState(false);
    const [openUpload, setOpenUpload] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState('');

    const handleOpen = (img: string) => {
        setSelectedImage(img);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleOpenUpload = () => {
        setOpenUpload(true);
    };
    const handleCloseUpload = () => {
        setOpenUpload(false);
    };
    const handleUpload = (files: File[]) => {
        onUpload(files);
    };
    return (
        <>
            <Stack direction='row' justifyContent='space-between' alignItems='center' marginBottom={2}>
                <Typography variant='h4'>รูป</Typography>
                <Button variant='contained' size='small' onClick={handleOpenUpload}>
                    เพิ่มรูป
                </Button>
            </Stack>
            <ImageList sx={{ width: '100%', height: 'max-content' }} cols={3} rowHeight={'auto'} gap={1}>
                {itemData?.map((item) => (
                    <ImageListItem key={item.uuid} onClick={() => { handleOpen(`${urlImage}${item.url}`) }} style={{ cursor: 'pointer' }}>
                        <Image
                            src={`${urlImage}${item.url}`}
                            alt={item.title}
                            width={0}
                            height={0}
                            sizes="100%"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                        />
                        <ImageListItemBar
                            title={item.title}
                            subtitle={<span>{item.createdBy}</span>}
                            position="bottom"
                            sx={{
                                background: 'rgba(0,0,0,0.8)',
                            }}
                        />
                    </ImageListItem>
                ))}
            </ImageList>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(0,0,0,0.8)',
                        boxShadow: 24,
                        p: 4,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img
                            src={selectedImage}
                            width="auto"
                            height="auto"
                            alt=""
                            style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                        />
                    </Box>
                </Box>
            </Modal>
            <ImageUploadModal
                open={openUpload}
                onClose={handleCloseUpload}
                onUpload={handleUpload}
            />
        </>
    );
}