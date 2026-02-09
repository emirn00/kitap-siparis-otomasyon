import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  category?: 'order' | 'user' | 'system' | 'general';
  suggestions?: string[];
}

interface QuickSuggestion {
  text: string;
  action: string;
  icon: string;
}

@Component({
  selector: 'app-admin-assistant',
  templateUrl: './admin-assistant.component.html',
  styleUrls: ['./admin-assistant.component.scss']
})
export class AdminAssistantComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages', { static: false }) chatMessages!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  messages: Message[] = [];
  userMessage: string = '';
  isTyping: boolean = false;
  searchTerm: string = '';
  showSuggestions: boolean = true;
  chatMinimized: boolean = false;

  quickSuggestions: QuickSuggestion[] = [
    { text: 'Siparişleri göster', action: 'orders', icon: 'shopping_cart' },
    { text: 'Kullanıcıları listele', action: 'users', icon: 'people' },
    { text: 'İstatistikleri göster', action: 'stats', icon: 'bar_chart' },
    { text: 'Sistem durumu', action: 'system', icon: 'settings' },
    { text: 'Yardım al', action: 'help', icon: 'help' },
    { text: 'Son siparişler', action: 'recent_orders', icon: 'history' }
  ];

  categories = [
    { value: 'all', label: 'Tümü / Alle', icon: 'chat' },
    { value: 'order', label: 'Siparişler / Bestellungen', icon: 'shopping_cart' },
    { value: 'user', label: 'Kullanıcılar / Benutzer', icon: 'people' },
    { value: 'system', label: 'Sistem / System', icon: 'settings' }
  ];

  selectedCategory: string = 'all';

  constructor() {}

  ngOnInit(): void {
    this.loadChatHistory();
    if (this.messages.length === 0) {
      this.addWelcomeMessage();
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.chatMessages) {
        this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  loadChatHistory(): void {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.messages = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        this.messages = [];
      }
    }
  }

  saveChatHistory(): void {
    localStorage.setItem('chatHistory', JSON.stringify(this.messages));
  }

  addWelcomeMessage(): void {
    const welcomeMessage: Message = {
      id: this.generateId(),
      type: 'assistant',
      content: 'Merhaba! Ben Hueber Admin Asistanı. Size nasıl yardımcı olabilirim? / Hallo! Ich bin der Hueber Admin-Assistent. Wie kann ich Ihnen helfen?',
      timestamp: new Date(),
      category: 'general',
      suggestions: [
        'Siparişleri göster',
        'Kullanıcıları listele',
        'İstatistikleri göster',
        'Sistem durumu'
      ]
    };
    this.messages.push(welcomeMessage);
    this.saveChatHistory();
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) {
      return;
    }

    const userMsg: Message = {
      id: this.generateId(),
      type: 'user',
      content: this.userMessage.trim(),
      timestamp: new Date(),
      category: this.detectCategory(this.userMessage)
    };

    this.messages.push(userMsg);
    this.saveChatHistory();
    this.showSuggestions = false;

    const message = this.userMessage;
    this.userMessage = '';
    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;
      const response = this.generateResponse(message);
      this.messages.push(response);
      this.saveChatHistory();
      this.scrollToBottom();
    }, 1000 + Math.random() * 1000);
  }

  generateResponse(userMessage: string): Message {
    const lowerMessage = userMessage.toLowerCase();
    let content = '';
    let category: 'order' | 'user' | 'system' | 'general' = 'general';
    let suggestions: string[] = [];

    if (lowerMessage.includes('sipariş') || lowerMessage.includes('order') || lowerMessage.includes('bestellung')) {
      category = 'order';
      content = 'Siparişler hakkında bilgi almak için aşağıdaki seçenekleri kullanabilirsiniz:\n\n' +
                '• Tüm siparişleri görüntülemek için "Orders (Tüm)" sayfasına gidin\n' +
                '• Tarihe göre siparişleri filtrelemek için "Orders (Tarih Seç)" sayfasını kullanın\n' +
                '• Yeni sipariş eklemek için "Özel Sipariş Ekle" sayfasını kullanın\n\n' +
                'Sie können die folgenden Optionen verwenden, um Informationen über Bestellungen zu erhalten:\n\n' +
                '• Gehen Sie zur Seite "Orders (Tüm)", um alle Bestellungen anzuzeigen\n' +
                '• Verwenden Sie die Seite "Orders (Tarih Seç)", um Bestellungen nach Datum zu filtern\n' +
                '• Verwenden Sie die Seite "Özel Sipariş Ekle", um eine neue Bestellung hinzuzufügen';
      suggestions = ['Tüm siparişleri göster', 'Bugünkü siparişler', 'Bekleyen siparişler'];
    } else if (lowerMessage.includes('kullanıcı') || lowerMessage.includes('user') || lowerMessage.includes('benutzer')) {
      category = 'user';
      content = 'Kullanıcı yönetimi için "Users (Arama)" sayfasını kullanabilirsiniz. Bu sayfada:\n\n' +
                '• Tüm kullanıcıları görüntüleyebilirsiniz\n' +
                '• Kullanıcıları ad, e-posta veya telefon ile arayabilirsiniz\n' +
                '• Kullanıcıları rolüne göre filtreleyebilirsiniz\n\n' +
                'Sie können die Seite "Users (Arama)" für die Benutzerverwaltung verwenden. Auf dieser Seite können Sie:\n\n' +
                '• Alle Benutzer anzeigen\n' +
                '• Benutzer nach Name, E-Mail oder Telefon suchen\n' +
                '• Benutzer nach Rolle filtern';
      suggestions = ['Tüm kullanıcıları göster', 'Admin kullanıcıları', 'Yeni kullanıcı ekle'];
    } else if (lowerMessage.includes('istatistik') || lowerMessage.includes('stat') || lowerMessage.includes('statistik')) {
      category = 'system';
      content = 'İstatistikler için admin ana sayfasındaki kartlara bakabilirsiniz. Ayrıca:\n\n' +
                '• "Orders (Tüm)" sayfasında sipariş istatistikleri\n' +
                '• "Users (Arama)" sayfasında kullanıcı istatistikleri\n' +
                '• "Loglar" sayfasında sistem logları\n\n' +
                'Sie können die Karten auf der Admin-Startseite für Statistiken ansehen. Außerdem:\n\n' +
                '• Bestellstatistiken auf der Seite "Orders (Tüm)"\n' +
                '• Benutzerstatistiken auf der Seite "Users (Arama)"\n' +
                '• Systemprotokolle auf der Seite "Loglar"';
      suggestions = ['Sipariş istatistikleri', 'Kullanıcı istatistikleri', 'Sistem durumu'];
    } else if (lowerMessage.includes('yardım') || lowerMessage.includes('help') || lowerMessage.includes('hilfe')) {
      content = 'Size nasıl yardımcı olabilirim? İşte bazı özellikler:\n\n' +
                '• Sipariş yönetimi ve görüntüleme\n' +
                '• Kullanıcı yönetimi ve arama\n' +
                '• Sistem logları ve istatistikler\n' +
                '• Özel sipariş oluşturma\n' +
                '• Form şablonları oluşturma\n\n' +
                'Wie kann ich Ihnen helfen? Hier sind einige Funktionen:\n\n' +
                '• Bestellungsverwaltung und -anzeige\n' +
                '• Benutzerverwaltung und -suche\n' +
                '• Systemprotokolle und Statistiken\n' +
                '• Erstellen spezieller Bestellungen\n' +
                '• Erstellen von Formularvorlagen';
      suggestions = ['Siparişler', 'Kullanıcılar', 'İstatistikler'];
    } else if (lowerMessage.includes('merhaba') || lowerMessage.includes('hello') || lowerMessage.includes('hallo')) {
      content = 'Merhaba! Ben Hueber Admin Asistanı. Size nasıl yardımcı olabilirim?\n\n' +
                'Hallo! Ich bin der Hueber Admin-Assistent. Wie kann ich Ihnen helfen?';
      suggestions = ['Siparişleri göster', 'Kullanıcıları listele', 'Yardım al'];
    } else {
      content = 'Anladım. Size daha iyi yardımcı olabilmem için şu konulardan birini seçebilirsiniz:\n\n' +
                '• Siparişler\n' +
                '• Kullanıcılar\n' +
                '• İstatistikler\n' +
                '• Sistem durumu\n\n' +
                'Verstanden. Sie können eines der folgenden Themen auswählen, damit ich Ihnen besser helfen kann:\n\n' +
                '• Bestellungen\n' +
                '• Benutzer\n' +
                '• Statistiken\n' +
                '• Systemstatus';
      suggestions = ['Siparişler', 'Kullanıcılar', 'İstatistikler'];
    }

    return {
      id: this.generateId(),
      type: 'assistant',
      content: content,
      timestamp: new Date(),
      category: category,
      suggestions: suggestions
    };
  }

  detectCategory(message: string): 'order' | 'user' | 'system' | 'general' {
    const lower = message.toLowerCase();
    if (lower.includes('sipariş') || lower.includes('order') || lower.includes('bestellung')) {
      return 'order';
    } else if (lower.includes('kullanıcı') || lower.includes('user') || lower.includes('benutzer')) {
      return 'user';
    } else if (lower.includes('sistem') || lower.includes('system') || lower.includes('log')) {
      return 'system';
    }
    return 'general';
  }

  quickAction(action: string): void {
    let message = '';
    
    switch (action) {
      case 'orders':
        message = 'Siparişleri göster';
        break;
      case 'users':
        message = 'Kullanıcıları listele';
        break;
      case 'stats':
        message = 'İstatistikleri göster';
        break;
      case 'system':
        message = 'Sistem durumu';
        break;
      case 'help':
        message = 'Yardım al';
        break;
      case 'recent_orders':
        message = 'Son siparişleri göster';
        break;
    }

    this.userMessage = message;
    this.sendMessage();
  }

  useSuggestion(suggestion: string): void {
    this.userMessage = suggestion;
    this.sendMessage();
  }

  clearChat(): void {
    if (confirm('Sohbet geçmişini temizlemek istediğinize emin misiniz? / Sind Sie sicher, dass Sie den Chat-Verlauf löschen möchten?')) {
      this.messages = [];
      localStorage.removeItem('chatHistory');
      this.addWelcomeMessage();
      this.showSuggestions = true;
    }
  }

  deleteMessage(messageId: string): void {
    this.messages = this.messages.filter(msg => msg.id !== messageId);
    this.saveChatHistory();
  }

  copyMessage(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      // Başarı mesajı gösterilebilir
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
  }

  get filteredMessages(): Message[] {
    if (this.selectedCategory === 'all') {
      return this.messages;
    }
    return this.messages.filter(msg => msg.category === this.selectedCategory);
  }

  get searchFilteredMessages(): Message[] {
    if (!this.searchTerm.trim()) {
      return this.filteredMessages;
    }
    const term = this.searchTerm.toLowerCase();
    return this.filteredMessages.filter(msg => 
      msg.content.toLowerCase().includes(term)
    );
  }

  formatTime(date: Date): string {
    const now = new Date();
    const msgDate = new Date(date);
    const diff = now.getTime() - msgDate.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'Şimdi / Jetzt';
    } else if (minutes < 60) {
      return `${minutes} dk önce / vor ${minutes} Min`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} sa önce / vor ${hours} Std`;
    } else {
      return msgDate.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    const msgDate = new Date(date);
    return today.toDateString() === msgDate.toDateString();
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  shouldShowDateSeparator(message: Message): boolean {
    const index = this.searchFilteredMessages.indexOf(message);
    if (index === 0) return true;
    
    const prevMessage = this.searchFilteredMessages[index - 1];
    const currentDate = new Date(message.timestamp).toDateString();
    const prevDate = new Date(prevMessage.timestamp).toDateString();
    
    return currentDate !== prevDate;
  }

  formatMessageContent(content: string): string {
    // Basit markdown benzeri formatlama
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '&bull;');
  }

  onEnterKey(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
