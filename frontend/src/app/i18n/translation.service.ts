import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Lang, TRANSLATIONS } from './translations';

const STORAGE_KEY = 'hueber_lang';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private currentLang$ = new BehaviorSubject<Lang>(this.getStoredLang());

  constructor() {}

  get currentLang(): Lang {
    return this.currentLang$.value;
  }

  get onLangChange() {
    return this.currentLang$.asObservable();
  }

  private getStoredLang(): Lang {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === 'tr' || stored === 'de' || stored === 'en') return stored;
    } catch {}
    return 'tr';
  }

  setLanguage(lang: Lang): void {
    if (lang !== 'tr' && lang !== 'de' && lang !== 'en') return;
    localStorage.setItem(STORAGE_KEY, lang);
    this.currentLang$.next(lang);
  }

  get(key: string): string {
    const dict = TRANSLATIONS[this.currentLang];
    return dict[key] ?? key;
  }
}
