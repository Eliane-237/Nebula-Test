'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export function useProfileRole() {
  const { user, role, setRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || loading) return;
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.role && data.role !== role) {
          setRole(data.role as typeof role);
        }
      });
  }, [user, loading, role, setRole]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  return { loading, user };
}
