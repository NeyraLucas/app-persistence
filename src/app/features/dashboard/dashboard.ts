import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HeaderComponent } from '../../share/components/header-component/header-component';
import { TransaccionService } from '../../core/services/transaccion.service';
import { CancelarTransaccionRequest, Transaccion, TransaccionPageResponse } from '../../core/models/transaccion.model';
import { TransaccionFormComponent } from './components/transaccion-form/transaccion-form.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    HeaderComponent,
    TransaccionFormComponent,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements AfterViewInit {
  private readonly transaccionService = inject(TransaccionService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Pagination state as signals — resource re-fetches reactively when they change
  protected readonly page = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly displayedColumns: string[] = [
    'id',
    'operacion',
    'importe',
    'cliente',
    'referencia',
    'estatus',
    'acciones',
  ];

  protected readonly transaccionesResource = rxResource<TransaccionPageResponse, { page: number; size: number }>({
    params: () => ({
      page: this.page(),
      size: this.pageSize(),
    }),
    stream: (ctx) => this.transaccionService.getTransactions(ctx.params.page, ctx.params.size),
  });

  protected get transacciones(): Transaccion[] {
    return this.transaccionesResource.value()?.contenido ?? [];
  }

  protected get totalElementos(): number {
    return this.transaccionesResource.value()?.totalElementos ?? 0;
  }

  ngAfterViewInit(): void {
    // MatPaginator events are handled via (page) binding in the template
  }

  protected reloadTransacciones(): void {
    this.transaccionesResource.reload();
  }

  protected onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  private readonly snackBar = inject(MatSnackBar);

  protected isAprobada(estatus: string): boolean {
    return estatus?.toLowerCase() === 'aprobada';
  }

  protected cancelTrnx(row: Transaccion): void {
    const request: CancelarTransaccionRequest = {
      id: row.id,
      referencia: row.referencia,
      estatus: 'cancelar',
    };

    this.transaccionService.cancelTransaction(request).subscribe({
      next: (response) => {
        this.snackBar.open(
          `Transacción ${response.id} cancelada con éxito (Referencia: ${response.referencia})`,
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          },
        );
        this.reloadTransacciones();
      },
      error: (error) => {
        const msg = error.error?.mensaje ?? 'Error al cancelar la transacción';
        this.snackBar.open(msg, 'Cerrar', {
          duration: 5000,
          panelClass: ['snackbar-error'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }
}
