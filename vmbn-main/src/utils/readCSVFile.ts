import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse/sync';

export interface CSVRecord {
    [key: string]: string;
}

export function readCSVFile(filePath: string): CSVRecord[] {
    try {
        // อ่านไฟล์ CSV
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        // ลบ BOM ถ้ามี
        const contentWithoutBOM = fileContent.replace(/^\uFEFF/, '');
        
        // แปลงข้อมูล CSV เป็น array of objects
        const records = csv.parse(contentWithoutBOM, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        return records;
    } catch (error) {
        console.error('Error reading CSV file:', error);
        throw error;
    }
} 