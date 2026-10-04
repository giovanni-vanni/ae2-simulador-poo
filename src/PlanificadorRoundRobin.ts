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
        const desbloqueados = procesos.filter(proceso => proceso.actualizarBloqueo());
        desbloqueados.forEach(proceso => this.encolar(proceso));
        return procesos.filter(proceso => proceso.getEstado() === EstadoProceso.Bloqueado);
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

        proceso && this.resolverResultado(proceso, resultado);
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

    private resolverResultado(proceso: Proceso, resultado: ResultadoCPU): void {
        const finalizo = proceso.getCpuRestante() === 0;
        const bloqueo = !finalizo && proceso.debeBloquearse();
        const quantumAgotado = !finalizo && !bloqueo && proceso.getQuantumConsumido() >= this.quantum;
        const hayOtrosListos = this.listos.length > 0;

        const reglas = [
            {
                aplica: finalizo,
                ejecutar: () => {
                    proceso.terminar();
                    resultado.terminado = proceso;
                    this.cpu = null;
                }
            },
            {
                aplica: bloqueo,
                ejecutar: () => {
                    proceso.bloquear();
                    resultado.bloqueado = proceso;
                    this.cambiosContexto++;
                    this.cpu = null;
                }
            },
            {
                aplica: quantumAgotado && hayOtrosListos,
                ejecutar: () => {
                    proceso.ponerListo();
                    proceso.reiniciarQuantum();
                    this.listos.push(proceso);
                    this.cambiosContexto++;
                    this.cpu = null;
                }
            },
            {
                aplica: quantumAgotado && !hayOtrosListos,
                ejecutar: () => proceso.reiniciarQuantum()
            }
        ];

        reglas.find(regla => regla.aplica)?.ejecutar();
    }
}
