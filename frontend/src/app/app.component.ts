import { Component } from '@angular/core';
import { TranslationService } from './i18n/translation.service';
import { Lang } from './i18n/translations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  constructor(public translation: TranslationService) {}

  get currentLang(): Lang {
    return this.translation.currentLang;
  }

  setLang(lang: Lang): void {
    this.translation.setLanguage(lang);
  }
}
