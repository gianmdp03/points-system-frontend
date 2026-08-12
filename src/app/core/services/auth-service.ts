import { inject, Injectable, signal } from '@angular/core';
import { Role, UserDetailDTO } from '../models';
import { SupabaseService } from './supabase-service';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly userService = inject(UserService);

  readonly isLoggedIn = signal<boolean>(false);
  readonly currentRole = signal<Role>(Role.USER);
  readonly userEmail = signal<string | null>(null);
  readonly userId = signal<string | null>(null);
  readonly userName = signal<string | null>(null);

  readonly isLoginModalOpen = signal<boolean>(false);

  displayName(): string {
    return this.userName() || (this.userEmail() ? this.userEmail()!.split('@')[0] : 'Usuario');
  }

  constructor() {
    this.initSession();
  }

  private async initSession() {
    try {
      const session = await this.supabase.getSession();
      if (session) {
        this.setSessionData(session.user);
      }
    } catch (e) {
      console.warn('No active session found on startup', e);
    }

    this.supabase.onAuthStateChange((_event, session) => {
      if (session) {
        this.setSessionData(session.user);
      } else {
        this.clearSessionData();
      }
    });
  }

  private setSessionData(user: any) {
    this.isLoggedIn.set(true);
    this.userEmail.set(user.email ?? null);
    this.userId.set(user.id ?? null);

    const metaName = user.user_metadata?.name || user.user_metadata?.full_name || user.user_metadata?.user_name;
    if (metaName) {
      this.userName.set(metaName);
    }

    // Initial check from Supabase metadata if present
    const roleFromMetadata = user.user_metadata?.role || user.app_metadata?.role;
    if (roleFromMetadata && Object.values(Role).includes(roleFromMetadata as Role)) {
      this.currentRole.set(roleFromMetadata as Role);
    }

    // Fetch exact role and profile from Spring Boot Backend
    this.userService.getMyProfile().subscribe({
      next: (profile: UserDetailDTO) => {
        if (profile?.role && Object.values(Role).includes(profile.role)) {
          this.currentRole.set(profile.role);
        }
        if (profile?.name) {
          this.userName.set(profile.name);
        }
      },
      error: (err) => {
        console.warn('Could not fetch user profile from backend API', err);
      }
    });
  }

  private clearSessionData() {
    this.isLoggedIn.set(false);
    this.userEmail.set(null);
    this.userId.set(null);
    this.userName.set(null);
    this.currentRole.set(Role.USER);
  }

  async login(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.signIn(email, pass);
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session && data.user) {
        this.setSessionData(data.user);
        this.closeLoginModal();
        return { success: true };
      }
      return { success: false, error: 'Error inesperado al iniciar sesión.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión.' };
    }
  }

  async register(email: string, pass: string, name: string, dni: string, role: Role): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.signUp(email, pass, { name, dni, role });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        if (data.session) {
          this.setSessionData(data.user);
        }
        return { success: true };
      }
      return { success: false, error: 'Error inesperado al crear la cuenta.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión.' };
    }
  }

  async loginWithOAuth(provider: 'google' | 'github'): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.signInWithOAuth(provider);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error con el proveedor de autenticación.' };
    }
  }

  async loginWithMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.signInWithMagicLink(email);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al enviar enlace mágico.' };
    }
  }

  async logout(): Promise<void> {
    await this.supabase.signOut();
    this.clearSessionData();
  }

  setRole(role: Role): void {
    this.currentRole.set(role);
  }

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
  }
}
