import React from 'react';
import { User } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  School, 
  BarChart3, 
  Search, 
  Clock, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  Calendar,
  Sparkles,
  Edit3
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onEditProfile?: () => void;
  riskCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onSelectTab,
  onLogout,
  onOpenLogin,
  onEditProfile,
  riskCount,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 no-print border-b border-slate-800">
      {/* Top Banner with Official School Identity */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-4 py-2 text-xs border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-600/30 text-blue-300 border border-blue-500/30">
              สังกัด สพม.สุพรรณบุรี นครปฐม
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-300">กลุ่มบริหารงานบุคคลและฝ่ายปกครอง</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <div className="flex items-center gap-1.5 text-amber-300/90 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>ภาคเรียนที่ 2 ปีการศึกษา 2569</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-slate-400">
              เกณฑ์คะแนนตั้งต้น: <span className="text-emerald-400 font-bold">100 คะแนน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* School Logo & Title */}
        <div 
          onClick={() => onSelectTab(isAdmin ? 'dashboard' : 'search')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black text-xl border border-amber-300 group-hover:scale-105 transition-transform">
            <School className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight text-white leading-tight">
                โรงเรียนมัธยมฐานบินกำแพงแสน
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                ฝ่ายปกครอง
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-none mt-1">
              ระบบสารสนเทศและการบันทึกความประพฤตินักเรียน
            </p>
          </div>
        </div>

        {/* User Account & Login Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
              <div 
                onClick={onEditProfile}
                title="คลิกเพื่อแก้ไขข้อมูลส่วนตัว / เปลี่ยนชื่อ"
                className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 cursor-pointer flex items-center justify-center font-bold text-white text-sm shadow transition-colors"
              >
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                ) : (
                  <UserCheck className="w-5 h-5 text-white" />
                )}
              </div>
              <div 
                onClick={onEditProfile}
                className="text-left cursor-pointer group"
                title="คลิกเพื่อแก้ไขข้อมูลส่วนตัว / เปลี่ยนชื่อ"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white leading-tight group-hover:text-amber-300 transition-colors">
                    {currentUser.fullName}
                  </span>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-amber-300 transition-colors" />
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    currentUser.role === 'admin' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' 
                      : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                  }`}>
                    {currentUser.role === 'admin' ? 'Admin' : 'ครูผู้ใช้งาน'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight truncate max-w-[200px]">
                  {currentUser.position}
                </p>
              </div>

              {onEditProfile && (
                <button
                  onClick={onEditProfile}
                  title="แก้ไขข้อมูลส่วนตัว / เปลี่ยนชื่อผู้ใช้งาน"
                  className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-700/60 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onLogout}
                title="ออกจากระบบ"
                className="ml-1 p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <UserCheck className="w-4 h-4" />
              เข้าสู่ระบบ (Login)
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-800 bg-slate-900/90 px-4 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-sm">
          {isAdmin && (
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>ภาพรวมสารสนเทศ (Admin Dashboard)</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('search')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              currentTab === 'search'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>ค้นหาและบันทึกความประพฤติ</span>
          </button>

          <button
            onClick={() => onSelectTab('gate')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              currentTab === 'gate'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>ครูเวรหน้าประตู / ตรวจมาสาย</span>
          </button>

          <button
            onClick={() => onSelectTab('risk')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap relative ${
              currentTab === 'risk'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>กลุ่มนักเรียนเสี่ยง & พิมพ์รายงาน</span>
            {riskCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {riskCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onSelectTab('users')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  currentTab === 'users'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>จัดการสิทธิ์ครูผู้ใช้งาน</span>
              </button>

              <button
                onClick={() => onSelectTab('rules')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  currentTab === 'rules'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>เกณฑ์การตัดคะแนน</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
