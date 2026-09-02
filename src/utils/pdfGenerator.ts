import jsPDF from 'jspdf';
import { Order } from '../types';

export const generateInvoicePDF = (order: Order) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const cyanColor = [6, 182, 212]; // Cyan 500
  const magentaColor = [225, 29, 72]; // Rose 600

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');

  // CMYK Color accent bars at top
  doc.setFillColor(225, 29, 72); // Magenta
  doc.rect(0, 36, 52.5, 2, 'F');
  doc.setFillColor(6, 182, 212); // Cyan
  doc.rect(52.5, 36, 52.5, 2, 'F');
  doc.setFillColor(234, 179, 8); // Yellow
  doc.rect(105, 36, 52.5, 2, 'F');
  doc.setFillColor(30, 41, 59); // Key/Black
  doc.rect(157.5, 36, 52.5, 2, 'F');

  // School Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SRI (Seni Rancang Inspirasi)', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Teaching Factory (TEFA) Teknik Grafika - SMK Negeri 1 Kaligondang', 14, 20);
  doc.text('Jl. Raya Kaligondang, Purbalingga, Jawa Tengah 53391 | WA: 0812-3456-7890', 14, 25);
  doc.text('Email: tefa.grafika@smkn1kaligondang.sch.id | Web: tefagrafika.smkn1kaligondang.sch.id', 14, 30);

  // Invoice Title Right
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 196, 16, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`No: ${order.orderNumber}`, 196, 23, { align: 'right' });
  doc.text(`Tanggal: ${order.createdAt}`, 196, 29, { align: 'right' });

  // Customer & Order Info Box
  let y = 48;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 32, 2, 2, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI PELANGGAN', 20, y + 7);
  doc.text('DETAIL TRANSAKSI', 110, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Nama: ${order.customer.name}`, 20, y + 14);
  doc.text(`No. HP: ${order.customer.phone}`, 20, y + 20);
  doc.text(`Alamat: ${order.customer.address || '-'}`, 20, y + 26, { maxWidth: 85 });

  doc.text(`Tipe Pesanan: ${order.orderType === 'offline_pos' ? 'Kasir Offline / Walk-in' : 'Online Website'}`, 110, y + 14);
  doc.text(`Metode Bayar: ${order.paymentMethod.toUpperCase()}`, 110, y + 20);
  doc.text(`Status Bayar: ${order.paymentStatus.toUpperCase()}`, 110, y + 26);

  // Table Headers
  y = 88;
  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('NO', 18, y + 5.5);
  doc.text('PRODUK / JASA & SPESIFIKASI', 30, y + 5.5);
  doc.text('QTY', 125, y + 5.5, { align: 'center' });
  doc.text('HARGA SATUAN', 155, y + 5.5, { align: 'right' });
  doc.text('SUBTOTAL', 190, y + 5.5, { align: 'right' });

  // Items
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  order.items.forEach((item, index) => {
    doc.text(String(index + 1), 18, y);
    doc.setFont('helvetica', 'bold');
    doc.text(item.product.name, 30, y);
    doc.setFont('helvetica', 'normal');
    
    // Specs
    let specText = [];
    if (item.specs.material) specText.push(`Bahan: ${item.specs.material}`);
    if (item.specs.size) specText.push(`Ukuran: ${item.specs.size}`);
    if (item.specs.finishings && item.specs.finishings.length > 0) {
      specText.push(`Finishing: ${item.specs.finishings.join(', ')}`);
    }
    if (item.specs.designFile) {
      specText.push(`File Drive: ${item.specs.designFile.name}`);
    }

    if (specText.length > 0) {
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(specText.join(' | '), 30, y + 4.5, { maxWidth: 90 });
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
    }

    doc.text(`${item.quantity} ${item.product.unit}`, 125, y, { align: 'center' });
    doc.text(`Rp ${item.unitPrice.toLocaleString('id-ID')}`, 155, y, { align: 'right' });
    doc.text(`Rp ${item.subtotal.toLocaleString('id-ID')}`, 190, y, { align: 'right' });

    y += 14;
  });

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 6;

  // Calculation Summary
  const startCalcX = 120;
  doc.setFontSize(9);
  doc.text('Subtotal Produk:', startCalcX, y);
  doc.text(`Rp ${order.subtotal.toLocaleString('id-ID')}`, 190, y, { align: 'right' });
  y += 5;

  if (order.shippingCost > 0) {
    doc.text(`Ongkos Kirim (${order.courier?.courierName || 'Kurir'}):`, startCalcX, y);
    doc.text(`Rp ${order.shippingCost.toLocaleString('id-ID')}`, 190, y, { align: 'right' });
    y += 5;
  }

  if (order.discount > 0) {
    doc.text('Diskon / Potongan:', startCalcX, y);
    doc.text(`- Rp ${order.discount.toLocaleString('id-ID')}`, 190, y, { align: 'right' });
    y += 5;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(startCalcX - 4, y, 80, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL PEMBAYARAN:', startCalcX, y + 5.5);
  doc.text(`Rp ${order.totalAmount.toLocaleString('id-ID')}`, 190, y + 5.5, { align: 'right' });

  // If cash received
  if (order.cashReceived) {
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Uang Diterima: Rp ${order.cashReceived.toLocaleString('id-ID')}`, startCalcX, y);
    y += 4.5;
    doc.text(`Kembalian: Rp ${(order.cashChange || 0).toLocaleString('id-ID')}`, startCalcX, y);
  }

  // SPK and Notes footer
  y = Math.max(y + 20, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 35, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CATATAN & KETENTUAN TEFA GRAFIKA:', 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('1. Dokumen ini merupakan bukti sah pemesanan Teaching Factory SMKN 1 Kaligondang.', 20, y + 11);
  doc.text('2. File desain disimpan aman pada Google Drive TEFA dan tersinkronisasi otomatis.', 20, y + 16);
  doc.text('3. Garansi cetak ulang berlaku jika terdapat cacat produksi murni dari pihak TEFA.', 20, y + 21);
  doc.text(`4. No. Registrasi SPK Produksi: ${order.spkNumber || '-'}`, 20, y + 26);

  // Footer Signature Block
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Kasir / Petugas TEFA', 150, y + 10);
  doc.text('___________________', 150, y + 25);
  doc.text(order.cashierName || 'Teknik Grafika TEFA', 150, y + 30);

  // Download PDF file
  doc.save(`Invoice_${order.orderNumber}.pdf`);
};

export const generateSPKPDF = (order: Order) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header SPK Bengkel
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SURAT PERINTAH KERJA (SPK) PRODUKSI', 105, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('TEACHING FACTORY TEKNIK GRAFIKA - SMK NEGERI 1 KALIGONDANG', 105, 20, { align: 'center' });
  doc.text(`No. SPK: ${order.spkNumber || order.orderNumber} | Ref Pesanan: ${order.orderNumber}`, 105, 26, { align: 'center' });

  let y = 40;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DATA PEMESAN & DEADLINE PRODUKSI', 14, y);
  
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Nama Pelanggan: ${order.customer.name}`, 14, y);
  doc.text(`No. Telp: ${order.customer.phone}`, 14, y + 5);
  doc.text(`Tanggal Masuk: ${order.createdAt}`, 110, y);
  doc.text(`Status Sekarang: ${order.productionStatus.toUpperCase()}`, 110, y + 5);

  y += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('RINCIAN TEKNIS MESIN & BAHAN CETAK', 18, y + 5);

  y += 10;
  order.items.forEach((item, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${idx + 1}. ${item.product.name} (${item.quantity} ${item.product.unit})`, 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.text(`• Bahan / Kertas: ${item.specs.material || 'Standar TEFA'}`, 18, y);
    y += 4.5;
    doc.text(`• Ukuran Potong: ${item.specs.size || 'Standar'}`, 18, y);
    y += 4.5;
    if (item.specs.finishings && item.specs.finishings.length > 0) {
      doc.text(`• Finishing: ${item.specs.finishings.join(' + ')}`, 18, y);
      y += 4.5;
    }
    if (item.specs.designFile) {
      doc.text(`• File Siap Cetak: ${item.specs.designFile.name} (Drive: Tersedia 300 DPI CMYK)`, 18, y);
      y += 4.5;
    }
    if (item.specs.notes) {
      doc.text(`• Catatan Khusus: ${item.specs.notes}`, 18, y);
      y += 4.5;
    }
    y += 4;
  });

  // Production Stages Checklist
  y = Math.max(y, 160);
  doc.setFont('helvetica', 'bold');
  doc.text('LEMBAR PARAF KONTROL DIVISI PRODUKSI:', 14, y);
  y += 6;

  const steps = [
    '1. Divisi Desain & CTP (Setting File & Plat/Film)',
    '2. Divisi Cetak (Offset Speedmaster / Digital Press / DTF)',
    '3. Divisi Finishing (Potong / Pond Die-Cut / Laminasi / Jilid)',
    '4. Divisi Quality Control & Packing',
  ];

  steps.forEach(step => {
    doc.rect(14, y, 120, 10);
    doc.rect(134, y, 30, 10);
    doc.rect(164, y, 32, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(step, 16, y + 6);
    doc.text('Paraf Siswa', 136, y + 6);
    doc.text('Paraf Guru Instruktur', 166, y + 6);

    y += 11;
  });

  doc.save(`SPK_${order.orderNumber}.pdf`);
};
