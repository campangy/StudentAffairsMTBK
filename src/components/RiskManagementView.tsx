import React, { useState } from 'react';
import { Student, ConductRecord, User } from '../types';
import { calculateRiskLevel, getRiskDetails, downloadCSV } from '../utils/helpers';
import { 
  AlertTriangle, 
  FileText, 
  Mail, 
  Download, 
  Eye, 
  Users, 
  ShieldAlert, 
  Clock,
  CheckCircle2
} from 'lucide-react';

interface RiskManagementViewProps {
  students: Student[];
  records: ConductRecord[];
  currentUser: User | null;
  onSelectStudent: (student: Student) => void;
  onOpenReport: (student: Student) => void;
  onOpenParentNotice: (student: Student) => void;
}

export const RiskManagementView: React.FC<RiskManagementViewProps> = ({
  students,
  records,
  currentUser,
  onSelectStudent,
  onOpenReport,
  onOpenParentNotice,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'medium' | 'late'>('all');

  const riskStudents = students.filter((s) => {
    const isCritical = s.currentScore < 60;
    const isMedium = s.currentScore >= 60 && s.currentScore <= 79;
    const isFrequentLate = s.consecutiveLateCount >= 3;

    if (filterType === 'critical') return isCritical;
    if (filterType === 'medium') return isMedium;
    if (filterType === 'late') return isFrequentLate;

    return isCritical || isMedium || isFrequentLate;
  }).sort((a, b) => a.currentScore - b.currentScore);

  const criticalCount = students.filter((s) => s.currentScore < 60).length;
  const mediumCount = students.filter((s) => s.currentScore >= 60 && s.currentScore <= 79).length;
  const lateCount = students.filter((s) => s.consecutiveLateCount >= 3).length;

  const handleExportRiskCSV = () => {
    const headers = [
      'เลขประจำตัว',
      'คำนำหน้า',
      'ชื่อ',
      'นามสกุล',
      'ระดับชั้น/ห้อง',
      'เลขที่',
      'คะแนนคงเหลือ',
      'ระดับความเสี่ยง',
      'มาสายสะสม (ครั้ง)',
      'ผู้ปกครอง',
      'เบอร์โทรศัพท์ผู้ปกครอง',
      'มาตรการที่ต้องดำเนินการ',
    ];

    const rows = riskStudents.map((s) => {
      const risk = getRiskDetails(calculateRiskLevel(s.currentScore, s.consecutiveLateCount));
      return [
        s.id,
        s.prefix,
        s.firstName,
        s.lastName,
        `ม.${s.gradeLevel.replace('ม.', '')}/${s.classroom}`,
        s.studentNumber,
        s.currentScore,
        risk.label,
        s.consecutiveLateCount,
        s.parentName,
        s.parentPhone,
        risk.action,
      ];
    });

    downloadCSV('รายชื่อกลุ่มนักเรียนเสี่ยง_โรงเรียนมัธยมฐานบินกำแพงแสน.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-red-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500 text-white">
              ระบบติดตามกลุ่มเสี่ยงฝ่ายปกครอง
            </span>
            <span className="text-xs text-rose-200">มาตรการดูแลช่วยเหลือนักเรียน</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            รายชื่อกลุ่มนักเรียนเสี่ยง & พิมพ์รายงานประพฤติ
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            ติดตามนักเรียนที่คะแนนคงเหลือต่ำกว่า 80 คะแนน หรือมีประวัติมาสายต่อเนื่อง
          </p>
        </div>

        <button
          onClick={handleExportRiskCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 shadow shrink-0"
        >
          <Download className="w-4 h-4 text-rose-400" />
          <span>Export รายชื่อกลุ่มเสี่ยง (CSV)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="text-[11px] opacity-80">กลุ่มเสี่ยงทั้งหมด</div>
          <div className="text-xl font-black mt-0.5">{criticalCount + mediumCount} คน</div>
        </button>

        <button
          onClick={() => setFilterType('critical')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'critical'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="text-[11px] opacity-80">วิกฤต (คะแนน &lt; 60)</div>
          <div className="text-xl font-black mt-0.5 text-rose-600 font-bold">{criticalCount} คน</div>
        </button>

        <button
          onClick={() => setFilterType('medium')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'medium'
              ? 'bg-orange-600 text-white border-orange-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="text-[11px] opacity-80">ปานกลาง (60-79 คะแนน)</div>
          <div className="text-xl font-black mt-0.5 text-orange-600 font-bold">{mediumCount} คน</div>
        </button>

        <button
          onClick={() => setFilterType('late')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'late'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="text-[11px] opacity-80">มาสายสะสม (≥ 3 ครั้ง)</div>
          <div className="text-xl font-black mt-0.5 text-amber-600 font-bold">{lateCount} คน</div>
        </button>
      </div>

      {/* List of Risk Students */}
      <div className="space-y-3">
        {riskStudents.map((student) => {
          const riskLevel = calculateRiskLevel(student.currentScore, student.consecutiveLateCount);
          const risk = getRiskDetails(riskLevel);
          const studentRecords = records.filter((r) => r.studentId === student.id);

          return (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-rose-300 p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={student.firstName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">
                      {student.prefix}{student.firstName} {student.lastName}
                    </h3>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      รหัส {student.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${risk.badgeBg}`}>
                      {risk.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    ชั้น ม.{student.gradeLevel.replace('ม.', '')}/{student.classroom} (เลขที่ {student.studentNumber}) • ผู้ปกครอง: <strong>{student.parentName}</strong> ({student.parentPhone})
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>มาสายสะสม: <strong className="text-amber-600">{student.consecutiveLateCount} ครั้ง</strong></span>
                    <span>•</span>
                    <span>ประวัติความผิด: <strong className="text-slate-800">{studentRecords.length} รายการ</strong></span>
                    <span>•</span>
                    <span className="text-rose-600 font-semibold">{risk.action}</span>
                  </div>
                </div>
              </div>

              {/* Score & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right pr-2">
                  <div className="text-[10px] text-slate-400">คะแนนคงเหลือ</div>
                  <div className={`text-2xl font-black ${
                    student.currentScore < 60 ? 'text-rose-600' : 'text-orange-600'
                  }`}>
                    {student.currentScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Detailed Individual Student Behavior Report Button (Prompt requirement!) */}
                  <button
                    onClick={() => onOpenReport(student)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-transform hover:scale-105"
                    title="ออกรายงานพฤติกรรมรายบุคคลสำหรับฝ่ายปกครองหรือแชร์ผู้ปกครอง"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>ออกรายงานรายบุคคล</span>
                  </button>

                  <button
                    onClick={() => onOpenParentNotice(student)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-sm"
                    title="พิมพ์หนังสือเชิญผู้ปกครอง"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>เชิญผู้ปกครอง</span>
                  </button>

                  <button
                    onClick={() => onSelectStudent(student)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                    title="ดูประวัติเต็ม"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {riskStudents.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-base">ไม่พบนักเรียนในกลุ่มเสี่ยงนี้</h3>
            <p className="text-xs text-slate-500 mt-1">นักเรียนมีคะแนนเกินเกณฑ์มาตรฐาน</p>
          </div>
        )}
      </div>
    </div>
  );
};
