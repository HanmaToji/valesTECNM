let dialogMaterial = document.getElementById("seleccionMaterial");

/*
Abre el diálogo modal para seleccionar material.
*/
function openDialogMaterial() {
    dialogMaterial.showModal();
};

/*
Cierra el diálogo de material sin realizar cambios.
*/
function closeDialogMaterial() {
    selectedItemName = '';
    dialogMaterial.close();
};

let selectedItemName = '';
let dialogMaterialCantidad = document.getElementById('seleccionCantidadMaterial');

/*
Cancela la selección de cantidad de material:
1. Limpia el nombre del material seleccionado.
2. Cierra los diálogos de material y cantidad.
*/
function closeQuantityDialog() {
    let dialogMaterialCantidad = document.getElementById('seleccionCantidadMaterial');
    selectedItemName = '';
    dialogMaterial.close();
    dialogMaterialCantidad.close();
};

/*
Agrega un material con su cantidad a la tabla:
1. Crea la estructura HTML para mostrar el material y su cantidad.
2. Incluye un botón para eliminar el material.
3. Agrega el elemento a la tabla.
4. Cierra los diálogos de material y cantidad.
*/
function selectMaterialCantidad(element) {
    let quantity = element.textContent;

    // Crear el contenedor principal.
    let container = document.createElement('div');
    container.classList.add('seccionMTCasilla');

    // Crear el div para la información.
    let infoDiv = document.createElement('div');
    infoDiv.classList.add('seccionMTValor');

    // Crear y asignar el nombre seleccionado.
    let nameElement = document.createElement('h5');
    nameElement.textContent = selectedItemName;

    // Crear y asignar la cantidad seleccionada.
    let quantityElement = document.createElement('span');
    quantityElement.textContent = quantity;

    // Agregar elementos al contenedor de información.
    infoDiv.appendChild(nameElement);
    infoDiv.appendChild(quantityElement);

    // Crear y configurar el botón de eliminación.
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.onclick = function () {
        container.remove(); // Eliminar el contenedor al hacer click.
    };

    // Agregar todo al contenedor principal.
    container.appendChild(infoDiv);
    container.appendChild(deleteButton);

    // Agregar el nuevo elemento a la secciónMTabla.
    let sectionTable = document.querySelector('.seccionMTabla');
    sectionTable.appendChild(container);

    // Cerrar el diálogo.
    dialogMaterial.close();
    dialogMaterialCantidad.close();
};

/*
Selecciona un material predefinido:
1. Extrae nombre y cantidad del texto del elemento.
2. Verifica si ya existe un material idéntico en la tabla.
3. Si existe, muestra alerta temporal.
4. Si no existe, crea y agrega el elemento a la tabla.
5. Cierra el diálogo de materiales.
*/
function selectMaterialPredefinido(element) {
    let text = element.textContent;
    let [nombre, cantidad] = text.split(':').map(t => t.trim());

    // Verifica si ya existe un elemento con el mismo nombre y cantidad
    let existentes = document.querySelectorAll('.seccionMTabla .seccionMTCasilla');

    let existe = Array.from(existentes).some(elem => {
        let nombreElem = elem.querySelector('h5')?.textContent.trim();
        let cantidadElem = elem.querySelector('span')?.textContent.trim();
        return nombreElem === nombre && cantidadElem === cantidad;
    });

    if (existe) {
        let mensajeAlertaMaterial = document.getElementById('dialogCCAlerta');
        mensajeAlertaMaterial.style.display = "flex";
        setTimeout(() => {
            mensajeAlertaMaterial.style.display = "none";
        }, 4000);
        return;
    }

    // Crear el contenedor principal.
    let container = document.createElement('div');
    container.classList.add('seccionMTCasilla');

    // Crear el div para la información.
    let infoDiv = document.createElement('div');
    infoDiv.classList.add('seccionMTValor');

    // Crear y asignar el nombre seleccionado.
    let nameElement = document.createElement('h5');
    nameElement.textContent = nombre;

    // Crear y asignar la cantidad seleccionada.
    let quantityElement = document.createElement('span');
    quantityElement.textContent = cantidad;

    // Agregar elementos al contenedor de información.
    infoDiv.appendChild(nameElement);
    infoDiv.appendChild(quantityElement);

    // Crear y configurar el botón de eliminación.
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.onclick = function () {
        container.remove();
    };

    // Agregar todo al contenedor principal.
    container.appendChild(infoDiv);
    container.appendChild(deleteButton);

    // Agregar el nuevo elemento a la secciónMTabla.
    document.querySelector('.seccionMTabla').appendChild(container);

    // Cerrar el diálogo.
    dialogMaterial.close();
}

/*
Cierra el diálogo de confirmación de envío sin realizar acciones.
*/
function closeDialogEnviar() {
    dialogEnviar.close();
};

/*
Selecciona un material de la lista:
1. Almacena el nombre del material seleccionado.
2. Verifica si el material ya fue agregado.
3. Si no existe, abre el diálogo para seleccionar cantidad.
4. Si existe, muestra una alerta temporal.
*/
function selectMaterial(element) {
    selectedItemName = element.textContent;
    let existingItems = document.querySelectorAll('.seccionMTabla .seccionMTValor h5');

    // Verifica si ya existe un elemento con el mismo nombre.
    let itemExists = Array.from(existingItems).some(item => item.textContent === selectedItemName);

    if (itemExists) {
        let mensajeAlertaMaterial = document.getElementById('dialogCCAlerta');
        mensajeAlertaMaterial.style.display = "flex";

        setTimeout(() => {
            mensajeAlertaMaterial.style.display = "none";
        }, 4000);
    } else {
        dialogMaterialCantidad.showModal();
    }
}

/*
Filtra la lista de equipos/materiales según el texto de búsqueda ingresado:
1. Compara el texto de búsqueda con el contenido de cada elemento de la lista.
2. Muestra u oculta los elementos según coincidan con el criterio de búsqueda.
*/
function filterListEquipo() {
    let input = document.getElementById('searchInputMaterial').value.toLowerCase();
    let listItems = document.querySelectorAll('#equipoLista li');

    listItems.forEach(li => {
        let text = li.textContent.toLowerCase();
        li.style.display = text.includes(input) ? 'flex' : 'none';
    });
};

let dialogEnviar = document.getElementById("seleccionEnviar");

/*
Abre el diálogo de confirmación para el vale:
1. Verifica si hay materiales agregados antes de mostrar el diálogo.
2. Si no hay materiales, muestra una notificación de advertencia.
*/
function openDialogEnviarEditar() {
    let items = document.querySelectorAll(".seccionMTabla .seccionMTCasilla");
    if (items.length === 0) {
        mostrarNotificacionRequest('Notificación', 'No hay Materiales Agregados', '#1c336c', 'bell');
    }
    else {
        dialogEnviar.showModal();
    }
};

/*
Envía los cambios realizados en el vale al servidor:
1. Recopila todos los materiales agregados con sus cantidades.
2. Envía la información al servidor.
3. Maneja la respuesta mostrando notificaciones o redirigiendo según corresponda.
*/
function enviarValeEditar() {
    // Validar campos obligatorios.
    let items = document.querySelectorAll(".seccionMTabla .seccionMTCasilla");
    let materialList = [];
    items.forEach(item => {
        let name = item.querySelector(".seccionMTValor h5").textContent.trim();
        let quantity = item.querySelector(".seccionMTValor span").textContent.trim();

        materialList.push([name, quantity]);
    });

    // Enviar datos al servidor.
    fetch('/casetero/vales/activos/editado', {
        method: 'POST',
        body: JSON.stringify({ identificacion: identificacionSolicitud, materiales: materialList, reportados: materialesReportados }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            switch (data.status) {
                case 'error':   // Notificación de error.
                    mostrarNotificacionRequest('Error', data.mensaje, 'crimson', 'bug');
                    break;
                case 'redirect':    // Redirección exitosa.
                    sessionStorage.setItem("notificacion_mensaje", data.mensaje);
                    window.location.href = data.url;
                    break;
            };
        });
};

let itemParaEliminar = null;
let botonActualReporte = null;
let nombreMaterialReporte = null;

/*
Configura los event listeners para los botones de eliminación de materiales:
1. Selecciona todos los botones dentro de los contenedores de material.
2. Asigna un manejador de eventos click a cada botón.
3. Al hacer click:
   - Almacena referencia al material padre.
   - Guarda referencia al botón clickeado.
   - Extrae y almacena el nombre del material.
   - Muestra el diálogo de confirmación de eliminación.
*/
document.querySelectorAll('.seccionMTCasilla button').forEach(button => {
    button.addEventListener('click', function () {
        itemParaEliminar = this.parentElement;
        botonActualReporte = this;
        nombreMaterialReporte = itemParaEliminar.querySelector("h5").textContent.trim();
        document.getElementById('dialogConfirmarEliminacion').showModal();
    });
});

/*
Confirma la eliminación de un material:
1. Elimina el elemento correspondiente.
2. Limpia la referencia al elemento eliminado.
3. Cierra el diálogo de confirmación.
*/
function confirmarEliminacion() {
    if (itemParaEliminar) {
        itemParaEliminar.remove();
        itemParaEliminar = null;
    }
    cerrarDialog('dialogConfirmarEliminacion');
}

/*
Abre el diálogo para reportar un material:
1 Limpia cualquier texto previo en el área de reporte.
2. Muestra el diálogo de reporte.
*/
function abrirDialogReportar() {
    document.getElementById('textoReporte').value = '';
    document.getElementById('dialogReportarMaterial').showModal();
}

/*
Cierra un diálogo modal específico:
1. Recibe el ID del diálogo a cerrar como parámetro.
2. Utiliza la API de dialog para cerrarlo.
*/
function cerrarDialog(id) {
    document.getElementById(id).close();
}

let materialesReportados = [];

/*
Envía un reporte sobre un material problemático:
1. Valida que se haya ingresado un comentario de reporte.
2. Recopila información del material a reportar.
3. Agrega el reporte a la lista de materiales reportados.
4. Elimina el material reportado de la lista.
5. Cierra los diálogos relacionados.
*/
function enviarReporteMaterial() {
    const comentario = document.getElementById('textoReporte').value.trim();
    if (!comentario) {
        mostrarNotificacionRequest('Error', 'Escribe un motivo para reportar', 'crimson', 'bug');
        return;
    }

    const equipo = botonActualReporte.closest('.seccionMTCasilla').querySelector('h5').textContent.trim();
    const cantidad = botonActualReporte.closest('.seccionMTCasilla').querySelector('span').textContent.trim();

    materialesReportados.push([equipo, cantidad, comentario]);

    botonActualReporte.closest('.seccionMTCasilla').remove();
    cerrarDialog('dialogReportarMaterial');
    cerrarDialog('dialogConfirmarEliminacion');
}

/*
Envía los cambios realizados en un vale de maestro al servidor:
1. Recopila todos los materiales agregados con sus cantidades.
2. Envía la información al servidor.
3. Maneja la respuesta mostrando notificaciones o redirigiendo según corresponda.
*/
function enviarValeEditarMaestro() {
    // Validar campos obligatorios.
    let items = document.querySelectorAll(".seccionMTabla .seccionMTCasilla");
    let materialList = [];
    items.forEach(item => {
        let name = item.querySelector(".seccionMTValor h5").textContent.trim();
        let quantity = item.querySelector(".seccionMTValor span").textContent.trim();

        materialList.push([name, quantity]);
    });

    // Enviar datos al servidor.
    fetch('/casetero/vales/maestros/editado', {
        method: 'POST',
        body: JSON.stringify({ identificacion: identificacionSolicitud, materiales: materialList, reportados: materialesReportados }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            switch (data.status) {
                case 'error':   // Notificación de error.
                    mostrarNotificacionRequest('Error', data.mensaje, 'crimson', 'bug');
                    break;
                case 'redirect':    // Redirección exitosa.
                    sessionStorage.setItem("notificacion_mensaje", data.mensaje);
                    window.location.href = data.url;
                    break;
            };
        });
};

/*
Selecciona un laboratorio de la lista y actualiza el input correspondiente:
1. Obtiene el texto del elemento seleccionado.
2. Asigna el valor al input y aplica estilos visuales.
3. Cierra el diálogo.
*/
function selectLab(element) {
    let selectedLab = element.textContent;
    let labInput = document.getElementById('valeLabInput');
    labInput.value = selectedLab;
    labInput.style.color = '#333'
    labInput.style.fontWeight = '500'
    dialogLab.close();
};

/*
Cancela la selección de laboratorio:
1. Limpia el input correspondiente.
2. Cierra el diálogo.
*/
function closeDialogLabCancelada() {
    let labInput = document.getElementById('valeLabInput');
    labInput.value = '';
    dialogLab.close();
};

/*
Cierra el diálogo de laboratorio sin realizar cambios.
*/
function closeDialogLab() {
    dialogLab.close();
};

/*
Filtra la lista de maestros según el texto ingresado:
1. Convierte el texto de búsqueda a minúsculas.
2. Muestra solo los elementos que coincidan con la búsqueda.
*/
function filterListTeacher() {
    let input = document.getElementById('searchInputTeacher').value.toLowerCase();
    let listItems = document.querySelectorAll('#teacherList li');

    listItems.forEach(li => {
        let text = li.textContent.toLowerCase();
        li.style.display = text.includes(input) ? 'flex' : 'none';
    });
};

/*
Selecciona un maestro de la lista y actualiza el input correspondiente:
1. Obtiene el texto del elemento seleccionado.
2. Asigna el valor al input y aplica estilos visuales.
3. Cierra el diálogo.
*/
function selectTeacher(element) {
    let selectedTeacher = element.textContent;
    let teacherInput = document.getElementById('valeTeacherInput');
    teacherInput.value = selectedTeacher;
    teacherInput.style.color = '#333'
    teacherInput.style.fontWeight = '500'
    dialogTeacher.close();
};

/*
Cancela la selección de maestro:
1. Limpia el input correspondiente.
2. Cierra el diálogo.
*/
function closeDialogTeacherCancelada() {
    let teacherInput = document.getElementById('valeTeacherInput');
    teacherInput.value = '';
    dialogTeacher.close();
};

/*
Cierra el diálogo de maestro sin realizar cambios.
*/
function closeDialogTeacher() {
    dialogTeacher.close();
};

/*
Selecciona una cantidad de la lista y actualiza el input correspondiente:
1. Obtiene el texto del elemento seleccionado.
2. Asigna el valor al input y aplica estilos visuales.
3. Cierra el diálogo.
*/
function selectCantidad(element) {
    let selectedCantidad = element.textContent;
    let cantidadInput = document.getElementById('valeNumInput');
    cantidadInput.value = selectedCantidad;
    cantidadInput.style.color = '#333'
    cantidadInput.style.fontWeight = '500'
    dialogCantidad.close();
};

/*
Cancela la selección de cantidad:
1. Limpia el input correspondiente.
2. Cierra el diálogo.
*/
function closeDialogCantidadCancelada() {
    let cantidadInput = document.getElementById('valeNumInput');
    cantidadInput.value = '';
    dialogCantidad.close();
};

/*
Cierra el diálogo de cantidad sin realizar cambios.
*/
function closeDialogCantidad() {
    dialogCantidad.close();
};

/*
Selecciona un salón de la lista y configura la interfaz según el tipo:
1. Actualiza el input de salón con estilos visuales.
2. Muestra el botón para agregar materiales.
3. Configura qué lista de materiales mostrar según el salón seleccionado.
4. Limpia la tabla de materiales existentes.
5. Cierra el diálogo.
*/
function selectSalon(element) {
    let selectedSalon = element.textContent;
    let salonInput = document.getElementById('valeSalonInput');
    document.querySelector('.seccionMTabla').innerHTML = '';
    salonInput.value = selectedSalon;
    salonInput.style.color = '#333'
    salonInput.style.fontWeight = '500'
    botonMaterial.style.display = 'flex';
    dialogSalon.close();
};

/*
Cancela la selección de salón:
1. Limpia el input y la tabla de materiales.
2. Oculta todas las listas de materiales.
3. Oculta el botón para agregar materiales.
4. Cierra el diálogo.
*/
function closeDialogSalonCancelada() {
    let salonInput = document.getElementById('valeSalonInput');
    document.querySelector('.seccionMTabla').innerHTML = '';
    salonInput.value = '';
    dialogSalon.close();
};

/*
Cierra el diálogo de salón sin realizar cambios.
*/
function closeDialogSalon() {
    dialogSalon.close();
};

let dialogLab = document.getElementById("seleccionLaboratorio");

/*
Abre el diálogo modal para seleccionar laboratorio.
*/
function openDialogLab() {
    dialogLab.showModal();
};

let dialogTeacher = document.getElementById("seleccionMaestro");

/*
Abre el diálogo modal para seleccionar maestro.
*/
function openDialogTeacher() {
    dialogTeacher.showModal();
};

let dialogCantidad = document.getElementById("seleccionCantidad");

/*
Abre el diálogo modal para seleccionar cantidad de alumnos.
*/
function openDialogCantidad() {
    dialogCantidad.showModal();
};

let dialogSalon = document.getElementById("seleccionSalon");
let botonMaterial = document.getElementById('botonAbrirMaterial');

/*
Abre el diálogo modal para seleccionar salón.
*/
function openDialogSalon() {
    dialogSalon.showModal();
};

function openDialogEnviarRegistro() {
    let items = document.querySelectorAll(".seccionMTabla .seccionMTCasilla");
    let control = document.getElementById("valeControlInput").value;
    let nombre = document.getElementById("valeNombreInput").value;
    let materia = document.getElementById("valeMateriaInput").value;
    let grupo = document.getElementById("valeGrupoInput").value;
    let vale = document.getElementById('valeLabInput').value;
    let profesor = document.getElementById('valeTeacherInput').value;
    let alumnos = document.getElementById('valeNumInput').value;
    let laboratorio = document.getElementById('valeSalonInput').value;

    if (control === '' || nombre === '' || materia === '' || grupo === '' || vale === '' || profesor === '' || alumnos === '' || laboratorio === '') {
        mostrarNotificacionRequest('Notificación', 'Falta Información', '#1c336c', 'bell');
    }
    else if (items.length === 0) {
        mostrarNotificacionRequest('Notificación', 'No hay Materiales Agregados', '#1c336c', 'bell');
    }
    else {
        dialogEnviar.showModal();
    }
};

function enviarRegistro() {
    let control = document.getElementById("valeControlInput").value;
    let nombre = document.getElementById("valeNombreInput").value;
    let materia = document.getElementById("valeMateriaInput").value;
    let grupo = document.getElementById("valeGrupoInput").value;
    let vale = document.getElementById('valeLabInput').value;
    let profesor = document.getElementById('valeTeacherInput').value;
    let alumnos = document.getElementById('valeNumInput').value;
    let laboratorio = document.getElementById('valeSalonInput').value;
    let reporte = document.getElementById('textoReporte').value.trim();
    let items = document.querySelectorAll(".seccionMTabla .seccionMTCasilla");

    let materialList = [];
    items.forEach(item => {
        let name = item.querySelector(".seccionMTValor h5").textContent.trim();
        let quantity = item.querySelector(".seccionMTValor span").textContent.trim();

        materialList.push([name, quantity]);
    });

    fetch('/casetero/registros/nuevo/agregar', {
        method: 'POST',
        body: JSON.stringify({ control: control, nombre: nombre, materia: materia, grupo: grupo, vale: vale, profesor: profesor, alumnos: alumnos, laboratorio: laboratorio, reporte: reporte, items: materialList }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            switch (data.status) {
                case 'error':
                    mostrarNotificacionRequest('Error', data.mensaje, 'crimson', 'bug');
                    break;
                case 'redirect':
                    sessionStorage.setItem("notificacion_mensaje", data.mensaje);
                    window.location.href = data.url;
                    break;
            };
        });
};

function openDialogReportar() {
    let dialog = document.getElementById(`dialogReportarMaterial`);
    if (dialog) {
        dialog.showModal();
    }
}

function closeDialogReportar() {
    let dialog = document.getElementById(`dialogReportarMaterial`);
    if (dialog) {
        dialog.close();
    }
}