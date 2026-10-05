import { describe, expect, it } from "vitest";
import { Simulador } from "../src/Simulador.js";
import { EstadoProceso } from "../src/tipos.js";

function secuenciaRoundRobin(): string[] {
    const simulador = new Simulador(500, 2);
    simulador.registrarProceso("P1", 100, 3);
    simulador.registrarProceso("P2", 100, 2);
    const ejecucion: string[] = [];

    Array.from({ length: 5 }).forEach(() => {
        const antesP1 = simulador.consultarProceso("P1")?.cpuRestante;
        const antesP2 = simulador.consultarProceso("P2")?.cpuRestante;
        simulador.tick();
        const despuesP1 = simulador.consultarProceso("P1")?.cpuRestante;
        const despuesP2 = simulador.consultarProceso("P2")?.cpuRestante;
        antesP1 !== despuesP1 && ejecucion.push("P1");
        antesP2 !== despuesP2 && ejecucion.push("P2");
    });

    return ejecucion;
}

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

    it("ejecuta P1 P1 P2 P2 P1 con quantum dos", () => {
        expect(secuenciaRoundRobin()).toEqual(["P1", "P1", "P2", "P2", "P1"]);
    });

    it("conserva la memoria mientras un proceso esta bloqueado", () => {
        const simulador = new Simulador(200, 2);
        simulador.registrarProceso("P1", 100, 3, { despuesDe: 1, duracion: 2 });
        simulador.tick();

        expect(simulador.obtenerMetricas().ocupacionMemoria).toBe(50);
    });

    it("un proceso bloqueado no consume CPU", () => {
        const simulador = new Simulador(200, 2);
        simulador.registrarProceso("P1", 100, 3, { despuesDe: 1, duracion: 2 });
        simulador.tick();
        const antes = simulador.consultarProceso("P1")?.cpuRestante;
        simulador.tick();

        expect(simulador.consultarProceso("P1")?.cpuRestante).toBe(antes);
    });

    it("un proceso vuelve de E/S y puede ejecutarse en ese mismo tick", () => {
        const simulador = new Simulador(200, 2);
        simulador.registrarProceso("P1", 100, 3, { despuesDe: 1, duracion: 2 });
        simulador.tick();
        simulador.tick();
        simulador.tick();

        expect(simulador.consultarProceso("P1")?.cpuRestante).toBe(1);
    });

    it("calcula las metricas luego de un tick con CPU ocupada", () => {
        const simulador = new Simulador(400, 2);
        simulador.registrarProceso("P1", 100, 3);
        simulador.tick();

        expect(simulador.obtenerMetricas()).toEqual({
            ocupacionMemoria: 25,
            utilizacionCPU: 100,
            cambiosContexto: 0,
            memoriaLibreTotal: 300,
            mayorBloqueLibre: 300,
            fragmentacionExterna: 0
        });
    });

    it("calcula 25 por ciento de fragmentacion para huecos de 100 y 300", () => {
        const simulador = new Simulador(700, 1);
        simulador.registrarProceso("A", 100, 1);
        simulador.registrarProceso("B", 100, 5);
        simulador.registrarProceso("C", 300, 1);
        simulador.registrarProceso("D", 200, 5);
        simulador.tick();
        simulador.tick();
        simulador.tick();

        expect(simulador.obtenerMetricas().fragmentacionExterna).toBe(25);
    });

    it("da fragmentacion cero cuando no queda memoria libre", () => {
        const simulador = new Simulador(100, 2);
        simulador.registrarProceso("P1", 100, 3);
        simulador.tick();

        expect(simulador.obtenerMetricas().fragmentacionExterna).toBe(0);
    });
});
