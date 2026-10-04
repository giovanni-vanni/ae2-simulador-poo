import type { ISimulador } from "./interfaces.js";
import { Memoria } from "./Memoria.js";
import { PlanificadorRoundRobin } from "./PlanificadorRoundRobin.js";
import { Proceso } from "./Proceso.js";
import type { EstadoSistema, EventoES, Metricas, NombrePolitica, VistaProceso } from "./tipos.js";
import { EstadoProceso } from "./tipos.js";
import { enteroPositivo, exigir } from "./utilidades.js";

export class Simulador implements ISimulador {
    private readonly memoria: Memoria;
    private readonly planificador: PlanificadorRoundRobin;
    private readonly procesos: Proceso[] = [];
    private pendientes: Proceso[] = [];
    private bloqueados: Proceso[] = [];
    private terminados: Proceso[] = [];
    private tickActual: number = 0;
    private ticksCPUOcupada: number = 0;

    constructor(memoriaTotal: number = 1024, quantum: number = 2, politica: NombrePolitica = "first-fit") {
        exigir(enteroPositivo(memoriaTotal), "La memoria total debe ser un entero positivo");
        exigir(enteroPositivo(quantum), "El quantum debe ser un entero positivo");

        this.memoria = new Memoria(memoriaTotal, politica);
        this.planificador = new PlanificadorRoundRobin(quantum);
    }

    registrarProceso(pid: string, memoria: number, cpuTotal: number, evento?: EventoES): void {
        exigir(!this.procesos.some(proceso => proceso.getPid() === pid), "El PID ya existe");
        exigir(memoria <= this.memoria.getTotal(), "El proceso solicita mas memoria que la disponible");

        const proceso = new Proceso(pid, memoria, cpuTotal, evento);
        this.procesos.push(proceso);
        this.pendientes.push(proceso);
    }

    tick(): void {
        this.admitirPendientes();
        this.bloqueados = this.planificador.actualizarBloqueados(this.bloqueados);

        const resultado = this.planificador.ejecutarTick();
        this.ticksCPUOcupada += Number(resultado.usoCPU);

        resultado.bloqueado && this.bloqueados.push(resultado.bloqueado);
        resultado.terminado && this.finalizar(resultado.terminado);

        this.tickActual++;
    }

    consultarProceso(pid: string): VistaProceso | undefined {
        return this.procesos.find(proceso => proceso.getPid() === pid)?.vista();
    }

    obtenerEstado(): EstadoSistema {
        return {
            tick: this.tickActual,
            cpu: this.planificador.obtenerCPU(),
            listos: this.planificador.obtenerListos(),
            esperandoMemoria: this.pendientes
                .filter(proceso => proceso.getEstado() === EstadoProceso.EsperandoMemoria)
                .map(proceso => proceso.getPid()),
            bloqueados: this.bloqueados.map(proceso => proceso.getPid()),
            terminados: this.terminados.map(proceso => proceso.getPid()),
            memoria: this.memoria.obtenerBloques()
        };
    }

    obtenerMetricas(): Metricas {
        const libre = this.memoria.memoriaLibre();
        const mayor = this.memoria.mayorBloqueLibre();
        const hayMemoriaLibre = libre > 0;
        const fragmentacion = 100 * (1 - mayor / Math.max(1, libre)) * Number(hayMemoriaLibre);

        return {
            ocupacionMemoria: this.memoria.ocupacion(),
            utilizacionCPU: 100 * this.ticksCPUOcupada / Math.max(1, this.tickActual),
            cambiosContexto: this.planificador.obtenerCambiosContexto(),
            memoriaLibreTotal: libre,
            mayorBloqueLibre: mayor,
            fragmentacionExterna: fragmentacion
        };
    }

    obtenerPolitica(): NombrePolitica {
        return this.memoria.getNombrePolitica();
    }

    private admitirPendientes(): void {
        this.pendientes = this.pendientes.filter(proceso => {
            const asignado = this.memoria.asignar(proceso);
            asignado && proceso.ponerListo();
            asignado && this.planificador.encolar(proceso);
            asignado || proceso.esperarMemoria();
            return !asignado;
        });
    }

    private finalizar(proceso: Proceso): void {
        this.memoria.liberar(proceso.getPid());
        this.terminados.push(proceso);
    }
}
