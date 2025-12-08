import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Admin } from './admin';
import { AuthService } from '../../services/auth.service';

// Mock AuthService
class MockAuthService {
  login = vi.fn().mockResolvedValue(undefined);
  logout = vi.fn().mockResolvedValue(undefined);
  isAuthenticated = vi.fn().mockReturnValue(true);
  isLoading = vi.fn().mockReturnValue(false);
  currentUser = vi.fn().mockReturnValue({ email: 'admin@test.com' });
  getUserEmail = vi.fn().mockReturnValue('admin@test.com');
}

describe('Admin', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService },
        { provide: Auth, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create the admin component', () => {
    const fixture = TestBed.createComponent(Admin);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render page header', async () => {
    const fixture = TestBed.createComponent(Admin);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Painel Administrativo');
  });

  it('should have logout button', async () => {
    const fixture = TestBed.createComponent(Admin);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logout-btn')).toBeTruthy();
  });

  it('should have edit button initially', async () => {
    const fixture = TestBed.createComponent(Admin);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn-primary')?.textContent).toContain('Editar');
  });

  it('should display score weights table', async () => {
    const fixture = TestBed.createComponent(Admin);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.config-table')).toBeTruthy();
  });

  it('should display risk thresholds', async () => {
    const fixture = TestBed.createComponent(Admin);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.thresholds-grid')).toBeTruthy();
  });

  it('should have four score weight items', () => {
    const fixture = TestBed.createComponent(Admin);
    const component = fixture.componentInstance;
    expect(component.scoreWeights().length).toBe(4);
  });

  it('should have four risk threshold items', () => {
    const fixture = TestBed.createComponent(Admin);
    const component = fixture.componentInstance;
    expect(component.riskThresholds().length).toBe(4);
  });

  it('should calculate total weight correctly', () => {
    const fixture = TestBed.createComponent(Admin);
    const component = fixture.componentInstance;
    expect(component.getTotalWeight()).toBeCloseTo(1, 5);
  });

  it('should toggle editing mode', () => {
    const fixture = TestBed.createComponent(Admin);
    const component = fixture.componentInstance;
    expect(component.isEditing()).toBe(false);
    component.startEditing();
    expect(component.isEditing()).toBe(true);
    component.cancelEditing();
    expect(component.isEditing()).toBe(false);
  });

  it('should update weight correctly', () => {
    const fixture = TestBed.createComponent(Admin);
    const component = fixture.componentInstance;
    component.updateWeight(0, 0.5);
    expect(component.scoreWeights()[0].peso).toBe(0.5);
  });

  it('should update threshold correctly', () => {
    const fixture = TestBed.createComponent(Admin);
    const component = fixture.componentInstance;
    component.updateThreshold(0, 'max', 30);
    expect(component.riskThresholds()[0].max).toBe(30);
  });

  it('should show error when weights do not sum to 1', () => {
    const fixture = TestBed.createComponent(Admin);
    const component = fixture.componentInstance;
    component.startEditing();
    component.updateWeight(0, 0.2);
    component.saveChanges();
    expect(component.errorMessage()).toContain('soma dos pesos');
  });

  it('should save changes when weights are valid', () => {
    const fixture = TestBed.createComponent(Admin);
    const component = fixture.componentInstance;
    component.startEditing();
    component.saveChanges();
    expect(component.isEditing()).toBe(false);
    expect(component.successMessage()).toContain('sucesso');
  });

  it('should have link to methodology documentation', async () => {
    const fixture = TestBed.createComponent(Admin);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.doc-link a')).toBeTruthy();
  });
});
