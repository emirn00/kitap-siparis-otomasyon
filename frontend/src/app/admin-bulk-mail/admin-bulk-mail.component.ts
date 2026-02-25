import { Component } from '@angular/core';
import { BULK_MAIL_TEMPLATE } from './bulk-mail-template';

@Component({
  selector: 'app-admin-bulk-mail',
  templateUrl: './admin-bulk-mail.component.html',
  styleUrls: ['./admin-bulk-mail.component.scss']
})
export class AdminBulkMailComponent {
  emailsInput = '';
  showTemplate = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  sending = false;

  readonly mailTemplate = BULK_MAIL_TEMPLATE;

  get recipientList(): string[] {
    return this.emailsInput
      .split(/[,;\s]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0);
  }

  get canSend(): boolean {
    return this.recipientList.length > 0 && !this.sending;
  }

  toggleTemplate(): void {
    this.showTemplate = !this.showTemplate;
  }

  sendBulkMail(): void {
    if (!this.canSend) return;
    this.errorMessage = null;
    this.successMessage = null;
    this.sending = true;
    // TODO: Backend API çağrısı – şu an simüle
    setTimeout(() => {
      this.sending = false;
      this.successMessage = 'Mail başarıyla gönderildi. / E-Mail erfolgreich gesendet.';
      setTimeout(() => (this.successMessage = null), 5000);
    }, 1500);
  }
}
