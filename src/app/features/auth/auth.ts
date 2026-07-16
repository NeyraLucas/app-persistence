import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.value as { username: string; password: string };

    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg: string = err.error?.mensaje ?? 'Error al iniciar sesión, intenta de nuevo';
        this.errorMessage.set(msg);
      },
    });
  }

  protected togglePassword(): void {
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;
    const icon = document.getElementById('passwordIcon');
    if (!passwordInput || !icon) return;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.textContent = 'visibility_off';
    } else {
      passwordInput.type = 'password';
      icon.textContent = 'visibility';
    }
  }
}
