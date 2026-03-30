export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'owner' | 'tenant';
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'tenant';
}

const SESSION_KEY = 'rentEasy_session';
const LEGACY_SESSION_KEY = 'currentUser';
export const SESSION_SYNC_EVENT = 'rentEasy:sessionUpdated';

export const getStoredAccounts = (): UserAccount[] => {
  const stored = localStorage.getItem('rentEasy_accounts');
  return stored ? JSON.parse(stored) : [];
};

export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'owner' | 'tenant';
}): { success: boolean; message: string } => {
  const accounts = getStoredAccounts();
  const existing = accounts.find(
    (a) => a.email.toLowerCase() === data.email.toLowerCase() && a.role === data.role
  );
  if (existing) {
    return {
      success: false,
      message: `An ${data.role} account with this email already exists. Please sign in.`,
    };
  }
  const newAccount: UserAccount = {
    id: Date.now().toString(),
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: data.role,
    createdAt: new Date().toISOString(),
  };
  accounts.push(newAccount);
  localStorage.setItem('rentEasy_accounts', JSON.stringify(accounts));
  return { success: true, message: 'Account created successfully!' };
};

export const loginUser = (
  email: string,
  password: string,
  role: 'owner' | 'tenant'
): { success: boolean; message: string; user?: SessionUser } => {
  const accounts = getStoredAccounts();
  const account = accounts.find(
    (a) =>
      a.email.toLowerCase() === email.toLowerCase() &&
      a.role === role
  );
  if (!account) {
    return {
      success: false,
      message: `No ${role} account found with this email. Please create an account first.`,
    };
  }
  if (account.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }
  const sessionUser: SessionUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: account.role,
  };
  return { success: true, message: 'Signed in successfully!', user: sessionUser };
};

export const getCurrentSession = (): SessionUser | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (stored) return JSON.parse(stored);

  // Backward compatibility: support session created by legacy/public flow.
  const legacy = localStorage.getItem(LEGACY_SESSION_KEY);
  if (!legacy) return null;
  try {
    const parsed = JSON.parse(legacy);
    if (!parsed?.email || !parsed?.role || !parsed?.name) return null;
    const session: SessionUser = {
      id: parsed.id || parsed.email,
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone || '',
      role: parsed.role,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch {
    return null;
  }
};

export const setCurrentSession = (user: SessionUser | null) => {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(LEGACY_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
  }
  window.dispatchEvent(new Event(SESSION_SYNC_EVENT));
};

export const subscribeToSessionUpdates = (onUpdate: () => void): (() => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY || event.key === LEGACY_SESSION_KEY) onUpdate();
  };
  const onLocal = () => onUpdate();

  window.addEventListener('storage', onStorage);
  window.addEventListener(SESSION_SYNC_EVENT, onLocal);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(SESSION_SYNC_EVENT, onLocal);
  };
};

// Backward compatibility aliases
export const getCurrentUser = getCurrentSession;
export const setCurrentUser = setCurrentSession;
