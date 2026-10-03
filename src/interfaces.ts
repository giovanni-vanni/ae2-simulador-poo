import type { EstadoSistema, EventoES, Metricas, NombrePolitica, VistaBloque, VistaProceso } from "./tipos.js";
import type { Proceso } from "./Proceso.js";
import type { BloqueMemoria } from "./BloqueMemoria.js";

export interface IPoliticaAsignacion {
    seleccionar(bloques: BloqueMemoria[], tamanio: number): number;
}

export interface IGestionMemoria {
    asignar(proceso: Proceso): boolean;
    liberar(pid: string): void;
    obtenerBloques(): VistaBloque[];
    memoriaLibre(): number;
    mayorBloqueLibre(): number;
    ocupacion(): number;
}

export interface IPlanificadorCPU {
    encolar(proceso: Proceso): void;
    ejecutarTick(): ResultadoCPU;
    actualizarBloqueados(procesos: Proceso[]): Proceso[];
    obtenerListos(): string[];
    obtenerCPU(): string | null;
    obtenerCambiosContexto(): number;
}

export interface ISimulador {
    registrarProceso(pid: string, memoria: number, cpuTotal: number, evento?: EventoES): void;
    tick(): void;
    consultarProceso(pid: string): VistaProceso | undefined;
    obtenerEstado(): EstadoSistema;
    obtenerMetricas(): Metricas;
    obtenerPolitica(): NombrePolitica;
}

export type ResultadoCPU = {
    usoCPU: boolean;
    terminado: Proceso | null;
    bloqueado: Proceso | null;
};
