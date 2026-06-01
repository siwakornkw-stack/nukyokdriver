// ไฟล์ทดสอบสำหรับระบบ InstallmentsVehicle
const testData = {
  // ข้อมูลยานพาหนะตัวอย่าง
  vehicle: {
    licensePlatePrefix: "กข",
    licensePlateSuffix: "1234",
    licensePlateProvince: "กรุงเทพมหานคร",
    vehicleCharacteristic: "รถยนต์ส่วนบุคคล",
    model: "Civic",
    generation: "2023",
    color: "ขาว",
    chassisNumber: "ABC123456789",
    engineNumber: "ENG123456",
    engineBrand: "Honda",
    tankSize: 50,
    fuelConsumption: 15,
    cylinderCount: 4,
    cylinder: 1600,
    vehicleSize: "4,500 x 1,800 x 1,450",
    cargoSize: "500L",
    gasSerialNumber: "GAS123456",
    vehicleWeight: 1200,
    cargoWeight: 500,
    wheelCount: 4,
    seatCount: 5,
    registrationDate: "2023-01-01",
    startDate: "2023-01-01",
    age: "1",
    ownership: "บริษัท",
    lineNotifyToken: "",
    note: "รถทดสอบ",
    // ข้อมูลผ่อนชำระ
    installmentPeriods: 12,
    installmentAmount: 5000.00
  }
};

console.log("ข้อมูลทดสอบสำหรับระบบ InstallmentsVehicle:");
console.log(JSON.stringify(testData, null, 2));

console.log("\nเมื่อส่งข้อมูลนี้ไปที่ /vehicle/add จะเกิด:");
console.log("1. สร้างข้อมูลยานพาหนะในตาราง Vehicle");
console.log("2. สร้างข้อมูลผ่อนชำระ 12 รายการในตาราง InstallmentsVehicle");
console.log("   - งวดที่ 1: วันที่ปัจจุบัน + 1 เดือน, ยอด 5,000 บาท");
console.log("   - งวดที่ 2: วันที่ปัจจุบัน + 2 เดือน, ยอด 5,000 บาท");
console.log("   - ...");
console.log("   - งวดที่ 12: วันที่ปัจจุบัน + 12 เดือน, ยอด 5,000 บาท");

console.log("\nเมื่อส่งข้อมูลนี้ไปที่ /vehicle/update/:id จะเกิด:");
console.log("1. อัปเดตข้อมูลยานพาหนะในตาราง Vehicle");
console.log("2. ลบข้อมูลผ่อนชำระเดิมทั้งหมด");
console.log("3. สร้างข้อมูลผ่อนชำระใหม่ตามจำนวนงวดและยอดที่ระบุ"); 