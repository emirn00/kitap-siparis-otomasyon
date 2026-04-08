import { Component } from '@angular/core';
import { ChatbotService, ChatbotResponse } from './chatbot.service';

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
  messages: Message[] = [
    { text: 'Merhaba! Ben Kitapçı Asistanı. Size nasıl yardımcı olabilirim?', sender: 'bot', timestamp: new Date() }
  ];
  currentMessage = '';
  isLoading = false;

  constructor(private chatbotService: ChatbotService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
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
