import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  X,
  Search,
  Phone,
  School,
  Edit3
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User | null;
  onAddUser: (newUser: Omit<User, 'id' | 'createdAt'>) => void;
  onDeleteUser: (userId: string) => void;
  onResetPassword: (userId: string, newPass: string) => void;
  onEditUser?: (user: User) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  onAddUser,
  onDeleteUser,
  onResetPassword,
  onEditUser,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // New user form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('teacher_discipline');
  const [position, setPosition] = useState('ครูฝ่ายปกครอง');
  const [assignedClass, setAssignedClass] = useState('ฝ่ายปกครอง');
  const [phone, setPhone] = useState('');

  // Password reset modal state
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !password) return;

    // Check duplicate username
    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      alert('ชื่อผู้ใช้งาน (Username) นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น');
      return;
    }

    onAddUser({
      fullName: fullName.trim(),
      username: username.trim(),
      password: password.trim(),
      role,
      position: position.trim(),
      assignedClass: assignedClass.trim() || 'ทุกระดับชั้น',
      phone: phone.trim(),
    });

    setSuccessMessage(`สร้าง Account สำหรับครู "${fullName.trim()}" เรียบร้อยแล้ว`);
    setIsAddModalOpen(false);

    // Reset form
    setFullName('');
    setUsername('');
    setPassword('');
    setPhone('');

    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPasswordInput) return;
    onResetPassword(resetTargetUser.id, newPasswordInput);
    setSuccessMessage(`รีเซ็ตรหัสผ่านสำหรับ ${resetTargetUser.fullName} สำเร็จ`);
    setResetTargetUser(null);
    setNewPasswordInput('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-400 text-slate-950">
              Admin Only
            </span>
            <span className="text-xs text-blue-200">ระบบจัดการสิทธิ์ผู้ใช้งาน</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            จัดการบัญชีผู้ใช้งานครู (User Management)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            สร้าง/แก้ไข/ลบ สิทธิ์เข้าใช้งานของครูฝ่ายปกครอง ครูเวร และครูประจำชั้น
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ สร้าง Account ครูใหม่</span>
        </button>
      </div>

      {/* Success alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* User Search & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 text-sm">
            รายชื่อบัญชีผู้ใช้งานทั้งหมดในระบบ ({users.length} บัญชี)
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ Username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">ชื่อ - นามสกุล</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">บทบาทในระบบ</th>
                <th className="py-3 px-3">ตำแหน่ง / ชั้นที่รับผิดชอบ</th>
                <th className="py-3 px-3">เบอร์ติดต่อ</th>
                <th className="py-3 px-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                    {u.role === 'admin' ? (
                      <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    )}
                    <span>{u.fullName}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-blue-700 font-bold">
                    {u.username}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'admin' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}>
                      {u.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ครูผู้ใช้งาน (Teacher)'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div>{u.position}</div>
                    <div className="text-[10px] text-slate-400">ชั้น: {u.assignedClass || '-'}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">
                    {u.phone || '-'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onEditUser && (
                        <button
                          onClick={() => onEditUser(u)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs"
                          title="แก้ไขข้อมูล / เปลี่ยนชื่อ-นามสกุล"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setResetTargetUser(u);
                          setNewPasswordInput('');
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs"
                        title="เปลี่ยนรหัสผ่าน"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      {u.role !== 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบบัญชีของ "${u.fullName}" หรือไม่?`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                          title="ลบบัญชีผู้ใช้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">สร้าง Account สำหรับครูผู้ใช้งานใหม่</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ - นามสกุลครู:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ครูสมจิต ปัญญางาม"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น teacher4"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสผ่าน (Password):
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  บทบาทหน้าที่:
                </label>
                <select
                  value={role}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setRole(r);
                    if (r === 'teacher_discipline') setPosition('ครูฝ่ายปกครอง');
                    if (r === 'teacher_homeroom') setPosition('ครูประจำชั้น');
                    if (r === 'teacher_duty') setPosition('ครูเวรประจำวัน');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="teacher_discipline">ครูฝ่ายปกครอง (Discipline Staff)</option>
                  <option value="teacher_homeroom">ครูประจำชั้น (Homeroom Teacher)</option>
                  <option value="teacher_duty">ครูเวรประจำวัน / สารวัตรนักเรียน</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ตำแหน่ง / รายละเอียด:
                  </label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="เช่น ครูประจำชั้น ม.2/1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชั้นที่รับผิดชอบ:
                  </label>
                  <input
                    type="text"
                    value={assignedClass}
                    onChange={(e) => setAssignedClass(e.target.value)}
                    placeholder="เช่น ม.2/1 หรือ ทุกระดับชั้น"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ (ถ้ามี):
                </label>
                <input
                  type="text"
                  placeholder="08X-XXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  บันทึกสร้าง Account ครู
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">รีเซ็ตรหัสผ่าน: {resetTargetUser.fullName}</h3>
              <button onClick={() => setResetTargetUser(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConfirmReset} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่านใหม่:
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  ยืนยันรหัสผ่านใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
