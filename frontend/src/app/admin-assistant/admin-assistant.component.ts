import { Component, OnInit } from '@angular/core';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-admin-assistant',
  templateUrl: './admin-assistant.component.html',
  styleUrls: ['./admin-assistant.component.scss']
})
export class AdminAssistantComponent implements OnInit {
  messages: Message[] = [];
  userMessage: string = '';

  ngOnInit(): void {
    // İlk hoş geldin mesajı
    this.messages.push({
      type: 'assistant',
      content: 'Merhaba! Size nasıl yardımcı olabilirim? / Hallo! Wie kann ich Ihnen helfen?',
      timestamp: new Date()
    });
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) {
      return;
    }

    // Kullanıcı mesajını ekle
    this.messages.push({
      type: 'user',
      content: this.userMessage,
      timestamp: new Date()
    });

    // Asistan yanıtını simüle et
    const response = this.generateResponse(this.userMessage);
    setTimeout(() => {
      this.messages.push({
        type: 'assistant',
        content: response,
        timestamp: new Date()
      });
    }, 500);

    this.userMessage = '';
  }

  generateResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('sipariş') || lowerMessage.includes('order')) {
      return 'Siparişler hakkında bilgi almak için "Orders (Tüm)" veya "Orders (Tarih Seç)" sayfalarını kullanabilirsiniz. / Sie können die Seiten "Orders (Tüm)" oder "Orders (Tarih Seç)" verwenden, um Informationen über Bestellungen zu erhalten.';
    } else if (lowerMessage.includes('kullanıcı') || lowerMessage.includes('user')) {
      return 'Kullanıcıları görüntülemek için "Users (Arama)" sayfasını kullanabilirsiniz. / Sie können die Seite "Users (Arama)" verwenden, um Benutzer anzuzeigen.';
    } else if (lowerMessage.includes('istatistik') || lowerMessage.includes('stat')) {
      return 'İstatistikler için admin ana sayfasındaki kartlara bakabilirsiniz. / Sie können die Karten auf der Admin-Startseite für Statistiken ansehen.';
    } else if (lowerMessage.includes('yardım') || lowerMessage.includes('help')) {
      return 'Size nasıl yardımcı olabilirim? Siparişler, kullanıcılar veya sistem hakkında sorularınızı sorabilirsiniz. / Wie kann ich Ihnen helfen? Sie können Fragen zu Bestellungen, Benutzern oder dem System stellen.';
    } else {
      return 'Anladım. Başka bir konuda yardımcı olabilir miyim? / Verstanden. Kann ich Ihnen bei etwas anderem helfen?';
    }
  }

  quickAction(action: string): void {
    let message = '';
    
    switch (action) {
      case 'orders':
        message = 'Siparişleri listele';
        break;
      case 'users':
        message = 'Kullanıcıları listele';
        break;
      case 'stats':
        message = 'İstatistikleri göster';
        break;
      case 'help':
        message = 'Yardım al';
        break;
    }

    this.userMessage = message;
    this.sendMessage();
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
