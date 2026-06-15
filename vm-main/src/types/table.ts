export interface TaxRow {
    uuid?: string;
    id: number;
    Year?: string;
    Type?: string;
    FileName?: string;
    Description?: string;
    StartDate?: string;
    EndDate?: string;
    TotalPremium?: string;
    InsuranceCompany?: string;
    BrokerName?: string;
    ChangeDate?: string;
    Position?: string;
    Brand?: string;
    Date?: string;
    Time?: string;
    Party?: string;
    LicensePlate?: string;
    DriverName?: string;
    Opponent?: string;
    RepairDate?: string;
    RepairShop?: string;
    ReceiveDate?: string;
    InsurancePay?: string;
    CompanyPay?: string;
    Item?: string;
    Liters?: string;
    Amount?: number;
    OdometerStart?: string;
    OdometerEnd?: string;
    TextAlert?: string;
    InstallmentNumber?: string;
    DueDate?: string;
    DatePay?: string;
    PaymentStatus?: string;
    PaymentEvidence?: string;
    Action?: string;
    editable?: boolean;
    Name?: string;
    CustomerName?: string;
    DateTime?: string;
    PaymentStatusId?: string;
    WorkOrderNumber?: string;
    InvoiceNumber?: string;
    AmountReceive?: string;
    VehicleDriverId?: string;
}

export interface AdminRow {
    id: number;
    Image: string;
    Username: string;
    Login: string;
    Password: string;
    Admin: string;
    Action: string;
}
