import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BULK_MAIL_TEMPLATE } from './bulk-mail-template';

interface BulkEmailResponse {
  id: string;
  recipientEmail: string;
  subject: string;
  status: string;
  sentAt: string | null;
  errorMessage: string | null;
}

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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

@Component({
  selector: 'app-admin-bulk-mail',
  templateUrl: './admin-bulk-mail.component.html',
  styleUrls: ['./admin-bulk-mail.component.scss']
})
export class AdminBulkMailComponent {

  private readonly mailUrl = 'http://localhost:8080/api/mail/send-bulk';

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
  recipients: string[] = []; // Manual emails

  // Registered users
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  userSearchQuery = '';
  selectedUserEmails: Set<string> = new Set();
  loadingUsers = false;

  // Send state
  sending = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

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
    this.fetchUsers();
  }

  fetchUsers(): void {
    if (this.allUsers.length > 0) {
      this.applyUserFilter();
      return;
    }
    this.loadingUsers = true;
    this.http.get<User[]>('http://localhost:8080/users').subscribe({
      next: (users) => {
        this.allUsers = users;
        this.applyUserFilter();
        this.loadingUsers = false;
      },
      error: () => (this.loadingUsers = false),
    });
  }

  onUserSearch(): void {
    this.applyUserFilter();
  }

  applyUserFilter(): void {
    const q = this.userSearchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredUsers = this.allUsers;
    } else {
      this.filteredUsers = this.allUsers.filter(u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
  }

  toggleUserSelection(email: string): void {
    if (this.selectedUserEmails.has(email)) {
      this.selectedUserEmails.delete(email);
    } else {
      this.selectedUserEmails.add(email);
    }
  }

  isUserSelected(email: string): boolean {
    return this.selectedUserEmails.has(email);
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    if (checked) {
      this.filteredUsers.forEach(u => this.selectedUserEmails.add(u.email));
    } else {
      this.filteredUsers.forEach(u => this.selectedUserEmails.delete(u.email));
    }
  }

  get areAllFilteredSelected(): boolean {
    if (this.filteredUsers.length === 0) return false;
    return this.filteredUsers.every(u => this.selectedUserEmails.has(u.email));
  }

  get totalRecipientCount(): number {
    const combined = new Set([...this.recipients, ...Array.from(this.selectedUserEmails)]);
    return combined.size;
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
    const combinedRecipients = Array.from(new Set([...this.recipients, ...Array.from(this.selectedUserEmails)]));
    if (combinedRecipients.length === 0 || this.sending) return;
    const tpl = this.activeTemplate;
    if (!tpl) return;

    this.errorMessage = null;
    this.successMessage = null;
    this.sending = true;

    const payload = {
      toList: combinedRecipients,
      subject: tpl.name,
      text: tpl.content,
      includeActivationCode: false,
    };

    this.http.post<BulkEmailResponse[]>(this.mailUrl, payload).subscribe({
      next: (results) => {
        this.sending = false;
        this.showModal = false;
        const failed = results.filter(r => r.status === 'FAILED');
        if (failed.length === 0) {
          this.successMessage = `Mail başarıyla gönderildi. (${results.length} alıcı)`;
        } else {
          this.successMessage = `${results.length - failed.length} alıcıya gönderildi, ${failed.length} başarısız.`;
        }
        this.recipients = [];
        this.selectedUserEmails.clear();
        setTimeout(() => (this.successMessage = null), 6000);
      },
      error: (err) => {
        this.sending = false;
        this.errorMessage = err?.error?.message ?? 'Mail gönderilemedi. Lütfen tekrar deneyin.';
      },
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
