import type { VistaProceso } from "./tipos.js";
import { EstadoProceso } from "./tipos.js";
import { enteroPositivo, exigir } from "./utilidades.js";

export class Proceso {
    private readonly pid: string;
    private readonly memoria: number;
    private readonly cpuTotal: number;
    private cpuRestante: number;
    private estado: EstadoProceso = EstadoProceso.Nuevo;
    private quantumConsumido: number = 0;

    constructor(pid: string, memoria: number, cpuTotal: number) {
        exigir(pid.trim().length > 0, "El PID no puede estar vacio");
        exigir(enteroPositivo(memoria), "La memoria del proceso debe ser un entero positivo");
        exigir(enteroPositivo(cpuTotal), "El tiempo de CPU debe ser un entero positivo");
        this.pid = pid;
        this.memoria = memoria;
        this.cpuTotal = cpuTotal;
        this.cpuRestante = cpuTotal;
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
        this.quantumConsumido++;
    }

    terminar(): void {
        this.estado = EstadoProceso.Terminado;
        this.quantumConsumido = 0;
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
            bloqueoRestante: 0
        };
    }
}
