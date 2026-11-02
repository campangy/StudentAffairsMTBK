import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { UserCheck, ShieldCheck, X, Check, Save } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
  isSelfEdit?: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
  isSelfEdit = false,
}) => {
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [assignedClass, setAssignedClass] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPosition(user.position || '');
      setAssignedClass(user.assignedClass || '');
      setPhone(user.phone || '');
      setUsername(user.username);
      setPassword(user.password || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onSave({
      ...user,
      fullName: fullName.trim(),
      position: position.trim(),
      assignedClass: assignedClass.trim(),
      phone: phone.trim(),
      username: username.trim(),
      password: password.trim() || user.password,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              {user.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isSelfEdit ? 'แก้ไขข้อมูลส่วนตัว / เปลี่ยนชื่อผู้ใช้งาน' : `แก้ไขข้อมูลผู้ใช้: ${user.fullName}`}
              </h3>
              <p className="text-xs text-blue-200">
                บทบาท: {user.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ครูผู้ใช้งาน'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              ชื่อ - นามสกุล (Full Name) <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="ระบุชื่อ-นามสกุล เช่น ดร.สมเกียรติ สกุลดี หรือชื่อของคุณ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              *ชื่อนี้จะแสดงในแถบด้านบน, รายงานพฤติกรรม และช่องลงนามหนังสือราชการ
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ตำแหน่ง / หน้าที่:
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="เช่น หัวหน้าฝ่ายปกครอง หรือ ครูประจำชั้น"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชั้น / ฝ่ายที่รับผิดชอบ:
              </label>
              <input
                type="text"
                value={assignedClass}
                onChange={(e) => setAssignedClass(e.target.value)}
                placeholder="เช่น ทุกระดับชั้น หรือ ม.3/1"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username):
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่าน (Password):
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              เบอร์โทรศัพท์ติดต่อ:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08X-XXX-XXXX"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
