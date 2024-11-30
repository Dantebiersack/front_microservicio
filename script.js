const API_URL = "https://microservicio-promociones-cine.vercel.app/api/promociones";

// Mostrar alertas
function mostrarAlerta(mensaje, tipo = "success") {
    const alert = $("#formAlert");
    alert.removeClass("d-none alert-success alert-danger");
    alert.addClass(`alert-${tipo}`);
    alert.text(mensaje);
    setTimeout(() => alert.addClass("d-none"), 3000);
}

// Cargar promociones
function cargarPromociones() {
    $.ajax({
        url: API_URL,
        method: "GET",
        success: function (data) {
            const tbody = $("#tablaPromociones tbody");
            tbody.empty();
            data.forEach(promocion => {
                tbody.append(`
                    <tr>
                        <td>${promocion.id_promocion}</td>
                        <td>${promocion.descripcion}</td>
                        <td>${formatearFecha(promocion.fecha_inicio)}</td>
                        <td>${formatearFecha(promocion.fecha_fin)}</td>
                        <td>${promocion.porcentaje_descuento}</td>
                        <td>${nombre_producto}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editarPromocion(${promocion.id_promocion})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarPromocion(${promocion.id_promocion})">Eliminar</button>
                        </td>
                    </tr>
                `);
            });
        },
        error: function () {
            mostrarAlerta("Error al cargar promociones.", "danger");
        }
    });
}


// Guardar promoción
$("#formPromocion").on("submit", function (e) {
    e.preventDefault();
    const promocion = {
        descripcion: $("#descripcion").val(),
        fecha_inicio: $("#fecha_inicio").val(),
        fecha_fin: $("#fecha_fin").val(),
        id_producto_fk: $("#id_producto_fk").val(),
        porcentaje_descuento: $("#porcentaje_descuento").val(),
        estatus: 1
    };

    const id_promocion = $("#id_promocion").val();
    const method = id_promocion ? "PUT" : "POST";
    const url = id_promocion ? `${API_URL}/${id_promocion}` : API_URL;

    $.ajax({
        url,
        method,
        data: JSON.stringify(promocion),
        contentType: "application/json",
        success: function () {
            mostrarAlerta("Promoción guardada correctamente.");
            $("#formPromocion")[0].reset();
            cargarPromociones();
        },
        error: function () {
            mostrarAlerta("Error al guardar la promoción.", "danger");
        }
    });
});

// Cargar datos para editar
function editarPromocion(id) {
    $.get(`${API_URL}/${id}`, function (promocion) {
        $("#id_promocion").val(promocion.id_promocion);
        $("#descripcion").val(promocion.descripcion);
        $("#fecha_inicio").val(promocion.fecha_inicio.split("T")[0]);
        $("#fecha_fin").val(promocion.fecha_fin.split("T")[0]);
        $("#id_producto_fk").val(promocion.id_producto_fk);
        $("#porcentaje_descuento").val(promocion.porcentaje_descuento);
    }).fail(function () {
        mostrarAlerta("Error: No se pudo cargar la promoción.", "danger");
    });
}


// Eliminar promoción
function eliminarPromocion(id) {
    if (!confirm("¿Deseas eliminar esta promoción?")) return;
    $.ajax({
        url: `${API_URL}/${id}`,
        method: "DELETE",
        success: function () {
            mostrarAlerta("Promoción eliminada correctamente.");
            cargarPromociones();
        },
        error: function () {
            mostrarAlerta("Error al eliminar la promoción.", "danger");
        }
    });
}

function cargarProductos() {
    $.ajax({
        url: "https://microservicio-promociones-cine.vercel.app/api/productos", // URL del endpoint
        method: "GET",
        success: function (data) {
            const select = $("#id_producto_fk");
            select.empty(); // Limpiar opciones previas
            select.append('<option value="">Seleccione un producto</option>'); // Opción predeterminada
            data.forEach(producto => {
                select.append(`<option value="${producto.producto_id}">${producto.nombre_producto}</option>`);
            });
        },
        error: function () {
            mostrarAlerta("Error al cargar los productos.", "danger");
        }
    });
}

// Función para formatear fechas a DD/MM/YYYY HH:MM:SS
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const segundos = fecha.getSeconds().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
}



// Recargar tabla
$("#recargar").on("click", cargarPromociones);

// Inicializar
$(document).ready(function () {
    cargarProductos(); // Llenar el select de productos
    cargarPromociones(); // Cargar promociones
});

