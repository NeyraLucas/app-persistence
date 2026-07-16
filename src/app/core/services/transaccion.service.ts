import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CancelarTransaccionRequest,
  CancelarTransaccionResponse,
  CrearTransaccionRequest,
  CrearTransaccionResponse,
  OrdenDireccion,
  TransaccionPageResponse,
} from '../models/transaccion.model';

@Injectable({
  providedIn: 'root',
})
export class TransaccionService {
  private readonly http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:8081/api/transacciones';

  getTransactions(
    page: number,
    size: number,
    sortField: string = 'id',
    sortDir: OrdenDireccion = 'asc',
  ): Observable<TransaccionPageResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sortField},${sortDir}`);

    return this.http.get<TransaccionPageResponse>(this.API_URL, { params });
  }

  createTransaction(data: CrearTransaccionRequest): Observable<CrearTransaccionResponse> {
    return this.http.post<CrearTransaccionResponse>(this.API_URL, data);
  }

  cancelTransaction(data: CancelarTransaccionRequest): Observable<CancelarTransaccionResponse> {
    return this.http.patch<CancelarTransaccionResponse>(this.API_URL, data);
  }
}
