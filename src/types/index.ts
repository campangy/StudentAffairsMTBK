export type UserRole = 'admin' | 'teacher_discipline' | 'teacher_homeroom' | 'teacher_duty';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  position: string;
  assignedClass?: string; // เช่น 'ม.2/1', 'ทุกระดับชั้น'
  phone?: string;
  createdAt: string;
}

export type InfractionCategory = 
  | 'การมาเรียน'
  | 'การแต่งกายและทรงผม'
  | 'ระเบียบวินัยและความประพฤติ'
  | 'สิ่งเสพติดและของมึนเมา'
  | 'ความรุนแรงและความปลอดภัย'
  | 'บำเพ็ญประโยชน์/คืนคะแนน';

export interface InfractionRule {
  id: string;
  code: string;
  title: string;
  category: InfractionCategory;
  scoreDeduction: number; // ลบเช่น -5, -10 หรือบวกเช่น +5 (กรณีบำเพ็ญประโยชน์)
  description?: string;
  active: boolean;
}

export type RiskLevel = 'excellent' | 'low_risk' | 'medium_risk' | 'high_risk';

export interface Student {
  id: string; // เลขประจำตัว 5 หลัก เช่น 45101
  prefix: string; // ด.ช., ด.ญ., นาย, น.ส.
  firstName: string;
  lastName: string;
  gradeLevel: 'ม.1' | 'ม.2' | 'ม.3' | 'ม.4' | 'ม.5' | 'ม.6';
  classroom: string; // ห้อง เช่น '1', '2', '3'
  studentNumber: number; // เลขที่
  currentScore: number; // คะแนนคงเหลือ (เริ่มต้น 100)
  phone?: string;
  parentName: string;
  parentPhone: string;
  consecutiveLateCount: number;
  avatarUrl?: string;
}

export interface ConductRecord {
  id: string;
  studentId: string;
  studentName: string;
  gradeClass: string; // เช่น 'ม.2/1'
  ruleId: string;
  ruleTitle: string;
  category: InfractionCategory;
  scoreDelta: number; // เช่น -5, +5
  previousScore: number;
  newScore: number;
  recordedAt: string; // ISO String
  recordedByTeacherId: string;
  recordedByTeacherName: string;
  location?: string;
  note?: string;
  evidenceUrl?: string;
}
