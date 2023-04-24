export interface UltimaPuja {
    id_puja: number;
    id_lote: number;
    id_usuario: number;
    puja: string;
    codigo_paleta: string;
    fecha_creado: string;
    usuario: Usuario;
}

export interface Usuario {
    nombres: string;
    identificacion: string;
}