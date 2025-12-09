// Inicializar EmailJS con tu User ID
emailjs.init("GDiZTwrCjV1aq9Bxj");

// Manejar el envío del formulario
document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const statusDiv = document.getElementById("status");
    const sendBtn = document.querySelector(".button-send");

    // Mostrar estado de carga
    statusDiv.className = "status-loading";
    statusDiv.textContent = "⏳ Enviando mensaje...";
    statusDiv.style.display = "block";
    sendBtn.classList.add("loading");
    sendBtn.disabled = true;
    sendBtn.textContent = "Enviando...";

    // Preparar parámetros para el template
    const params = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value
    };

    // Enviar email usando EmailJS
    emailjs.send("service_xt7fs7w", "template_xmrrv6l", params)
        .then(() => {
            // Éxito
            statusDiv.className = "status-success";
            statusDiv.textContent = "✔️ ¡Mensaje enviado correctamente! Te responderemos pronto.";
            
            // Limpiar el formulario
            document.getElementById("contactForm").reset();
            
            // Scroll suave al mensaje de éxito
            statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        })
        .catch((error) => {
            // Error
            console.error("Error al enviar:", error);
            statusDiv.className = "status-error";
            statusDiv.textContent = "❌ Error al enviar el mensaje. Por favor, inténtalo nuevamente.";
        })
        .finally(() => {
            // Restaurar botón
            sendBtn.classList.remove("loading");
            sendBtn.disabled = false;
            sendBtn.textContent = "Enviar Mensaje";
            
            // Ocultar mensaje después de 6 segundos
            setTimeout(() => {
                statusDiv.style.display = "none";
                statusDiv.className = "";
            }, 6000);
        });
});

// Validación en tiempo real para el email
document.getElementById("email").addEventListener("blur", function() {
    const email = this.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        this.style.borderColor = "#dc3545";
    } else {
        this.style.borderColor = "#ddd";
    }
});

// Validación en tiempo real para el teléfono
document.getElementById("phone").addEventListener("input", function() {
    // Permitir solo números, espacios, guiones y paréntesis
    this.value = this.value.replace(/[^\d\s\-\(\)\+]/g, '');
});

// Contador de caracteres para el textarea
const messageTextarea = document.getElementById("message");
const maxLength = 500;

messageTextarea.addEventListener("input", function() {
    const currentLength = this.value.length;
    
    if (currentLength > maxLength) {
        this.value = this.value.substring(0, maxLength);
    }
});