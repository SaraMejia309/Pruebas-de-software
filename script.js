document.addEventListener('DOMContentLoaded', () => {
    //categorías por tipo
    const categoriasPorTipo = {
        gasto: ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Deudas', 'Otros Gastos'],
        ingreso: ['Salario', 'Regalo', 'Venta', 'Inversión', 'Otros Ingresos']
    };

    //movimientos guardados o inicializar
    const movimientosGuardados = JSON.parse(localStorage.getItem('listaMovimientos'));
    let listaMovimientos = movimientosGuardados || [];

    // Referencias DOM
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

    const cardSaldo = document.getElementById('monto-saldo');
    const cardIngresos = document.getElementById('monto-ingresos');
    const cardGastos = document.getElementById('monto-gastos');

    const cuerpoInicio = document.getElementById('cuerpo-inicio');
    const cuerpoMovimientos = document.getElementById('cuerpo-movimientos');
    const cuerpoBuscar = document.getElementById('cuerpo-buscar');
    const contenedorResumen = document.getElementById('contenedor-resumen');

    // Referencias filtros de búsqueda
    const filtroTipoBuscar = document.getElementById('filtro-tipo-buscar');
    const filtroCategoriaBuscar = document.getElementById('filtro-categoria-buscar');

    // Llenar select de categorías en el modal
    function cargarCategoriasModal(tipo) {
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

    //Llenar select de categorías dinámico en la vista Buscar
    function actualizarCategoriasBuscar() {
        if (!filtroCategoriaBuscar || !filtroTipoBuscar) return;

        const tipoSeleccionado = filtroTipoBuscar.value;
        filtroCategoriaBuscar.innerHTML = '<option value="">Todas las Categorías</option>';

        let categoriasAMostrar = [];

        if (tipoSeleccionado === 'gasto') {
            categoriasAMostrar = categoriasPorTipo.gasto;
        } else if (tipoSeleccionado === 'ingreso') {
            categoriasAMostrar = categoriasPorTipo.ingreso;
        } else {
            categoriasAMostrar = [...categoriasPorTipo.gasto, ...categoriasPorTipo.ingreso];
        }

        categoriasAMostrar.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filtroCategoriaBuscar.appendChild(option);
        });
    }

    // generar filas de tabla HTML
    function generarFilasHTML(arreglo) {
        if (!arreglo || arreglo.length === 0) {
            return `<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No hay registros</td></tr>`;
        }
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
                    <td class="${claseMonto}">${signo}${parseFloat(mov.monto).toLocaleString('es-CO')}</td>
                </tr>
            `;
        }).join('');
    }

    // actualizar interfaz 
    function actualizarVistas() {
        const totalIngresos = listaMovimientos
            .filter(m => m.tipo === 'ingreso')
            .reduce((sum, m) => sum + Number(m.monto), 0);

        const totalGastos = listaMovimientos
            .filter(m => m.tipo === 'gasto')
            .reduce((sum, m) => sum + Number(m.monto), 0);

        const saldoDisponible = totalIngresos - totalGastos;

        // Tarjetas principales
        if (cardIngresos) cardIngresos.textContent = `$ ${totalIngresos.toLocaleString('es-CO')}`;
        if (cardGastos) cardGastos.textContent = `$ ${totalGastos.toLocaleString('es-CO')}`;
        if (cardSaldo) {
            cardSaldo.textContent = `$ ${saldoDisponible.toLocaleString('es-CO')}`;
            cardSaldo.className = saldoDisponible < 0 ? 'monto texto-gasto' : 'monto texto-ingreso';
        }

        // Vista Inicio
        if (cuerpoInicio) {
            cuerpoInicio.innerHTML = generarFilasHTML(listaMovimientos.slice(0, 5));
        }

        // Vista Movimientos
        if (cuerpoMovimientos) {
            cuerpoMovimientos.innerHTML = generarFilasHTML(listaMovimientos);
        }

        // Vista Buscar
        if (cuerpoBuscar) {
            const tipoElegido = filtroTipoBuscar ? filtroTipoBuscar.value : '';
            const catElegida = filtroCategoriaBuscar ? filtroCategoriaBuscar.value : '';

            const resultados = listaMovimientos.filter(m => {
                const coincideTipo = !tipoElegido || m.tipo === tipoElegido;
                const coincideCat = !catElegida || m.categoria === catElegida;
                return coincideTipo && coincideCat;
            });

            cuerpoBuscar.innerHTML = generarFilasHTML(resultados);
        }

        // Vista Resumen
        if (contenedorResumen) {
            const gastosCat = {};
            listaMovimientos
                .filter(m => m.tipo === 'gasto')
                .forEach(m => {
                    gastosCat[m.categoria] = (gastosCat[m.categoria] || 0) + Number(m.monto);
                });

            const keys = Object.keys(gastosCat);
            if (keys.length === 0) {
                contenedorResumen.innerHTML = '<p style="color:#94a3b8;">No hay gastos registrados.</p>';
            } else {
                contenedorResumen.innerHTML = keys.map(cat => `
                    <div class="card">
                        <h3>${cat}</h3>
                        <p class="monto texto-gasto">$ ${gastosCat[cat].toLocaleString('es-CO')}</p>
                    </div>
                `).join('');
            }
        }
    }

    // eventos
    if (inputTipo) {
        inputTipo.addEventListener('change', (e) => cargarCategoriasModal(e.target.value));
    }

    if (filtroTipoBuscar) {
        filtroTipoBuscar.addEventListener('change', () => {
            actualizarCategoriasBuscar();
            actualizarVistas();
        });
    }

    if (filtroCategoriaBuscar) {
        filtroCategoriaBuscar.addEventListener('change', actualizarVistas);
    }

    if (btnIngreso && modal) {
        btnIngreso.addEventListener('click', () => {
            if (inputTipo) inputTipo.value = 'ingreso';
            cargarCategoriasModal('ingreso');
            modal.showModal();
        });
    }

    if (btnGasto && modal) {
        btnGasto.addEventListener('click', () => {
            if (inputTipo) inputTipo.value = 'gasto';
            cargarCategoriasModal('gasto');
            modal.showModal();
        });
    }

    if (btnCancelar && modal) {
        btnCancelar.addEventListener('click', () => modal.close());
    }

    // guadar registro
    if (formMovimiento) {
        formMovimiento.addEventListener('submit', (e) => {
            e.preventDefault();

            const tipo = inputTipo.value;
            const monto = parseFloat(inputMonto.value);
            const categoria = inputCategoria.value;
            const fecha = inputFecha.value;
            const descripcion = inputDescripcion.value.trim();

            listaMovimientos.unshift({ tipo, monto, categoria, fecha, descripcion });
            localStorage.setItem('listaMovimientos', JSON.stringify(listaMovimientos));

            actualizarVistas();
            formMovimiento.reset();
            modal.close();
        });
    }

    // inicialización al cargar la página
    actualizarCategoriasBuscar();
    actualizarVistas();
});