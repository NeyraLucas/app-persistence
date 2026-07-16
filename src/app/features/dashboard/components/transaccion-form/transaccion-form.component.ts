import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { TransaccionService } from '../../../../core/services/transaccion.service';
import { AesService } from '../../../../core/services/aes.service';
import { CrearTransaccionResponse } from '../../../../core/models/transaccion.model';

interface TransaccionFormValue {
  operacion: FormControl<string | null>;
  importe: FormControl<string | null>;
  cliente: FormControl<string | null>;
  secreto: FormControl<string | null>;
}

@Component({
  selector: 'app-transaccion-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './transaccion-form.component.html',
  styleUrl: './transaccion-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransaccionFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly transaccionService = inject(TransaccionService);
  private readonly aesService = inject(AesService);
  private readonly snackBar = inject(MatSnackBar);

  /** Emits when a transaction is created successfully so the parent can reload the table. */
  readonly transaccionCreada = output<CrearTransaccionResponse>();

  protected readonly submitting = signal(false);

  protected readonly transaccionForm: FormGroup<TransaccionFormValue> = this.fb.group({
    operacion: new FormControl<string | null>(null, [
      Validators.required,
      Validators.pattern(/^[a-zA-Z\s]+$/),
    ]),
    importe: new FormControl<string | null>(null, [
      Validators.required,
      Validators.pattern(/^\d+(\.\d{1,2})?$/),
    ]),
    cliente: new FormControl<string | null>(null, [
      Validators.required,
      Validators.pattern(/^[a-zA-Z\s]+$/),
      Validators.maxLength(100),
    ]),
    secreto: new FormControl<string | null>(null, [Validators.required]),
  });

  /** Convenience getters for cleaner template access */
  protected get operacionCtrl(): FormControl<string | null> {
    return this.transaccionForm.controls.operacion;
  }

  protected get importeCtrl(): FormControl<string | null> {
    return this.transaccionForm.controls.importe;
  }

  protected get clienteCtrl(): FormControl<string | null> {
    return this.transaccionForm.controls.cliente;
  }

  protected get secretoCtrl(): FormControl<string | null> {
    return this.transaccionForm.controls.secreto;
  }

  protected onSubmit(): void {
    if (this.transaccionForm.invalid) {
      this.transaccionForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const { operacion, importe, cliente, secreto } = this.transaccionForm.value;
    const secretoCifrado = this.aesService.encrypt(secreto!);

    this.transaccionService
      .createTransaction({
        operacion: operacion!,
        importe: importe!,
        cliente: cliente!,
        secreto: secretoCifrado,
      })
      .subscribe({
        next: (response) => {
          this.submitting.set(false);
          this.showSuccessSnackbar(response);
          this.transaccionForm.reset();
          this.transaccionCreada.emit(response);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          const msg: string =
            (err.error?.mensaje as string | undefined) ??
            'Ocurrió un error al registrar la operación';
          this.snackBar.open(msg, 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }

  private showSuccessSnackbar(response: CrearTransaccionResponse): void {
    const mensaje = `Transacción ${response.estatus} · ID: ${response.id} · Referencia: ${response.referencia}`;
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
