import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, UserCheck, KeyRound, AlertCircle, X, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  users: User[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  users,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'teacher'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin2512');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUser = username.trim();
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      setErrorMessage('ชื่อผู้ใช้งาน (Username) หรือรหัสผ่าน (Password) ไม่ถูกต้อง');
      return;
    }

    if (activeTab === 'admin' && foundUser.role !== 'admin') {
      setErrorMessage('บัญชีนี้ไม่ใช่สิทธิ์ผู้ดูแลระบบ (Admin) กรุณาเลือกแท็บครูผู้ใช้งาน');
      return;
    }

    onLogin(foundUser);
    onClose();
  };

  const handleQuickLogin = (targetUser: User) => {
    onLogin(targetUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">เข้าสู่ระบบฝ่ายปกครอง</h2>
              <p className="text-xs text-blue-200">โรงเรียนมัธยมฐานบินกำแพงแสน</p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setUsername('admin');
              setPassword('admin2512');
              setErrorMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'bg-white text-blue-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            ผู้ดูแลระบบ (Admin)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('teacher');
              setUsername('teacher1');
              setPassword('pass1234');
              setErrorMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
              activeTab === 'teacher'
                ? 'bg-white text-blue-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            ครูผู้ใช้งาน (Teacher)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="เช่น admin หรือ teacher1"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
          >
            เข้าสู่ระบบ
          </button>

          {/* Quick Login Chips for rapid testing / reviewer convenience */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>เข้าใช้งานด่วนด้วยบัญชีจำลอง (Quick Demo Login):</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    {u.role === 'admin' ? (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                    )}
                    <span className="font-medium text-slate-800 truncate">{u.fullName}</span>
                    <span className="text-slate-400 text-[10px]">({u.role === 'admin' ? 'Admin' : u.position})</span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded shrink-0">
                    {u.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
