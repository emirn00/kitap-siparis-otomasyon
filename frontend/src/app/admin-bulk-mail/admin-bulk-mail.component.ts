import { Component } from '@angular/core';
import { BULK_MAIL_TEMPLATE } from './bulk-mail-template';

interface MailTemplate {
  id: string;
  name: string;
  content: string;
  visible: boolean;
  editing: boolean;
  editName: string;
  editContent: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-admin-bulk-mail',
  templateUrl: './admin-bulk-mail.component.html',
  styleUrls: ['./admin-bulk-mail.component.scss']
})
export class AdminBulkMailComponent {

  templates: MailTemplate[] = [
    {
      id: 'tpl-001',
      name: 'Hueber Interaktiv – TR + DE',
      content: BULK_MAIL_TEMPLATE,
      visible: false,
      editing: false,
      editName: '',
      editContent: '',
      isDefault: true,
    }
  ];

  activeTemplateId = 'tpl-001';

  // Modal state
  showModal = false;

  // Email entry inside modal
  emailInput = '';
  emailInputError = '';
  recipients: string[] = [];

  // Send state
  sending = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  get activeTemplate(): MailTemplate | undefined {
    return this.templates.find(t => t.id === this.activeTemplateId);
  }

  // ── Template management ───────────────────────────────────────────────────

  toggleVisible(tpl: MailTemplate): void {
    tpl.visible = !tpl.visible;
  }

  selectTemplate(tpl: MailTemplate): void {
    this.activeTemplateId = tpl.id;
  }

  startEdit(tpl: MailTemplate): void {
    tpl.editName = tpl.name;
    tpl.editContent = tpl.content;
    tpl.editing = true;
    tpl.visible = true;
  }

  saveEdit(tpl: MailTemplate): void {
    const name = tpl.editName.trim();
    const content = tpl.editContent.trim();
    if (!name || !content) return;
    tpl.name = name;
    tpl.content = content;
    tpl.editing = false;
  }

  cancelEdit(tpl: MailTemplate): void {
    tpl.editing = false;
  }

  deleteTemplate(tpl: MailTemplate): void {
    const idx = this.templates.indexOf(tpl);
    if (idx === -1) return;
    this.templates.splice(idx, 1);
    if (this.activeTemplateId === tpl.id && this.templates.length > 0) {
      this.activeTemplateId = this.templates[0].id;
    }
  }

  addTemplate(): void {
    const id = 'tpl-' + Date.now();
    const newTpl: MailTemplate = {
      id,
      name: '',
      content: '',
      visible: true,
      editing: true,
      editName: '',
      editContent: '',
      isDefault: false,
    };
    this.templates.push(newTpl);
  }

  // ── Recipients modal ──────────────────────────────────────────────────────

  openModal(): void {
    this.showModal = true;
    this.emailInput = '';
    this.emailInputError = '';
  }

  closeModal(): void {
    this.showModal = false;
  }

  addEmail(): void {
    const email = this.emailInput.trim().toLowerCase();
    this.emailInputError = '';
    if (!email) return;
    if (!this.isValidEmail(email)) { this.emailInputError = 'invalid'; return; }
    if (this.recipients.includes(email)) { this.emailInputError = 'duplicate'; return; }
    this.recipients.push(email);
    this.emailInput = '';
  }

  onEmailKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addEmail(); }
  }

  removeEmail(index: number): void {
    this.recipients.splice(index, 1);
  }

  clearAll(): void {
    this.recipients = [];
  }

  sendBulkMail(): void {
    if (this.recipients.length === 0 || this.sending) return;
    this.errorMessage = null;
    this.successMessage = null;
    this.sending = true;
    // TODO: Backend API çağrısı
    setTimeout(() => {
      this.sending = false;
      this.showModal = false;
      this.successMessage = `Mail başarıyla gönderildi. (${this.recipients.length} alıcı)`;
      this.recipients = [];
      setTimeout(() => (this.successMessage = null), 6000);
    }, 1500);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
