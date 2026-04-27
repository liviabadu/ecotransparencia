import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';

// Mock AuthService
class MockAuthService {
  login = vi.fn().mockResolvedValue(undefined);
  logout = vi.fn().mockResolvedValue(undefined);
  isAuthenticated = vi.fn().mockReturnValue(false);
  isLoading = vi.fn().mockReturnValue(false);
  currentUser = vi.fn().mockReturnValue(null);
  getUserEmail = vi.fn().mockReturnValue(null);
}

describe('Login', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService },
        { provide: Auth, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create the login component', () => {
    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render login form', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form')).toBeTruthy();
  });

  it('should have email input field', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
  });

  it('should have password input field', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('should have submit button', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should display header title', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Entrar');
  });

  it('should have back link to home page', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const backLink = compiled.querySelector('.back-link');
    expect(backLink).toBeTruthy();
    expect(backLink?.textContent).toContain('Voltar');
  });

  it('should update email signal on input change', () => {
    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;
    component.onEmailChange('test@example.com');
    expect(component.email()).toBe('test@example.com');
  });

  it('should update password signal on input change', () => {
    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;
    component.onPasswordChange('password123');
    expect(component.password()).toBe('password123');
  });
});
