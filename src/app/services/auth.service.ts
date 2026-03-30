import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  // Signals for reactive state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);
  /** Reservado para UI legada; a app espera `authStateReady` no APP_INITIALIZER antes do bootstrap. */
  isLoading = signal(false);

  constructor() {
    const u = this.auth.currentUser;
    this.currentUser.set(u);
    this.isAuthenticated.set(!!u);
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
    });
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(this.auth, provider);
  }

  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get the current user's email
   */
  getUserEmail(): string | null {
    return this.currentUser()?.email || null;
  }

  /** Nome amigável para saudação (displayName, parte do e-mail ou “Usuário”). */
  getDisplayName(): string {
    const u = this.currentUser();
    if (!u) return '';
    const d = u.displayName?.trim();
    if (d) return d;
    const local = u.email?.split('@')[0]?.trim();
    if (local) {
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
    return 'Usuário';
  }

  getPhotoUrl(): string | null {
    return this.currentUser()?.photoURL ?? null;
  }

  /** Iniciais para avatar quando não há foto. */
  getInitials(): string {
    const name = this.getDisplayName();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || '?';
  }
}
