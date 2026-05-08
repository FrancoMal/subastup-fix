// GET /help/faq
// FAQ estático — si querés podés migrar esto a la BD en el futuro
const FAQ = [
  { id: 1, question: '¿Cómo funciona una subasta?', answer: 'Cada subasta tiene un precio inicial y un tiempo límite. Los usuarios realizan pujas que deben superar la puja actual. Al finalizar el tiempo, gana quien tenga la puja más alta.' },
  { id: 2, question: '¿Cómo publico un artículo para subastar?', answer: 'Desde la pantalla principal tocá el botón "+", completá los datos del artículo, subí las fotos y definí el precio inicial y las fechas. Tu publicación quedará en estado Pendiente hasta que la confirmes.' },
  { id: 3, question: '¿Puedo cancelar una puja?', answer: 'No, una vez realizada una puja no puede cancelarse. Asegurate de confirmar el monto antes de pujar.' },
  { id: 4, question: '¿Qué monedas se aceptan?', answer: 'Aceptamos pesos argentinos (ARS) y dólares estadounidenses (USD). Podés configurar tu moneda preferida en Ajustes.' },
  { id: 5, question: '¿Cómo contacto al vendedor?', answer: 'Desde el detalle de la subasta podés iniciar un chat directamente con el vendedor para hacer preguntas sobre el artículo.' },
  { id: 6, question: '¿Es seguro compartir mis datos?', answer: 'Tus datos están protegidos. Solo compartimos la información necesaria para concretar la operación entre comprador y vendedor.' },
];

const getFaq = (req, res) => {
  res.json(FAQ);
};

module.exports = { getFaq };
