import React from 'react';
import { Student, ConductRecord, InfractionRule, User } from '../types';
import { calculateRiskLevel, getRiskDetails, downloadCSV } from '../utils/helpers';
import { 
  BarChart3, 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingDown, 
  Download, 
  FileText, 
  Mail, 
  CheckCircle,
  Eye,
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface AdminDashboardProps {
  students: Student[];
  records: ConductRecord[];
  rules: InfractionRule[];
  currentUser: User | null;
  onSelectStudent: (student: Student) => void;
  onOpenReport: (student: Student) => void;
  onOpenParentNotice: (student: Student) => void;
  onOpenRecordModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  records,
  rules,
  currentUser,
  onSelectStudent,
  onOpenReport,
  onOpenParentNotice,
  onOpenRecordModal,
}) => {
  // Aggregate KPIs
  const totalStudents = students.length;
  const avgScore = totalStudents > 0
    ? (students.reduce((sum, s) => sum + s.currentScore, 0) / totalStudents).toFixed(1)
    : '100';

  // Infraction records in the last 7 days vs today
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

  const todayLateRecords = records.filter(
    (r) =>
      r.ruleTitle.includes('มาโรงเรียนสาย') &&
      new Date(r.recordedAt).getTime() >= startOfToday
  );

  const weekLateRecords = records.filter(
    (r) =>
      r.ruleTitle.includes('มาโรงเรียนสาย') &&
      new Date(r.recordedAt).getTime() >= sevenDaysAgo
  );

  // Top 3 infractions
  const infractionCounts: { [title: string]: { count: number; totalDeducted: number; category: string } } = {};
  records.forEach((r) => {
    if (r.scoreDelta < 0) {
      if (!infractionCounts[r.ruleTitle]) {
        infractionCounts[r.ruleTitle] = { count: 0, totalDeducted: 0, category: r.category };
      }
      infractionCounts[r.ruleTitle].count += 1;
      infractionCounts[r.ruleTitle].totalDeducted += Math.abs(r.scoreDelta);
    }
  });

  const topInfractions = Object.entries(infractionCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  // Risk students: score < 80 or consecutive late >= 3
  const riskStudents = students.filter(
    (s) => s.currentScore < 80 || s.consecutiveLateCount >= 3
  ).sort((a, b) => a.currentScore - b.currentScore);

  // Group by grade level (ม.1 ถึง ม.6)
  const gradeStats = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'].map((grade) => {
    const gradeStudents = students.filter((s) => s.gradeLevel === grade);
    const count = gradeStudents.length;
    const avg = count > 0 
      ? (gradeStudents.reduce((acc, s) => acc + s.currentScore, 0) / count).toFixed(1)
      : '100';
    const gradeRecords = records.filter((r) => r.gradeClass.startsWith(grade));
    const lateCount = gradeRecords.filter((r) => r.ruleTitle.includes('สาย')).length;

    return {
      grade,
      studentCount: count,
      avgScore: avg,
      infractionCount: gradeRecords.filter((r) => r.scoreDelta < 0).length,
      lateCount,
    };
  });

  const handleExportFullReport = () => {
    const headers = [
      'เลขประจำตัว',
      'คำนำหน้า',
      'ชื่อ',
      'นามสกุล',
      'ระดับชั้น',
      'ห้อง',
      'เลขที่',
      'คะแนนคงเหลือ',
      'สถานะความเสี่ยง',
      'มาสายสะสม (ครั้ง)',
      'ผู้ปกครอง',
      'เบอร์โทรศัพท์ผู้ปกครอง',
    ];

    const rows = students.map((s) => {
      const risk = getRiskDetails(calculateRiskLevel(s.currentScore, s.consecutiveLateCount));
      return [
        s.id,
        s.prefix,
        s.firstName,
        s.lastName,
        s.gradeLevel,
        s.classroom,
        s.studentNumber,
        s.currentScore,
        risk.label,
        s.consecutiveLateCount,
        s.parentName,
        s.parentPhone,
      ];
    });

    downloadCSV('รายงานสรุปสารสนเทศความประพฤติโรงเรียนมัธยมฐานบินกำแพงแสน.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner for Admin */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-400 text-slate-950">
              Admin Executive Dashboard
            </span>
            <span className="text-xs text-blue-200">ระบบสารสนเทศฝ่ายปกครอง</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            สรุปข้อมูลสารสนเทศและสถิติภาพรวมความประพฤติ
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            โรงเรียนมัธยมฐานบินกำแพงแสน • คะแนนตั้งต้น 100 คะแนน • เกณฑ์ระดับความเสี่ยงตามระเบียบโรงเรียน
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportFullReport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export ข้อมูลสรุป (CSV)</span>
          </button>

          <button
            onClick={onOpenRecordModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>+ บันทึกความประพฤติใหม่</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>นักเรียนทั้งหมดในระบบ</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-400">คน</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ระดับชั้น ม.1 ถึง ม.6</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>คะแนนเฉลี่ยทั้งโรงเรียน</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{avgScore}</span>
            <span className="text-xs text-slate-400">/ 100 คะแนน</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">เกณฑ์มาตรฐานวินัยเชิงบวก</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>นักเรียนมาสาย (สัปดาห์นี้)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{weekLateRecords.length}</span>
            <span className="text-xs text-slate-400">ครั้ง</span>
            <span className="text-[11px] text-slate-500 font-normal">
              (วันนี้: {todayLateRecords.length})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ตรวจหน้าประตูโรงเรียน 07.50 น.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>กลุ่มนักเรียนเสี่ยง (Top Risk)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">{riskStudents.length}</span>
            <span className="text-xs text-slate-400">คน</span>
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">
            คะแนน &lt; 80 หรือมาสาย ≥ 3 ครั้ง
          </p>
        </div>
      </div>

      {/* Top 3 Infractions & Grade Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Infractions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">3 อันดับความผิดที่พบบ่อยที่สุด</h3>
              <p className="text-xs text-slate-500">สถิติสะสมภาคเรียนปัจจุบัน</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
              ฝ่ายปกครอง
            </span>
          </div>

          <div className="space-y-3">
            {topInfractions.map(([title, data], index) => {
              const maxCount = topInfractions[0]?.[1]?.count || 1;
              const percentage = Math.round((data.count / maxCount) * 100);

              return (
                <div key={title} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                        index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{title}</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">{data.count} ครั้ง</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-blue-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>หมวด: {data.category}</span>
                    <span>หักคะแนนรวม: -{data.totalDeducted} คะแนน</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Breakdown Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">สถิติเปรียบเทียบตามระดับชั้น (ม.1 - ม.6)</h3>
              <p className="text-xs text-slate-500">คะแนนเฉลี่ย จำนวนการทำผิดระเบียบ และการมาสาย</p>
            </div>
            <span className="text-xs text-blue-600 font-semibold">
              จัดอันดับตามความเรียบร้อย
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ระดับชั้น</th>
                  <th className="py-2.5 px-3 text-center">จำนวนนักเรียน</th>
                  <th className="py-2.5 px-3 text-center">คะแนนเฉลี่ย</th>
                  <th className="py-2.5 px-3 text-center">การทำผิดระเบียบ</th>
                  <th className="py-2.5 px-3 text-center">การมาสาย</th>
                  <th className="py-2.5 px-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradeStats.map((item) => {
                  const avg = Number(item.avgScore);
                  return (
                    <tr key={item.grade} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">ชั้น {item.grade}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{item.studentCount} คน</td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-700">{item.avgScore}</td>
                      <td className="py-2.5 px-3 text-center text-rose-600 font-semibold">{item.infractionCount} ครั้ง</td>
                      <td className="py-2.5 px-3 text-center text-amber-600 font-semibold">{item.lateCount} ครั้ง</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          avg >= 85 ? 'bg-emerald-100 text-emerald-800' :
                          avg >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {avg >= 85 ? 'เรียบร้อยดี' : avg >= 75 ? 'ปานกลาง' : 'ต้องเฝ้าระวัง'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Risk Students Table with Direct Actions (Report / Notice) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
              <h3 className="font-bold text-slate-900 text-base">
                รายชื่อกลุ่มนักเรียนเสี่ยง (Top Risk Students)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              เกณฑ์: คะแนนคงเหลือต่ำกว่า 80 คะแนน หรือมีสถิติมาสายสะสมตั้งแต่ 3 ครั้งขึ้นไป
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            พบ {riskStudents.length} คนที่ต้องดำเนินการ
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">เลขประจำตัว</th>
                <th className="py-3 px-3">ชื่อ - นามสกุล</th>
                <th className="py-3 px-3">ชั้น / ห้อง</th>
                <th className="py-3 px-3 text-center">คะแนนคงเหลือ</th>
                <th className="py-3 px-3 text-center">มาสายสะสม</th>
                <th className="py-3 px-3">ระดับความเสี่ยง / มาตรการ</th>
                <th className="py-3 px-3 text-right">การจัดการ & เอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {riskStudents.map((student) => {
                const riskLevel = calculateRiskLevel(student.currentScore, student.consecutiveLateCount);
                const risk = getRiskDetails(riskLevel);

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {student.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {student.prefix}{student.firstName} {student.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ผู้ปกครอง: {student.parentName}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      ม.{student.gradeLevel.replace('ม.', '')}/{student.classroom} (เลขที่ {student.studentNumber})
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-sm font-black ${
                        student.currentScore < 60 ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        {student.currentScore}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-0.5">/100</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        student.consecutiveLateCount >= 3 ? 'bg-amber-100 text-amber-800' : 'text-slate-600'
                      }`}>
                        {student.consecutiveLateCount} ครั้ง
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${risk.badgeBg}`}>
                        {risk.label}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {risk.action}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium"
                          title="ดูประวัติความประพฤติ"
                        >
                          ประวัติ
                        </button>

                        {/* Individual Behavior Report Button (Prompt requirement!) */}
                        <button
                          onClick={() => onOpenReport(student)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs"
                          title="ออกรายงานพฤติกรรมรายบุคคล"
                        >
                          <FileText className="w-3 h-3" />
                          <span>รายงานรายบุคคล</span>
                        </button>

                        <button
                          onClick={() => onOpenParentNotice(student)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs"
                          title="ออกหนังสือเชิญผู้ปกครอง"
                        >
                          <Mail className="w-3 h-3" />
                          <span>เชิญผู้ปกครอง</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
