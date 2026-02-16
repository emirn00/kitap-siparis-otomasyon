import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey = '';
  private lastValue = '';

  constructor(
    private translation: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    this.translation.onLangChange.subscribe(() => {
      this.lastKey = '';
      this.cdr.markForCheck();
    });
  }

  transform(key: string): string {
    if (key === this.lastKey) return this.lastValue;
    this.lastKey = key;
    this.lastValue = this.translation.get(key);
    return this.lastValue;
  }

  ngOnDestroy(): void {}
}
