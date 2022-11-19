/*-- ENTREGA FINAL / comisión 41805 / Higa María Soledad --*/
//---Simulador de App para auto-pedidos

//--VARIABLES GLOBALES
const modalValEdad = document.getElementById("modalValEdad"),
  msjValEdad = document.getElementById("msjValEdad"),
  btnValEdad = document.getElementById("btnValEdad"),
  modalMenor = document.getElementById("modalMenor"),
  msjMenor = document.getElementById("msjMenor"),
  modalMesa = document.getElementById("modalMesa"),
  btnNumMesa = document.getElementById("btnNumMesa"),
  valNumMesa = document.getElementById("valNumMesa"),
  productoParaComer = document.getElementById("tarjetasParaComer"),
  productoParaTomar = document.getElementById("tarjetasParaTomar"),
  btnsMenu = document.getElementById("menu"),
  verPedido = document.getElementById("verPedido"),
  modalPedido = document.getElementById("pedido"),
  listaPedido = document.getElementById("listaPedido"),
  total = document.getElementById("total"),
  btnEnviar = document.getElementById("enviar"),
  btnCancelar = document.getElementById("cancelar"),
  btnFalta = document.getElementById("falta"),
  modalEnviarPedido = document.getElementById("modalEnviarPedido"),
  msjEnviarPedido = document.getElementById("msjEnviarPedido"),
  cantidad = document.getElementById("cantidad");
let mayorEdad = JSON.parse(localStorage.getItem("mayorEdad")) ?? "";
let numMesa = JSON.parse(sessionStorage.getItem("numMesa")) || "";
let edadClienteProducto;
let itemPedido;
let pedido = JSON.parse(localStorage.getItem("pedidoEnCurso")) || [];
let totalPedido = 0;
let totalCantidad = 0;
// Luxon JS
const DateTime = luxon.DateTime;

//--FLUJO SIMULADOR

// fetch - Obteniendo datos - función asíncrona
const fetchDatos = async () => {
  const res = await fetch("./json/menu.json");
  const datos = await res.json();
  // guardo arrays de productos por categoría en constantes
  const paraComer = filtrarPorCategoria(datos, "Para comer");
  const paraTomar = filtrarPorCategoria(datos, "Para tomar");
  // pintando tarjeta de productos
  pintarProductos(paraComer, productoParaComer);
  pintarProductos(paraTomar, productoParaTomar);
  return (menu = datos);
};

// ejecuciones
fetchDatos();
pintarCantidad();

//--eventos

// escucha botones para agregar productos al pedido por delegación de evento
btnsMenu.addEventListener("click", (e) => {
  e.preventDefault;
  seleccion(e);
  e.stopPropagation();
});

// modalValEdad
// guarda en local storage si el cliente es mayor o no a partir de la fecha de nacimiento que ingresa
btnValEdad.addEventListener("click", (e) => {
  e.preventDefault();
  const fechaVal = DateTime.now().minus({ years: 18 }); //aplicando Luxon JS
  const inputFecha = document.getElementById("fechaNacCliente").value;
  if (inputFecha !== "") {
    const fechaNac = DateTime.fromISO(inputFecha); //aplicando Luxon JS
    const esMayor = fechaVal >= fechaNac;
    localStorage.setItem("mayorEdad", esMayor);
    mayorEdad = JSON.parse(localStorage.getItem("mayorEdad"));
    modalValEdad.close();
  }
  e.stopPropagation();
});

// modalMesa
// guarda en session storage el número de mesa
btnNumMesa.addEventListener("click", (e) => {
  e.preventDefault();
  const inputNumMesa = parseFloat(
    document.getElementById("inputNumMesa").value
  );
  validarNumMesa(inputNumMesa);
  if (inputNumMesa > 0 && inputNumMesa < 21 && Number.isInteger(inputNumMesa)) {
    sessionStorage.setItem("numMesa", inputNumMesa);
    numMesa = JSON.parse(sessionStorage.getItem("numMesa"));
    modalMesa.close();
    modalPedido.showModal();
    pintarNumMesa();
  }
  e.stopPropagation();
});

// abre modalPedido
verPedido.addEventListener("click", (e) => {
  e.preventDefault();
  modalPedido.showModal();
  noEscape(modalPedido);
  pintarNumMesa();
  pintarPedido();
  e.stopPropagation();
});

// botones en modalPedido - btnFalta / btnCancelar / btnEnviar
btnFalta.addEventListener("click", (e) => {
  e.preventDefault();
  modalPedido.close();
  e.stopPropagation();
});
btnCancelar.addEventListener("click", (e) => {
  e.preventDefault;
  resetearPedido();
  pintarCantidad();
  modalPedido.close();
  e.stopPropagation();
});
btnEnviar.addEventListener("click", (e) => {
  e.preventDefault;
  validarPedido();
  if (pedido.length > 0 && !(numMesa === "")) {
    crearDatosPedido();
    resetearPedido();
    pintarCantidad();
    modalPedido.close();
    modalTemporizado(modalEnviarPedido);
    numMesa = JSON.parse(sessionStorage.getItem("numMesa"));
    msjEnviarPedido.innerText = `Pedido de mesa número ${numMesa} enviado exitosamente`;
  }
  e.stopPropagation();
});

// botones editar pedido -  por delegación de evento
listaPedido.addEventListener("click", (e) => {
  e.preventDefault;
  const btn = e.target.dataset;
  const idItemEditar = parseInt(btn.id);
  editarPedidoMas(btn, idItemEditar);
  editarPedidoMenos(btn, idItemEditar);
  editarPedidoBorrar(btn, idItemEditar);
  pintarPedido();
  pintarCantidad();
  e.stopPropagation();
});

//--FUNCIONES

// filtra productos por categoria
function filtrarPorCategoria(datos, filtro) {
  return datos.filter((producto) => producto.categoria == filtro);
}

// pinta tarjetas de productos dinámicamente
function pintarProductos(categoriaProducto, contenedor) {
  categoriaProducto.forEach((producto) => {
    contenedor.innerHTML += `
    <div class="tarjeta-producto" >
    <img src="${producto.imgSrc}" alt="" class="img-producto" />
    <h4 class="nombre-producto">${producto.nombre}</h4>
    <p class="detalle-producto">${producto.detalle}</p>
    <h4 class="precio-producto">$ ${producto.precio}</h4>
    <button class="btn-agregar" id="${producto.id}" type="submit")">Agregar</button>
    </div>
    `;
  });
}

// verifica si se presionó el botón agregar y ejecuta funciones
function seleccion(e) {
  if (e.target.classList.contains("btn-agregar")) {
    let idSeleccion = parseInt(e.target.id);
    encuentraSeleccion(idSeleccion);
    validarEdad(itemPedido);
    controlMayorEdad(itemPedido);
    agregarAlPedido(itemPedido);
    pintarCantidad();
  }
  return itemPedido, edadClienteProducto;
}

// busca producto seleccionado
function encuentraSeleccion(idSeleccion) {
  itemPedido = menu.find((producto) => producto.id === idSeleccion);
  return itemPedido;
}

// verifica si el producto requiere validar edad del cliente
function validarEdad(itemPedido) {
  itemPedido.mayorEdad && mayorEdad === "" && modalValEdad.showModal();
  noEscape(modalValEdad);
}

// verifica si el cliente es mayor, algunos productos requieren mayoria de edad
function controlMayorEdad(itemPedido) {
  if (mayorEdad === false && itemPedido.mayorEdad) {
    modalTemporizado(modalMenor);
    msjMenor.innerText = `El producto "${itemPedido.nombre}" es para mayores de 18 años.`;
    edadClienteProducto = false;
  }
  mayorEdad && (edadClienteProducto = true);
  return edadClienteProducto;
}

// agrega al pedido y localstorage para no perder los propuctos agrgados si se recarga la página
function agregarAlPedido(itemPedido) {
  if (!itemPedido.mayorEdad || edadClienteProducto) {
    validarCantidadEnPedido(itemPedido);
  }
  localStorage.setItem("pedidoEnCurso", JSON.stringify(pedido));
  return pedido;
}

// pinta cantidad de productos en el pedido
function pintarCantidad() {
  if (pedido.length === 0) {
    cantidad.style.display = "none";
  } else {
    cantidad.style.display = "block";
    totalCantidad = pedido.reduce((suma, { cantidad }) => suma + cantidad, 0);
    cantidad.innerText = `${totalCantidad}`;
  }
}

// verifica si el producto a agregar existe en el carrito, aumenta cantidad
function validarCantidadEnPedido(itemPedido) {
  if (pedido.some((item) => item.id === itemPedido.id)) {
    const indice = pedido.findIndex((item) => item.id === itemPedido.id);
    pedido[indice].cantidad++;
  } else {
    pedido.push({ ...itemPedido, cantidad: 1 });
  }
}

// pinta pedido dinámicamente
function pintarPedido() {
  // detalle del pedido
  listaPedido.innerHTML = "";
  pedido.forEach((item) => {
    listaPedido.innerHTML += `
    <tr>
    <td class="col2">${item.nombre}</td>
    <td class="col3">${item.cantidad}</td>
    <td class="col5">$${item.cantidad * item.precio}</td>
    <td>
    <img class="btn-edit-pedido" data-name="menos"
    data-id="${item.id}" src="./img/circle-minus-fill.svg"/>
    <img class="btn-edit-pedido" data-name="borrar"
      data-id="${item.id}" src="./img/trash-can.svg"/>
      <img class="btn-edit-pedido" data-name="mas" 
      data-id="${item.id}" src="./img/circle-plus-fill.svg"/>
      </td>
      </tr>
      `;
  });
  // total del pedido
  if (pedido.length === 0) {
    total.innerText = `Vacío`;
  } else {
    totalPedido = pedido.reduce(
      (suma, { cantidad, precio }) => suma + cantidad * precio,
      0
    );
    total.innerText = `$${totalPedido}`;
  }
}

// resetea el pedido
function resetearPedido() {
  pedido = [];
  pedidoJSON = JSON.stringify(pedido);
  localStorage.setItem("pedidoEnCurso", pedidoJSON);
  totalPedido = 0;
}

// valida pedido a enviar
function validarPedido() {
  if (pedido.length === 0) {
    modalTemporizado(modalEnviarPedido);
    msjEnviarPedido.innerText = `Pedido vacío`;
    modalPedido.close();
  } else if (numMesa === "") {
    valNumMesa.innerText = `Se requiere número de mesa para continuar`;
    modalMesa.showModal();
    noEscape(modalMesa);
    modalPedido.close();
  }
}

// pinta numero de mesa
function pintarNumMesa() {
  const textoNumMesa = numMesa ? `Mesa N°${numMesa}` : "";
  modalPedido.children[1].innerText = textoNumMesa;
}

// funciones editar pedido
// botón más
function editarPedidoMas(btn, idItemEditar) {
  const indice = pedido.findIndex((item) => item.id === idItemEditar);
  btn.name === "mas" && pedido[indice].cantidad++;
  localStorage.setItem("pedidoEnCurso", JSON.stringify(pedido));
  return pedido;
}
// botón menos
function editarPedidoMenos(btn, idItemEditar) {
  const indice = pedido.findIndex((item) => item.id === idItemEditar);
  if (btn.name === "menos") {
    pedido[indice].cantidad--;
    pedido[indice].cantidad === 0 && pedido.splice(indice, 1);
  }
  localStorage.setItem("pedidoEnCurso", JSON.stringify(pedido));
  return pedido;
}
// botón borrar
function editarPedidoBorrar(btn, idItemEditar) {
  const indice = pedido.findIndex((item) => item.id === idItemEditar);
  btn.name === "borrar" && pedido.splice(indice, 1);
  localStorage.setItem("pedidoEnCurso", JSON.stringify(pedido));
  return pedido;
}

// función constructora objeto con datos del pedido
function DatosPedido(fecha, hora, numMesa, total) {
  this.fecha = fecha;
  this.hora = hora;
  this.numMesa = numMesa;
  this.total = total;
}

// crea numero de pedido
function obtenerNumPedido() {
  const ultimoNumPedido = localStorage.getItem("ultimoNumPedido") || "0";
  const nuevoNumPedido = JSON.parse(ultimoNumPedido) + 1;
  localStorage.setItem("ultimoNumPedido", JSON.stringify(nuevoNumPedido));
  return nuevoNumPedido;
}

// crea el objeto con los datos del pedido y los agrega a un array junto con el detalle de productos para guargarlo en el localStorage
function crearDatosPedido() {
  const numPedido = obtenerNumPedido();
  const fecha = DateTime.now().toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY); //aplicando Luxon JS
  const hora = DateTime.now().toLocaleString(DateTime.TIME_WITH_SECONDS); //aplicando Luxon JS
  const datosPedido = new DatosPedido(fecha, hora, numMesa, totalPedido);
  const pedidoCerrado = [...pedido, datosPedido];
  const jsonPedido = JSON.stringify(pedidoCerrado);
  localStorage.setItem(`Pedido Enviado N°${numPedido}`, jsonPedido);
}

// valida número de mesa que se está ingresando
function validarNumMesa(inputNumMesa) {
  while (
    inputNumMesa > 20 ||
    inputNumMesa < 1 ||
    !Number.isInteger(inputNumMesa)
  ) {
    valNumMesa.innerText = `El número de mesa ingresado es incorrecto`;
    break;
  }
}

// modal temporizado - abre y cierra
function modalTemporizado(modal) {
  modal.showModal();
  setTimeout(() => modal.close(), 2000);
}

// deshabilita tecla "escape" cuando el modal está abierto
function noEscape(modal) {
  if (modal.open) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    });
  }
}
