'use client';
import * as React from 'react';

import { config } from '@/config';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import Head from 'next/head';

export default function Page(): React.JSX.Element {
  const { checkSession } = useUser();

  const router = useRouter();
  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        logger.error('Sign out error', error);
        return;
      }

      await checkSession?.();

      router.refresh();
    } catch (err) {
      logger.error('Sign out error', err);
    }
  }, [checkSession, router]);
  React.useEffect(() => {
    const signOut = async () => {
      await handleSignOut();
    };

    signOut().catch((err: unknown) => {
      if (err instanceof Error) {
        logger.error('Sign out effect error', err.message);
      } else {
        logger.error('Unknown error in sign out effect');
      }
    });
  }, [handleSignOut]);
  return (
    <>
    <Head>
      <title>Logout | Dashboard | {config.site.name}</title>
    </Head>
    <h1>ออกจากระบบ...</h1>
  </>
  );
}
