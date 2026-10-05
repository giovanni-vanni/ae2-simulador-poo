# AE2 - Simulador de Procesos y Memoria

Trabajo intercátedra correspondiente a las materias **Paradigmas y Lenguajes de Programación II** y **Sistemas Operativos**.

El proyecto consiste en una biblioteca desarrollada en TypeScript que simula la administración de procesos, memoria y CPU de un sistema operativo.

La simulación avanza mediante ticks y utiliza planificación Round-Robin para la CPU. Para la asignación de memoria se contemplan las políticas First-Fit, Best-Fit y Worst-Fit.

## Tecnologías utilizadas

- TypeScript
- Node.js
- Vitest
- Git y GitHub

## Requisitos

Para ejecutar el proyecto es necesario tener instalado:

- Node.js
- npm

Se puede verificar la instalación con:

```bash
node --version
npm --version
```

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/giovanni-vanni/ae2-simulador-poo.git
```

Ingresar a la carpeta del proyecto:

```bash
cd ae2-simulador-poo
```

Instalar las dependencias:

```bash
npm install
```

## Ejecución de los tests

El funcionamiento del simulador se verifica mediante pruebas automatizadas realizadas con Vitest.

Para ejecutar los tests:

```bash
npm test
```

## Funcionamiento general

El simulador administra procesos que necesitan memoria y tiempo de CPU.

Cada proceso puede encontrarse en uno de los siguientes estados:

- Nuevo
- Esperando Memoria
- Listo
- Ejecutando
- Bloqueado
- Terminado

La simulación comienza en el tick 0 y avanza una unidad por cada llamada al método `tick()`.

Durante cada tick se realizan las siguientes etapas:

1. Se intenta admitir a los procesos que están esperando memoria.
2. Se actualizan los procesos bloqueados por operaciones de entrada/salida.
3. Se realiza el despacho y la ejecución de CPU mediante Round-Robin.
4. Se actualiza el reloj y las métricas del sistema.

## Planificación Round-Robin

La CPU utiliza el algoritmo Round-Robin con un quantum configurable.

Los procesos listos se mantienen en una cola FIFO. Cuando un proceso consume su quantum y existen otros procesos esperando CPU, vuelve al final de la cola de listos.

Si no existen otros procesos listos, puede continuar ejecutándose con un nuevo quantum.

## Gestión de memoria

La memoria se representa mediante bloques contiguos que pueden encontrarse libres u ocupados.

Se utilizan tres políticas de asignación:

### First-Fit

Selecciona el primer bloque de memoria que tenga espacio suficiente para el proceso.

### Best-Fit

Selecciona el bloque suficiente de menor tamaño.

### Worst-Fit

Selecciona el bloque suficiente de mayor tamaño.

Cuando un proceso termina, su bloque se libera y se realiza la coalescencia de bloques libres adyacentes.

## Entrada y salida

Los procesos pueden tener eventos de entrada/salida configurados.

Cuando se dispara un evento de E/S:

- el proceso pasa al estado Bloqueado;
- deja de utilizar la CPU;
- mantiene la memoria que tenía asignada;
- al finalizar el tiempo de bloqueo vuelve a la cola de procesos Listos.

## Métricas

El simulador permite consultar:

- porcentaje de ocupación de memoria;
- porcentaje de utilización de CPU;
- cantidad de cambios de contexto;
- memoria libre total;
- tamaño del mayor bloque libre;
- porcentaje de fragmentación externa.

La fragmentación externa se calcula mediante:

```text
Fragmentación = 100 × (1 - mayor bloque libre / memoria libre total)
```

Si no existe memoria libre, la fragmentación se considera 0 %.

## Organización del proyecto

El código de producción se encuentra en `src/` y las pruebas automatizadas en `tests/`.

Los componentes principales del simulador separan las responsabilidades de:

- procesos;
- gestión de memoria;
- planificación de CPU;
- políticas de asignación;
- coordinación general de la simulación.

## Diagramas

La documentación del proyecto incluye:

- diagrama de clases;
- diagrama de transición de estados;
- diagrama de secuencia de admisión y asignación de memoria;
- diagrama de secuencia de un tick Round-Robin;
- diagrama de secuencia de bloqueo y retorno por entrada/salida.

## Autor

Giovanni Vanni

Ingeniería en Sistemas de Información  
Universidad de la Cuenca del Plata
