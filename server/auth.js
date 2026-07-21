import crypto from 'node:crypto';

const sessions = new Map();
const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const roles = new Set(['admin', 'creator', 'runner', 'viewer']);

export const publicUser = user => ({ id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt });

const passwordHash = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  hash: crypto.scryptSync(password, salt, 64).toString('hex')
});

export function validateAccount({ name, email, password }) {
  if (!name?.trim() || name.trim().length > 80) return 'Enter a name of up to 80 characters.';
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return 'Enter a valid email address.';
  if (typeof password !== 'string' || password.length < 10) return 'Use a password with at least 10 characters.';
  return null;
}

export function registerUser(db, account) {
  const error = validateAccount(account);
  if (error) return { error };
  const email = account.email.trim().toLowerCase();
  if ((db.users || []).some(user => user.email === email)) return { error: 'An account already exists for that email.' };
  const credentials = passwordHash(account.password);
  const user = {
    id: crypto.randomUUID(),
    name: account.name.trim(),
    email,
    role: (db.users || []).length === 0 ? 'admin' : 'creator',
    passwordHash: credentials.hash,
    passwordSalt: credentials.salt,
    createdAt: new Date().toISOString()
  };
  db.users = [...(db.users || []), user];
  return { user };
}

export function authenticate(db, email, password) {
  const user = (db.users || []).find(item => item.email === String(email || '').trim().toLowerCase());
  if (!user || !password) return null;
  const candidate = crypto.scryptSync(password, user.passwordSalt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(user.passwordHash, 'hex')) ? user : null;
}

export function createSession(user) {
  const token = crypto.randomBytes(32).toString('base64url');
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + sessionLifetimeMs });
  return { token, expiresAt: new Date(Date.now() + sessionLifetimeMs).toISOString() };
}

export function revokeSession(token) { sessions.delete(token); }

export function sessionUser(db, authorization) {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return (db.users || []).find(user => user.id === session.userId) || null;
}

export function hasRole(user, ...allowed) { return Boolean(user && allowed.includes(user.role)); }
export function validRole(role) { return roles.has(role); }
