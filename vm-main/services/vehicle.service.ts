import type { ApiResponse, WrapResponse } from "../types/utils";
import { wrapResponse } from "../types/utils";
import { errorWrapper, getDomain } from "../helpers/helper";
import Cookies from 'js-cookie';
import type { AccidentVehicleResponse, AttachFileVehicleResponse, CarTiresResponse, CompulsoryMotorInsuranceVehicleResponse, CreateAccidentVehicleDTO, CreateAttachFileVehicleDTO, CreateCarTiresDTO, CreateCompulsoryMotorInsuranceVehicleDTO, CreateDrainTheOilVehicleDTO, CreateGasolineCostDTO, CreateImageVehicleDTO, CreateIncomeVehicleDTO, CreateInstallmentsVehicleDTO, CreateInsurancePolicyVehicleDTO, CreateRepairVehicleDTO, CreateTypeDTO, CreateVehicleDTO, CreateVehicleTaxDTO, DrainTheOilVehicleResponse, GasolineCostResponse, ImageVehicleResponse, ImportItemsStatus, ImportResponse, IncomeVehicleResponse, InstallmentsVehicleResponse, InsurancePolicyVehicleResponse, NotificationResponse, OptionOneResponse, OptionResponse, RepairVehicleResponse, TypeResponse, UpdateAccidentVehicleDTO, UpdateAttachFileVehicleDTO, UpdateCarTiresDTO, UpdateCompulsoryMotorInsuranceVehicleDTO, UpdateDrainTheOilVehicleDTO, UpdateGasolineCostDTO, UpdateImageVehicleDTO, UpdateIncomeVehicleDTO, UpdateInstallmentsVehicleDTO, UpdateInsurancePolicyVehicleDTO, UpdateRepairVehicleDTO, UpdateTypeDTO, UpdateVehicleDTO, UpdateVehicleTaxDTO, UploadImageVehicleDTO, UploadImageVehicleResponse, VehicleAllResponse, VehicleTaxResponse } from "@/types/vehicle";

const urlApi = process.env.NEXT_PUBLIC_URL_API ?? '';

export async function getVehicleAll(sortBy?: string, sortOrder?: string, limit?: number): Promise<WrapResponse<VehicleAllResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/?${sortBy ? `sortBy=${sortBy}&` : ''}${sortOrder ? `sortOrder=${sortOrder}&` : ''}${limit ? `limit=${limit}` : ''}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const result = await wrapResponse<VehicleAllResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getVehicleAll') });
    }
}

export async function getOption(): Promise<WrapResponse<OptionResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        console.log('accessToken', accessToken);
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        console.log('domain', domain);
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/option`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<OptionResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getOption') });
    }
}

export async function getOptionDriver(): Promise<WrapResponse<OptionOneResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        console.log('accessToken', accessToken);
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        console.log('domain', domain);
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/option-driver`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<OptionOneResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getOptionDriver') });
    }
}

export async function getOptionPaymentStatus(): Promise<WrapResponse<OptionOneResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        console.log('accessToken', accessToken);
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        console.log('domain', domain);
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/option-payment-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<OptionOneResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getOptionDriver') });
    }
}

export async function createVehicle(data: CreateVehicleDTO): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'createVehicle') });
    }
}

export async function updateVehicle(data: UpdateVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateVehicle') });
    }
}

export async function uploadVehicleImage(data: UploadImageVehicleDTO): Promise<WrapResponse<UploadImageVehicleResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const formData = new FormData();
        formData.append('file', data.file[0]);

        const response = await fetch(`${urlApi}/vehicle/image`, {
            method: 'POST',
            headers: {
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        const result = await wrapResponse<UploadImageVehicleResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'uploadVehicleImage') });
    }
}

export async function importVehicleCSV<T>(file: File): Promise<WrapResponse<ImportResponse<T>>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${urlApi}/vehicle/import`, {
            method: 'POST',
            headers: {
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        const result = await wrapResponse<ImportResponse<T>>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'importVehicleCSV') });
    }
}

export async function importDataVehicleCSV(file: File, type: number, id: string): Promise<WrapResponse<ImportResponse<ImportItemsStatus[]>>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const formData = new FormData();
        formData.append('file', file);

        let path = ''

        switch (type) {
            case 1:
                path = `/vehicle/import-tax/${id}`
                break;
            case 2:
                path = `/vehicle/import-compulsory-motor-insurance/${id}`
                break;
            case 3:
                path = `/vehicle/import-insurance-policy/${id}`
                break;
            case 6:
                path = `/vehicle/import-car-tires/${id}`
                break;
            case 7:
                path = `/vehicle/import-accident-vehicle/${id}`
                break;
            case 8:
                path = `/vehicle/import-repair-vehicle/${id}`
                break;
            case 9:
                path = `/vehicle/import-gasoline-cost/${id}`
                break;
            case 10:
                path = `/vehicle/import-drain-oil/${id}`
                break;
            case 11:
                path = `/vehicle/import-installments/${id}`
                break;
            case 12:
                path = `/vehicle/import-income/${id}`
                break;
            default:
                break;
        }

        const response = await fetch(`${urlApi}${path}`, {
            method: 'POST',
            headers: {
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        const result = await wrapResponse<ImportResponse<ImportItemsStatus[]>>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'importVehicleCSV') });
    }
}

export async function getVehicleTax(id: string): Promise<WrapResponse<VehicleTaxResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/tax/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<VehicleTaxResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getVehicleTax') });
    }
}
export async function addVehicleTax(data: CreateVehicleTaxDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/tax/add/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addVehicleTax') });
    }
}
export async function updateVehicleTax(data: UpdateVehicleTaxDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/tax/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateVehicleTax') });
    }
}

export async function getCompulsoryMotorInsuranceVehicle(id: string): Promise<WrapResponse<CompulsoryMotorInsuranceVehicleResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/compulsory-motor-insurance/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<CompulsoryMotorInsuranceVehicleResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getCompulsoryMotorInsuranceVehicle') });
    }
}
export async function addCompulsoryMotorInsuranceVehicle(data: CreateCompulsoryMotorInsuranceVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/compulsory-motor-insurance/add/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addCompulsoryMotorInsuranceVehicle') });
    }
}
export async function updateCompulsoryMotorInsuranceVehicle(data: UpdateCompulsoryMotorInsuranceVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/compulsory-motor-insurance/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateCompulsoryMotorInsuranceVehicle') });
    }
}

export async function getInsurancePolicyVehicle(id: string): Promise<WrapResponse<InsurancePolicyVehicleResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/insurance-policy/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<InsurancePolicyVehicleResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getInsurancePolicyVehicle') });
    }
}
export async function addInsurancePolicyVehicle(data: CreateInsurancePolicyVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/insurance-policy/add/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addInsurancePolicyVehicle') });
    }
}
export async function updateInsurancePolicyVehicle(data: UpdateInsurancePolicyVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/insurance-policy/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateInsurancePolicyVehicle') });
    }
}

export async function getAttachFileVehicle(id: string): Promise<WrapResponse<AttachFileVehicleResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/attach-file/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<AttachFileVehicleResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getAttachFileVehicle') });
    }
}
export async function addAttachFileVehicle(data: CreateAttachFileVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const formData = new FormData();
        data.files.forEach((fileWithNote) => {
            formData.append('files', fileWithNote);
            formData.append('notes', fileWithNote.note ?? '');
        });

        const response = await fetch(`${urlApi}/vehicle/attach-file/add/${id}`, {
            method: 'POST',
            headers: {
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addAttachFileVehicle') });
    }
}
export async function updateAttachFileVehicle(data: UpdateAttachFileVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/attach-file/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateAttachFileVehicle') });
    }
}

export async function getCarTiresVehicle(id: string): Promise<WrapResponse<CarTiresResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/car-tires/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<CarTiresResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getCarTiresVehicle') });
    }
}
export async function addCarTiresVehicle(data: CreateCarTiresDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/car-tires/add/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addCarTiresVehicle') });
    }
}
export async function updateCarTiresVehicle(data: UpdateCarTiresDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/car-tires/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateCarTiresVehicle') });
    }
}

export async function getAccidentVehicle(id: string): Promise<WrapResponse<AccidentVehicleResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/accident-vehicle/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<AccidentVehicleResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getAccidentVehicle') });
    }
}
export async function addAccidentVehicle(data: CreateAccidentVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/accident-vehicle/add/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addAccidentVehicle') });
    }
}
export async function updateAccidentVehicle(data: UpdateAccidentVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/accident-vehicle/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateAccidentVehicle') });
    }
}

export async function getRepairVehicle(id: string): Promise<WrapResponse<RepairVehicleResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/repair-vehicle/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<RepairVehicleResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getRepairVehicle') });
    }
}
export async function addRepairVehicle(data: CreateRepairVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/repair-vehicle/add/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addRepairVehicle') });
    }
}
export async function updateRepairVehicle(data: UpdateRepairVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/repair-vehicle/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateRepairVehicle') });
    }
}

export async function getGasolineCostVehicle(id: string): Promise<WrapResponse<GasolineCostResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/gasoline-cost/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<GasolineCostResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getGasolineCostVehicle') });
    }
}
export async function addGasolineCostVehicle(data: CreateGasolineCostDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/gasoline-cost/add/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addGasolineCostVehicle') });
    }
}
export async function updateGasolineCostVehicle(data: UpdateGasolineCostDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/gasoline-cost/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateGasolineCostVehicle') });
    }
}

export async function getDrainTheOilVehicle(id: string): Promise<WrapResponse<DrainTheOilVehicleResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/drain-oil/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<DrainTheOilVehicleResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getDrainTheOilVehicle') });
    }
}
export async function addDrainTheOilVehicle(data: CreateDrainTheOilVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/drain-oil/add/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addDrainTheOilVehicle') });
    }
}
export async function updateDrainTheOilVehicle(data: UpdateDrainTheOilVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/drain-oil/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateDrainTheOilVehicle') });
    }
}

export async function getInstallmentsVehicle(id: string): Promise<WrapResponse<InstallmentsVehicleResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/installments/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<InstallmentsVehicleResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getInstallmentsVehicle') });
    }
}
export async function addInstallmentsVehicle(data: CreateInstallmentsVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/installments/add/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addInstallmentsVehicle') });
    }
}
export async function updateInstallmentsVehicle(data: UpdateInstallmentsVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/installments/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateInstallmentsVehicle') });
    }
}

export async function getImageVehicle(id: string): Promise<WrapResponse<ImageVehicleResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/image/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<ImageVehicleResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getImageVehicle') });
    }
}
export async function addImageVehicle(data: CreateImageVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const formData = new FormData();
        data.files.forEach((fileWithNote) => {
            formData.append('files', fileWithNote);
            formData.append('notes', fileWithNote.note ?? '');
        });

        const response = await fetch(`${urlApi}/vehicle/image/add/${id}`, {
            method: 'POST',
            headers: {
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addImageVehicle') });
    }
}
export async function updateImageVehicle(data: UpdateImageVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/image/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateImageVehicle') });
    }
}


export async function getIncomeVehicle(id: string): Promise<WrapResponse<IncomeVehicleResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/income/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<IncomeVehicleResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getIncomeVehicle') });
    }
}
export async function addIncomeVehicle(data: CreateIncomeVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/income/add/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addIncomeVehicle') });
    }
}
export async function updateIncomeVehicle(data: UpdateIncomeVehicleDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/income/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateIncomeVehicle') });
    }
}



export async function getVehicleType(): Promise<WrapResponse<TypeResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-type/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<TypeResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getDrainTheOilVehicle') });
    }
}
export async function addVehicleType(data: CreateTypeDTO): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-type/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addVehicleType') });
    }
}
export async function updateVehicleType(data: UpdateTypeDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-type/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateVehicleType') });
    }
}

export async function getVehicleBrand(): Promise<WrapResponse<TypeResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-brand/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<TypeResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getVehicleBrand') });
    }
}
export async function addVehicleBrand(data: CreateTypeDTO): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-brand/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addVehicleBrand') });
    }
}
export async function updateVehicleBrand(data: UpdateTypeDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-brand/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateVehicleBrand') });
    }
}

export async function getVehicleOwner(): Promise<WrapResponse<TypeResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-owner/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<TypeResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getVehicleOwner') });
    }
}
export async function addVehicleOwner(data: CreateTypeDTO): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-owner/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addVehicleOwner') });
    }
}
export async function updateVehicleOwner(data: UpdateTypeDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-owner/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateVehicleOwner') });
    }
}

export async function getVehicleDepartment(): Promise<WrapResponse<TypeResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-department/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<TypeResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getVehicleDepartment') });
    }
}
export async function addVehicleDepartment(data: CreateTypeDTO): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-department/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addVehicleDepartment') });
    }
}
export async function updateVehicleDepartment(data: UpdateTypeDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-department/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateVehicleDepartment') });
    }
}

export async function getVehicleDriver(): Promise<WrapResponse<TypeResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-driver/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<TypeResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getVehicleDriver') });
    }
}
export async function addVehicleDriver(data: CreateTypeDTO): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-driver/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addVehicleDriver') });
    }
}
export async function updateVehicleDriver(data: UpdateTypeDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-driver/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateVehicleDriver') });
    }
}

export async function getVehicleStatus(): Promise<WrapResponse<TypeResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-status/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<TypeResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getVehicleStatus') });
    }
}
export async function addVehicleStatus(data: CreateTypeDTO): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-status/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addVehicleStatus') });
    }
}
export async function updateVehicleStatus(data: UpdateTypeDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-status/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateVehicleStatus') });
    }
}

export async function getFuelType(): Promise<WrapResponse<TypeResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/fuel-type/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<TypeResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getFuelType') });
    }
}
export async function addFuelType(data: CreateTypeDTO): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/fuel-type/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addFuelType') });
    }
}
export async function updateFuelType(data: UpdateTypeDTO, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/fuel-type/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateFuelType') });
    }
}

export async function getNotification(): Promise<WrapResponse<NotificationResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/notification/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<NotificationResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getNotification') });
    }
}

export interface DuplicateVehicleItem {
    id: string;
    no: number;
    licensePlatePrefix: string;
    licensePlateSuffix: string;
    licensePlateProvince: string;
    vehicleType: string;
    brand: string;
    model: string;
    driver: string;
    createdAt: string;
    updatedAt: string;
}

export interface DuplicateVehicleGroup {
    key: string;
    count: number;
    vehicles: DuplicateVehicleItem[];
}

export interface DuplicateVehiclesResponse {
    success: boolean;
    code: number;
    message: string;
    data: DuplicateVehicleGroup[];
}

export async function getDuplicateVehicles(): Promise<WrapResponse<DuplicateVehiclesResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/duplicates`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<DuplicateVehiclesResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getDuplicateVehicles') });
    }
}

export async function bulkDeleteVehicles(ids: string[]): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/duplicates/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ ids })
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'bulkDeleteVehicles') });
    }
}

export interface ManagedDriver {
    id: string;
    name: string;
    mobileNo: string;
    licenseNo: string;
    imageUrl: string;
    status: string;
    lineUserId: string;
    vehicleCount: number;
    jobCount: number;
    createdAt: string;
}

export interface ManagedDriversResponse {
    success: boolean;
    code: number;
    message: string;
    data: ManagedDriver[];
}

export interface DriverInput {
    name: string;
    mobileNo?: string;
    licenseNo?: string;
    imageUrl?: string;
}

export async function getDriversManaged(): Promise<WrapResponse<ManagedDriversResponse | null>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-driver/manage`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<ManagedDriversResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'getDriversManaged') });
    }
}

export async function addDriverManaged(data: DriverInput): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-driver/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'addDriverManaged') });
    }
}

export async function updateDriverManaged(data: DriverInput, id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-driver/update/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateDriverManaged') });
    }
}

export async function deleteDriverManaged(id: string): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

        const response = await fetch(`${urlApi}/vehicle/vehicle-driver/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'deleteDriverManaged') });
    }
}