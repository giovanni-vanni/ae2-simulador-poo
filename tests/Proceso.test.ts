import { describe, expect, it } from "vitest";
import { Proceso } from "../src/Proceso.js";
import { EstadoProceso } from "../src/tipos.js";

describe("Proceso", () => {
    it("se crea con sus datos iniciales", () => {
        const proceso = new Proceso("P1", 100, 4);

        expect(proceso.vista()).toEqual({
            pid: "P1",
            memoria: 100,
            cpuTotal: 4,
            cpuRestante: 4,
            estado: EstadoProceso.Nuevo,
            quantumConsumido: 0,
            bloqueoRestante: 0
        });
    });

    it("rechaza un PID vacio", () => {
        expect(() => new Proceso("", 100, 4)).toThrow();
    });

    it("rechaza memoria igual a cero", () => {
        expect(() => new Proceso("P1", 0, 4)).toThrow();
    });

    it("rechaza tiempo de CPU igual a cero", () => {
        expect(() => new Proceso("P1", 100, 0)).toThrow();
    });

    it("rechaza un momento de E/S igual a cero", () => {
        expect(() => new Proceso("P1", 100, 4, { despuesDe: 0, duracion: 2 })).toThrow();
    });

    it("rechaza una duracion de E/S igual a cero", () => {
        expect(() => new Proceso("P1", 100, 4, { despuesDe: 2, duracion: 0 })).toThrow();
    });

    it("rechaza una E/S programada al finalizar el proceso", () => {
        expect(() => new Proceso("P1", 100, 4, { despuesDe: 4, duracion: 1 })).toThrow();
    });
});
