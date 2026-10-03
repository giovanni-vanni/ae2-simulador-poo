import { describe, expect, it } from "vitest";
import { Memoria } from "../src/Memoria.js";
import { Proceso } from "../src/Proceso.js";

function proceso(pid: string, memoria: number): Proceso {
    return new Proceso(pid, memoria, 3);
}

describe("Memoria", () => {
    it("empieza con un solo bloque libre", () => {
        const memoria = new Memoria(500, "first-fit");

        expect(memoria.obtenerBloques()).toEqual([
            { inicio: 0, tamanio: 500, pid: null }
        ]);
    });

    it("divide un bloque cuando la asignacion es parcial", () => {
        const memoria = new Memoria(300, "first-fit");
        memoria.asignar(proceso("P1", 100));

        expect(memoria.obtenerBloques()).toEqual([
            { inicio: 0, tamanio: 100, pid: "P1" },
            { inicio: 100, tamanio: 200, pid: null }
        ]);
    });

    it("no crea un bloque de tamanio cero en un ajuste exacto", () => {
        const memoria = new Memoria(200, "first-fit");
        memoria.asignar(proceso("P1", 200));

        expect(memoria.obtenerBloques()).toEqual([
            { inicio: 0, tamanio: 200, pid: "P1" }
        ]);
    });

    it("first-fit usa el primer hueco suficiente", () => {
        const memoria = new Memoria(500, "first-fit");
        memoria.asignar(proceso("P1", 100));
        memoria.asignar(proceso("P2", 150));
        memoria.asignar(proceso("P3", 100));
        memoria.liberar("P1");
        memoria.liberar("P3");

        memoria.asignar(proceso("P4", 80));

        expect(memoria.obtenerBloques().find(b => b.pid === "P4")?.inicio).toBe(0);
    });

    it("best-fit elige el menor hueco y desempata por direccion", () => {
        const memoria = new Memoria(1000, "best-fit");
        memoria.asignar(proceso("P1", 100));
        memoria.asignar(proceso("P2", 200));
        memoria.asignar(proceso("P3", 100));
        memoria.asignar(proceso("P4", 300));
        memoria.asignar(proceso("P5", 100));
        memoria.asignar(proceso("P6", 200));
        memoria.liberar("P2");
        memoria.liberar("P4");
        memoria.liberar("P6");

        memoria.asignar(proceso("P7", 150));

        expect(memoria.obtenerBloques().find(b => b.pid === "P7")?.inicio).toBe(100);
    });

    it("worst-fit elige el mayor hueco y desempata por direccion", () => {
        const memoria = new Memoria(1100, "worst-fit");
        memoria.asignar(proceso("P1", 100));
        memoria.asignar(proceso("P2", 300));
        memoria.asignar(proceso("P3", 100));
        memoria.asignar(proceso("P4", 200));
        memoria.asignar(proceso("P5", 100));
        memoria.asignar(proceso("P6", 300));
        memoria.liberar("P2");
        memoria.liberar("P4");
        memoria.liberar("P6");

        memoria.asignar(proceso("P7", 150));

        expect(memoria.obtenerBloques().find(b => b.pid === "P7")?.inicio).toBe(100);
    });

    it("falla sin modificar memoria cuando no hay hueco contiguo suficiente", () => {
        const memoria = new Memoria(400, "first-fit");
        memoria.asignar(proceso("P1", 100));
        memoria.asignar(proceso("P2", 100));
        memoria.asignar(proceso("P3", 100));
        memoria.asignar(proceso("P4", 100));
        memoria.liberar("P1");
        memoria.liberar("P3");
        const antes = memoria.obtenerBloques();

        const resultado = memoria.asignar(proceso("P5", 150));

        expect({ resultado, bloques: memoria.obtenerBloques() }).toEqual({
            resultado: false,
            bloques: antes
        });
    });

    it("fusiona con el bloque libre de la izquierda", () => {
        const memoria = new Memoria(300, "first-fit");
        memoria.asignar(proceso("P1", 100));
        memoria.asignar(proceso("P2", 100));
        memoria.asignar(proceso("P3", 100));
        memoria.liberar("P1");
        memoria.liberar("P2");

        expect(memoria.obtenerBloques()).toEqual([
            { inicio: 0, tamanio: 200, pid: null },
            { inicio: 200, tamanio: 100, pid: "P3" }
        ]);
    });

    it("fusiona con el bloque libre de la derecha", () => {
        const memoria = new Memoria(300, "first-fit");
        memoria.asignar(proceso("P1", 100));
        memoria.asignar(proceso("P2", 100));
        memoria.asignar(proceso("P3", 100));
        memoria.liberar("P3");
        memoria.liberar("P2");

        expect(memoria.obtenerBloques()).toEqual([
            { inicio: 0, tamanio: 100, pid: "P1" },
            { inicio: 100, tamanio: 200, pid: null }
        ]);
    });

    it("fusiona ambos lados al liberar un bloque entre dos huecos", () => {
        const memoria = new Memoria(300, "first-fit");
        memoria.asignar(proceso("P1", 100));
        memoria.asignar(proceso("P2", 100));
        memoria.asignar(proceso("P3", 100));
        memoria.liberar("P1");
        memoria.liberar("P3");
        memoria.liberar("P2");

        expect(memoria.obtenerBloques()).toEqual([
            { inicio: 0, tamanio: 300, pid: null }
        ]);
    });
});
