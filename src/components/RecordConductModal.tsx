import React, { useState, useEffect } from 'react';
import { Student, InfractionRule, User, ConductRecord } from '../types';
import { calculateRiskLevel, getRiskDetails } from '../utils/helpers';
import { X, ShieldAlert, Award, AlertCircle, Check, Users, Sparkles } from 'lucide-react';

interface RecordConductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (
    studentIds: string[],
    rule: InfractionRule,
    customScoreDelta?: number,
    location?: string,
    note?: string
  ) => void;
  students: Student[];
  rules: InfractionRule[];
  currentUser: User | null;
  targetStudent?: Student | null;
}

export const RecordConductModal: React.FC<RecordConductModalProps> = ({
  isOpen,
  onClose,
  onSaveRecord,
  students,
  rules,
  currentUser,
  targetStudent,
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ทั้งหมด');
  const [customDelta, setCustomDelta] = useState<string>('');
  const [location, setLocation] = useState<string>('โรงเรียนมัธยมฐานบินกำแพงแสน');
  const [note, setNote] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);

  useEffect(() => {
    if (targetStudent) {
      setSelectedStudentIds([targetStudent.id]);
      setIsBulkMode(false);
    } else if (students.length > 0 && selectedStudentIds.length === 0) {
      setSelectedStudentIds([students[0].id]);
    }

    if (rules.length > 0 && !selectedRuleId) {
      setSelectedRuleId(rules[0].id);
    }
  }, [targetStudent, students, rules]);

  if (!isOpen) return null;

  const selectedRule = rules.find((r) => r.id === selectedRuleId) || rules[0];
  const deltaValue = customDelta !== '' ? Number(customDelta) : (selectedRule?.scoreDeduction ?? -5);

  const categories = ['ทั้งหมด', ...Array.from(new Set(rules.map((r) => r.category)))];
  const filteredRules = categoryFilter === 'ทั้งหมด' 
    ? rules 
    : rules.filter((r) => r.category === categoryFilter);

  const filteredStudents = students.filter(
    (s) =>
      s.id.includes(searchTerm) ||
      `${s.prefix}${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.gradeLevel}/${s.classroom}`.includes(searchTerm)
  );

  const handleToggleStudent = (id: string) => {
    if (isBulkMode) {
      if (selectedStudentIds.includes(id)) {
        setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
      } else {
        setSelectedStudentIds([...selectedStudentIds, id]);
      }
    } else {
      setSelectedStudentIds([id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0 || !selectedRule) return;

    onSaveRecord(
      selectedStudentIds,
      selectedRule,
      customDelta !== '' ? Number(customDelta) : undefined,
      location,
      note
    );

    // Reset fields & close
    setNote('');
    setCustomDelta('');
    onClose();
  };

  // Preview target student calculation (if single student)
  const singleStudent = selectedStudentIds.length === 1 
    ? students.find((s) => s.id === selectedStudentIds[0]) 
    : null;

  const prevScore = singleStudent?.currentScore ?? 100;
  const newProjectedScore = Math.max(0, Math.min(100, prevScore + deltaValue));
  const newRisk = calculateRiskLevel(newProjectedScore, (singleStudent?.consecutiveLateCount || 0) + (selectedRule?.title.includes('สาย') ? 1 : 0));
  const riskMeta = getRiskDetails(newRisk);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          deltaValue >= 0 ? 'bg-emerald-800' : 'bg-slate-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              deltaValue >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {deltaValue >= 0 ? <Award className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {deltaValue >= 0 ? 'บันทึกบำเพ็ญประโยชน์ / เพิ่มคะแนนคืน' : 'บันทึกการกระทำผิดระเบียบ / ตัดคะแนนความประพฤติ'}
              </h3>
              <p className="text-xs text-slate-300">
                ผู้บันทึก: {currentUser?.fullName || 'ครูฝ่ายปกครอง'} ({currentUser?.position})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Mode Switch: Single vs Bulk */}
          {!targetStudent && (
            <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
              <span className="text-slate-600 pl-2">รูปแบบการบันทึก:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setIsBulkMode(false)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    !isBulkMode ? 'bg-white shadow text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  นักเรียนรายบุคคล (1 คน)
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkMode(true)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    isBulkMode ? 'bg-white shadow text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  บันทึกเป็นกลุ่ม (เช่น มาสายหลายคน)
                </button>
              </div>
            </div>
          )}

          {/* Student Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isBulkMode ? `เลือกนักเรียน (เลือกแล้ว ${selectedStudentIds.length} คน):` : 'เลือกนักเรียนที่ต้องการบันทึก:'}
              </label>
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือ รหัส..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs px-2.5 py-1 border border-slate-300 rounded-lg w-44 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
              {filteredStudents.map((s) => {
                const isSelected = selectedStudentIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => handleToggleStudent(s.id)}
                    className={`p-2 px-3 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-mono font-bold text-slate-800">{s.id}</span>
                      <span className="text-slate-900">{s.prefix}{s.firstName} {s.lastName}</span>
                      <span className="text-slate-500 text-[11px]">(ม.{s.gradeLevel.replace('ม.', '')}/{s.classroom})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                        s.currentScore >= 80 ? 'text-emerald-700 bg-emerald-100' :
                        s.currentScore >= 60 ? 'text-amber-700 bg-amber-100' : 'text-rose-700 bg-rose-100'
                      }`}>
                        {s.currentScore} คะแนน
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Filter & Rule Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">ฐานความผิด / รายการเกณฑ์:</label>
              <div className="flex gap-1 overflow-x-auto text-[11px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-full transition-colors whitespace-nowrap ${
                      categoryFilter === cat
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <select
              value={selectedRuleId}
              onChange={(e) => {
                setSelectedRuleId(e.target.value);
                setCustomDelta('');
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filteredRules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  [{rule.code}] {rule.title} ({rule.scoreDeduction > 0 ? `+${rule.scoreDeduction}` : rule.scoreDeduction} คะแนน)
                </option>
              ))}
            </select>
          </div>

          {/* Points deduction & Location row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                คะแนนที่ตัด / เพิ่ม (แก้ไขได้):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customDelta !== '' ? customDelta : selectedRule?.scoreDeduction || -5}
                  onChange={(e) => setCustomDelta(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-500 shrink-0">คะแนน</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                *ค่ามาตรฐานของเกณฑ์คือ: {selectedRule?.scoreDeduction > 0 ? `+${selectedRule?.scoreDeduction}` : selectedRule?.scoreDeduction} คะแนน
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานที่เกิดเหตุ / จุดตรวจ:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น ประตู 1, ลานเคารพธงชาติ, ห้องน้ำชาย"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes / Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / พฤติกรรมที่พบ / สิ่งของที่ตรวจยึด:
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุข้อเท็จจริงเพิ่มเติม เช่น ตักเตือนแล้วยังไม่แก้ไข, ของกลางส่งมอบฝ่ายปกครองแล้ว ฯลฯ"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Impact preview */}
          {singleStudent && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500">ผลการประเมินคะแนน:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-slate-700">{prevScore} คะแนน</span>
                  <span className="text-slate-400">➔</span>
                  <span className={`font-bold text-sm ${
                    deltaValue >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {newProjectedScore} คะแนน ({deltaValue >= 0 ? `+${deltaValue}` : deltaValue})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-500 text-[11px]">ระดับความเสี่ยงใหม่:</span>
                <div className={`mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${riskMeta.badgeBg}`}>
                  {riskMeta.label}
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={selectedStudentIds.length === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                deltaValue >= 0 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              } disabled:opacity-50`}
            >
              บันทึกข้อมูล ({selectedStudentIds.length} คน)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
