/* Configuración del sitio. Editar acá los datos de la empresa. */
window.AW = window.AW || {};

window.AW.config = {
  company: {
    name: "Autopiezas Warnes",
    since: 1965,
    address: "Av. Warnes 1151, CABA, Buenos Aires",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Warnes+1151,+CABA",
    hours: "Lunes a viernes de 8:30 a 18:00",
    email: "autopiezas@autopiezaswarnes.com.ar",
    // PENDIENTE DE CONFIRMAR: se encontraron dos teléfonos distintos en fuentes públicas.
    phone: "(011) 3989-6816",
    phoneHref: "tel:+541139896816"
  },

  /* Número de WhatsApp para pedidos, en formato internacional SIN "+" ni espacios.
     Ejemplo: "5491112345678". PENDIENTE: la empresa debe indicar el número.
     Mientras esté vacío, WhatsApp se abre con el mensaje listo y el usuario elige el contacto. */
  whatsappNumber: "",

  maxResults: 20,

  /* Zonas y aplicaciones reales del catálogo actual (categorías de Warnes). */
  zones: [
    { key: "motor", label: "Motor", hint: "Distribución, bancada, árbol de levas, válvulas" },
    { key: "transmision", label: "Caja y transmisión", hint: "Caja de cambios, semiejes, diferencial" },
    { key: "ruedas", label: "Ruedas", hint: "Maza de rueda delantera o trasera" }
  ],

  applications: {
    "distribucion": { zone: "motor", label: "Distribución",
      explanation: "Retenes de la zona de distribución del motor, donde van la correa o cadena de distribución." },
    "bancada": { zone: "motor", label: "Bancada",
      explanation: "Retén trasero del cigüeñal, del lado de la caja de cambios y el embrague." },
    "arbol-de-levas": { zone: "motor", label: "Árbol de levas",
      explanation: "Retén en el extremo del árbol de levas, en la parte superior del motor." },
    "guia-de-valvulas": { zone: "motor", label: "Guía de válvulas",
      explanation: "Retenes chicos que van sobre cada válvula, en la tapa de cilindros." },
    "caja-de-velocidad": { zone: "transmision", label: "Caja de velocidad",
      explanation: "Retenes de la caja de cambios: ejes de entrada, salida y semiejes." },
    "caja-de-transferencia": { zone: "transmision", label: "Caja de transferencia",
      explanation: "En vehículos 4x4, la caja que reparte la tracción entre los ejes." },
    "semieje": { zone: "transmision", label: "Semieje",
      explanation: "Donde el semieje sale hacia la rueda." },
    "pinon": { zone: "transmision", label: "Piñón de diferencial",
      explanation: "Retén del piñón del diferencial, donde entra el cardán." },
    "rueda-delantera": { zone: "ruedas", label: "Rueda delantera",
      explanation: "Retén de la maza de la rueda delantera." },
    "rueda-trasera": { zone: "ruedas", label: "Rueda trasera",
      explanation: "Retén de la maza de la rueda trasera." }
  }
};
