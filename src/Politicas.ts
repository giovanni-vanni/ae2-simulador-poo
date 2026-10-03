import type { IPoliticaAsignacion } from "./interfaces.js";
import type { BloqueMemoria } from "./BloqueMemoria.js";

type Candidato = {
    indice: number;
    inicio: number;
    tamanio: number;
};

function candidatos(bloques: BloqueMemoria[], tamanio: number): Candidato[] {
    return bloques
        .map((bloque, indice) => ({
            indice,
            inicio: bloque.getInicio(),
            tamanio: bloque.getTamanio(),
            libre: bloque.estaLibre()
        }))
        .filter(bloque => bloque.libre && bloque.tamanio >= tamanio)
        .map(({ indice, inicio, tamanio: tamanioBloque }) => ({
            indice,
            inicio,
            tamanio: tamanioBloque
        }));
}

export class FirstFit implements IPoliticaAsignacion {
    seleccionar(bloques: BloqueMemoria[], tamanio: number): number {
        return candidatos(bloques, tamanio)[0]?.indice ?? -1;
    }
}

export class BestFit implements IPoliticaAsignacion {
    seleccionar(bloques: BloqueMemoria[], tamanio: number): number {
        const lista = candidatos(bloques, tamanio);
        lista.sort((a, b) => a.tamanio - b.tamanio || a.inicio - b.inicio);
        return lista[0]?.indice ?? -1;
    }
}

export class WorstFit implements IPoliticaAsignacion {
    seleccionar(bloques: BloqueMemoria[], tamanio: number): number {
        const lista = candidatos(bloques, tamanio);
        lista.sort((a, b) => b.tamanio - a.tamanio || a.inicio - b.inicio);
        return lista[0]?.indice ?? -1;
    }
}
