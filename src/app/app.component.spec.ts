import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('se instancia correctamente', () => {
    const component = new AppComponent();
    expect(component).toBeInstanceOf(AppComponent);
  });
});
