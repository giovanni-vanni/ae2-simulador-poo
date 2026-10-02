export function exigir(condicion: boolean, mensaje: string): void {
    condicion || lanzarError(mensaje);
}

function lanzarError(mensaje: string): never {
    throw new Error(mensaje);
}

export function enteroPositivo(valor: number): boolean {
    return Number.isInteger(valor) && valor > 0;
}
