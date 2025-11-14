'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  order: number;
  target?: string;
}

export default function Linktree() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name] = useState('CSE B');
  const [bio] = useState('One link to rule them all');
  const [avatar] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'links'), orderBy('order', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LinkItem[];
      setLinks(linksData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching links:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#000' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Avatar */}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center mb-4 border-2 text-2xl font-bold text-white"
            style={{ borderColor: '#CC5500', backgroundColor: '#111' }}
          >
            {avatar ? (
              <img
                src={avatar || "/placeholder.svg"}
                alt={name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitial(name)
            )}
          </div>

          {/* Name and Bio */}
          <h1 className="text-2xl font-bold text-white mb-2">{name}</h1>
          <p className="text-gray-400 text-sm">{bio}</p>
        </div>

        {/* Links */}
        <div className="space-y-3 mb-8">
          {loading ? (
            <div className="text-center text-gray-500 text-sm">Loading links...</div>
          ) : links.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              No links added yet. Visit the admin panel to add your first link.
            </div>
          ) : (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target={link.target || '_blank'}
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 rounded-2xl border transition-all duration-200 transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 text-white text-center font-medium group"
                style={{
                  backgroundColor: '#111',
                  borderColor: '#333',
                  outlineColor: '#CC5500'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px #CC5500';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
                aria-label={`Visit ${link.title}`}
              >
                <span className="flex items-center justify-center gap-2">
                  {link.title}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-1 rounded-full" style={{ backgroundColor: '#CC5500' }} />
          <Link
            href="/admin"
            className="text-xs font-medium transition-colors"
            style={{ color: '#CC5500' }}
          >
            Admin
          </Link>
          <a
            href="https://www.ushodayanetworks.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            Developed by Ushodaya Networks
          </a>
        </div>
      </div>
    </div>
  );
}
