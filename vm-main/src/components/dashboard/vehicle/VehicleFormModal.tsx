import React, { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Modal, Fade, Box, Typography, Stack, FormControl, TextField, Autocomplete, InputAdornment, IconButton, Button } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import type { Theme } from '@mui/material';
import '../../../../public/styles/modal.scss';
import { CreateVehicleDTO, Option, OptionResponse, UpdateVehicleDTO, UploadImageVehicleDTO, VehicleModel } from '@/types/vehicle';
import { createVehicle, getOption, updateVehicle, uploadVehicleImage } from '../../../../services/vehicle.service';
import { getResponseData, WrapResponse } from '../../../../types/utils';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dayjs, { Dayjs } from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { CustomToast } from '@/helpers/toast';
import Image from 'next/image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import '../../../../public/styles/modalforminfo.scss';
import VehicleTypeModal from './VehicleTypeModal';

const urlImage = process.env.NEXT_PUBLIC_URL_IMAGE || '';


const provinces = [
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
    'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
    'ชัยภูมิ', 'ชุมพร', 'เชียงใหม่', 'เชียงราย', 'ตรัง',
    'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
    'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส',
    'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
    'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง',
    'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่',
    'พะเยา', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
    'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
    'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
    'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
    'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี',
    'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
    'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์',
    'อุทัยธานี', 'อุบลราชธานี'
];

interface VehicleFormModalProps {
    open: boolean;
    onClose: () => void;
    actionEdit: boolean;
    infoVehicle?: VehicleModel;
    theme: Theme;
    onSuccess: () => void;
}

const vehicleSchema = z.object({
    no: z.number().optional(),
    licensePlatePrefix: z.string().optional(),//.min(1, 'กรุณากรอกทะเบียนส่วนหัว'),
    licensePlateSuffix: z.string().optional(),//.min(1, 'กรุณากรอกทะเบียนส่วนหาง'),
    licensePlateProvince: z.string().optional(),//.min(1, 'กรุณาเลือกจังหวัด'),
    vehicleType: z.string().optional(),//.min(1, 'กรุณาเลือกประเภทรถ'),
    vehicleCharacteristic: z.string().optional(),//.min(1, 'กรุณากรอกลักษณะรถ'),
    brand: z.string().optional(),//.min(1, 'กรุณาเลือกยี่ห้อ'),
    model: z.string().optional(),//.min(1, 'กรุณากรอกแบบ'),
    generation: z.string().optional(),//.min(1, 'กรุณากรอกรุ่น'),
    color: z.string().optional(),//.min(1, 'กรุณากรอกสี'),
    chassisNumber: z.string().optional(),//.min(1, 'กรุณากรอกหมายเลขตัวถัง'),
    engineNumber: z.string().optional(),//.min(1, 'กรุณากรอกหมายเลขเครื่องยนต์'),
    engineBrand: z.string().optional(),//.min(1, 'กรุณาเลือกยี่ห้อเครื่องยนต์'),
    fuelType: z.string().optional(),//.min(1, 'กรุณาเลือกเชื้อเพลิง'),
    tankSize: z.number().optional(),//.min(1, 'กรุณากรอกขนาดถัง'),
    fuelConsumption: z.number().optional(),//.min(1, 'กรุณากรอกการทำงานของเครื่องยนต์'),
    cylinderCount: z.number().optional(),//.min(1, 'กรุณากรอกจำนวนหลอดกระบอก'),
    cylinder: z.number().optional(),//.min(1, 'กรุณากรอกจำนวนหลอดกระบอก'),
    vehicleSize: z.string().optional(),//.min(1, 'กรุณากรอกขนาดรถ'),
    cargoSize: z.string().optional(),//.min(1, 'กรุณากรอกขนาดคันถัง'),
    gasSerialNumber: z.string().optional(),//.min(1, 'กรุณากรอกหมายเลขตัวถังของถังกระบะ'),
    vehicleWeight: z.number().optional(),//.min(1, 'กรุณากรอกน้ำหนักรถ'),
    cargoWeight: z.number().optional(),//.min(1, 'กรุณากรอกน้ำหนักคันถัง'),
    wheelCount: z.number().optional(),//.min(1, 'กรุณากรอกจำนวนล้อ'),
    seatCount: z.number().optional(),//.min(1, 'กรุณากรอกจำนวนที่นั่ง'),
    registrationDate: z.custom<Dayjs | null>()
        .nullable().optional()
        /* .refine((val): val is dayjs.Dayjs => val === null || dayjs.isDayjs(val), {
            message: "รูปแบบวันที่ไม่ถูกต้อง"
        })
        .refine((val: dayjs.Dayjs | null) => val === null || val.isBefore(dayjs()) || val.isSame(dayjs(), 'day'), {
            message: "วันที่จดทะเบียนต้องไม่เกินวันปัจจุบัน"
        }) */,
    startDate: z.custom<Dayjs | null>()
        .nullable().optional()
        /* .refine((val): val is dayjs.Dayjs => val === null || dayjs.isDayjs(val), {
            message: "รูปแบบวันที่ไม่ถูกต้อง"
        })
        .refine((val: dayjs.Dayjs | null) => val === null || val.isBefore(dayjs()) || val.isSame(dayjs(), 'day'), {
            message: "วันที่เริ่มใช้งานต้องไม่เกินวันปัจจุบัน"
        }) */,
    age: z.string().optional(),//.min(1, 'กรุณากรอกอายุรถ'),
    ownership: z.string().optional(),//.min(1, 'กรุณากรอกสิทธิ์การเป็นเจ้าของ'),
    owner: z.string().optional(),//.min(1, 'กรุณากรอกเจ้าของรถ'),
    department: z.string().optional(),//.min(1, 'กรุณากรอกหน่วยงาน'),
    driver: z.string().optional(),//.min(1, 'กรุณากรอกคนขับ'),
    status: z.string().optional(),//.min(1, 'กรุณากรอกสถานะ'),
    note: z.string().optional(),
    img: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;


const style = (theme: Theme) => ({
    position: 'relative',
    background: '#fff',
    padding: '20px',
    width: '100%',
    maxWidth: '1000px',
    height: 'auto',
    maxHeight: '100vh',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    borderRadius: '10px',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
    display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
        height: '100vh',
        margin: 0,
        borderRadius: 0,
    }
});

function VehicleFormModal({ open, onClose, actionEdit, infoVehicle, theme, onSuccess }: VehicleFormModalProps): JSX.Element {
    console.log('infoVehicle', infoVehicle);
    const [optionsAll, setOptionsAll] = useState<OptionResponse | null>(null);
    const [optionsVehicleTypes, setOptionsVehicleTypes] = useState<Option[] | null>(null);
    const [optionsCarBrands, setOptionsCarBrands] = useState<Option[] | null>(null);
    const [fuelOptions, setFuelOptions] = useState<Option[] | null>(null);
    const [optionsOwners, setOptionsOwners] = useState<Option[] | null>(null);
    const [optionsDepartments, setOptionsDepartments] = useState<Option[] | null>(null);
    const [optionsDrivers, setOptionsDrivers] = useState<Option[] | null>(null);
    const [optionsStatus, setOptionsStatus] = useState<Option[] | null>(null);
    const [optionsAllLoading, setOptionsAllLoading] = useState(false);
    const [vehicleImage, setVehicleImage] = useState<string | null>(infoVehicle?.img || null);
    const [fileBlob , setFileBlob] = useState<string | null>(null);
    const [modalTypeVehicleIsOpen, setModalTypeVehicleIsOpen] = useState(false);
    const [modalTypeVehicleTab, setModalTypeVehicleTab] = useState(0);

    const handleCloseTypeVehicle = () => {
        setModalTypeVehicleIsOpen(false);
        setModalTypeVehicleTab(0);
    };

    const handleOpenTypeVehicle = (type: number) => {
        
        void fetchOptions();
        setModalTypeVehicleIsOpen(true);
        setModalTypeVehicleTab(type);
    };

    const defaultValues = {
        licensePlatePrefix: '',
        licensePlateSuffix: '',
        licensePlateProvince: '',
        vehicleType: '',
        vehicleCharacteristic: '',
        brand: '',
        model: '',
        generation: '',
        color: '',
        chassisNumber: '',
        engineNumber: '',
        engineBrand: '',
        fuelType: '',
        tankSize: 0,
        fuelConsumption: 0,
        cylinderCount: 0,
        cylinder: 0,
        vehicleSize: '',
        cargoSize: '',
        gasSerialNumber: '',
        vehicleWeight: 0,
        cargoWeight: 0,
        wheelCount: 0,
        seatCount: 0,
        registrationDate: null,
        startDate: null,
        age: '',
        ownership: '',
        owner: '',
        department: '',
        driver: '',
        status: '',
        note: '',
        img: '',
    }

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset
    } = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: defaultValues
    });

    useEffect(() => {
        console.log('actionEdit infoVehicle', actionEdit, infoVehicle);
        if (actionEdit && infoVehicle) {
            reset({
                no: infoVehicle?.no,
                licensePlatePrefix: infoVehicle?.licensePlatePrefix,
                licensePlateSuffix: infoVehicle?.licensePlateSuffix,
                licensePlateProvince: infoVehicle?.licensePlateProvince,
                vehicleType: optionsVehicleTypes ? optionsVehicleTypes.find(option => option.name === infoVehicle?.vehicleType)?.id : '',
                vehicleCharacteristic: infoVehicle?.vehicleCharacteristic,
                brand: optionsCarBrands ? optionsCarBrands.find(option => option.name === infoVehicle?.brand)?.id : '',
                model: infoVehicle?.model,
                generation: infoVehicle?.generation,
                color: infoVehicle?.color,
                chassisNumber: infoVehicle?.chassisNumber,
                engineNumber: infoVehicle?.engineNumber,
                engineBrand: infoVehicle?.engineBrand,
                fuelType: fuelOptions ? fuelOptions.find(option => option.name === infoVehicle?.fuelType)?.id : '',
                tankSize: infoVehicle?.tankSize,
                fuelConsumption: infoVehicle?.fuelConsumption,
                cylinderCount: infoVehicle?.cylinderCount,
                cylinder: infoVehicle?.cylinder,
                vehicleSize: infoVehicle?.vehicleSize,
                cargoSize: infoVehicle?.cargoSize,
                gasSerialNumber: infoVehicle?.gasSerialNumber,
                vehicleWeight: infoVehicle?.vehicleWeight,
                cargoWeight: infoVehicle?.cargoWeight,
                wheelCount: infoVehicle?.wheelCount,
                seatCount: infoVehicle?.seatCount,
                registrationDate: dayjs(infoVehicle?.registrationDate),
                startDate: dayjs(infoVehicle?.startDate),
                age: infoVehicle?.age,
                ownership: infoVehicle?.ownership,
                owner: optionsOwners ? optionsOwners.find(option => option.name === infoVehicle?.owner)?.id : '',
                department: optionsDepartments ? optionsDepartments.find(option => option.name === infoVehicle?.department)?.id : '',
                driver: optionsDrivers ? optionsDrivers.find(option => option.name === infoVehicle?.driver)?.id : '',
                status: optionsStatus ? optionsStatus.find(option => option.name === infoVehicle?.status)?.id : '',
                note: infoVehicle?.note,
                img: infoVehicle?.img,
            });
        }
    }, [infoVehicle, actionEdit, optionsAllLoading, reset]);

    const onSubmitForm = (data: VehicleFormData) => {
        void onSubmit(data);
    };

    const [isLoadingSubmitForm, setIsLoadingSubmitForm] = useState(false);

    const onSubmit = async (data: VehicleFormData) => {
        setIsLoadingSubmitForm(true);
        const imgInput = document.getElementById('img-input');
        if (imgInput && imgInput instanceof HTMLInputElement && imgInput.files?.[0]) {
            console.log('imgInput', imgInput.files[0]);
            const payload: UploadImageVehicleDTO = {
                file: [imgInput.files[0]]
            };
            const res = await uploadVehicleImage(payload);
            if (res.status === 200 && res.data) {
                const dataResponse = getResponseData(res);
                if (dataResponse) {
                    console.log('dataResponse', dataResponse);
                    data.img = dataResponse.data.url;
                }
            } else {
                CustomToast.error('Error', 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
            }
        } else {
            data.img = vehicleImage || '/uploads/vehicle/logo.png';
        }
        console.log('data', data);
        if (actionEdit) {
            try {
                if (!infoVehicle?.id) {
                    CustomToast.error('error', 'ไม่พบข้อมูลรถ');

                    setIsLoadingSubmitForm(false);
                    return;
                }
                const formattedData = {
                    ...data,
                    registrationDate: data.registrationDate?.format('YYYY-MM-DD') || null,
                    startDate: data.startDate?.format('YYYY-MM-DD') || null
                };
                const res = await updateVehicle(formattedData as UpdateVehicleDTO, infoVehicle?.id);
                if (res.status === 200 && res.data) {
                    const dataResponse = getResponseData(res);
                    if (dataResponse) {
                        console.log('dataResponse', dataResponse);
                        CustomToast.success('success', 'แก้ไขข้อมูลรถสำเร็จ');
                        onSuccess();
                    }
                    setIsLoadingSubmitForm(false);
                    onClose();
                }
            } catch (error) {
                console.error('Error updateVehicle form:', error);
                CustomToast.error('error', 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลรถ');
                setIsLoadingSubmitForm(false);
            }
        } else {
            try {
                const formattedData = {
                    ...data,
                    registrationDate: data.registrationDate?.format('YYYY-MM-DD') || null,
                    startDate: data.startDate?.format('YYYY-MM-DD') || null
                };
                const res = await createVehicle(formattedData as CreateVehicleDTO);
                if (res.status === 200 && res.data) {
                    const dataResponse = getResponseData(res);
                    if (dataResponse) {
                        console.log('dataResponse', dataResponse);
                        CustomToast.success('success', 'เพิ่มข้อมูลรถสำเร็จ');
                        onSuccess();
                    }
                    setIsLoadingSubmitForm(false);
                    onClose();
                }
            } catch (error) {
                console.error('Error createVehicle form:', error);
                CustomToast.error('error', 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลรถ');
                setIsLoadingSubmitForm(false);
            }
        }
        setIsLoadingSubmitForm(false); 

    };

    const fetchOptions = async () => {
        try {
            const res = await getOption();
            if (res.status === 200 && res.data) {
                const data = getResponseData(res as WrapResponse<OptionResponse>);
                if (data) {
                    setOptionsAll(data);
                }
            }
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    useEffect(() => {
        if (optionsAll) {
            console.log('optionsAll', optionsAll);
            console.log('optionsAll.data', optionsAll.data);
            console.log('optionsAll.data.vehicleTypes', optionsAll.data.vehicleType);
            setOptionsVehicleTypes(optionsAll.data.vehicleType);
            setOptionsCarBrands(optionsAll.data.vehicleBrand);
            setFuelOptions(optionsAll.data.fuelType);
            setOptionsOwners(optionsAll.data.vehicleOwner);
            setOptionsDepartments(optionsAll.data.vehicleDepartment);
            setOptionsDrivers(optionsAll.data.vehicleDriver);
            setOptionsStatus(optionsAll.data.vehicleStatus);
            setOptionsAllLoading(true);
        }
    }, [optionsAll]);
    useEffect(() => {
        if (!actionEdit) {
            reset(defaultValues);
        }
        if (!optionsAll && open) {
            void fetchOptions();
        }
        console.log(open);
        setFileBlob(null);
    }, [open]);

    useEffect(() => {
        setVehicleImage(infoVehicle?.img || null);
    }, [infoVehicle]);

    const handleImageClick = () => {
        const inputElement = document.querySelector('input[type="file"]');
        if (inputElement) {
            (inputElement as HTMLInputElement).click();
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFileBlob(URL.createObjectURL(e.target.files[0]));
        }
    }

    return (
    <React.Fragment>
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            className='modal-overlay'
        >
            <Fade in={open}>
                <Box sx={{ ...style(theme) }}>
                    <Typography variant="h4">{actionEdit ? 'แก้ไขยานพาหนะ' : 'เพิ่มยานพาหนะ'}</Typography>
                    <Stack sx={{
                        alignItems: 'flex-start', justifyContent: 'center',
                        overflowY: 'scroll', width: '100%', paddingRight: '10px'
                    }} direction="row" spacing={1} margin={'20px 0'}>
                        <FormControl fullWidth style={{
                            gap: '12px',
                        }} size='small'
                            onSubmit={handleSubmit(onSubmitForm)}>
                            <Typography variant="h6">กรอกข้อมูลประจำตัวรถ</Typography>
                            <Box display={'flex'} flexWrap={'wrap'} gap={1} flexDirection={'row'} alignItems={'flex-start'} justifyContent={'center'}>
                                <Box className='modal-info-image-box' display={'flex'} flex={1} flexGrow={1} flexBasis={'250px 250px'} position={'relative'} borderRadius={'6px'} overflow={'hidden'} minWidth={'250px'} onClick={handleImageClick}>
                                    <Image src={fileBlob ? fileBlob : vehicleImage ? `${urlImage}${vehicleImage}` : '/assets/logo.png'} alt='' width={0} height={0} layout="responsive" onError={(e) => {
                                        e.currentTarget.src = '/assets/logo.png';
                                    }} objectFit={'contain'} />
                                    <div className="image-overlay">
                                        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main'}} />
                                    </div>
                                    <input id="img-input" type="file" accept="image/*" hidden onChange={handleImageChange} />
                                </Box>
                                <Box display={'flex'} flex={1} flexGrow={1} flexBasis={'70%'} flexDirection={'row'} flexWrap={'wrap'} gap={1}>
                                        <Controller
                                            control={control}
                                            name="licensePlatePrefix"
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="ทะเบียนส่วนหัว"
                                                    name="licensePlatePrefix"
                                                    size='small'
                                                    fullWidth
                                                    sx={{ flex: '1 1 40%' }}
                                                    error={Boolean(errors.licensePlatePrefix)}
                                                    helperText={errors.licensePlatePrefix?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name="licensePlateSuffix"
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="ทะเบียนส่วนหาง"
                                                    name="licensePlateSuffix"
                                                    size='small'
                                                    fullWidth
                                                    sx={{ flex: '1 1 40%' }}
                                                    error={Boolean(errors.licensePlateSuffix)}
                                                    helperText={errors.licensePlateSuffix?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name="licensePlateProvince"
                                            render={({ field }) => (
                                                <Autocomplete
                                                    options={provinces}
                                                    value={field.value}
                                                    onChange={(_, newValue) => field.onChange(newValue)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="ทะเบียนจังหวัด"
                                                            variant="outlined"
                                                            size='small'
                                                            error={Boolean(errors.licensePlateProvince)}
                                                            helperText={errors.licensePlateProvince?.message}
                                                        />
                                                    )}
                                                    getOptionLabel={(option) => String(option || '')}
                                                    isOptionEqualToValue={(option, value) => option === value}
                                                    fullWidth
                                                    sx={{ flex: '1 1 40%' }}
                                                />
                                            )}
                                        />

                                        <Controller
                                            control={control}
                                            name="vehicleType"
                                            render={({ field }) => (
                                                <Autocomplete
                                                    {...field}
                                                    options={optionsVehicleTypes ?? []}
                                                    value={field.value ? optionsVehicleTypes?.find(option => option.id === field.value) || null : null}
                                                    onChange={(_, value) => field.onChange(value?.id)}
                                                    renderInput={(params) => <TextField {...params} label="ประเภทรถ" variant="outlined"
                                                        size='small'
                                                        name="vehicleType"
                                                        error={Boolean(errors.vehicleType)}
                                                        helperText={errors.vehicleType?.message}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    {params.InputProps.endAdornment}
                                                                    <IconButton aria-label="Edit" onClick={() => handleOpenTypeVehicle(0)}>
                                                                        <FontAwesomeIcon icon={faPenToSquare} />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }} />}
                                                    getOptionLabel={(option) => option.name || ''}
                                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                                    sx={{ flex: '1 1 40%' }}
                                                />
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name="vehicleCharacteristic"
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="ลักษณะ"
                                                    name="vehicleCharacteristic"
                                                    size='small'
                                                    sx={{ flex: '1 1 40%' }}
                                                    error={Boolean(errors.vehicleCharacteristic)}
                                                    helperText={errors.vehicleCharacteristic?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name="brand"
                                            render={({ field }) => (
                                                <Autocomplete
                                                    {...field}
                                                    options={optionsCarBrands ?? []}
                                                    value={field.value ? optionsCarBrands?.find(option => option.id === field.value) || null : null}
                                                    onChange={(_, value) => field.onChange(value?.id)}
                                                    renderInput={(params) => <TextField {...params} label="ยี่ห้อ" variant="outlined"
                                                        name="brand"
                                                        size='small'
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    {params.InputProps.endAdornment}
                                                                    <IconButton aria-label="Edit" onClick={() => handleOpenTypeVehicle(1)}>
                                                                        <FontAwesomeIcon icon={faPenToSquare} />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        error={Boolean(errors.brand)}
                                                        helperText={errors.brand?.message}
                                                    />}
                                                    getOptionLabel={(option) => option.name || ''}
                                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                                    sx={{ flex: '1 1 40%' }}
                                                />
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name="model"
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="แบบ"
                                                    name="model"
                                                    size='small'
                                                    sx={{ flex: '1 1 40%' }}
                                                    error={Boolean(errors.model)}
                                                    helperText={errors.model?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name="generation"
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="รุ่น"
                                                    name="generation"
                                                    size='small'
                                                    sx={{ flex: '1 1 40%' }}
                                                    error={Boolean(errors.generation)}
                                                    helperText={errors.generation?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name="color"
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="สี"
                                                    name="color"
                                                    size='small'
                                                    sx={{ flex: '1 1 40%' }}
                                                    error={Boolean(errors.color)}
                                                    helperText={errors.color?.message}
                                                />
                                            )}
                                        />
                                </Box>
                            </Box>

                            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                <Controller
                                    control={control}
                                    name="chassisNumber"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="หมายเลขตัวถัง"
                                            name="chassisNumber"
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.chassisNumber)}
                                            helperText={errors.chassisNumber?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="engineNumber"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="หมายเลขเครื่องยนต์"
                                            name="engineNumber"
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.engineNumber)}
                                            helperText={errors.engineNumber?.message}
                                        />
                                    )}
                                />
                            </Box>
                            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                <Controller
                                    control={control}
                                    name="engineBrand"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="ยี่ห้อเครื่องยนต์"
                                            name="engineBrand"
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.engineBrand)}
                                            helperText={errors.engineBrand?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="fuelType"
                                    render={({ field }) => (
                                        <Autocomplete
                                            {...field}
                                            options={fuelOptions ?? []}
                                            value={field.value ? fuelOptions?.find(option => option.id === field.value) || null : null}
                                            onChange={(_, value) => field.onChange(value?.id)}
                                            renderInput={(params) => <TextField {...params} label="เชื้อเพลิง" variant="outlined"
                                                size='small'
                                                name="fuelType"
                                                error={Boolean(errors.fuelType)}
                                                helperText={errors.fuelType?.message}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {params.InputProps.endAdornment}
                                                            <IconButton aria-label="Edit" onClick={() => handleOpenTypeVehicle(2)}>
                                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }} />}
                                            getOptionLabel={(option) => option.name || ''}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            sx={{ flex: '1 0 150px' }}
                                        />
                                    )}
                                />
                            </Box>
                            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                <Controller
                                    control={control}
                                    name="tankSize"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            type="number"
                                            label="ขนาดถัง"
                                            name="tankSize"
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.tankSize)}
                                            helperText={errors.tankSize?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="fuelConsumption"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            type="number"
                                            label="อัตราการสิ้นเปลือง"
                                            name="fuelConsumption"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">กม.ต่อลิตร</InputAdornment>,
                                            }}
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.fuelConsumption)}
                                            helperText={errors.fuelConsumption?.message}
                                        />
                                    )}
                                />
                            </Box>

                            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                <Controller
                                    control={control}
                                    name="cylinderCount"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            type="number"
                                            label="จำนวน/ขนาด"
                                            name="cylinderCount"
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.cylinderCount)}
                                            helperText={errors.cylinderCount?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="cylinder"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            type="number"
                                            label="กระบอกสูบ"
                                            name="cylinder"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">CC</InputAdornment>,
                                            }}
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.cylinder)}
                                            helperText={errors.cylinder?.message}
                                        />
                                    )}
                                />
                            </Box>
                            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                <Controller
                                    control={control}
                                    name="vehicleSize"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="ขนาดรถ"
                                            name="vehicleSize"
                                            size='small'
                                            placeholder='กว้างxยาวxสูง'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.vehicleSize)}
                                            helperText={errors.vehicleSize?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="cargoSize"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="ขนาดตู้"
                                            name="cargoSize"
                                            size='small'
                                            placeholder='กว้างxยาวxสูง'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.cargoSize)}
                                            helperText={errors.cargoSize?.message}
                                        />
                                    )}
                                />
                            </Box>
                            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                <Controller
                                    control={control}
                                    name="gasSerialNumber"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="เลขถังแก๊ส"
                                            name="gasSerialNumber"
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.gasSerialNumber)}
                                            helperText={errors.gasSerialNumber?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="vehicleWeight"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            type="number"
                                            label="น้ำหนักรถ"
                                            name="vehicleWeight"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
                                            }}
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.vehicleWeight)}
                                            helperText={errors.vehicleWeight?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="cargoWeight"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            type="number"
                                            label="น้ำหนักตู้"
                                            name="cargoWeight"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
                                            }}
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.cargoWeight)}
                                            helperText={errors.cargoWeight?.message}
                                        />
                                    )}
                                />
                            </Box>

                            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                <Controller
                                    control={control}
                                    name="wheelCount"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            type="number"
                                            label="ล้อ"
                                            name="wheelCount"
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.wheelCount)}
                                            helperText={errors.wheelCount?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="seatCount"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            type="number"
                                            label="ที่นั่ง"
                                            name="seatCount"
                                            size='small'
                                            sx={{ flex: '1 0 150px' }}
                                            error={Boolean(errors.seatCount)}
                                            helperText={errors.seatCount?.message}
                                        />
                                    )}
                                />
                            </Box>


                            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Controller
                                        control={control}
                                        name="registrationDate"
                                        render={({ field }) => (
                                            <DatePicker
                                                value={field.value ? dayjs(field.value) : null}
                                                onChange={(newValue) => field.onChange(newValue ? newValue : undefined)}
                                                label="วันที่จดทะเบียน"
                                                format="DD/MM/YYYY"
                                                slots={{ textField: TextField }}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        error: Boolean(errors.registrationDate),
                                                        helperText: errors.registrationDate?.message
                                                    },
                                                }}
                                                sx={{ flex: '1 0 150px' }}
                                            />
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <DatePicker
                                                value={field.value ? dayjs(field.value) : null}
                                                onChange={(newValue) => field.onChange(newValue ? newValue : undefined)}
                                                label="วันที่เริ่มใช้งาน"
                                                format="DD/MM/YYYY"
                                                slots={{ textField: TextField }}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        error: Boolean(errors.startDate),
                                                        helperText: errors.startDate?.message
                                                    },
                                                }}
                                                sx={{ flex: '1 0 150px' }}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                                <Controller
                                    control={control}
                                    name="age"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="อายุ"
                                            name="age"
                                            size='small'
                                            sx={{ flex: '1 0 60px' }}
                                            error={Boolean(errors.age)}
                                            helperText={errors.age?.message}
                                        />
                                    )}
                                />
                            </Box>
                            <Controller
                                control={control}
                                name="ownership"
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="outlined-controlled"
                                        label="ผู้ถือกรรมสิทธิ์"
                                        name="ownership"
                                        size='small'
                                        error={Boolean(errors.ownership)}
                                        helperText={errors.ownership?.message}
                                    />
                                )}
                            />

                            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                <Controller
                                    control={control}
                                    name="owner"
                                    render={({ field }) => (
                                        <Autocomplete
                                            {...field}
                                            options={optionsOwners ?? []}
                                            value={field.value ? optionsOwners?.find(option => option.id === field.value) || null : null}
                                            onChange={(_, value) => field.onChange(value?.id)}
                                            renderInput={(params) => <TextField {...params} label="เจ้าของ" variant="outlined"
                                                name="owner"
                                                size='small'
                                                error={Boolean(errors.owner)}
                                                helperText={errors.owner?.message}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {params.InputProps.endAdornment}
                                                            <IconButton aria-label="Edit" onClick={() => handleOpenTypeVehicle(3)}>
                                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }} />}
                                            getOptionLabel={(option) => option.name || ''}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            sx={{ flex: '1 0 150px' }}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="department"
                                    render={({ field }) => (
                                        <Autocomplete
                                            {...field}
                                            options={optionsDepartments ?? []}
                                            value={field.value ? optionsDepartments?.find(option => option.id === field.value) || null : null}
                                            onChange={(_, value) => field.onChange(value?.id)}
                                            renderInput={(params) => <TextField {...params} label="หน่วยงาน" variant="outlined"
                                                name="department"
                                                size='small'
                                                error={Boolean(errors.department)}
                                                helperText={errors.department?.message}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {params.InputProps.endAdornment}
                                                            <IconButton aria-label="Edit" onClick={() => handleOpenTypeVehicle(4)}>
                                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }} />}
                                            getOptionLabel={(option) => option.name || ''}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            sx={{ flex: '1 0 150px' }}
                                        />
                                    )}
                                />
                            </Box>

                            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                <Controller
                                    control={control}
                                    name="driver"
                                    render={({ field }) => (
                                        <Autocomplete
                                            {...field}
                                            options={optionsDrivers ?? []}
                                            value={field.value ? optionsDrivers?.find(option => option.id === field.value) || null : null}
                                            onChange={(_, value) => field.onChange(value?.id)}
                                            renderInput={(params) => <TextField {...params} label="คนขับ" variant="outlined"
                                                name="driver"
                                                size='small'
                                                error={Boolean(errors.driver)}
                                                helperText={errors.driver?.message}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {params.InputProps.endAdornment}
                                                            <IconButton aria-label="Edit" onClick={() => handleOpenTypeVehicle(5)}>
                                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }} />}
                                            getOptionLabel={(option) => option.name || ''}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            sx={{ flex: '1 0 150px' }}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="status"
                                    render={({ field }) => (
                                        <Autocomplete
                                            {...field}
                                            options={optionsStatus ?? []}
                                            value={field.value ? optionsStatus?.find(option => option.id === field.value) || null : null}
                                            onChange={(_, value) => field.onChange(value?.id)}
                                            renderInput={(params) => <TextField {...params} label="สถานะ" variant="outlined"
                                                name="status"
                                                size='small'
                                                error={Boolean(errors.status)}
                                                helperText={errors.status?.message}
                                            />}
                                            getOptionLabel={(option) => option.name || ''}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            sx={{ flex: '1 0 150px' }}
                                        />
                                    )}
                                />
                            </Box>

                            <TextField
                                label="หมายเหตุ"
                                multiline
                                maxRows={4}
                                size='small'
                                name="note"
                                error={Boolean(errors.note)}
                                helperText={errors.note?.message}
                            />
                            {/* <Stack sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }} direction="row" spacing={1}>
              <TimePicker
                label="จาก"
                defaultValue={actionEdit && infoBillVehicle ? dayjs(infoBillVehicle.createdAt) : null}
                slots={{ textField: TextField }}
                slotProps={{
                  textField: {
                    size: 'small'
                  },
                }}
                sx={{ width: '100%' }}
              />
              <TimePicker
                label="ถึง"
                defaultValue={actionEdit && infoBillVehicle ? dayjs(infoBillVehicle.updatedAt) : null}
                slots={{ textField: TextField }}
                slotProps={{
                  textField: {
                    size: 'small'
                  },
                }}
                sx={{ width: '100%' }}
              />
            </Stack>

            <TextField
              id="outlined-controlled"
              label="รายได้"
              defaultValue={actionEdit && infoBillVehicle ? infoBillVehicle.vehicleDetails.licensePlate : undefined}
              InputProps={{
                endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
              }}
              size='small'
            /> */}
                        </FormControl>
                    </Stack>
                    <Stack sx={{ alignItems: 'center', justifyContent: 'flex-end' }} direction="row" spacing={1}>
                        <LoadingButton onClick={() => handleSubmit(onSubmitForm)()} variant="contained" loading={isLoadingSubmitForm}>บันทึก</LoadingButton>
                        <Button onClick={onClose} variant="outlined" color="error">ปิด</Button>
                    </Stack>
                </Box>
            </Fade>
        </Modal>
        
        <VehicleTypeModal
          open={modalTypeVehicleIsOpen}
          onClose={handleCloseTypeVehicle}
          theme={theme}
          tab={modalTypeVehicleTab}
        />
        </React.Fragment>
    );
};

export default VehicleFormModal;