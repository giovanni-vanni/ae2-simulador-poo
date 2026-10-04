import { describe, expect, it } from "vitest";
import { Simulador } from "../src/Simulador.js";
import { EstadoProceso } from "../src/tipos.js";

describe("Simulador", () => {
    it("inicia en tick cero con memoria libre y colas vacias", () => {
        const simulador = new Simulador(1024, 2, "first-fit");

        expect(simulador.obtenerEstado()).toEqual({
            tick: 0,
            cpu: null,
            listos: [],
            esperandoMemoria: [],
            bloqueados: [],
            terminados: [],
            memoria: [{ inicio: 0, tamanio: 1024, pid: null }]
        });
    });

    it("rechaza memoria total igual a cero", () => {
        expect(() => new Simulador(0, 2)).toThrow();
    });

    it("rechaza quantum igual a cero", () => {
        expect(() => new Simulador(100, 0)).toThrow();
    });

    it("rechaza un PID repetido", () => {
        const simulador = new Simulador(200, 2);
        simulador.registrarProceso("P1", 100, 3);

        expect(() => simulador.registrarProceso("P1", 50, 2)).toThrow();
    });

    it("rechaza un proceso mayor que la memoria total", () => {
        const simulador = new Simulador(200, 2);

        expect(() => simulador.registrarProceso("P1", 300, 2)).toThrow();
    });

    it("deja esperando a un proceso cuando no hay memoria suficiente", () => {
        const simulador = new Simulador(200, 1);
        simulador.registrarProceso("P1", 200, 1);
        simulador.registrarProceso("P2", 100, 1);
        simulador.tick();

        expect(simulador.consultarProceso("P2")?.estado).toBe(EstadoProceso.EsperandoMemoria);
    });

    it("admite en el tick siguiente un proceso que esperaba memoria", () => {
        const simulador = new Simulador(200, 1);
        simulador.registrarProceso("P1", 200, 1);
        simulador.registrarProceso("P2", 100, 1);
        simulador.tick();
        simulador.tick();

        expect(simulador.consultarProceso("P2")?.estado).toBe(EstadoProceso.Terminado);
    });
});
