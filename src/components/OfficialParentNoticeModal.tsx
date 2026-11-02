import React from 'react';
import { Student, ConductRecord, User } from '../types';
import { formatThaiDateLong, formatThaiDateTime } from '../utils/helpers';
import { Printer, X, Download, School, AlertTriangle } from 'lucide-react';

interface OfficialParentNoticeModalProps {
  student: Student | null;
  records: ConductRecord[];
  currentUser: User | null;
  onClose: () => void;
}

export const OfficialParentNoticeModal: React.FC<OfficialParentNoticeModalProps> = ({
  student,
  records,
  currentUser,
  onClose,
}) => {
  if (!student) return null;

  const studentRecords = records
    .filter((r) => r.studentId === student.id && r.scoreDelta < 0)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  const currentDateLong = formatThaiDateLong(new Date().toISOString());

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-6 overflow-hidden border border-slate-200 max-h-[95vh] flex flex-col">
        {/* Toolbar */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">หนังสือเชิญผู้ปกครองเพื่อร่วมหารือและปรับพฤติกรรม</h3>
              <p className="text-xs text-slate-400">โรงเรียนมัธยมฐานบินกำแพงแสน</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300"
            >
              <Printer className="w-3.5 h-3.5" />
              พิมพ์หนังสือราชการ
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Letter */}
        <div className="p-8 sm:p-12 overflow-y-auto text-slate-800 space-y-6 text-sm font-serif print:font-serif print:p-0 print:space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 mx-auto mb-2 text-slate-900">
              <School className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-lg font-bold">โรงเรียนมัธยมฐานบินกำแพงแสน</h2>
            <p className="text-xs text-slate-600">
              อำเภอกำแพงแสน จังหวัดนครปฐม 73140
            </p>
            <p className="text-xs text-slate-600 font-mono">
              ที่ ศธ ๐๔๒๕๑/ฝปก. ๒๕๖๙/{student.id}
            </p>
          </div>

          <div className="text-right text-xs">
            วันที่ {currentDateLong}
          </div>

          <div className="space-y-1 text-xs">
            <p><strong>เรื่อง:</strong> ขอเชิญผู้ปกครองร่วมปรึกษาหารือเพื่อปรับเปลี่ยนพฤติกรรมและส่งเสริมระเบียบวินัยนักเรียน</p>
            <p><strong>เรียน:</strong> ผู้ปกครองของ {student.prefix}{student.firstName} {student.lastName} ({student.parentName})</p>
          </div>

          <div className="text-xs leading-relaxed indent-8 space-y-3">
            <p>
              ด้วย กลุ่มบริหารงานบุคคลและฝ่ายปกครอง โรงเรียนมัธยมฐานบินกำแพงแสน ได้ดำเนินการติดตามและประเมินผลคะแนนความประพฤติของ <strong>{student.prefix}{student.firstName} {student.lastName}</strong> นักเรียนชั้นมัธยมศึกษาปีที่ <strong>{student.gradeLevel.replace('ม.', '')}/{student.classroom}</strong> เลขประจำตัว <strong>{student.id}</strong> ในภาคเรียนที่ ๒ ปีการศึกษา ๒๕๖๙
            </p>
            <p>
              จากการตรวจสอบพบว่า นักเรียนมีคะแนนความประพฤติคงเหลือปัจจุบัน <strong>{student.currentScore} คะแนน</strong> (จากคะแนนเต็ม ๑๐๐ คะแนน) ซึ่งอยู่ในระดับ 
              {student.currentScore < 60 ? (
                <span className="font-bold text-rose-700"> "กลุ่มเสี่ยงวิกฤต (ต้องพิจารณาปรับเปลี่ยนพฤติกรรมขั้นสูงสุด)" </span>
              ) : (
                <span className="font-bold text-orange-700"> "กลุ่มเฝ้าระวังและต้องเชิญผู้ปกครองเพื่อร่วมแก้ไข" </span>
              )}
              โดยมีประวัติการกระทำผิดระเบียบของโรงเรียนที่สำคัญ ดังนี้:
            </p>
          </div>

          {/* Infractions Mini Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="p-2">วันที่เกิดเหตุ</th>
                  <th className="p-2">รายการความผิด</th>
                  <th className="p-2 text-center">คะแนนที่ตัด</th>
                  <th className="p-2">ครูผู้บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentRecords.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td className="p-2 whitespace-nowrap">{formatThaiDateTime(r.recordedAt)}</td>
                    <td className="p-2">{r.ruleTitle} {r.note ? `(${r.note})` : ''}</td>
                    <td className="p-2 text-center text-rose-600 font-bold">{r.scoreDelta}</td>
                    <td className="p-2">{r.recordedByTeacherName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs leading-relaxed indent-8">
            <p>
              เพื่อประโยชน์ในการร่วมมือกันดูแลช่วยเหลือและปรับปรุงพฤติกรรมของนักเรียนให้เป็นไปตามระเบียบวินัย ฝ่ายปกครองจึงขอเรียนเชิญท่านผู้ปกครองเข้าพบเพื่อหารือแนวทางร่วมกัน ณ ห้องฝ่ายปกครอง โรงเรียนมัธยมฐานบินกำแพงแสน ในวันและเวลาราชการ
            </p>
          </div>

          <div className="pt-8 text-right pr-12 text-xs space-y-8">
            <p>ขอแสดงความนับถือ</p>
            <div className="space-y-1">
              <p className="font-bold">({currentUser?.fullName || 'ดร.สมเกียรติ สกุลดี'})</p>
              <p className="text-slate-600">{currentUser?.position || 'หัวหน้าฝ่ายบริหารงานบุคคลและฝ่ายปกครอง'}</p>
              <p className="text-slate-600">โรงเรียนมัธยมฐานบินกำแพงแสน</p>
            </div>
          </div>

          {/* Tear-off slip for parents */}
          <div className="border-t-2 border-dashed border-slate-400 pt-4 mt-8 text-xs space-y-2">
            <p className="font-bold text-center">ใบตอบรับการเชิญพบฝ่ายปกครอง (กรุณาส่งคืนครูประจำชั้น)</p>
            <p>
              ข้าพเจ้า (นาย/นาง/นางสาว) ................................................................. ผู้ปกครองของ {student.prefix}{student.firstName} {student.lastName} ชั้น ม.{student.gradeLevel.replace('ม.', '')}/{student.classroom}
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" className="rounded" /> สะดวกเข้าพบในวันที่ ........................................ เวลา .................... น.
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" className="rounded" /> ขอติดต่อประสานงานทางโทรศัพท์ เบอร์: ........................................
              </label>
            </div>
            <div className="text-right pt-4 pr-12">
              <p>ลงชื่อ ........................................................................ ผู้ปกครอง</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
