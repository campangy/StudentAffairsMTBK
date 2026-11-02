import React from 'react';
import { Student, ConductRecord, User } from '../types';
import { calculateRiskLevel, getRiskDetails, formatThaiDateTime } from '../utils/helpers';
import { 
  X, 
  FileText, 
  AlertTriangle, 
  Award, 
  MinusCircle, 
  PlusCircle, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Calendar,
  Trash2
} from 'lucide-react';

interface StudentConductModalProps {
  student: Student | null;
  records: ConductRecord[];
  currentUser: User | null;
  onClose: () => void;
  onOpenReport: (student: Student) => void;
  onOpenParentNotice: (student: Student) => void;
  onOpenRecordModal: (student: Student, isMerit?: boolean) => void;
  onDeleteRecord?: (recordId: string) => void;
}

export const StudentConductModal: React.FC<StudentConductModalProps> = ({
  student,
  records,
  currentUser,
  onClose,
  onOpenReport,
  onOpenParentNotice,
  onOpenRecordModal,
  onDeleteRecord,
}) => {
  if (!student) return null;

  const studentRecords = records
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  const riskLevel = calculateRiskLevel(student.currentScore, student.consecutiveLateCount);
  const risk = getRiskDetails(riskLevel);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-6 overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header with Student Bio & Score Meter */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={student.firstName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">
                    {student.prefix}{student.firstName} {student.lastName}
                  </h2>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  เลขประจำตัว: <span className="font-mono font-bold text-amber-300">{student.id}</span> • ชั้นมัธยมศึกษาปีที่ {student.gradeLevel.replace('ม.', '')}/{student.classroom} เลขที่ {student.studentNumber}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-2">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    ผู้ปกครอง: {student.parentName} ({student.parentPhone})
                  </span>
                </div>
              </div>
            </div>

            {/* Score Pill */}
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-3 px-5 text-center shrink-0 self-stretch sm:self-auto">
              <div className="text-[11px] text-blue-200 font-medium">คะแนนคงเหลือ</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-3xl font-black ${
                  student.currentScore >= 80 ? 'text-emerald-400' :
                  student.currentScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {student.currentScore}
                </span>
                <span className="text-xs text-slate-300">/ 100</span>
              </div>
              <div className={`mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${risk.badgeBg}`}>
                {risk.label}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenRecordModal(student, false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <MinusCircle className="w-4 h-4" />
              <span>บันทึกตัดคะแนน</span>
            </button>

            <button
              onClick={() => onOpenRecordModal(student, true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>เพิ่มคะแนนบำเพ็ญประโยชน์</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenReport(student)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-transform hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              <span>ออกรายงานพฤติกรรมรายบุคคล</span>
            </button>

            {student.currentScore < 80 && (
              <button
                onClick={() => onOpenParentNotice(student)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow-xs"
              >
                <Mail className="w-4 h-4" />
                <span>หนังสือเชิญผู้ปกครอง</span>
              </button>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">
              ประวัติการกระทำผิดและการตัดคะแนน ({studentRecords.length} รายการ)
            </h4>
            <span className="text-xs text-slate-500">
              มาสายสะสม: <strong className="text-amber-600">{student.consecutiveLateCount} ครั้ง</strong>
            </span>
          </div>

          {studentRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-sm text-slate-700">ไม่มีประวัติการกระทำผิด</p>
              <p className="text-xs text-slate-500 mt-1">นักเรียนรักษาคะแนนเต็ม 100 คะแนน</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {studentRecords.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${
                        r.scoreDelta > 0 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {r.scoreDelta > 0 ? `+${r.scoreDelta}` : r.scoreDelta} คะแนน
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{r.ruleTitle}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                        {r.category}
                      </span>
                    </div>

                    {r.note && (
                      <p className="text-slate-600 text-xs">
                        {r.note}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{formatThaiDateTime(r.recordedAt)}</span>
                      {r.location && <span>• สถานที่: {r.location}</span>}
                      <span>• ครูผู้บันทึก: {r.recordedByTeacherName}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-slate-400 text-[10px]">คงเหลือหลังตัด</div>
                    <div className="font-bold text-sm text-slate-800">{r.newScore} คะแนน</div>
                    {currentUser?.role === 'admin' && onDeleteRecord && (
                      <button
                        onClick={() => onDeleteRecord(r.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 mt-1 rounded hover:bg-rose-50"
                        title="ลบรายการบันทึก (Admin Only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
