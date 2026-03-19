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
  const stored = localStorage.getItem('rentEasy_session');
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentSession = (user: SessionUser | null) => {
  if (user) {
    localStorage.setItem('rentEasy_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('rentEasy_session');
  }
};

// Backward compatibility aliases
export const getCurrentUser = getCurrentSession;
export const setCurrentUser = setCurrentSession;
