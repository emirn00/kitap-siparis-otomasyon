import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AdminBook } from '../../../admin/admin-book-store.service';

@Component({
    selector: 'app-book-card',
    templateUrl: './book-card.component.html',
    styleUrls: ['./book-card.component.scss']
})
export class BookCardComponent {
    @Input() book!: AdminBook;
    @Input() isEditing = false;
    @Input() isDeleting = false;

    @Output() edit = new EventEmitter<AdminBook>();
    @Output() delete = new EventEmitter<AdminBook>();
    @Output() save = new EventEmitter<AdminBook>();
    @Output() cancel = new EventEmitter<void>();
    @Output() confirmDelete = new EventEmitter<void>();
    @Output() cancelDelete = new EventEmitter<void>();

    placeholderImage = 'https://via.placeholder.com/150x200?text=Book+Cover';

    onEdit() {
        this.edit.emit(this.book);
    }

    onDelete() {
        this.delete.emit(this.book);
    }

    onSave() {
        this.save.emit(this.book);
    }

    onCancel() {
        this.cancel.emit();
    }

    onConfirmDelete() {
        this.confirmDelete.emit();
    }

    onCancelDelete() {
        this.cancelDelete.emit();
    }
}
