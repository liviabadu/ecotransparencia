import { TestBed } from '@angular/core/testing';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();
  });

  it('should create the home component', () => {
    const fixture = TestBed.createComponent(Home);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render hero title', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Transparência');
    expect(compiled.querySelector('h1')?.textContent).toContain('Socioambiental');
  });

  it('should render the search component', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-search')).toBeTruthy();
  });
});
