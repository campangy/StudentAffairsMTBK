import React, { useState } from 'react';
import { InfractionRule, InfractionCategory, User } from '../types';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Award,
  ShieldAlert
} from 'lucide-react';

interface CriteriaManagementProps {
  rules: InfractionRule[];
  currentUser: User | null;
  onUpdateRule: (updatedRule: InfractionRule) => void;
  onAddRule: (newRule: Omit<InfractionRule, 'id'>) => void;
}

export const CriteriaManagement: React.FC<CriteriaManagementProps> = ({
  rules,
  currentUser,
  onUpdateRule,
  onAddRule,
}) => {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // New rule state
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<InfractionCategory>('ระเบียบวินัยและความประพฤติ');
  const [newDeduction, setNewDeduction] = useState<number>(-5);
  const [newDesc, setNewDesc] = useState('');

  const handleStartEdit = (rule: InfractionRule) => {
    setEditingRuleId(rule.id);
    setEditScore(rule.scoreDeduction);
  };

  const handleSaveEdit = (rule: InfractionRule) => {
    onUpdateRule({
      ...rule,
      scoreDeduction: editScore,
    });
    setEditingRuleId(null);
    setSuccessMessage(`อัปเดตเกณฑ์คะแนนของ "${rule.title}" เป็น ${editScore > 0 ? `+${editScore}` : editScore} คะแนน สำเร็จ`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    onAddRule({
      code: newCode.trim(),
      title: newTitle.trim(),
      category: newCategory,
      scoreDeduction: newDeduction,
      description: newDesc.trim(),
      active: true,
    });

    setIsAddModalOpen(false);
    setSuccessMessage(`เพิ่มเกณฑ์ข้อบังคับ "${newTitle.trim()}" เรียบร้อยแล้ว`);
    setNewCode('');
    setNewTitle('');
    setNewDesc('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const categories: InfractionCategory[] = [
    'การมาเรียน',
    'การแต่งกายและทรงผม',
    'ระเบียบวินัยและความประพฤติ',
    'สิ่งเสพติดและของมึนเมา',
    'ความรุนแรงและความปลอดภัย',
    'บำเพ็ญประโยชน์/คืนคะแนน',
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-400 text-slate-950">
              Admin Only
            </span>
            <span className="text-xs text-blue-200">ระเบียบงานฝ่ายปกครอง</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            กำหนดและแก้ไขเกณฑ์การตัด/เพิ่มคะแนนความประพฤติ
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            คะแนนตั้งต้นนักเรียนทุกคน 100 คะแนน • กำหนดฐานความผิดและสัดส่วนคะแนนตามระเบียบโรงเรียน
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มเกณฑ์ความผิดใหม่</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">
          รายการเกณฑ์และฐานความผิดในระบบ ({rules.length} เกณฑ์)
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">รหัสเกณฑ์</th>
                <th className="py-3 px-3">รายการฐานความผิด / กิจกรรม</th>
                <th className="py-3 px-3">หมวดหมู่</th>
                <th className="py-3 px-3 text-center w-36">คะแนนตัด/เพิ่ม</th>
                <th className="py-3 px-3">คำอธิบาย</th>
                <th className="py-3 px-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rules.map((rule) => {
                const isEditing = editingRuleId === rule.id;

                return (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                      {rule.code}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {rule.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {rule.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={editScore}
                            onChange={(e) => setEditScore(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs border border-blue-500 rounded font-bold font-mono text-center"
                          />
                          <button
                            onClick={() => handleSaveEdit(rule)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="บันทึก"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingRuleId(null)}
                            className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                            title="ยกเลิก"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`font-mono font-bold text-xs ${
                          rule.scoreDeduction > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {rule.scoreDeduction > 0 ? `+${rule.scoreDeduction}` : rule.scoreDeduction} คะแนน
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                      {rule.description || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(rule)}
                          className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>แก้ไขคะแนน</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">เพิ่มเกณฑ์ฐานความผิดใหม่</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="p-6 space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสเกณฑ์ (Code):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น DISC-11"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คะแนนที่ตัด/เพิ่ม:
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="เช่น -5 หรือ +5"
                    value={newDeduction}
                    onChange={(e) => setNewDeduction(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อฐานความผิด / กิจกรรม:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ทิ้งขยะไม่ถูกที่ หรือ ไม่เข้าแถวสวดมนต์"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมวดหมู่:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as InfractionCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คำอธิบายระเบียบเพิ่มเติม:
                </label>
                <textarea
                  rows={2}
                  placeholder="รายละเอียดพฤติกรรม ข้อห้าม หรือเงื่อนไข"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  บันทึกเกณฑ์ใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
