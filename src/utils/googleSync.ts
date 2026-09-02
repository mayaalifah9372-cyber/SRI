import { Order, GoogleDriveDocument } from '../types';

export const exportOrdersToCSV = (orders: Order[]): string => {
  const headers = [
    'No Pesanan',
    'Tanggal',
    'Tipe Pesanan',
    'Nama Pelanggan',
    'No HP',
    'Alamat',
    'Total (Rp)',
    'Metode Bayar',
    'Status Bayar',
    'Status Produksi',
    'Kurir/Ekspedisi',
    'No Resi',
    'Link Folder Drive',
    'No SPK',
  ];

  const rows = orders.map(o => [
    `"${o.orderNumber}"`,
    `"${o.createdAt}"`,
    `"${o.orderType}"`,
    `"${o.customer.name}"`,
    `"${o.customer.phone}"`,
    `"${(o.customer.address || '').replace(/"/g, '""')}"`,
    o.totalAmount,
    `"${o.paymentMethod}"`,
    `"${o.paymentStatus}"`,
    `"${o.productionStatus}"`,
    `"${o.courier?.courierName || (o.isPickupInStore ? 'Ambil di TEFA' : '-')}"`,
    `"${o.courier?.trackingNumber || '-'}"`,
    `"${o.googleDriveFolderUrl || '-'}"`,
    `"${o.spkNumber || '-'}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
