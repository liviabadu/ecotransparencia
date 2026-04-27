import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthService } from './services/auth.service';

class MockAuthService {
  currentUser = signal<unknown>(null);
  isAuthenticated = signal(false);
  isLoading = signal(false);
  getDisplayName = () => '';
  getDashboardGreetingName = () => '';
  getUserEmail = () => null;
  getUsernameHandle = () => '';
  getPhotoUrl = () => null;
  getRailAvatarPhotoUrl = (_edge?: number) => null;
  getInitials = () => '?';
  getDashboardBadgeTwoLetters = () => '?';
  logout = vi.fn().mockResolvedValue(undefined);
  updateDisplayName = vi.fn().mockResolvedValue(undefined);
  uploadProfilePhoto = vi.fn().mockResolvedValue(undefined);
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router-outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
