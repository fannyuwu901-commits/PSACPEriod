const API_KEY = "924f39106906a6a63501e7ee6cfc1b69";

// 📅 FECHA
function mostrarFecha() {
    const ahora = new Date();
    const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let fecha = ahora.toLocaleDateString('es-ES', opciones);
    fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    document.getElementById("fechaActual").textContent = fecha;
}

// 🌤️ CLIMA
function obtenerClima() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${API_KEY}`)
            .then(r => r.json())
            .then(data => {
                document.getElementById("ciudad").textContent = data.name;
                document.getElementById("temperatura").textContent = Math.round(data.main.temp) + " °C";
                document.getElementById("descripcion").textContent = data.weather[0].description;
            });
    });
}

mostrarFecha();
obtenerClima();