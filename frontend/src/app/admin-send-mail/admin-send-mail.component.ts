import { Component } from '@angular/core';

export interface MailPreviewRow {
  fullName: string;
  email: string;
  bookCodes: string;
}

@Component({
  selector: 'app-admin-send-mail',
  templateUrl: './admin-send-mail.component.html',
  styleUrls: ['./admin-send-mail.component.scss']
})
export class AdminSendMailComponent {
  emailsInput = '';
  previewRows: MailPreviewRow[] = [];
  showConfirm = false;
  successMessage: string | null = null;

  buildPreview(): void {
    const emails = this.emailsInput
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);
    const byEmail = new Map(this.previewRows.map(r => [r.email, r]));
    this.previewRows = emails.map((email, i) => {
      const existing = byEmail.get(email);
      return {
        fullName: existing?.fullName ?? `Alıcı ${i + 1}`,
        email,
        bookCodes: existing?.bookCodes ?? ''
      };
    });
  }

  openConfirm(): void {
    if (this.previewRows.length === 0) {
      this.buildPreview();
    }
    if (this.previewRows.length === 0) return;
    this.showConfirm = true;
    this.successMessage = null;
  }

  cancelSend(): void {
    this.showConfirm = false;
  }

  confirmSend(): void {
    this.showConfirm = false;
    this.successMessage = 'Mail başarıyla gönderildi. / E-Mail erfolgreich gesendet.';
    setTimeout(() => (this.successMessage = null), 4000);
  }
}
