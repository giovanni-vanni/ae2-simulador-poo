import type { EventoES, VistaProceso } from "./tipos.js";
import { EstadoProceso } from "./tipos.js";
import { enteroPositivo, exigir } from "./utilidades.js";

export class Proceso {
    private readonly pid: string;
    private readonly memoria: number;
    private readonly cpuTotal: number;
    private cpuRestante: number;
    private estado: EstadoProceso = EstadoProceso.Nuevo;
    private quantumConsumido: number = 0;
    private bloqueoRestante: number = 0;
    private cpuConsumida: number = 0;
    private eventoES: EventoES | null = null;
    private eventoDisparado: boolean = false;

    constructor(pid: string, memoria: number, cpuTotal: number, evento?: EventoES) {
        exigir(pid.trim().length > 0, "El PID no puede estar vacio");
        exigir(enteroPositivo(memoria), "La memoria del proceso debe ser un entero positivo");
        exigir(enteroPositivo(cpuTotal), "El tiempo de CPU debe ser un entero positivo");

        this.pid = pid;
        this.memoria = memoria;
        this.cpuTotal = cpuTotal;
        this.cpuRestante = cpuTotal;

        evento && this.configurarEntradaSalida(evento.despuesDe, evento.duracion);
    }

    configurarEntradaSalida(despuesDe: number, duracion: number): void {
        exigir(enteroPositivo(despuesDe), "El momento de E/S debe ser un entero positivo");
        exigir(enteroPositivo(duracion), "La duracion de E/S debe ser un entero positivo");
        exigir(despuesDe < this.cpuTotal, "La E/S debe ocurrir antes de finalizar el proceso");
        this.eventoES = { despuesDe, duracion };
        this.eventoDisparado = false;
    }

    esperarMemoria(): void {
        this.estado = EstadoProceso.EsperandoMemoria;
    }

    ponerListo(): void {
        this.estado = EstadoProceso.Listo;
    }

    comenzarEjecucion(): void {
        this.estado = EstadoProceso.Ejecutando;
        this.quantumConsumido = 0;
    }

    consumirCPU(): void {
        this.cpuRestante--;
        this.cpuConsumida++;
        this.quantumConsumido++;
    }

    bloquear(): void {
        this.estado = EstadoProceso.Bloqueado;
        this.bloqueoRestante = this.eventoES?.duracion ?? 0;
        this.eventoDisparado = true;
        this.quantumConsumido = 0;
    }

    actualizarBloqueo(): boolean {
        const estabaBloqueado = this.estado === EstadoProceso.Bloqueado;
        this.bloqueoRestante = Math.max(0, this.bloqueoRestante - Number(estabaBloqueado));
        const terminoBloqueo = estabaBloqueado && this.bloqueoRestante === 0;
        terminoBloqueo && this.ponerListo();
        return terminoBloqueo;
    }

    terminar(): void {
        this.estado = EstadoProceso.Terminado;
        this.quantumConsumido = 0;
        this.bloqueoRestante = 0;
    }

    reiniciarQuantum(): void {
        this.quantumConsumido = 0;
    }

    debeBloquearse(): boolean {
        return Boolean(
            this.eventoES &&
            !this.eventoDisparado &&
            this.cpuConsumida === this.eventoES.despuesDe
        );
    }

    getPid(): string {
        return this.pid;
    }

    getMemoria(): number {
        return this.memoria;
    }

    getCpuRestante(): number {
        return this.cpuRestante;
    }

    getQuantumConsumido(): number {
        return this.quantumConsumido;
    }

    getEstado(): EstadoProceso {
        return this.estado;
    }

    vista(): VistaProceso {
        return {
            pid: this.pid,
            memoria: this.memoria,
            cpuTotal: this.cpuTotal,
            cpuRestante: this.cpuRestante,
            estado: this.estado,
            quantumConsumido: this.quantumConsumido,
            bloqueoRestante: this.bloqueoRestante
        };
    }
}
