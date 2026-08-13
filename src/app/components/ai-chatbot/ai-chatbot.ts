import {
  Component,
  inject,
  signal,
  effect,
  ElementRef,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../../core/services/ai-chat-service';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chatbot.html',
  styleUrl: './ai-chatbot.css'
})
export class AiChatbotComponent {
  protected readonly chatService = inject(AiChatService);

  readonly inputMessage = signal<string>('');
  readonly messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');

  constructor() {
    // Auto-scroll hacia abajo cada vez que cambien los mensajes o el bot esté escribiendo
    effect(() => {
      // Registrar dependencias de reactividad
      this.chatService.messages();
      this.chatService.isTyping();
      this.chatService.isOpen();

      setTimeout(() => {
        this.scrollToBottom();
      }, 50);
    });
  }

  scrollToBottom(): void {
    const container = this.messagesContainer()?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  onSendMessage(): void {
    const text = this.inputMessage();
    if (!text.trim()) return;

    this.chatService.sendMessage(text);
    this.inputMessage.set('');
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  onPromptClick(prompt: string): void {
    this.chatService.sendMessage(prompt);
  }

  formatMessageText(text: string): string {
    // Reemplazar negritas en markdown **texto** por <strong>texto</strong>
    const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Reemplazar saltos de línea por <br>
    return boldFormatted.replace(/\n/g, '<br>');
  }
}
