import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (data: any[], columns: string[], filename: string) => {
    const doc = new jsPDF();

    doc.text(filename, 14, 15);

    autoTable(doc, {
        head: [columns],
        body: data.map(row => columns.map(col => row[col] || '')),
        startY: 20,
    });

    doc.save(`${filename}.pdf`);
};
