import type { IGestionMemoria, IPoliticaAsignacion } from "./interfaces.js";
import type { Proceso } from "./Proceso.js";
import type { NombrePolitica, VistaBloque } from "./tipos.js";
import { enteroPositivo, exigir } from "./utilidades.js";
import { BloqueMemoria } from "./BloqueMemoria.js";
import { BestFit, FirstFit, WorstFit } from "./Politicas.js";

export class Memoria implements IGestionMemoria {
    private readonly total: number;
    private readonly nombrePolitica: NombrePolitica;
    private readonly politica: IPoliticaAsignacion;
    private bloques: BloqueMemoria[];

    constructor(total: number, nombrePolitica: NombrePolitica) {
        exigir(enteroPositivo(total), "La memoria total debe ser un entero positivo");

        const politicas: Record<NombrePolitica, IPoliticaAsignacion> = {
            "first-fit": new FirstFit(),
            "best-fit": new BestFit(),
            "worst-fit": new WorstFit()
        };

        this.total = total;
        this.nombrePolitica = nombrePolitica;
        this.politica = politicas[nombrePolitica];
        exigir(Boolean(this.politica), "Politica de memoria invalida");
        this.bloques = [new BloqueMemoria(0, total)];
    }

    asignar(proceso: Proceso): boolean {
        const indice = this.politica.seleccionar(this.bloques, proceso.getMemoria());
        const encontrado = indice >= 0;
        encontrado && this.ocupar(indice, proceso);
        return encontrado;
    }

    liberar(pid: string): void {
        this.bloques = this.bloques.map(bloque =>
            bloque.getPid() === pid
                ? new BloqueMemoria(bloque.getInicio(), bloque.getTamanio())
                : bloque
        );
        this.coalescer();
    }

    obtenerBloques(): VistaBloque[] {
        return this.bloques.map(bloque => bloque.vista());
    }

    memoriaLibre(): number {
        return this.bloques
            .filter(bloque => bloque.estaLibre())
            .reduce((total, bloque) => total + bloque.getTamanio(), 0);
    }

    mayorBloqueLibre(): number {
        return this.bloques
            .filter(bloque => bloque.estaLibre())
            .reduce((mayor, bloque) => Math.max(mayor, bloque.getTamanio()), 0);
    }

    ocupacion(): number {
        return 100 * (this.total - this.memoriaLibre()) / this.total;
    }

    getTotal(): number {
        return this.total;
    }

    getNombrePolitica(): NombrePolitica {
        return this.nombrePolitica;
    }

    private ocupar(indice: number, proceso: Proceso): void {
        const bloque = this.bloques[indice]!;
        const usado = new BloqueMemoria(bloque.getInicio(), proceso.getMemoria(), proceso.getPid());
        const sobrante = bloque.getTamanio() - proceso.getMemoria();
        const reemplazo = [usado];

        sobrante > 0 && reemplazo.push(
            new BloqueMemoria(bloque.getInicio() + proceso.getMemoria(), sobrante)
        );

        this.bloques.splice(indice, 1, ...reemplazo);
    }

    private coalescer(): void {
        this.bloques = this.bloques.reduce<BloqueMemoria[]>((resultado, bloque) => {
            const anterior = resultado.at(-1);
            const unir = Boolean(anterior?.estaLibre() && bloque.estaLibre());
            unir && anterior?.ampliar(bloque.getTamanio());
            unir || resultado.push(bloque);
            return resultado;
        }, []);
    }
}
