import type { VistaBloque } from "./tipos.js";

export class BloqueMemoria {
    private inicio: number;
    private tamanio: number;
    private pid: string | null;

    constructor(inicio: number, tamanio: number, pid: string | null = null) {
        this.inicio = inicio;
        this.tamanio = tamanio;
        this.pid = pid;
    }

    estaLibre(): boolean {
        return this.pid === null;
    }

    getInicio(): number {
        return this.inicio;
    }

    getTamanio(): number {
        return this.tamanio;
    }

    getPid(): string | null {
        return this.pid;
    }

    ampliar(cantidad: number): void {
        this.tamanio += cantidad;
    }

    vista(): VistaBloque {
        return {
            inicio: this.inicio,
            tamanio: this.tamanio,
            pid: this.pid
        };
    }
}
