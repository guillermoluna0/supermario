const mario = document.getElementById("mario");

// Posición y física
let posicionX = 300; // left
let posicionY = 515; // top (valor inicial que coincide con el CSS)
let vy = 0; // velocidad vertical
const gravity = 0.8; // gravedad (px/frame^2)
const jumpStrength = -15; // velocidad inicial del salto (negativa = hacia arriba)
let onGround = true;

// Manejo de teclado: flags para movimiento continuo y doble salto
const speedX = 4; // velocidad horizontal en px/frame
let leftPressed = false;
let rightPressed = false;
let upPressed = false; // para evitar repetición al mantener la tecla

let jumpsUsed = 0;
const maxJumps = 2; // permite doble salto

document.addEventListener("keydown", (event) => {
    // Solo prevenir el scroll por flechas cuando son usadas para moverse
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
    }

    switch (event.key) {
        case "ArrowLeft":
            leftPressed = true;
            break;
        case "ArrowRight":
            rightPressed = true;
            break;
        case "ArrowUp":
            // Solo disparar un salto por pulsación (evitar key repeat)
            if (!upPressed) {
                // permitir hasta maxJumps saltos consecutivos
                if (jumpsUsed < maxJumps) {
                    vy = jumpStrength;
                    jumpsUsed += 1;
                    onGround = false;
                }
            }
            upPressed = true;
            break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            leftPressed = false;
            break;
        case "ArrowRight":
            rightPressed = false;
            break;
        case "ArrowUp":
            upPressed = false;
            break;
    }
});

// Bucle de animación que aplica gravedad y actualiza la posición
function update() {
    // Movimiento horizontal continuo según flags
    if (leftPressed) posicionX -= speedX;
    if (rightPressed) posicionX += speedX;

    // aplicar gravedad
    vy += gravity;
    posicionY += vy;

    // colisión con el suelo
    if (posicionY > 515) {
        posicionY = 515;
        vy = 0;
        onGround = true;
        // resetear contador de saltos al tocar el suelo
        jumpsUsed = 0;
    }

    // limitar dentro de la pantalla (ancho pantalla 900px, mario ~25px)
    posicionX = Math.max(0, Math.min(posicionX, 900 - 25));

    // Aplicar estilos
    mario.style.top = posicionY + "px";
    mario.style.left = posicionX + "px";

    // Detección de colisiones con cajas
    const cajas = document.querySelectorAll('[id^="caja"]');
    cajas.forEach(box => {
        // saltar cajas ya procesadas
        if (box.dataset.got === 'true') return;

        const r1 = mario.getBoundingClientRect();
        const r2 = box.getBoundingClientRect();

        const overlap = !(r1.right < r2.left ||
                          r1.left > r2.right ||
                          r1.bottom < r2.top ||
                          r1.top > r2.bottom);

        if (overlap) {
            // Marcar como recogida/impactada
            box.dataset.got = 'true';
            // ocultar la caja
            box.style.visibility = 'hidden';

            // Crear la moneda en la posición de la caja
            spawnCoin(r2.left, r2.top, box.offsetWidth, box.offsetHeight);
        }
    });

    requestAnimationFrame(update);
}

// Iniciar animación
requestAnimationFrame(update);

// Crea una moneda en pantalla en las coordenadas (x,y) en pantalla (client coords)
function spawnCoin(clientX, clientY, w, h) {
    const pantalla = document.getElementById('pantalla');
    if (!pantalla) return;

    // Crear elemento img para la moneda
    const img = document.createElement('img');
    img.src = 'img/moneda.png';
    img.style.position = 'absolute';
    // convertir client coords a coordenadas relativas al contenedor pantalla
    const pantallaRect = pantalla.getBoundingClientRect();
    const left = clientX - pantallaRect.left;
    const top = clientY - pantallaRect.top;

    // colocar la moneda encima de la caja
    img.style.left = left + 'px';
    img.style.top = (top - 8) + 'px';
    img.style.width = (w || 28) + 'px';
    img.style.height = (h || 32) + 'px';
    img.style.zIndex = 5;

    pantalla.appendChild(img);

    // Animación sencilla: subir y desaparecer
    img.animate([
        { transform: 'translateY(0px)', opacity: 1 },
        { transform: 'translateY(-30px)', opacity: 0 }
    ], {
        duration: 700,
        easing: 'ease-out'
    });

    // Eliminar tras la animación
    setTimeout(() => img.remove(), 750);
}



