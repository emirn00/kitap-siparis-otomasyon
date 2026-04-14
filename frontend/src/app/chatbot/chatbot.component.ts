import { Component } from '@angular/core';
import { ChatbotService, ChatbotResponse } from './chatbot.service';
import { AuthService } from '../auth/auth.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {
  isOpen = false;
  isAdmin = false;
  messages: Message[] = [
    { text: 'Merhaba! Ben Kitapçı Asistanı. Size nasıl yardımcı olabilirim?', sender: 'bot', timestamp: new Date() }
  ];
  currentMessage = '';
  isLoading = false;

  quickActions = [
    { label: '📚 Kitap öner', message: 'Bana kitap önerir misin?' },
    { label: '🕐 Çalışma saatleri', message: 'Çalışma saatleri nedir?' },
    { label: '📦 Sipariş durumu', message: 'Sipariş durumunu nasıl sorgularım?' },
    { label: '🆕 Yeni eklemeler', message: 'Son eklenen kitaplar neler?' },
    { label: '❓ Yardım', message: 'Neler yapabilirsin?' },
  ];

  constructor(
    private chatbotService: ChatbotService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.getUserRole() === 'ADMIN';

    this.authService.loginState$.subscribe(() => {
      this.isAdmin = this.authService.getUserRole() === 'ADMIN';
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendQuickAction(message: string) {
    this.currentMessage = message;
    this.sendMessage();
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMsg: Message = {
      text: this.currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMsg);
    const messageToSend = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;

    this.chatbotService.ask(messageToSend).subscribe({
      next: (res: ChatbotResponse) => {
        this.messages.push({
          text: res.reply,
          sender: 'bot',
          timestamp: new Date()
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.messages.push({
          text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
          sender: 'bot',
          timestamp: new Date()
        });
        this.isLoading = false;
      }
    });
  }
}
