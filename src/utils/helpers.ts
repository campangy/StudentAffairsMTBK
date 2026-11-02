import { RiskLevel } from '../types';

export function calculateRiskLevel(score: number, consecutiveLateCount: number = 0): RiskLevel {
  if (score < 60) {
    return 'high_risk';
  }
  if (score <= 79) {
    return 'medium_risk';
  }
  if (score <= 99 || consecutiveLateCount >= 3) {
    return 'low_risk';
  }
  return 'excellent';
}

export function getRiskDetails(risk: RiskLevel) {
  switch (risk) {
    case 'excellent':
      return {
        label: 'ปกติ / วินัยดีเยี่ยม',
        shortLabel: 'ดีเยี่ยม',
        action: 'ชื่นชม / รักษามาตรฐานวินัย',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dotColor: 'bg-emerald-500',
        scoreRange: '100 คะแนน',
      };
    case 'low_risk':
      return {
        label: 'เฝ้าระวัง / ตักเตือน',
        shortLabel: 'ตักเตือน',
        action: 'ตักเตือน / แจ้งครูประจำชั้นติดตาม',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
        dotColor: 'bg-amber-500',
        scoreRange: '80 - 99 คะแนน หรือมาสาย ≥ 3 ครั้ง',
      };
    case 'medium_risk':
      return {
        label: 'เสี่ยงปานกลาง / เชิญผู้ปกครอง',
        shortLabel: 'เชิญผู้ปกครอง',
        action: 'เชิญผู้ปกครองพบครูฝ่ายปกครอง / ทำกิจกรรมสาธารณประโยชน์',
        badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
        dotColor: 'bg-orange-500',
        scoreRange: '60 - 79 คะแนน',
      };
    case 'high_risk':
      return {
        label: 'เสี่ยงวิกฤต / ปรับพฤติกรรมขั้นสูงสุด',
        shortLabel: 'วิกฤต',
        action: 'พิจารณาปรับเปลี่ยนพฤติกรรมขั้นสูงสุด / ประชุมคณะกรรมการฝ่ายปกครอง',
        badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
        dotColor: 'bg-rose-600',
        scoreRange: 'ต่ำกว่า 60 คะแนน',
      };
  }
}

export function formatThaiDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543; // พ.ศ.
    return `${day} ${month} ${year}`;
  } catch {
    return isoString;
  }
}

export function formatThaiDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} เวลา ${hours}:${minutes} น.`;
  } catch {
    return isoString;
  }
}

export function formatThaiDateLong(isoString: string): string {
  try {
    const date = new Date(isoString);
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} พ.ศ. ${year}`;
  } catch {
    return isoString;
  }
}

export function getScoreBadgeClass(score: number): string {
  if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  // UTF-8 BOM so Excel opens Thai fonts correctly
  const bom = '\uFEFF';
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
