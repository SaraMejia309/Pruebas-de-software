document.addEventListener('DOMContentLoaded', () => {
    // 1. Categorías divididas por tipo
    const categoriasPorTipo = {
        gasto: ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Gasto Hormiga', 'Otros Gastos'],
        ingreso: ['Salario', 'Pago / Honorarios', 'Regalo', 'Venta', 'Inversión', 'Otros Ingresos']
    };

    // 2. Estado global inicial
    let listaMovimientos = [
        { categoria: 'Alimentación', fecha: '2026-10-25', descripcion: 'Almuerzo de trabajo', monto: 45900, tipo: 'gasto' }
    ];

    let totalIngresos = 5200000;
    let totalGastos = 1749000;

    // 3. Referencias al DOM
    const modal = document.getElementById('modal-movimiento');
    const btnIngreso = document.querySelector('header .btn-ingreso');
    const btnGasto = document.querySelector('header .btn-gasto');
    const btnCancelar = document.querySelector('.btn-cancelar');
    const formMovimiento = document.getElementById('form-movimiento');

    const inputTipo = document.getElementById('tipo');
    const inputCategoria = document.getElementById('categoria');
    const inputMonto = document.getElementById('monto');
    const inputFecha = document.getElementById('fecha');
    const inputDescripcion = document.getElementById('descripcion');

    const cardSaldo = document.querySelector('.tarjetas-container .card:nth-child(1) .monto');
    const cardIngresos = document.querySelector('.tarjetas-container .card:nth-child(2) .monto');
    const cardGastos = document.querySelector('.tarjetas-container .card:nth-child(3) .monto');

    const cuerpoInicio = document.getElementById('cuerpo-inicio') || document.querySelector('tbody');
    const cuerpoMovimientos = document.getElementById('cuerpo-movimientos');
    const cuerpoBuscar = document.getElementById('cuerpo-buscar');
    const contenedorResumen = document.getElementById('contenedor-resumen');

    const filtroTipo = document.getElementById('filtro-tipo');
    const inputBusqueda = document.getElementById('input-busqueda');

    // 4. Función para cargar categorías dinámicamente según el tipo
    function cargarCategorias(tipo) {
        if (!inputCategoria) return;
        inputCategoria.innerHTML = '';
        const opciones = categoriasPorTipo[tipo] || [];
        opciones.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            inputCategoria.appendChild(option);
        });
    }

    if (inputTipo) {
        inputTipo.addEventListener('change', (e) => cargarCategorias(e.target.value));
    }

    // 5. Renderizado de filas
    function generarFilasHTML(arreglo) {
        return arreglo.map(mov => {
            const esIngreso = mov.tipo === 'ingreso';
            const claseMonto = esIngreso ? 'texto-ingreso' : 'texto-gasto';
            const signo = esIngreso ? '+$' : '-$ ';
            const desc = mov.descripcion ? mov.descripcion : '-';

            return `
                <tr>
                    <td>${mov.categoria}</td>
                    <td>${mov.fecha}</td>
                    <td>${desc}</td>
                    <td class="${claseMonto}">${signo}${mov.monto.toLocaleString('es-CO')}</td>
                </tr>
            `;
        }).join('');
    }

    function actualizarVistas() {
        if (cuerpoInicio) {
            cuerpoInicio.innerHTML = generarFilasHTML(listaMovimientos);
        }

        if (cuerpoMovimientos) {
            const filtro = filtroTipo ? filtroTipo.value : 'todos';
            const filtrados = listaMovimientos.filter(m => filtro === 'todos' || m.tipo === filtro);
            cuerpoMovimientos.innerHTML = generarFilasHTML(filtrados);
        }

        if (cuerpoBuscar) {
            const texto = inputBusqueda ? inputBusqueda.value.toLowerCase() : '';
            const buscados = listaMovimientos.filter(m =>
                m.categoria.toLowerCase().includes(texto) ||
                m.descripcion.toLowerCase().includes(texto)
            );
            cuerpoBuscar.innerHTML = generarFilasHTML(buscados);
        }

        if (contenedorResumen) {
            const totalesPorCat = {};
            listaMovimientos.forEach(m => {
                totalesPorCat[m.categoria] = (totalesPorCat[m.categoria] || 0) + m.monto;
            });

            contenedorResumen.innerHTML = Object.keys(totalesPorCat).map(cat => `
                <div class="card" style="min-width: 180px;">
                    <h4>${cat}</h4>
                    <p class="monto">$ ${totalesPorCat[cat].toLocaleString('es-CO')}</p>
                </div>
            `).join('');
        }

        const saldoDisponible = totalIngresos - totalGastos;
        if (cardIngresos) cardIngresos.textContent = `$ ${totalIngresos.toLocaleString('es-CO')}`;
        if (cardGastos) cardGastos.textContent = `$ ${totalGastos.toLocaleString('es-CO')}`;
        if (cardSaldo) cardSaldo.textContent = `$ ${saldoDisponible.toLocaleString('es-CO')}`;
    }

    // 6. Modal y Eventos de Apertura
    if (btnIngreso && modal) {
        btnIngreso.addEventListener('click', () => {
            if (inputTipo) inputTipo.value = 'ingreso';
            cargarCategorias('ingreso');
            modal.showModal();
        });
    }

    if (btnGasto && modal) {
        btnGasto.addEventListener('click', () => {
            if (inputTipo) inputTipo.value = 'gasto';
            cargarCategorias('gasto');
            modal.showModal();
        });
    }

    if (btnCancelar && modal) {
        btnCancelar.addEventListener('click', () => modal.close());
    }

    // 7. Evento de Guardado
    if (formMovimiento) {
        formMovimiento.addEventListener('submit', (e) => {
            e.preventDefault();

            const tipo = inputTipo.value;
            const monto = parseFloat(inputMonto.value);
            const categoria = inputCategoria.value;
            const fecha = inputFecha.value;
            const descripcion = inputDescripcion.value.trim();

            // Validación de valor máximo (10.000.000 COP)
            const LIMITE_MAXIMO = 10000000;
            if (monto > LIMITE_MAXIMO) {
                alert(`El monto máximo permitido por registro es $${LIMITE_MAXIMO.toLocaleString('es-CO')}`);
                return;
            }

            // Agregar al arreglo principal
            listaMovimientos.unshift({ tipo, monto, categoria, fecha, descripcion });

            // Actualizar acumulados
            if (tipo === 'ingreso') {
                totalIngresos += monto;
            } else {
                totalGastos += monto;
            }

            actualizarVistas();
            formMovimiento.reset();
            modal.close();
        });
    }

    // 8. Filtros dinámicos
    if (filtroTipo) filtroTipo.addEventListener('change', actualizarVistas);
    if (inputBusqueda) inputBusqueda.addEventListener('input', actualizarVistas);

    // Carga inicial de interfaz
    actualizarVistas();
});