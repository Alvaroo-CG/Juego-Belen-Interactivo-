document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    mostrarModal("instrucciones-modal");
  }, 500);

  const fondoInicial = "img/nacimiento/esc-nacimiento.png";
  cambiarFondo(fondoInicial);
});

function mostrarModal(id) {
  const modal = document.getElementById(id);
  const contenido = modal.querySelector(".modal-contenido");
  modal.classList.add("mostrar");
  contenido.classList.add("mostrar");
}

function ocultarModal(id) {
  const modal = document.getElementById(id);
  const contenido = modal.querySelector(".modal-contenido");
  modal.classList.remove("mostrar");
  contenido.classList.remove("mostrar");
}

document.querySelectorAll(".cerrar-modal").forEach((btn) => {
  btn.addEventListener("click", function () {
    const modal = this.closest(".modal");
    ocultarModal(modal.id);
  });
});

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", function (e) {
    if (e.target === this) {
      ocultarModal(this.id);
    }
  });
});

function finalizar() {
  mostrarModal("finalizar-modal");
}

document.getElementById("imprimir-btn").addEventListener("click", function () {
  window.print();
});

document.getElementById("descargar-btn").addEventListener("click", function () {
  const escenario = document.getElementById("escenario");
  html2canvas(escenario).then((canvas) => {
    const link = document.createElement("a");
    link.download = "mi-belen.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

document.getElementById("redes-btn").addEventListener("click", function () {
  ocultarModal("finalizar-modal");
  mostrarModal("redes-modal");
});

function capturarEscenario(callback) {
  const escenario = document.getElementById("escenario");
  html2canvas(escenario).then((canvas) => {
    const dataURL = canvas.toDataURL("image/png");
    callback(dataURL);
  });
}

function compartirFacebook() {
  capturarEscenario((dataURL) => {
    subirAImgur(dataURL, (url) => {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(facebookUrl, "_blank");
    });
  });
  ocultarModal("redes-modal");
}

function compartirTwitter() {
  capturarEscenario((dataURL) => {
    subirAImgur(dataURL, (url) => {
      const text = "Mira mi Belén interactivo:";
      const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, "_blank");
    });
  });
  ocultarModal("redes-modal");
}

function compartirWhatsApp() {
  capturarEscenario((dataURL) => {
    subirAImgur(dataURL, (url) => {
      const text = "Mira mi Belén interactivo:";
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
      window.open(whatsappUrl, "_blank");
    });
  });
  ocultarModal("redes-modal");
}

function subirAImgur(dataURL, callback) {
  const base64Image = dataURL.split(",")[1];
  fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: "Client-ID 2b8ac60090fc266",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: base64Image, type: "base64" }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const url = data.data.link;
        callback(url);
      } else {
        alert("Hubo un problema al subir la imagen.");
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Error al subir la imagen a Imgur.");
    });
}

const escenario = document.getElementById("escenario");

function limpiarTablero() {
  const colocadas = document.querySelectorAll(".pieza-colocada");
  colocadas.forEach((p) => p.remove());
}

function addDragHandlers(el) {
  let offsetX, offsetY;
  let currentMover = null;

  el.addEventListener("mousedown", (e) => {
    e.preventDefault();
    currentMover = el;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    el.style.zIndex = "1000";
  });

  document.addEventListener("mousemove", (e) => {
    if (currentMover) {
      const rect = escenario.getBoundingClientRect();
      currentMover.style.left = `${e.clientX - rect.left - offsetX}px`;
      currentMover.style.top = `${e.clientY - rect.top - offsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (currentMover) {
      currentMover.style.zIndex = "";
      currentMover = null;
    }
  });

  el.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rectEl = el.getBoundingClientRect();
    currentMover = el;
    offsetX = touch.clientX - rectEl.left;
    offsetY = touch.clientY - rectEl.top;
    el.style.zIndex = "1000";
  });

  document.addEventListener("touchmove", (e) => {
    if (currentMover) {
      const touch = e.touches[0];
      const rect = escenario.getBoundingClientRect();
      currentMover.style.left = `${touch.clientX - rect.left - offsetX}px`;
      currentMover.style.top = `${touch.clientY - rect.top - offsetY}px`;
    }
  });

  document.addEventListener("touchend", () => {
    if (currentMover) {
      currentMover.style.zIndex = "";
      currentMover = null;
    }
  });

  el.addEventListener("dblclick", () => el.remove());

  let lastTap = 0;
  el.addEventListener("touchend", (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      el.remove();
    }
    lastTap = currentTime;
  });
}

function habilitarArrastreBandeja(img) {
  let offsetX, offsetY;
  let piezaMoviendo = null;

  
  img.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const rectEsc = escenario.getBoundingClientRect();
    piezaMoviendo = img.cloneNode(true);
    piezaMoviendo.style.position = "absolute";
    piezaMoviendo.classList.add("pieza-colocada");
    piezaMoviendo.style.left = `${e.clientX - rectEsc.left - img.offsetWidth / 2}px`;
    piezaMoviendo.style.top = `${e.clientY - rectEsc.top - img.offsetHeight / 2}px`;
    escenario.appendChild(piezaMoviendo);
    offsetX = img.offsetWidth / 2;
    offsetY = img.offsetHeight / 2;
    piezaMoviendo.style.zIndex = "1000";
  });

  document.addEventListener("mousemove", (e) => {
    if (piezaMoviendo) {
      const rectEsc = escenario.getBoundingClientRect();
      piezaMoviendo.style.left = `${e.clientX - rectEsc.left - offsetX}px`;
      piezaMoviendo.style.top = `${e.clientY - rectEsc.top - offsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (piezaMoviendo) {
      piezaMoviendo.style.zIndex = "";
      addDragHandlers(piezaMoviendo);
      piezaMoviendo = null;
    }
  });

  img.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rectEsc = escenario.getBoundingClientRect();
    piezaMoviendo = img.cloneNode(true);
    piezaMoviendo.style.position = "absolute";
    piezaMoviendo.classList.add("pieza-colocada");
    piezaMoviendo.style.left = `${touch.clientX - rectEsc.left - img.offsetWidth / 2}px`;
    piezaMoviendo.style.top = `${touch.clientY - rectEsc.top - img.offsetHeight / 2}px`;
    escenario.appendChild(piezaMoviendo);
    offsetX = img.offsetWidth / 2;
    offsetY = img.offsetHeight / 2;
    piezaMoviendo.style.zIndex = "1000";
  });

  document.addEventListener("touchmove", (e) => {
    if (piezaMoviendo) {
      const touch = e.touches[0];
      const rectEsc = escenario.getBoundingClientRect();
      piezaMoviendo.style.left = `${touch.clientX - rectEsc.left - offsetX}px`;
      piezaMoviendo.style.top = `${touch.clientY - rectEsc.top - offsetY}px`;
    }
  });

  document.addEventListener("touchend", () => {
    if (piezaMoviendo) {
      piezaMoviendo.style.zIndex = "";
      addDragHandlers(piezaMoviendo);
      piezaMoviendo = null;
    }
  });
}

const escenas = {
  "img/nacimiento/esc-nacimiento.png": {
    nombre: "Nacimiento",
    figuras: [
      { id: "jesus", src: "img/nacimiento/jesus.png" },
      { id: "maria", src: "img/nacimiento/maria.png" },
      { id: "jose", src: "img/nacimiento/jose.png" },
      { id: "mula", src: "img/nacimiento/mula.png" },
      { id: "buey", src: "img/nacimiento/buey.png" },
      { id: "pastorcillo", src: "img/nacimiento/pastorcillo.png" },
      { id: "angelito", src: "img/nacimiento/angelito.png" },
    ],
  },
  "img/anunciacion/esc-anunciacion.png": {
    nombre: "Anunciación",
    figuras: [
      { id: "arcangelgabriel", src: "img/anunciacion/arcangelgabriel.png" },
      { id: "virgenmaria", src: "img/anunciacion/virgenmaria.png" },
    ],
  },
  "img/huidaegipto/esc-huidaegipto.png": {
    nombre: "Huida a Egipto",
    figuras: [
      { id: "sanjose", src: "img/huidaegipto/sanjose.png" },
      { id: "virgenmariaburro", src: "img/huidaegipto/virgenmariaburro.png" },
      { id: "camello", src: "img/huidaegipto/camello.png" },
    ],
  },
  "img/posada/esc-posada.png": {
    nombre: "La Posada",
    figuras: [
      { id: "posadero", src: "img/posada/posadero.png" },
      { id: "mariaembarazada", src: "img/posada/mariaembarazada.png" },
      { id: "joseposada", src: "img/posada/joseposada.png" },
      { id: "burro", src: "img/posada/burro.png" },
    ],
  },
  "img/adoracionreyesmagos/esc-adoracionreyesmagos.png": {
    nombre: "La Adoración de los Reyes Magos",
    figuras: [
      { id: "melchor", src: "img/adoracionreyesmagos/melchor.png" },
      { id: "gaspar", src: "img/adoracionreyesmagos/gaspar.png" },
      { id: "baltasar", src: "img/adoracionreyesmagos/baltasar.png" },
      { id: "buey", src: "img/adoracionreyesmagos/buey.png" },
      { id: "mula", src: "img/adoracionreyesmagos/mula.png" },
      { id: "jesus", src: "img/adoracionreyesmagos/jesus.png" },
      { id: "maria", src: "img/adoracionreyesmagos/maria.png" },
      { id: "jose", src: "img/adoracionreyesmagos/jose.png" },
    ],
  },
};

function cambiarFondo(rutaFondo) {
  const escena = escenas[rutaFondo];
  if (!escena) return;
  document.getElementById("fondo-impresion").src = rutaFondo;
  document.getElementById("titulo-escena").innerText = escena.nombre;
  limpiarTablero();
  actualizarBandeja(escena.figuras);
}

function actualizarBandeja(figuras) {
  const bandeja = document.getElementById("bandeja");
  bandeja.innerHTML = "";
  figuras.forEach((figura) => {
    const img = document.createElement("img");
    img.src = figura.src;
    img.id = figura.id;
    img.className = "pieza";
    habilitarArrastreBandeja(img);
    bandeja.appendChild(img);
  });
}
