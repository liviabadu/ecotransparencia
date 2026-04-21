import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
} from '@angular/fire/auth';
import { getApp } from '@angular/fire/app';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { getAuth, reload, updateProfile } from 'firebase/auth';

/** Chave em localStorage: instante do último login bem-sucedido (ms desde epoch). Não armazena credenciais. */
const LOGIN_TIME_KEY = 'loginTime';

/** Sessão “lembrar de mim” expira após este número de dias (revalidação no carregamento do site). */
const MAX_SESSION_DAYS = 7;

const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private storage = inject(Storage);

  // Signals for reactive state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);
  /** Reservado para UI legada; a app espera `authStateReady` no APP_INITIALIZER antes do bootstrap. */
  isLoading = signal(false);

  constructor() {
    /* O Firebase invoca o listener de imediato com o utilizador atual (após authStateReady no APP_INITIALIZER). */
    onAuthStateChanged(this.auth, (user) => {
      void this.handleAuthState(user);
    });
  }

  /**
   * Sincroniza estado com o Firebase e aplica regra de 7 dias sobre `loginTime`.
   * Logout limpa o marcador; usuário sem `loginTime` recebe um na primeira detecção (migração).
   */
  private async handleAuthState(user: User | null): Promise<void> {
    if (!user) {
      this.clearLoginTimeStorage();
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      return;
    }

    const expired = await this.enforceMaxSessionAgeIfNeeded();
    if (expired) {
      /* signOut já correu; atualizar sinais antes do próximo tick do listener com user === null */
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      return;
    }

    if (!this.getLoginTimeRaw()) {
      this.recordLoginTime();
    }

    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  /** Retorna true se a sessão foi encerrada por expiração (> MAX_SESSION_DAYS). */
  private async enforceMaxSessionAgeIfNeeded(): Promise<boolean> {
    const raw = this.getLoginTimeRaw();
    if (!raw) {
      return false;
    }
    const t = Number(raw);
    if (!Number.isFinite(t)) {
      return false;
    }
    const diffDays = (Date.now() - t) / (1000 * 60 * 60 * 24);
    if (diffDays > MAX_SESSION_DAYS) {
      try {
        await signOut(this.auth);
      } finally {
        this.clearLoginTimeStorage();
      }
      return true;
    }
    return false;
  }

  private getLoginTimeRaw(): string | null {
    try {
      return localStorage.getItem(LOGIN_TIME_KEY);
    } catch {
      return null;
    }
  }

  /** Grava o instante do login (após sucesso). */
  private recordLoginTime(): void {
    try {
      localStorage.setItem(LOGIN_TIME_KEY, String(Date.now()));
    } catch {
      /* quota / modo privado — sessão Firebase ainda vale */
    }
  }

  private clearLoginTimeStorage(): void {
    try {
      localStorage.removeItem(LOGIN_TIME_KEY);
    } catch {
      /* ignore */
    }
  }

  /**
   * Define onde o Firebase guarda o token antes de qualquer sign-in.
   * `browserLocalPersistence`: permanece após fechar o separador; `browserSessionPersistence`: só na sessão do browser.
   */
  private async applyPersistence(rememberMe: boolean): Promise<void> {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(this.auth, persistence);
  }

  /**
   * Login com e-mail e senha. `rememberMe` controla persistência (local vs sessão).
   */
  async login(email: string, password: string, rememberMe: boolean): Promise<void> {
    await this.applyPersistence(rememberMe);
    await signInWithEmailAndPassword(this.auth, email, password);
    this.recordLoginTime();
  }

  /**
   * Login Google com popup. Se o browser bloquear o popup, usa redirect.
   * Tempos após fechar o popup são encurtados via patch em `@firebase/auth` (patch-package).
   *
   * @returns `true` se o login terminou no popup (a UI pode navegar); `false` se iniciou redirect.
   */
  async loginWithGoogle(rememberMe: boolean): Promise<boolean> {
    await this.applyPersistence(rememberMe);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(this.auth, provider, browserPopupRedirectResolver);
      this.recordLoginTime();
      return true;
    } catch (e: unknown) {
      const code =
        e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(this.auth, provider);
        return false;
      }
      throw e;
    }
  }

  /**
   * Cadastro: o Firebase entra automaticamente após criar a conta; a persistência aplica-se a essa sessão.
   */
  async register(email: string, password: string, rememberMe: boolean): Promise<void> {
    await this.applyPersistence(rememberMe);
    await createUserWithEmailAndPassword(this.auth, email, password);
    this.recordLoginTime();
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      this.clearLoginTimeStorage();
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
    if (d) {
      return d;
    }
    const local = u.email?.split('@')[0]?.trim();
    if (local) {
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
    return 'Usuário';
  }

  /**
   * Saudação no topo do painel pós-login: para quem entrou com Google, só primeiro e segundo nome.
   * Login com e-mail/senha mantém o nome completo de {@link getDisplayName}.
   */
  getDashboardGreetingName(): string {
    const u = this.currentUser();
    if (!u) return '';
    const full = this.getDisplayName();
    if (!this.userHasGoogleProvider(u)) {
      return full;
    }
    return this.firstTwoGivenNames(full);
  }

  private userHasGoogleProvider(u: User): boolean {
    return u.providerData?.some((p) => p.providerId === GoogleAuthProvider.PROVIDER_ID) ?? false;
  }

  /** Duas primeiras palavras do nome (ex.: “Maria Clara Santos” → “Maria Clara”). */
  private firstTwoGivenNames(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) {
      return parts[0] ?? '';
    }
    return `${parts[0]} ${parts[1]}`;
  }

  getPhotoUrl(): string | null {
    return this.currentUser()?.photoURL ?? null;
  }

  /**
   * URL da foto com aresta maior no CDN (Google: `=s96-c` → `=sNN-c`), para avatares nítidos na rail e no menu de conta.
   */
  /** @param edgePx aresta pedida ao CDN (ex.: 160 na rail, 192 no cabeçalho do popover). */
  getRailAvatarPhotoUrl(edgePx: number = 160): string | null {
    const raw = this.getPhotoUrl();
    return raw ? AuthService.upgradeGoogleProfilePhotoForDensity(raw, edgePx) : null;
  }

  /** Ajusta `=sNN-c`, `=wNN-hNN` ou `sz=NN` em lh3.googleusercontent.com / ggpht.com. */
  private static upgradeGoogleProfilePhotoForDensity(url: string, edgePx: number): string {
    if (!/googleusercontent\.com|ggpht\.com/i.test(url)) {
      return url;
    }
    let out = url.replace(/=s\d+(-[a-z]+)?/gi, `=s${edgePx}$1`);
    if (out === url) {
      out = url.replace(/=w\d+-h\d+/gi, `=w${edgePx}-h${edgePx}`);
    }
    if (out === url) {
      out = url.replace(/([?&])sz=\d+/gi, `$1sz=${edgePx}`);
    }
    return out;
  }

  /** Parte antes do @ do e-mail (só leitura na UI; não é editável). */
  getUsernameHandle(): string {
    const email = this.getUserEmail();
    if (!email) return '';
    const at = email.indexOf('@');
    return at > 0 ? email.slice(0, at) : email;
  }

  /** Atualiza o nome de exibição no Firebase Auth. */
  async updateDisplayName(displayName: string): Promise<void> {
    const auth = getAuth(getApp());
    const u = auth.currentUser;
    if (!u) {
      throw new Error('Sem utilizador autenticado');
    }
    await updateProfile(u, { displayName: displayName.trim() });
  }

  /**
   * Envia imagem para Storage (`profilePhotos/{uid}/…`) e define `photoURL` no perfil Auth.
   * Requer Storage ativo e regras publicadas (ver `storage.rules`).
   */
  async uploadProfilePhoto(file: File): Promise<void> {
    const u = this.currentUser();
    if (!u) {
      throw new Error('Sem utilizador autenticado');
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('Escolha um ficheiro de imagem.');
    }
    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      throw new Error('Imagem demasiado grande (máximo 5 MB).');
    }
    const rawExt = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'jpg';
    const ext = /^(jpe?g|png|gif|webp)$/.test(rawExt) ? rawExt.replace('jpeg', 'jpg') : 'jpg';
    const path = `profilePhotos/${u.uid}/${Date.now()}.${ext}`;
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file, { contentType: file.type || 'image/jpeg' });
    const url = await getDownloadURL(storageRef);
    const auth = getAuth(getApp());
    const cu = auth.currentUser;
    if (!cu) {
      throw new Error('Sem utilizador autenticado');
    }
    await updateProfile(cu, { photoURL: url });
    await reload(cu);
    const refreshed = getAuth(getApp()).currentUser;
    if (refreshed) {
      this.currentUser.set(refreshed);
    }
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

  /**
   * Primeira e segunda letra do nome de exibição (Unicode), para o badge ao lado da saudação no painel.
   */
  getDashboardBadgeTwoLetters(): string {
    const raw = this.getDisplayName().trim();
    if (!raw) return '?';
    const picked: string[] = [];
    for (const ch of raw) {
      if (/\p{L}/u.test(ch)) {
        picked.push(ch);
        if (picked.length >= 2) break;
      }
    }
    if (picked.length === 0) {
      const alnum = raw.replace(/[^\dA-Za-zÀ-ÿ]/gi, '');
      return (alnum.slice(0, 2).toUpperCase() || '?');
    }
    return picked.map((c) => c.toLocaleUpperCase('pt-BR')).join('');
  }
}
