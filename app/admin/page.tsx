'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setDoc } from 'firebase/firestore';
import { auth, db, authFunctions, firestoreFunctions, linkQueries } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { Trash2, Edit2, LogOut, Plus } from 'lucide-react';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  order: number;
  target?: string;
}

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminsEmpty, setAdminsEmpty] = useState(false);
  
  // Form states
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', order: 0, target: '_blank' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check if user is admin
        const adminDoc = await getDocs(collection(db, 'admins'));
        const isUserAdmin = adminDoc.docs.some(doc => doc.id === currentUser.uid || doc.data().email === currentUser.email);
        setIsAdmin(isUserAdmin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if admins collection is empty (for initial setup)
  useEffect(() => {
    const checkAdmins = async () => {
      const adminsSnap = await getDocs(collection(db, 'admins'));
      setAdminsEmpty(adminsSnap.empty);
    };
    checkAdmins();
  }, []);

  // Fetch links
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(collection(db, 'links'), orderBy('order', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LinkItem[];
      setLinks(linksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await authFunctions.signOut();
      router.push('/');
    } catch (err) {
      setError('Failed to logout');
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.url.trim()) {
      setError('Title and URL are required');
      return;
    }

    if (!validateUrl(formData.url)) {
      setError('Invalid URL format');
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'links', editingId), {
          title: formData.title,
          url: formData.url,
          order: parseInt(formData.order.toString()),
          target: formData.target
        });
        setSuccess('Link updated successfully');
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'links'), {
          title: formData.title,
          url: formData.url,
          order: links.length,
          target: formData.target
        });
        setSuccess('Link added successfully');
      }

      setFormData({ title: '', url: '', order: 0, target: '_blank' });
      setShowNewForm(false);
    } catch (err) {
      setError('Failed to save link');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      await deleteDoc(doc(db, 'links', id));
      setSuccess('Link deleted successfully');
    } catch (err) {
      setError('Failed to delete link');
    }
  };

  const handleEdit = (link: LinkItem) => {
    setFormData({
      title: link.title,
      url: link.url,
      order: link.order,
      target: link.target || '_blank'
    });
    setEditingId(link.id);
    setShowNewForm(true);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginPage adminsEmpty={adminsEmpty} />;
  }

  // Not an admin
  if (!isAdmin && !adminsEmpty) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#000' }}>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have permission to access the admin panel.</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: '#CC5500' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#000' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg transition-colors text-white hover:bg-gray-900"
            style={{ color: '#CC5500' }}
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-white text-sm" style={{ backgroundColor: '#CC5500' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg text-black text-sm" style={{ backgroundColor: '#CC5500' }}>
            {success}
          </div>
        )}

        {/* Add/Edit Form */}
        {showNewForm ? (
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-6 rounded-lg border border-gray-800"
            style={{ backgroundColor: '#111' }}
          >
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Edit Link' : 'Add New Link'}
            </h2>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus-visible:outline-none"
                  placeholder="Link title"
                  style={{ outlineColor: '#CC5500' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus-visible:outline-none"
                  placeholder="https://..."
                  style={{ outlineColor: '#CC5500' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus-visible:outline-none"
                    style={{ outlineColor: '#CC5500' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target
                  </label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus-visible:outline-none"
                    style={{ outlineColor: '#CC5500' }}
                  >
                    <option value="_blank">New Tab</option>
                    <option value="_self">Same Tab</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: '#CC5500' }}
              >
                {editingId ? 'Update' : 'Add'} Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewForm(false);
                  setEditingId(null);
                  setFormData({ title: '', url: '', order: 0, target: '_blank' });
                }}
                className="px-6 py-2 rounded-lg font-medium border border-gray-700 text-white hover:bg-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowNewForm(true)}
            className="mb-8 px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition-colors"
            style={{ backgroundColor: '#CC5500' }}
          >
            <Plus className="w-5 h-5" />
            Add New Link
          </button>
        )}

        {/* Links List */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white mb-4">Your Links</h2>

          {loading ? (
            <p className="text-gray-500">Loading links...</p>
          ) : links.length === 0 ? (
            <p className="text-gray-500">No links yet. Add your first link above!</p>
          ) : (
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-800"
                  style={{ backgroundColor: '#111' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{link.title}</p>
                    <p className="text-sm text-gray-400 truncate">{link.url}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(link)}
                      className="p-2 rounded-lg transition-colors text-white hover:bg-gray-800"
                      style={{ color: '#CC5500' }}
                      aria-label="Edit link"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 rounded-lg transition-colors text-red-500 hover:bg-gray-800"
                      aria-label="Delete link"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface LoginPageProps {
  adminsEmpty: boolean;
}

function LoginPage({ adminsEmpty }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(adminsEmpty);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!confirm('⚠️ You are creating the first admin account. This cannot be undone. Continue?')) {
          setLoading(false);
          return;
        }

        const result = await authFunctions.signUp(email, password);
        // Automatically add this user as admin
        // NEW CODE:
        await setDoc(doc(db, 'admins', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          role: 'admin',
          createdAt: new Date()
        });
        router.push('/admin');
      } else {
        await authFunctions.signIn(email, password);
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#000' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {adminsEmpty ? 'Create First Admin' : 'Admin Login'}
          </h1>
          <p className="text-gray-400">
            {adminsEmpty
              ? 'Set up your admin account to manage links'
              : 'Sign in to manage your links'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-900 text-red-100 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus-visible:outline-none"
              placeholder="your@email.com"
              required
              style={{ outlineColor: '#CC5500' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus-visible:outline-none"
              placeholder="••••••••"
              required
              style={{ outlineColor: '#CC5500' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 rounded-2xl font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: '#CC5500' }}
          >
            {loading
              ? 'Loading...'
              : adminsEmpty
                ? 'Create Admin Account'
                : 'Sign In'}
          </button>

          {!adminsEmpty && (
            <p className="text-center text-gray-400 text-sm">
              No account yet?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-center w-full"
                style={{ color: '#CC5500' }}
              >
                Contact the administrator
              </button>
            </p>
          )}
        </form>

        {adminsEmpty && (
          <div className="mt-6 p-4 rounded-lg border border-yellow-900 bg-yellow-900/20 text-yellow-200 text-sm">
            <p className="font-bold mb-2">⚠️ First Time Setup</p>
            <p>
              This is the first admin account. After creation, only you can add other admins through the Firebase console.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
