# Reto Final — Fundamentos y Taxonomía del Error



### Taxonomía
* **Error Humano:** Acción equivocada cometida por el desarrollador al escribir o diseñar el código.
* **Defecto (Bug):** Imperfección o imperfección física dentro del código fuente resultante del error.
* **Falla:** Comportamiento incorrecto u observable por el usuario final durante la ejecución de la aplicación.

---

### **Ejemplo 1  (Error Humano):**

Durante el desarrollo de la aplicacion "Control de Gastos"
el programador asume que los usuarios siempre ingresaran valores positivos.

Por una equivocación al pensar y no revisar bien las reglas del programa, se pasó por alto agregar la validación necesaria (el control del saldo). Ese pequeño descuido humano es lo que realmente provoca el fallo en el sistema

### **Ejemplo 2 (Falla):**
Cuando se registra un gasto de 5.000 COP en una cuenta que ya tenía 10.000 COP, el sistema, en lugar de sumar las cantidades, simplemente "pega" los textos uno al lado del otro. Por eso, en vez de dar el resultado correcto, muestra una cifra absurda de 100.005.000 COP, lo que arruina por completo la experiencia al usar la aplicación

---
## Reporte 

* **ID:** BUG-EXP-001
* **Problema:** La aplicación permite ingresar y guardar montos o saldos iniciales con números negativos (ej. `-50,000 COP`).
* **Módulo:** Configuración de Cuentas / Registro Inicial.
* **Pasos para reproducir:**
  1. Abrir la aplicación e ir al formulario de **Nuevo Movimiento**.
  2. Escribir un valor numérico negativo en el campo de monto (Ej: `-50000`).
  3. Hacer clic en el botón **Guardar**.
* **Comportamiento Esperado:** El sistema debe validar el dato, bloquear la acción y mostrar un mensaje de alerta impidiendo el registro de números negativos.
* **Comportamiento Actual:** La aplicación acepta el valor negativo sin restricciones, lo guarda y descuadra por completo el cálculo del balance disponible y los gráficos del panel principal.
