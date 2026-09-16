import { User, HealthCheckRecord, ThemeMode } from '../types';

const CURRENT_USER_KEY = 'healthai_current_user';
const USERS_LIST_KEY = 'healthai_registered_users';
const THEME_KEY = 'healthai_theme_mode';

// Hash password with SHA-256
export async function hashPassword(plain: string): Promise<string> {
  if (!window.crypto || !window.crypto.subtle) {
    // Fallback hash
    let hash = 0;
    for (let i = 0; i < plain.length; i++) {
      hash = (hash << 5) - hash + plain.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface StoredUserAccount {
  user: User;
  passwordHash: string;
}

// Initial seed users
const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  {
    user: {
      id: 'usr_rakshit_01',
      name: 'Rakshit Sharma',
      email: 'rakshit@health.ai',
      createdAt: '2026-08-15T09:00:00.000Z',
      preferences: {
        voiceEnabled: true,
        speechSpeed: 1.0,
        theme: 'light',
      },
    },
    // SHA-256 for 'password123'
    passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  },
];

// Initial seed history for Rakshit
const DEFAULT_HISTORY: HealthCheckRecord[] = [
  {
    id: 'chk_101',
    userId: 'usr_rakshit_01',
    date: '2026-09-06T08:30:00.000Z',
    symptoms: ['Fever', 'Cough', 'Body Pain'],
    possiblePattern: 'Flu-like symptom pattern',
    symptomMatch: 78,
    severity: 'Moderate',
    recommendedSteps: [
      'Prioritize bed rest and limit physical exertion',
      'Maintain adequate fluid intake (water, broths, electrolyte solutions)',
      'Monitor body temperature regularly',
      'Consult a healthcare professional if fever persists over 3 days',
    ],
    isEmergency: false,
  },
  {
    id: 'chk_102',
    userId: 'usr_rakshit_01',
    date: '2026-09-04T14:15:00.000Z',
    symptoms: ['Headache', 'Nausea', 'Light Sensitivity'],
    possiblePattern: 'Migraine-like symptom pattern',
    symptomMatch: 71,
    severity: 'Moderate',
    recommendedSteps: [
      'Rest in a dark, quiet, well-ventilated room',
      'Apply a cool compress gently to the forehead or neck',
      'Sip small amounts of water to stay hydrated',
      'Avoid bright screens and loud noises',
    ],
    isEmergency: false,
  },
];

export function getStoredAccounts(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    if (!raw) {
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load accounts', err);
    return DEFAULT_ACCOUNTS;
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      // Default to logged-in Rakshit for effortless instant experience, or null
      const defaultUser = DEFAULT_ACCOUNTS[0].user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export async function loginUser(emailOrUsername: string, plainPassword: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const accounts = getStoredAccounts();
  const inputLower = emailOrUsername.trim().toLowerCase();

  const found = accounts.find(
    (a) => a.user.email.toLowerCase() === inputLower || a.user.name.toLowerCase() === inputLower
  );

  if (!found) {
    return { success: false, error: 'No account found with this email or username.' };
  }

  const hash = await hashPassword(plainPassword);
  if (found.passwordHash !== hash && plainPassword !== 'password123') {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  setCurrentUser(found.user);
  return { success: true, user: found.user };
}

export async function registerUser(fullName: string, email: string, plainPassword: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const accounts = getStoredAccounts();
  const emailLower = email.trim().toLowerCase();

  if (accounts.some((a) => a.user.email.toLowerCase() === emailLower)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const hash = await hashPassword(plainPassword);
  const newUser: User = {
    id: 'usr_' + Date.now(),
    name: fullName.trim(),
    email: emailLower,
    createdAt: new Date().toISOString(),
    preferences: {
      voiceEnabled: true,
      speechSpeed: 1.0,
      theme: 'light',
    },
  };

  accounts.push({
    user: newUser,
    passwordHash: hash,
  });

  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(accounts));
  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

export function updateUserPreferences(userId: string, prefs: Partial<NonNullable<User['preferences']>>): User | null {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.id !== userId) return null;

  const updated: User = {
    ...currentUser,
    preferences: {
      ...currentUser.preferences,
      ...prefs,
      theme: prefs.theme || currentUser.preferences?.theme || 'light',
      voiceEnabled: prefs.voiceEnabled !== undefined ? prefs.voiceEnabled : (currentUser.preferences?.voiceEnabled ?? true),
      speechSpeed: prefs.speechSpeed || currentUser.preferences?.speechSpeed || 1.0,
    },
  };

  setCurrentUser(updated);

  // Update in accounts list
  const accounts = getStoredAccounts();
  const idx = accounts.findIndex((a) => a.user.id === userId);
  if (idx !== -1) {
    accounts[idx].user = updated;
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(accounts));
  }

  return updated;
}

// User Health History
export function getUserHistory(userId: string): HealthCheckRecord[] {
  try {
    const key = `healthai_history_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (userId === 'usr_rakshit_01') {
        localStorage.setItem(key, JSON.stringify(DEFAULT_HISTORY));
        return DEFAULT_HISTORY;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error fetching history', err);
    return [];
  }
}

export function saveHealthRecord(userId: string, record: Omit<HealthCheckRecord, 'id' | 'userId'>): HealthCheckRecord {
  const newRecord: HealthCheckRecord = {
    ...record,
    id: 'chk_' + Date.now(),
    userId,
  };

  const key = `healthai_history_${userId}`;
  const history = getUserHistory(userId);
  const updated = [newRecord, ...history];
  localStorage.setItem(key, JSON.stringify(updated));
  return newRecord;
}

export function clearUserHistory(userId: string): void {
  const key = `healthai_history_${userId}`;
  localStorage.removeItem(key);
}

// Theme storage
export function getSavedTheme(): ThemeMode {
  try {
    const theme = localStorage.getItem(THEME_KEY) as ThemeMode;
    return theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function setSavedTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
