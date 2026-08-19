import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { AiChatbotComponent } from './components/ai-chatbot/ai-chatbot';
import { CompleteProfileModalComponent } from './components/complete-profile-modal/complete-profile-modal';
import { PlanLimitModalComponent } from './components/plan-limit-modal/plan-limit-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, AiChatbotComponent, CompleteProfileModalComponent, PlanLimitModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('points-system-frontend');
}
