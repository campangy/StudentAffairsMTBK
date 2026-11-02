import React, { useState, useEffect } from 'react';
import { User, Student, ConductRecord, InfractionRule } from './types';
import { storage } from './utils/storage';
import { calculateRiskLevel } from './utils/helpers';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentSearch } from './components/StudentSearch';
import { MorningGateDuty } from './components/MorningGateDuty';
import { RiskManagementView } from './components/RiskManagementView';
import { UserManagement } from './components/UserManagement';
import { CriteriaManagement } from './components/CriteriaManagement';
import { IndividualBehaviorReportModal } from './components/IndividualBehaviorReportModal';
import { StudentConductModal } from './components/StudentConductModal';
import { OfficialParentNoticeModal } from './components/OfficialParentNoticeModal';
import { RecordConductModal } from './components/RecordConductModal';
import { EditUserModal } from './components/EditUserModal';
import { 
  ShieldCheck, 
  RotateCcw, 
  School, 
  CheckCircle2, 
  Sparkles,
  FileText
} from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [rules, setRules] = useState<InfractionRule[]>(() => storage.getRules());
  const [students, setStudents] = useState<Student[]>(() => storage.getStudents());
  const [records, setRecords] = useState<ConductRecord[]>(() => storage.getRecords());
  
  // Default to admin account (dr. somkiat) so user can immediately test everything
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = storage.getCurrentUser();
    if (saved) return saved;
    const adminUser = storage.getUsers().find((u) => u.username === 'admin');
    return adminUser || null;
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    return currentUser?.role === 'admin' ? 'dashboard' : 'search';
  });

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [studentForDetail, setStudentForDetail] = useState<Student | null>(null);
  const [studentForReport, setStudentForReport] = useState<Student | null>(null);
  const [studentForParentNotice, setStudentForParentNotice] = useState<Student | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordTargetStudent, setRecordTargetStudent] = useState<Student | null>(null);
  const [actionNotice, setActionNotice] = useState<string>('');

  // Persist current user on change
  useEffect(() => {
    storage.saveCurrentUser(currentUser);
    if (currentUser?.role !== 'admin' && (currentTab === 'dashboard' || currentTab === 'users' || currentTab === 'rules')) {
      setCurrentTab('search');
    }
  }, [currentUser]);

  // Flash action notification
  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 4000);
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    notify(`เข้าสู่ระบบในชื่อ ${user.fullName} (${user.role === 'admin' ? 'Admin' : 'ครูผู้ใช้งาน'}) เรียบร้อย`);
    if (user.role === 'admin') {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('search');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    notify('ออกจากระบบเรียบร้อย');
    setIsLoginModalOpen(true);
  };

  // Record Conduct (Single or Batch)
  const handleSaveRecord = (
    studentIds: string[],
    rule: InfractionRule,
    customScoreDelta?: number,
    location?: string,
    note?: string
  ) => {
    const delta = customScoreDelta !== undefined ? customScoreDelta : rule.scoreDeduction;
    const nowIso = new Date().toISOString();

    const newRecordsList: ConductRecord[] = [];
    const updatedStudents = students.map((student) => {
      if (!studentIds.includes(student.id)) return student;

      const prev = student.currentScore;
      const next = Math.max(0, Math.min(100, prev + delta));
      const isLateRule = rule.title.includes('สาย') || rule.category === 'การมาเรียน' && rule.title.includes('สาย');
      const newLateCount = isLateRule && delta < 0 
        ? student.consecutiveLateCount + 1 
        : student.consecutiveLateCount;

      const newRecord: ConductRecord = {
        id: `rec_${Date.now()}_${student.id}`,
        studentId: student.id,
        studentName: `${student.prefix}${student.firstName} ${student.lastName}`,
        gradeClass: `ม.${student.gradeLevel.replace('ม.', '')}/${student.classroom}`,
        ruleId: rule.id,
        ruleTitle: rule.title,
        category: rule.category,
        scoreDelta: delta,
        previousScore: prev,
        newScore: next,
        recordedAt: nowIso,
        recordedByTeacherId: currentUser?.id || 'admin',
        recordedByTeacherName: currentUser?.fullName || 'ฝ่ายปกครอง',
        location: location || 'โรงเรียนมัธยมฐานบินกำแพงแสน',
        note: note || '',
      };

      newRecordsList.push(newRecord);

      return {
        ...student,
        currentScore: next,
        consecutiveLateCount: newLateCount,
      };
    });

    const combinedRecords = [...newRecordsList, ...records];
    setStudents(updatedStudents);
    setRecords(combinedRecords);
    storage.saveStudents(updatedStudents);
    storage.saveRecords(combinedRecords);

    // If modal currently has selected student, update state
    if (studentForDetail && studentIds.includes(studentForDetail.id)) {
      const updatedTarget = updatedStudents.find((s) => s.id === studentForDetail.id) || null;
      setStudentForDetail(updatedTarget);
    }

    notify(`บันทึกข้อมูลเรียบร้อยสำหรับนักเรียน ${studentIds.length} คน (${delta > 0 ? `+${delta}` : delta} คะแนน)`);
  };

  // Quick 1-tap late from morning gate duty
  const handleRecordQuickLate = (studentId: string, ruleId: string, note?: string) => {
    const rule = rules.find((r) => r.id === ruleId) || rules[0];
    handleSaveRecord([studentId], rule, undefined, 'ประตู 1 หน้าโรงเรียน', note);
  };

  // Delete a record (Admin only)
  const handleDeleteRecord = (recordId: string) => {
    const targetRec = records.find((r) => r.id === recordId);
    if (!targetRec) return;

    if (!confirm(`คุณต้องการลบประวัติ "${targetRec.ruleTitle}" และคืนคะแนนให้นักเรียนหรือไม่?`)) {
      return;
    }

    // Revert score
    const updatedStudents = students.map((s) => {
      if (s.id !== targetRec.studentId) return s;
      const reverted = Math.max(0, Math.min(100, s.currentScore - targetRec.scoreDelta));
      const wasLate = targetRec.ruleTitle.includes('สาย');
      return {
        ...s,
        currentScore: reverted,
        consecutiveLateCount: wasLate && s.consecutiveLateCount > 0 ? s.consecutiveLateCount - 1 : s.consecutiveLateCount,
      };
    });

    const filteredRecords = records.filter((r) => r.id !== recordId);
    setStudents(updatedStudents);
    setRecords(filteredRecords);
    storage.saveStudents(updatedStudents);
    storage.saveRecords(filteredRecords);

    if (studentForDetail && studentForDetail.id === targetRec.studentId) {
      setStudentForDetail(updatedStudents.find((s) => s.id === studentForDetail.id) || null);
    }

    notify('ลบรายการบันทึกและปรับคะแนนคืนเรียบร้อย');
  };

  // User Management
  const handleAddUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const createdUser: User = {
      ...newUser,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedUsers = [...users, createdUser];
    setUsers(updatedUsers);
    storage.saveUsers(updatedUsers);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    storage.saveUsers(updatedUsers);
    notify('ลบบัญชีผู้ใช้เรียบร้อย');
  };

  const handleResetPassword = (userId: string, newPass: string) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, password: newPass } : u));
    setUsers(updatedUsers);
    storage.saveUsers(updatedUsers);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    storage.saveUsers(updatedUsers);

    // If current logged in user was modified, update active session
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      storage.saveCurrentUser(updatedUser);
    }

    // Also update any conduct records recorded by this teacher
    const updatedRecords = records.map((rec) => {
      if (rec.recordedByTeacherId === updatedUser.id) {
        return {
          ...rec,
          recordedByTeacherName: updatedUser.fullName,
        };
      }
      return rec;
    });
    setRecords(updatedRecords);
    storage.saveRecords(updatedRecords);

    notify(`บันทึกข้อมูลและเปลี่ยนชื่อเป็น "${updatedUser.fullName}" สำเร็จ`);
  };

  // Rules Management
  const handleUpdateRule = (updatedRule: InfractionRule) => {
    const updatedRules = rules.map((r) => (r.id === updatedRule.id ? updatedRule : r));
    setRules(updatedRules);
    storage.saveRules(updatedRules);
  };

  const handleAddRule = (newRule: Omit<InfractionRule, 'id'>) => {
    const rule: InfractionRule = {
      ...newRule,
      id: `rule_${Date.now()}`,
    };
    const updatedRules = [...rules, rule];
    setRules(updatedRules);
    storage.saveRules(updatedRules);
  };

  // Count risk students
  const riskCount = students.filter(
    (s) => s.currentScore < 80 || s.consecutiveLateCount >= 3
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Official Top Navigation */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onEditProfile={() => {
          if (currentUser) {
            setUserToEdit(currentUser);
            setIsEditUserModalOpen(true);
          }
        }}
        riskCount={riskCount}
      />

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* If not logged in, prompt user */}
        {!currentUser && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">กรุณาเข้าสู่ระบบเพื่อใช้งานระบบงานฝ่ายปกครอง</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Admin (Username: <strong>admin</strong> / Password: <strong>admin2512</strong>) หรือ บัญชีครูผู้ใช้งาน
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 shrink-0"
            >
              เข้าสู่ระบบทันที (Login)
            </button>
          </div>
        )}

        {/* Tab Content */}
        {currentTab === 'dashboard' && currentUser?.role === 'admin' && (
          <AdminDashboard
            students={students}
            records={records}
            rules={rules}
            currentUser={currentUser}
            onSelectStudent={(s) => setStudentForDetail(s)}
            onOpenReport={(s) => setStudentForReport(s)}
            onOpenParentNotice={(s) => setStudentForParentNotice(s)}
            onOpenRecordModal={() => {
              setRecordTargetStudent(null);
              setIsRecordModalOpen(true);
            }}
          />
        )}

        {currentTab === 'search' && (
          <StudentSearch
            students={students}
            records={records}
            currentUser={currentUser}
            onSelectStudent={(s) => setStudentForDetail(s)}
            onOpenReport={(s) => setStudentForReport(s)}
            onOpenParentNotice={(s) => setStudentForParentNotice(s)}
            onOpenRecordModal={(s, isMerit) => {
              setRecordTargetStudent(s);
              setIsRecordModalOpen(true);
            }}
          />
        )}

        {currentTab === 'gate' && (
          <MorningGateDuty
            students={students}
            records={records}
            rules={rules}
            currentUser={currentUser}
            onRecordQuickLate={handleRecordQuickLate}
            onOpenReport={(s) => setStudentForReport(s)}
          />
        )}

        {currentTab === 'risk' && (
          <RiskManagementView
            students={students}
            records={records}
            currentUser={currentUser}
            onSelectStudent={(s) => setStudentForDetail(s)}
            onOpenReport={(s) => setStudentForReport(s)}
            onOpenParentNotice={(s) => setStudentForParentNotice(s)}
          />
        )}

        {currentTab === 'users' && currentUser?.role === 'admin' && (
          <UserManagement
            users={users}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onResetPassword={handleResetPassword}
            onEditUser={(u) => {
              setUserToEdit(u);
              setIsEditUserModalOpen(true);
            }}
          />
        )}

        {currentTab === 'rules' && currentUser?.role === 'admin' && (
          <CriteriaManagement
            rules={rules}
            currentUser={currentUser}
            onUpdateRule={handleUpdateRule}
            onAddRule={handleAddRule}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200">
              โรงเรียนมัธยมฐานบินกำแพงแสน
            </span>
            <span>• ฝ่ายบริหารงานบุคคลและกลุ่มงานฝ่ายปกครอง</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>เกณฑ์ตั้งต้น 100 คะแนน</span>
            <span>•</span>
            <button
              onClick={() => {
                if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                  storage.resetAllData();
                  window.location.reload();
                }
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 underline underline-offset-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตข้อมูลตัวอย่าง</span>
            </button>
          </div>
        </div>
      </footer>

      {/* --- MODALS --- */}

      {/* 1. Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        users={users}
      />

      {/* 2. Individual Student Behavior Report Modal (Specific Prompt Requirement!) */}
      <IndividualBehaviorReportModal
        student={studentForReport}
        records={records}
        currentUser={currentUser}
        onClose={() => setStudentForReport(null)}
      />

      {/* 3. Student Conduct Detail Modal */}
      <StudentConductModal
        student={studentForDetail}
        records={records}
        currentUser={currentUser}
        onClose={() => setStudentForDetail(null)}
        onOpenReport={(s) => {
          setStudentForReport(s);
          setStudentForDetail(null);
        }}
        onOpenParentNotice={(s) => {
          setStudentForParentNotice(s);
          setStudentForDetail(null);
        }}
        onOpenRecordModal={(s) => {
          setRecordTargetStudent(s);
          setIsRecordModalOpen(true);
        }}
        onDeleteRecord={handleDeleteRecord}
      />

      {/* 4. Official Parent Invitation Letter Modal */}
      <OfficialParentNoticeModal
        student={studentForParentNotice}
        records={records}
        currentUser={currentUser}
        onClose={() => setStudentForParentNotice(null)}
      />

      {/* 5. Record Conduct / Deduct Points Modal */}
      <RecordConductModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setRecordTargetStudent(null);
        }}
        onSaveRecord={handleSaveRecord}
        students={students}
        rules={rules}
        currentUser={currentUser}
        targetStudent={recordTargetStudent}
      />

      {/* 6. Edit User / Profile Modal (เปลี่ยนชื่อ ดร.สมเกียรติ สกุลดี หรือข้อมูลผู้ใช้) */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        user={userToEdit}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setUserToEdit(null);
        }}
        onSave={handleUpdateUser}
        isSelfEdit={userToEdit?.id === currentUser?.id}
      />
    </div>
  );
}
