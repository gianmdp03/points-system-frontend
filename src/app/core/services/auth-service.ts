import { inject, Injectable, signal } from '@angular/core';
import { Role, UserDetailDTO } from '../models';
import { SupabaseService } from './supabase-service';
import { UserService } from './user-service';
import { SubscriptionStateService } from './subscription-state-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly userService = inject(UserService);
  private readonly subscriptionState = inject(SubscriptionStateService);

  readonly isLoggedIn = signal<boolean>(false);
  readonly currentRole = signal<Role>(Role.COMPANY_ADMIN);
  readonly userEmail = signal<string | null>(null);
  readonly userId = signal<string | null>(null);
  readonly userName = signal<string | null>(null);
  readonly userDni = signal<string | null>(null);

  // Indica si el usuario inició con Google y necesita completar su DNI
  readonly needsDni = signal<boolean>(false);

  readonly isLoginModalOpen = signal<boolean>(false);

  displayName(): string {
    return this.userName() || (this.userEmail() ? this.userEmail()!.split('@')[0] : 'Administrador');
  }

  userInitial(): string {
    const name = this.displayName();
    return name ? name.charAt(0).toUpperCase() : 'A';
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

    const metaDni = user.user_metadata?.dni;
    if (metaDni && metaDni !== 'No registrado' && metaDni !== 'null' && metaDni.trim().length > 0) {
      this.userDni.set(metaDni.trim());
      this.needsDni.set(false);
    } else {
      this.userDni.set(null);
      this.needsDni.set(true);
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
        if (profile?.dni && profile.dni !== 'No registrado' && profile.dni.trim().length > 0) {
          this.userDni.set(profile.dni.trim());
          this.needsDni.set(false);
        }
      },
      error: (err) => {
        console.warn('Could not fetch user profile from backend API', err);
      }
    });

    // Load subscription details for the logged in user
    this.subscriptionState.loadSubscription();
  }

  private clearSessionData() {
    this.isLoggedIn.set(false);
    this.userEmail.set(null);
    this.userId.set(null);
    this.userName.set(null);
    this.userDni.set(null);
    this.needsDni.set(false);
    this.currentRole.set(Role.COMPANY_ADMIN);
    this.subscriptionState.clearSubscription();
  }

  async login(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.signIn(email, pass);
      if (error) {
        let msg = error.message;
        if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed')) {
          msg = 'Tu correo electrónico aún no ha sido confirmado. Por favor revisa tu bandeja de entrada y confirma tu cuenta antes de ingresar.';
        } else if (msg.includes('Invalid login credentials')) {
          msg = 'Credenciales inválidas. Por favor verifica tu correo y contraseña.';
        }
        return { success: false, error: msg };
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

  async register(email: string, pass: string, name: string, dni: string, role: Role = Role.COMPANY_ADMIN): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.signUp(email, pass, { name, dni, role });
      if (error) {
        let msg = error.message;
        if (msg.includes('User already registered') || msg.includes('user_already_exists')) {
          msg = 'Ya existe un comercio o usuario registrado con este correo electrónico.';
        }
        return { success: false, error: msg };
      }
      if (data.user) {
        await this.supabase.signOut();
        this.clearSessionData();
        return { success: true };
      }
      return { success: false, error: 'Error inesperado al crear la cuenta.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión.' };
    }
  }

  async loginWithOAuth(provider: 'google' = 'google'): Promise<{ success: boolean; error?: string }> {
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

  async updateDni(dni: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanDni = dni.trim();
      const { error } = await this.supabase.updateUserMetadata({
        dni: cleanDni,
        role: this.currentRole()
      });
      if (error) {
        return { success: false, error: error.message };
      }
      this.userDni.set(cleanDni);
      this.needsDni.set(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al guardar tu DNI.' };
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
