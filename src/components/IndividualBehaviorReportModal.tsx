import React, { useState } from 'react';
import { Student, ConductRecord, User } from '../types';
import { 
  getRiskDetails, 
  calculateRiskLevel, 
  formatThaiDateTime, 
  formatThaiDateLong, 
  downloadCSV 
} from '../utils/helpers';
import { 
  Printer, 
  Download, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  User as UserIcon, 
  Award, 
  School,
  Share2,
  Copy,
  Check
} from 'lucide-react';

interface IndividualBehaviorReportModalProps {
  student: Student | null;
  records: ConductRecord[];
  currentUser: User | null;
  onClose: () => void;
}

export const IndividualBehaviorReportModal: React.FC<IndividualBehaviorReportModalProps> = ({
  student,
  records,
  currentUser,
  onClose,
}) => {
  const [reportType, setReportType] = useState<'official' | 'parent'>('official');
  const [copied, setCopied] = useState(false);

  if (!student) return null;

  // Filter records belonging to this student and sort chronologically (oldest first or newest first)
  const studentRecords = records
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

  const riskLevel = calculateRiskLevel(student.currentScore, student.consecutiveLateCount);
  const risk = getRiskDetails(riskLevel);

  // Calculate statistics
  const totalDeducted = studentRecords
    .filter((r) => r.scoreDelta < 0)
    .reduce((sum, r) => sum + Math.abs(r.scoreDelta), 0);

  const totalMerit = studentRecords
    .filter((r) => r.scoreDelta > 0)
    .reduce((sum, r) => sum + r.scoreDelta, 0);

  const lateRecordsCount = studentRecords.filter((r) => 
    r.ruleTitle.includes('มาโรงเรียนสาย') || r.category === 'การมาเรียน' && r.ruleTitle.includes('สาย')
  ).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'ลำดับ',
      'วันที่-เวลา',
      'รายการความผิด/พฤติกรรม',
      'หมวดหมู่',
      'คะแนนที่ตัด/เพิ่ม',
      'คะแนนคงเหลือหลังตัด',
      'สถานที่',
      'ครูผู้บันทึก',
      'หมายเหตุ',
    ];

    const rows = studentRecords.map((r, idx) => [
      idx + 1,
      formatThaiDateTime(r.recordedAt),
      r.ruleTitle,
      r.category,
      r.scoreDelta > 0 ? `+${r.scoreDelta}` : r.scoreDelta,
      r.newScore,
      r.location || '-',
      r.recordedByTeacherName,
      r.note || '-',
    ]);

    downloadCSV(
      `รายงานพฤติกรรม_${student.id}_${student.firstName}_${student.lastName}.csv`,
      headers,
      rows
    );
  };

  const handleCopySummary = () => {
    const text = `[รายงานพฤติกรรมความประพฤติ - โรงเรียนมัธยมฐานบินกำแพงแสน]
นักเรียน: ${student.prefix}${student.firstName} ${student.lastName} (รหัสประจำตัว ${student.id})
ชั้นมัธยมศึกษาปีที่ ${student.gradeLevel.replace('ม.', '')}/${student.classroom} เลขที่ ${student.studentNumber}
คะแนนความประพฤติคงเหลือ: ${student.currentScore} / 100 คะแนน
สถานะระดับความเสี่ยง: ${risk.label} (${risk.action})
จำนวนประวัติบันทึก: ${studentRecords.length} รายการ (คะแนนที่ถูกตัดรวม: -${totalDeducted} คะแนน)
ออกรายงานโดย: ฝ่ายปกครอง โรงเรียนมัธยมฐานบินกำแพงแสน`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentDateLong = formatThaiDateLong(new Date().toISOString());

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                รายงานพฤติกรรมและความประพฤตินักเรียนรายบุคคล
              </h3>
              <p className="text-xs text-slate-400">
                เลขประจำตัว: <span className="font-mono text-amber-300 font-bold">{student.id}</span> • {student.prefix}{student.firstName} {student.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Report Mode Selector */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex text-xs">
              <button
                onClick={() => setReportType('official')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                  reportType === 'official' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                ฉบับฝ่ายปกครอง
              </button>
              <button
                onClick={() => setReportType('parent')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                  reportType === 'parent' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                ฉบับแจ้งผู้ปกครอง
              </button>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกสรุป'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow transition-transform hover:scale-105"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์เอกสารรายงาน</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="overflow-y-auto p-6 sm:p-10 text-slate-800 bg-white space-y-6 print:p-0 print:space-y-4">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-800 pb-5">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-full border-2 border-blue-900 flex items-center justify-center bg-blue-50 text-blue-950 font-black shadow-inner">
                <School className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              โรงเรียนมัธยมฐานบินกำแพงแสน
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              กลุ่มบริหารงานบุคคลและฝ่ายปกครอง • สังกัดสำนักงานเขตพื้นที่การศึกษามัธยมศึกษาสุพรรณบุรี นครปฐม
            </p>
            <div className="mt-3 inline-block bg-slate-100 border border-slate-300 px-4 py-1 rounded-full text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">
              {reportType === 'official' 
                ? 'แบบรายงานข้อมูลความประพฤติและวินัยนักเรียนรายบุคคล (ฝ่ายปกครอง)' 
                : 'ใบรายงานคะแนนความประพฤติและแจ้งพฤติกรรมนักเรียน (ฉบับผู้ปกครอง)'}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              ข้อมูล ณ วันที่ {currentDateLong} • ภาคเรียนที่ 2 ปีการศึกษา 2569
            </p>
          </div>

          {/* Student Profile & Homeroom Details Block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
            <div className="space-y-1">
              <div className="text-slate-500 text-[11px] font-semibold uppercase">ข้อมูลนักเรียน</div>
              <div className="text-base font-bold text-slate-900">
                {student.prefix}{student.firstName} {student.lastName}
              </div>
              <div className="text-slate-700">
                เลขประจำตัว: <span className="font-mono font-bold text-blue-700">{student.id}</span>
              </div>
              <div className="text-slate-700">
                ชั้นมัธยมศึกษาปีที่: <span className="font-semibold">{student.gradeLevel.replace('ม.', '')}/{student.classroom}</span> • เลขที่: <span className="font-semibold">{student.studentNumber}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-slate-500 text-[11px] font-semibold uppercase">ข้อมูลประจำชั้น & ผู้ปกครอง</div>
              <div className="text-slate-700">
                ห้องเรียน: <span className="font-semibold">{student.gradeLevel}/{student.classroom}</span>
              </div>
              <div className="text-slate-700">
                ชื่อผู้ปกครอง: <span className="font-semibold">{student.parentName}</span>
              </div>
              <div className="text-slate-700">
                เบอร์ติดต่อผู้ปกครอง: <span className="font-mono">{student.parentPhone}</span>
              </div>
            </div>

            {/* Current Score & Risk Status */}
            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">คะแนนความประพฤติคงเหลือ</span>
                <span className="text-xs font-mono text-slate-400">เต็ม 100</span>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${
                  student.currentScore >= 80 ? 'text-emerald-600' :
                  student.currentScore >= 60 ? 'text-orange-600' : 'text-rose-600'
                }`}>
                  {student.currentScore}
                </span>
                <span className="text-xs text-slate-500 font-medium">คะแนน</span>
              </div>

              {/* Risk Level Badge */}
              <div className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1.5 ${risk.badgeBg}`}>
                <span className={`w-2 h-2 rounded-full ${risk.dotColor}`}></span>
                <span>{risk.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                มาตรการ: {risk.action}
              </p>
            </div>
          </div>

          {/* Statistics summary chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[11px]">คะแนนตั้งต้น</div>
              <div className="text-base font-bold text-slate-800">100 คะแนน</div>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
              <div className="text-rose-700 text-[11px]">รวมคะแนนที่ถูกตัด</div>
              <div className="text-base font-bold text-rose-700">-{totalDeducted} คะแนน</div>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-emerald-700 text-[11px]">คะแนนบำเพ็ญประโยชน์คืน</div>
              <div className="text-base font-bold text-emerald-700">+{totalMerit} คะแนน</div>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-amber-800 text-[11px]">จำนวนครั้งที่มาสาย</div>
              <div className="text-base font-bold text-amber-800">{lateRecordsCount} ครั้ง</div>
            </div>
          </div>

          {/* Chronological Log of All Recorded Infractions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>ตารางบันทึกประวัติการกระทำผิดและการตัดคะแนนความประพฤติ (เรียงตามลำดับเวลา)</span>
                <span className="text-xs font-normal text-slate-500">
                  (ทั้งหมด {studentRecords.length} รายการ)
                </span>
              </h3>
            </div>

            {studentRecords.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-sm">ไม่พบประวัติการถูกตัดคะแนนความประพฤติ</p>
                <p className="text-xs text-emerald-700 mt-1">นักเรียนปฏิบัติตามกฎระเบียบของโรงเรียนอย่างเคร่งครัด</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">ลำดับ</th>
                      <th className="py-2.5 px-3 w-32">วัน-เวลาที่เกิดเหตุ</th>
                      <th className="py-2.5 px-3">รายการพฤติกรรม / ฐานความผิด</th>
                      <th className="py-2.5 px-3 w-28">หมวดหมู่</th>
                      <th className="py-2.5 px-3 text-center w-24">คะแนน</th>
                      <th className="py-2.5 px-3 text-center w-24">คะแนนคงเหลือ</th>
                      <th className="py-2.5 px-3 w-36">ครูผู้บันทึก</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentRecords.map((r, index) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                          {formatThaiDateTime(r.recordedAt)}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{r.ruleTitle}</div>
                          {r.note && (
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              <span className="font-medium text-slate-600">รายละเอียด:</span> {r.note}
                            </div>
                          )}
                          {r.location && (
                            <div className="text-slate-400 text-[10px]">
                              สถานที่: {r.location}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                            {r.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {r.scoreDelta > 0 ? (
                            <span className="text-emerald-600">+{r.scoreDelta}</span>
                          ) : (
                            <span className="text-rose-600">{r.scoreDelta}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800">
                          {r.newScore}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <div className="font-medium">{r.recordedByTeacherName}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Conduct Intervention & Guidelines Notice */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>เกณฑ์ระดับความเสี่ยงและการดูแลช่วยเหลือนักเรียน:</span>
            </div>
            <ul className="list-disc pl-5 text-slate-600 space-y-0.5 text-[11px]">
              <li><strong className="text-slate-800">คะแนนคงเหลือ 80 - 99 คะแนน:</strong> ตักเตือน แจ้งครูประจำชั้นติดตาม และบันทึกข้อตกลงปรับปรุงตนเอง</li>
              <li><strong className="text-slate-800">คะแนนคงเหลือ 60 - 79 คะแนน:</strong> เชิญผู้ปกครองเพื่อร่วมวางแนวทางแก้ไข และให้นักเรียนทำกิจกรรมสาธารณประโยชน์เพื่อชดเชยคะแนน</li>
              <li><strong className="text-slate-800">คะแนนต่ำกว่า 60 คะแนน หรือมาสายติดต่อกันเกิน 3 ครั้ง:</strong> พิจารณาปรับเปลี่ยนพฤติกรรมขั้นสูงสุดตามระเบียบกระทรวงศึกษาธิการว่าด้วยการลงโทษนักเรียน</li>
            </ul>
          </div>

          {/* Official Signatures Section */}
          <div className="pt-6 border-t border-slate-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
              <div className="space-y-7">
                <p className="text-slate-600">ลงชื่อ ................................................</p>
                <div>
                  <p className="font-semibold text-slate-800">
                    ({currentUser?.fullName || 'ครูผู้บันทึกรายงาน'})
                  </p>
                  <p className="text-[11px] text-slate-500">ครูฝ่ายปกครองผู้จัดทำรายงาน</p>
                </div>
              </div>

              <div className="space-y-7">
                <p className="text-slate-600">ลงชื่อ ................................................</p>
                <div>
                  <p className="font-semibold text-slate-800">
                    (......................................................)
                  </p>
                  <p className="text-[11px] text-slate-500">ครูประจำชั้น ม.{student.gradeLevel.replace('ม.', '')}/{student.classroom}</p>
                </div>
              </div>

              <div className="space-y-7">
                <p className="text-slate-600">ลงชื่อ ................................................</p>
                <div>
                  <p className="font-semibold text-slate-800">
                    ({student.prefix}{student.firstName} {student.lastName})
                  </p>
                  <p className="text-[11px] text-slate-500">นักเรียนผู้รับทราบรายงาน</p>
                </div>
              </div>

              <div className="space-y-7">
                <p className="text-slate-600">ลงชื่อ ................................................</p>
                <div>
                  <p className="font-semibold text-slate-800">
                    ({student.parentName})
                  </p>
                  <p className="text-[11px] text-slate-500">ผู้ปกครองผู้รับทราบรายงาน</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
