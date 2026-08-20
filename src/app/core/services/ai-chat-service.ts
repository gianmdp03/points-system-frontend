import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, catchError, of, tap } from 'rxjs';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'msg-init',
  sender: 'assistant',
  text: '¡Hola! 👋 Soy tu asistente inteligente de **Pointly** impulsado por IA. ¿En qué te puedo ayudar hoy con respecto a tus puntos, canjes, comercios, promociones o planes de suscripción?',
  timestamp: new Date()
};

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/public/ai/chat`;

  readonly isOpen = signal<boolean>(false);
  readonly isTyping = signal<boolean>(false);
  readonly messages = signal<ChatMessage[]>([INITIAL_MESSAGE]);
  readonly hasUnread = signal<boolean>(false);

  readonly suggestedPrompts: string[] = [
    '¿Cuáles son los planes y precios para comercios?',
    '¿Qué diferencias hay entre el plan BASIC y PRO?',
    '¿Cómo consulto mis puntos con DNI?',
    '¿Qué beneficios ofrece Pointly a comercios?'
  ];

  toggleChat(): void {
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.hasUnread.set(false);
    }
  }

  openChat(): void {
    this.isOpen.set(true);
    this.hasUnread.set(false);
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  clearHistory(): void {
    this.messages.set([
      {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        text: 'Historial reiniciado. ¿En qué puedo ayudarte ahora?',
        timestamp: new Date()
      }
    ]);
  }

  sendMessage(userText: string): void {
    const trimmed = userText.trim();
    if (!trimmed || this.isTyping()) return;

    // 1. Agregar mensaje del usuario
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    };

    this.messages.update((prev) => [...prev, userMsg]);
    this.isTyping.set(true);

    // 2. Llamar al backend
    this.http.post<{ response: string }>(this.apiUrl, { message: trimmed }).pipe(
      tap((res) => {
        this.isTyping.set(false);
        const botReply = res.response || 'No recibí respuesta del asistente.';
        const botMsg: ChatMessage = {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: botReply,
          timestamp: new Date()
        };
        this.messages.update((prev) => [...prev, botMsg]);
        if (!this.isOpen()) {
          this.hasUnread.set(true);
        }
      }),
      catchError((err) => {
        this.isTyping.set(false);
        const errorMsg: ChatMessage = {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: err.status === 400 && err.error?.error
            ? err.error.error
            : 'Lo siento, ocurrió un error al conectar con el servidor de inteligencia artificial. Por favor, intenta de nuevo.',
          timestamp: new Date(),
          isError: true
        };
        this.messages.update((prev) => [...prev, errorMsg]);
        return of(null);
      })
    ).subscribe();
  }
}
