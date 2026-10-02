export enum EstadoProceso {
    Nuevo = "Nuevo",
    EsperandoMemoria = "Esperando Memoria",
    Listo = "Listo",
    Ejecutando = "Ejecutando",
    Bloqueado = "Bloqueado",
    Terminado = "Terminado"
}

export type NombrePolitica = "first-fit" | "best-fit" | "worst-fit";

export type EventoES = {
    despuesDe: number;
    duracion: number;
};

export type VistaProceso = {
    pid: string;
    memoria: number;
    cpuTotal: number;
    cpuRestante: number;
    estado: EstadoProceso;
    quantumConsumido: number;
    bloqueoRestante: number;
};

export type VistaBloque = {
    inicio: number;
    tamanio: number;
    pid: string | null;
};

export type Metricas = {
    ocupacionMemoria: number;
    utilizacionCPU: number;
    cambiosContexto: number;
    memoriaLibreTotal: number;
    mayorBloqueLibre: number;
    fragmentacionExterna: number;
};

export type EstadoSistema = {
    tick: number;
    cpu: string | null;
    listos: string[];
    esperandoMemoria: string[];
    bloqueados: string[];
    terminados: string[];
    memoria: VistaBloque[];
};
