export interface Transaccion {
  id: string;
  operacion: string;
  importe: string;
  cliente: string;
  referencia: string;
  estatus: string;
  secreto: string;
}

export interface TransaccionPageResponse {
  contenido: Transaccion[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface CrearTransaccionRequest {
  operacion: string;
  importe: string;
  cliente: string;
  secreto: string;
}

export interface CrearTransaccionResponse {
  id: string;
  estatus: string;
  referencia: string;
  operacion: string;
}

export interface CancelarTransaccionRequest {
  id: string;
  referencia: string;
  estatus: string;
}

export interface CancelarTransaccionResponse {
  id: string;
  estatus: string;
  referencia: string;
  operacion: string;
}

export type OrdenDireccion = 'asc' | 'desc';
