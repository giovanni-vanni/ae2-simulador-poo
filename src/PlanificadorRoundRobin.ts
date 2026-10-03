import type { IPlanificadorCPU, ResultadoCPU } from "./interfaces.js";
import type { Proceso } from "./Proceso.js";
import { EstadoProceso } from "./tipos.js";
import { enteroPositivo, exigir } from "./utilidades.js";

export class PlanificadorRoundRobin implements IPlanificadorCPU {
    private readonly quantum: number;
    private listos: Proceso[] = [];
    private cpu: Proceso | null = null;
    private cambiosContexto: number = 0;

    constructor(quantum: number) {
        exigir(enteroPositivo(quantum), "El quantum debe ser un entero positivo");
        this.quantum = quantum;
    }

    encolar(proceso: Proceso): void {
        const repetido = this.listos.includes(proceso) || this.cpu === proceso;
        !repetido && proceso.getEstado() !== EstadoProceso.Terminado && this.listos.push(proceso);
    }

    actualizarBloqueados(procesos: Proceso[]): Proceso[] {
        return procesos;
    }

    ejecutarTick(): ResultadoCPU {
        this.despachar();
        const proceso = this.cpu;
        proceso?.consumirCPU();

        const resultado: ResultadoCPU = {
            usoCPU: Boolean(proceso),
            terminado: null,
            bloqueado: null
        };

        const finalizo = Boolean(proceso && proceso.getCpuRestante() === 0);
        finalizo && proceso?.terminar();
        finalizo && (resultado.terminado = proceso);
        finalizo && (this.cpu = null);

        const quantumAgotado = Boolean(
            proceso && !finalizo && proceso.getQuantumConsumido() >= this.quantum
        );
        const rotar = quantumAgotado && this.listos.length > 0;
        rotar && proceso?.ponerListo();
        rotar && proceso?.reiniciarQuantum();
        rotar && proceso && this.listos.push(proceso);
        rotar && this.cambiosContexto++;
        rotar && (this.cpu = null);
        quantumAgotado && !rotar && proceso?.reiniciarQuantum();

        return resultado;
    }

    obtenerListos(): string[] {
        return this.listos.map(proceso => proceso.getPid());
    }

    obtenerCPU(): string | null {
        return this.cpu?.getPid() ?? null;
    }

    obtenerCambiosContexto(): number {
        return this.cambiosContexto;
    }

    private despachar(): void {
        const necesitaProceso = this.cpu === null;
        necesitaProceso && (this.cpu = this.listos.shift() ?? null);
        necesitaProceso && this.cpu?.comenzarEjecucion();
    }
}
