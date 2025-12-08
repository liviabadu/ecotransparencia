import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Metodologia } from './metodologia';

describe('Metodologia', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Metodologia],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the metodologia component', () => {
    const fixture = TestBed.createComponent(Metodologia);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the main title', async () => {
    const fixture = TestBed.createComponent(Metodologia);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Metodologia de Cálculo de Score');
  });

  it('should render risk level cards', async () => {
    const fixture = TestBed.createComponent(Metodologia);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.risk-baixo')).toBeTruthy();
    expect(compiled.querySelector('.risk-medio')).toBeTruthy();
    expect(compiled.querySelector('.risk-alto')).toBeTruthy();
    expect(compiled.querySelector('.risk-critico')).toBeTruthy();
  });

  it('should render data sources section', async () => {
    const fixture = TestBed.createComponent(Metodologia);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ambiental IBAMA');
    expect(compiled.textContent).toContain('Ambiental ICMBio');
    expect(compiled.textContent).toContain('Trabalhista');
    expect(compiled.textContent).toContain('Administrativo');
  });

  it('should render the example table', async () => {
    const fixture = TestBed.createComponent(Metodologia);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.example-table')).toBeTruthy();
  });

  it('should have a link back to home', async () => {
    const fixture = TestBed.createComponent(Metodologia);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const homeLink = compiled.querySelector('a[routerLink="/"]');
    expect(homeLink).toBeTruthy();
  });
});
