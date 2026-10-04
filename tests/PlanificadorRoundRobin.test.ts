import { describe, expect, it } from "vitest";
import { PlanificadorRoundRobin } from "../src/PlanificadorRoundRobin.js";
import { Proceso } from "../src/Proceso.js";
import { EstadoProceso } from "../src/tipos.js";

describe("PlanificadorRoundRobin", () => {
    it("rechaza un quantum igual a cero", () => {
        expect(() => new PlanificadorRoundRobin(0)).toThrow();
    });

    it("despacha el primer proceso de la cola", () => {
        const planificador = new PlanificadorRoundRobin(2);
        const proceso = new Proceso("P1", 100, 3);
        proceso.ponerListo();
        planificador.encolar(proceso);
        planificador.ejecutarTick();

        expect(planificador.obtenerCPU()).toBe("P1");
    });

    it("reencola al final al agotar quantum cuando hay otro listo", () => {
        const planificador = new PlanificadorRoundRobin(2);
        const p1 = new Proceso("P1", 100, 4);
        const p2 = new Proceso("P2", 100, 4);
        p1.ponerListo();
        p2.ponerListo();
        planificador.encolar(p1);
        planificador.encolar(p2);
        planificador.ejecutarTick();
        planificador.ejecutarTick();

        expect(planificador.obtenerListos()).toEqual(["P2", "P1"]);
    });

    it("cuenta un cambio de contexto por agotamiento de quantum", () => {
        const planificador = new PlanificadorRoundRobin(2);
        const p1 = new Proceso("P1", 100, 4);
        const p2 = new Proceso("P2", 100, 4);
        p1.ponerListo();
        p2.ponerListo();
        planificador.encolar(p1);
        planificador.encolar(p2);
        planificador.ejecutarTick();
        planificador.ejecutarTick();

        expect(planificador.obtenerCambiosContexto()).toBe(1);
    });

    it("renueva quantum sin cambio de contexto cuando no hay otros listos", () => {
        const planificador = new PlanificadorRoundRobin(2);
        const proceso = new Proceso("P1", 100, 4);
        proceso.ponerListo();
        planificador.encolar(proceso);
        planificador.ejecutarTick();
        planificador.ejecutarTick();

        expect({
            quantum: proceso.getQuantumConsumido(),
            cambios: planificador.obtenerCambiosContexto()
        }).toEqual({ quantum: 0, cambios: 0 });
    });

    it("bloquea por E/S y libera la CPU", () => {
        const planificador = new PlanificadorRoundRobin(2);
        const proceso = new Proceso("P1", 100, 4, { despuesDe: 1, duracion: 2 });
        proceso.ponerListo();
        planificador.encolar(proceso);
        planificador.ejecutarTick();

        expect({
            estado: proceso.getEstado(),
            cpu: planificador.obtenerCPU(),
            cambios: planificador.obtenerCambiosContexto()
        }).toEqual({
            estado: EstadoProceso.Bloqueado,
            cpu: null,
            cambios: 1
        });
    });
});
