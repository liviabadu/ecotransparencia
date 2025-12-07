# EcoTransparência - Development Guidelines

## Build & Configuration

### Prerequisites
- Node.js with npm (packageManager: npm@10.9.3)
- Angular CLI 21.x

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
# or
npx ng serve
```
The application will be available at `http://localhost:4200/`.

### Production Build
```bash
npm run build
# or
npx ng build --configuration production
```
Build artifacts are output to the `dist/` directory.

### Development Build with Watch Mode
```bash
npm run watch
```

## Testing

This project uses **Vitest** (v4.x) as the test runner with Angular's `@angular/build:unit-test` builder.

### Running Tests

**Single run (CI mode):**
```bash
npx ng test --no-watch
```

**Watch mode (development):**
```bash
npm test
# or
npx ng test
```

### Test File Conventions
- Test files should be placed alongside the source files they test
- Test files must use the `.spec.ts` extension
- Example: `calculator.service.ts` → `calculator.service.spec.ts`

### Writing Tests

**Service Test Example:**
```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform expected behavior', () => {
    expect(service.someMethod()).toBe(expectedValue);
  });
});
```

**Component Test Example:**
```typescript
import { TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(MyComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render content', async () => {
    const fixture = TestBed.createComponent(MyComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('selector')?.textContent).toContain('expected text');
  });
});
```

### Testing Edge Cases
Use `expect().toThrow()` for error testing:
```typescript
it('should throw error for invalid input', () => {
  expect(() => service.methodThatThrows()).toThrow('Error message');
});
```

## Code Style

### Prettier Configuration
The project uses Prettier with the following settings (defined in `package.json`):
- Print width: 100 characters
- Single quotes: enabled
- HTML files: Angular parser

### Angular Conventions
- **Standalone components**: All components use the standalone architecture with `imports` array
- **Signals**: Use Angular signals for reactive state (e.g., `signal()`, `computed()`)
- **Component prefix**: `app-` (defined in angular.json)
- **Component file naming**: Use `.ts` for component class files (not `.component.ts`)
  - Example: `app.ts`, `my-feature.ts`

### Project Structure
```
src/
├── app/
│   ├── app.ts              # Root component
│   ├── app.html            # Root template
│   ├── app.css             # Root styles
│   ├── app.spec.ts         # Root component tests
│   ├── app.config.ts       # Application configuration
│   └── app.routes.ts       # Route definitions
├── main.ts                 # Application entry point
└── styles.css              # Global styles
public/                     # Static assets
```

## Build Budgets (Production)
- Initial bundle: warning at 500kB, error at 1MB
- Component styles: warning at 4kB, error at 8kB
