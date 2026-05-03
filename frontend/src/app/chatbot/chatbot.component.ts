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
  unreadCount = 1;
  messages: Message[] = [
    { text: 'Merhaba! Ben Hueber Asistan. Size nasıl yardımcı olabilirim?', sender: 'bot', timestamp: new Date() }
  ];
  currentMessage = '';
  isLoading = false;
  currentSessionId: string | undefined = undefined;

  quickActions = [
    { label: '📊 Bugünün Siparişleri', message: 'Bugün toplam kaç sipariş verildi ve detayları neler?' },
    { label: '👥 Bugünün Kayıtları', message: 'Bugün kaç yeni kullanıcı kayıt oldu?' },
    { label: '📧 Mail Trafiği', message: 'Bugün gönderilen e-postaların durumu nedir?' },
  ];

  // Dynamic Query Builder
  selectedPeriod = 'today';
  selectedDataType = 'orders';

  periods = [
    { value: 'today', label: 'Bugün' },
    { value: 'week', label: 'Son 1 Hafta' },
    { value: 'month', label: 'Son 1 Ay' },
    { value: 'year', label: 'Son 1 Yıl' }
  ];

  dataTypes = [
    { value: 'orders', label: 'Siparişler' },
    { value: 'registrations', label: 'Kullanıcı Kayıtları' },
    { value: 'emails', label: 'E-posta Gönderimleri' },
    { value: 'logs', label: 'Tüm Sistem Logları' }
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

  generateAndSendQuery() {
    const periodLabel = this.periods.find(p => p.value === this.selectedPeriod)?.label;
    const typeLabel = this.dataTypes.find(t => t.value === this.selectedDataType)?.label;
    
    const message = `${periodLabel} dönemindeki ${typeLabel} hakkında detaylı bir rapor sunar mısın?`;
    this.sendQuickAction(message);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.unreadCount = 0;
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

    this.chatbotService.ask(messageToSend, this.currentSessionId).subscribe({
      next: (res: ChatbotResponse) => {
        this.currentSessionId = res.sessionId;
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
