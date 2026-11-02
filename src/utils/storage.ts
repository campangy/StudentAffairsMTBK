import { User, InfractionRule, Student, ConductRecord } from '../types';
import { INITIAL_USERS, INITIAL_RULES, INITIAL_STUDENTS, INITIAL_CONDUCT_RECORDS } from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'mtbk_conduct_users_v1',
  RULES: 'mtbk_conduct_rules_v1',
  STUDENTS: 'mtbk_conduct_students_v1',
  RECORDS: 'mtbk_conduct_records_v1',
  CURRENT_USER: 'mtbk_current_user_v1',
};

export const storage = {
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },
  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getRules(): InfractionRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      return data ? JSON.parse(data) : INITIAL_RULES;
    } catch {
      return INITIAL_RULES;
    }
  },
  saveRules(rules: InfractionRule[]) {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  },

  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  },
  saveStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getRecords(): ConductRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return data ? JSON.parse(data) : INITIAL_CONDUCT_RECORDS;
    } catch {
      return INITIAL_CONDUCT_RECORDS;
    }
  },
  saveRecords(records: ConductRecord[]) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(INITIAL_RULES));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_CONDUCT_RECORDS));
  },
};
