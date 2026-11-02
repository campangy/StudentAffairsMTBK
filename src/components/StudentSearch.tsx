import React, { useState } from 'react';
import { Student, ConductRecord, User } from '../types';
import { calculateRiskLevel, getRiskDetails } from '../utils/helpers';
import { 
  Search, 
  Filter, 
  FileText, 
  MinusCircle, 
  PlusCircle, 
  Eye, 
  Mail, 
  GraduationCap, 
  UserCheck, 
  ScanLine,
  SlidersHorizontal
} from 'lucide-react';

interface StudentSearchProps {
  students: Student[];
  records: ConductRecord[];
  currentUser: User | null;
  onSelectStudent: (student: Student) => void;
  onOpenReport: (student: Student) => void;
  onOpenParentNotice: (student: Student) => void;
  onOpenRecordModal: (student: Student, isMerit?: boolean) => void;
}

export const StudentSearch: React.FC<StudentSearchProps> = ({
  students,
  records,
  currentUser,
  onSelectStudent,
  onOpenReport,
  onOpenParentNotice,
  onOpenRecordModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ทั้งหมด');
  const [riskFilter, setRiskFilter] = useState('ทั้งหมด');
  const [quickScanId, setQuickScanId] = useState('');

  const grades = ['ทั้งหมด', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
  const riskOptions = ['ทั้งหมด', 'ดีเยี่ยม (100)', 'เฝ้าระวัง (80-99)', 'เชิญผู้ปกครอง (60-79)', 'วิกฤต (<60)'];

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.prefix}${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch =
      searchTerm.trim() === '' ||
      s.id.includes(searchTerm.trim()) ||
      fullName.includes(searchTerm.trim().toLowerCase()) ||
      `${s.gradeLevel}/${s.classroom}`.includes(searchTerm.trim());

    const matchesGrade = gradeFilter === 'ทั้งหมด' || s.gradeLevel === gradeFilter;

    const risk = calculateRiskLevel(s.currentScore, s.consecutiveLateCount);
    let matchesRisk = true;
    if (riskFilter === 'ดีเยี่ยม (100)') matchesRisk = risk === 'excellent';
    if (riskFilter === 'เฝ้าระวัง (80-99)') matchesRisk = risk === 'low_risk';
    if (riskFilter === 'เชิญผู้ปกครอง (60-79)') matchesRisk = risk === 'medium_risk';
    if (riskFilter === 'วิกฤต (<60)') matchesRisk = risk === 'high_risk';

    return matchesSearch && matchesGrade && matchesRisk;
  });

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScanId.trim()) return;
    const found = students.find((s) => s.id === quickScanId.trim());
    if (found) {
      onSelectStudent(found);
      setQuickScanId('');
    } else {
      alert(`ไม่พบนักเรียนรหัส ${quickScanId} ในระบบ`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              ค้นหาประวัตินักเรียนและบันทึกความประพฤติ
            </h2>
            <p className="text-xs text-slate-500">
              ค้นหาด้วยเลขประจำตัว 5 หลัก, ชื่อ-นามสกุล หรือระดับชั้น/ห้องเรียน
            </p>
          </div>

          {/* Quick Scan Input (Barcode / ID reader simulation) */}
          <form onSubmit={handleQuickScan} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <ScanLine className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="สแกน / ยิงรหัส 5 หลัก..."
                value={quickScanId}
                onChange={(e) => setQuickScanId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shrink-0"
            >
              ค้นด่วน
            </button>
          </form>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="พิมพ์ชื่อ นามสกุล หรือรหัสนักเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">ระดับชั้น:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {grades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">สถานะวินัย:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {riskOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>แสดงผลนักเรียน <strong>{filteredStudents.length}</strong> จากทั้งหมด {students.length} คน</span>
        <span>คะแนนเต็ม 100 คะแนน</span>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const riskLevel = calculateRiskLevel(student.currentScore, student.consecutiveLateCount);
          const risk = getRiskDetails(riskLevel);
          const studentHistoryCount = records.filter((r) => r.studentId === student.id).length;

          return (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Photo + Info + Score Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={student.firstName}
                      className="w-13 h-13 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">
                        {student.prefix}{student.firstName} {student.lastName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {student.id}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-600 font-medium">
                          ม.{student.gradeLevel.replace('ม.', '')}/{student.classroom} (เลขที่ {student.studentNumber})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ผู้ปกครอง: {student.parentName}
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400">คงเหลือ</div>
                    <div className={`text-2xl font-black ${
                      student.currentScore >= 80 ? 'text-emerald-600' :
                      student.currentScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {student.currentScore}
                    </div>
                  </div>
                </div>

                {/* Risk and Status Tag */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${risk.badgeBg}`}>
                    {risk.label}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ประวัติ {studentHistoryCount} ครั้ง • มาสาย {student.consecutiveLateCount} ครั้ง
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูประวัติ</span>
                  </button>

                  <button
                    onClick={() => onOpenRecordModal(student, false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>ตัดคะแนน</span>
                  </button>
                </div>

                {/* Dedicated Individual Behavior Report Button (Prompt requirement!) */}
                <button
                  onClick={() => onOpenReport(student)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>ออกรายงานพฤติกรรมรายบุคคล (พิมพ์/แชร์)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-base">ไม่พบข้อมูลนักเรียนที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรอง</p>
        </div>
      )}
    </div>
  );
};
