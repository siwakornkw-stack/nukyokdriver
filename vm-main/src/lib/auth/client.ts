'use client';

import type { User } from '@/types/user';
import { getUser, login, signUp } from '../../../services/auth.service';
import { removeAllCookies } from '../../../helpers/helper';
import { getResponseData } from '../../../types/utils';

/* function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
} */

export interface SignUpParams {
  username: string;
  name: string;
  email: string;
  password: string;
  mobileNo: string;
  lineId: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  username: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    const { username, name, email, password, mobileNo, lineId } = _;
    const payload = { username, name, email, password, mobileNo, lineId };
    const result = await signUp(payload);

    if (!result.ok) {
      return { error: result.message };
    }

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { username, password } = params;

    const result = await login({ username, password });
    console.log('result', result);
    if (!result.ok) {
      return { error: result.message};
    }

    return {};
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.

    const result = await getUser();

    if (!result.ok) {
      return { error: result.message };
    }

    const data = getResponseData(result);
    if (!data) {
      return { error: result.message };
    }

    return { data: data.data ?? null };
  }

  async signOut(): Promise<{ error?: string }> {
    removeAllCookies();
    localStorage.clear();

    return {};
  }
}

export const authClient = new AuthClient();
