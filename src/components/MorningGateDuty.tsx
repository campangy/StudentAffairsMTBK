import React, { useState } from 'react';
import { Student, ConductRecord, InfractionRule, User } from '../types';
import { formatThaiDateTime } from '../utils/helpers';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  UserCheck, 
  Zap, 
  Sparkles,
  Shirt,
  Calendar,
  Volume2
} from 'lucide-react';

interface MorningGateDutyProps {
  students: Student[];
  records: ConductRecord[];
  rules: InfractionRule[];
  currentUser: User | null;
  onRecordQuickLate: (studentId: string, ruleId: string, note?: string) => void;
  onOpenReport: (student: Student) => void;
}

export const MorningGateDuty: React.FC<MorningGateDutyProps> = ({
  students,
  records,
  rules,
  currentUser,
  onRecordQuickLate,
  onOpenReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [lastLoggedStudent, setLastLoggedStudent] = useState<{
    student: Student;
    ruleTitle: string;
    scoreDelta: number;
    newScore: number;
    isRisk: boolean;
  } | null>(null);

  // Today's late records
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayLateRecords = records.filter(
    (r) =>
      r.ruleTitle.includes('สาย') &&
      new Date(r.recordedAt).getTime() >= startOfToday
  );

  const lateRule = rules.find((r) => r.id === 'rule_late') || rules[0];
  const uniformRule = rules.find((r) => r.id === 'rule_skirt_pants') || rules[3];
  const hairRule = rules.find((r) => r.id === 'rule_hair') || rules[4];

  const filteredStudents = students.filter(
    (s) =>
      s.id.includes(searchTerm.trim()) ||
      `${s.prefix}${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const handleQuickLog = (student: Student, rule: InfractionRule, customNote?: string) => {
    onRecordQuickLate(student.id, rule.id, customNote || 'บันทึกตรวจเวรหน้าประตูโรงเรียน');

    const newScore = Math.max(0, student.currentScore + rule.scoreDeduction);
    const newLateCount = student.consecutiveLateCount + (rule.title.includes('สาย') ? 1 : 0);
    const isRisk = newScore < 80 || newLateCount >= 3;

    setLastLoggedStudent({
      student,
      ruleTitle: rule.title,
      scoreDelta: rule.scoreDeduction,
      newScore,
      isRisk,
    });

    setSearchTerm('');
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Morning Duty Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-white text-slate-950">
              โหมดครูเวรหน้าประตูโรงเรียน
            </span>
            <span className="text-xs text-amber-100">จุดคัดกรอง 07.50 น.</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            ระบบบันทึกนักเรียนมาสายและตรวจเครื่องแบบ (ด่วน)
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            แตะหรือสแกนเลขประจำตัวนักเรียนเพื่อตัดคะแนน 1-Click ทันที
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur border border-white/30 rounded-2xl p-3 px-5 text-center shrink-0">
          <div className="text-[11px] text-amber-100 font-semibold">มาสายเช้าวันนี้</div>
          <div className="text-3xl font-black text-white">{todayLateRecords.length} คน</div>
          <div className="text-[10px] text-amber-100">ตัด -5 คะแนน/คน</div>
        </div>
      </div>

      {/* Instant Success / Risk Notification Banner */}
      {lastLoggedStudent && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 animate-in fade-in duration-200 ${
          lastLoggedStudent.isRisk 
            ? 'bg-rose-50 border-rose-300 text-rose-900' 
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
              lastLoggedStudent.isRisk ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              {lastLoggedStudent.isRisk ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-sm">
                บันทึกเรียบร้อย: {lastLoggedStudent.student.prefix}{lastLoggedStudent.student.firstName} {lastLoggedStudent.student.lastName} ({lastLoggedStudent.student.id})
              </div>
              <p className="text-xs mt-0.5 opacity-90">
                รายการ: {lastLoggedStudent.ruleTitle} ({lastLoggedStudent.scoreDelta} คะแนน) • คะแนนคงเหลือใหม่: <strong>{lastLoggedStudent.newScore} คะแนน</strong>
                {lastLoggedStudent.isRisk && (
                  <span className="ml-2 font-bold text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded">
                    ⚠️ เข้าข่ายกลุ่มเสี่ยง (คะแนน &lt; 80 หรือมาสาย ≥ 3 ครั้ง)
                  </span>
                )}
              </p>
            </div>
          </div>

          {lastLoggedStudent.isRisk && (
            <button
              onClick={() => onOpenReport(lastLoggedStudent.student)}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shrink-0"
            >
              ออกรายงานรายบุคคล
            </button>
          )}
        </div>
      )}

      {/* Search & Fast Tap Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fast Scanner / Search Box */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>พิมพ์รหัส 5 หลัก หรือเลือกนักเรียน:</span>
            </h3>
            <span className="text-xs text-slate-400">กดคลิกเพื่อบันทึกทันที</span>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              autoFocus
              placeholder="พิมพ์เลขประจำตัว เช่น 45102, 45215 หรือชื่อนักเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          {/* Student quick selection grid */}
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {filteredStudents.slice(0, 10).map((student) => (
              <div
                key={student.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 font-bold font-mono flex items-center justify-center shrink-0">
                    {student.id.slice(-3)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {student.prefix}{student.firstName} {student.lastName}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      รหัส: <strong className="font-mono text-blue-700">{student.id}</strong> • ม.{student.gradeLevel.replace('ม.', '')}/{student.classroom} • คะแนน: <strong className={student.currentScore < 80 ? 'text-rose-600' : 'text-emerald-600'}>{student.currentScore}</strong> • สาย: {student.consecutiveLateCount} ครั้ง
                    </div>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleQuickLog(student, lateRule, 'มาโรงเรียนสายเข้าแถวไม่ทัน')}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-xs transition-transform active:scale-95"
                  >
                    มาสาย (-5)
                  </button>

                  <button
                    onClick={() => handleQuickLog(student, uniformRule, 'เครื่องแบบ/กางเกง/กระโปรงผิดระเบียบ')}
                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg"
                  >
                    เครื่องแบบ (-5)
                  </button>

                  <button
                    onClick={() => handleQuickLog(student, hairRule, 'ทรงผมผิดระเบียบ')}
                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg"
                  >
                    ทรงผม (-5)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Today Late Log List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>รายชื่อมาสายวันนี้ ({todayLateRecords.length} คน)</span>
            </h3>
            <span className="text-[10px] text-slate-400">เรียงตามเวลาล่าสุด</span>
          </div>

          <div className="flex-1 max-h-96 overflow-y-auto space-y-2">
            {todayLateRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                ยังไม่มีการบันทึกมาสายในวันนี้
              </div>
            ) : (
              todayLateRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rec.studentName}</span>
                    <span className="text-[11px] font-mono text-rose-600 font-bold">-5 คะแนน</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{rec.gradeClass} • รหัส {rec.studentId}</span>
                    <span>{formatThaiDateTime(rec.recordedAt).split('เวลา')[1] || ''}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
