// @TASK: Datos idempotentes para una demostración completa de SubastUP.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const zlib = require('zlib');

const prisma = new PrismaClient();

const usuariosDemo = [
  { email: 'demo1@subastup.com', password: 'Demo1234', documento: '41000001', nombre: 'Lucía Demo', telefono: '1111111111', direccion: 'Av. Demo 101', categoria: 'comun' },
  { email: 'demo2@subastup.com', password: 'Demo1234', documento: '41000002', nombre: 'Mateo Demo', telefono: '1111111112', direccion: 'Av. Demo 102', categoria: 'especial' },
  { email: 'demo3@subastup.com', password: 'Demo1234', documento: '41000003', nombre: 'Sofía Demo', telefono: '1111111113', direccion: 'Av. Demo 103', categoria: 'oro' },
  { email: 'demo4@subastup.com', password: 'Demo1234', documento: '41000004', nombre: 'Tomás Demo', telefono: '1111111114', direccion: 'Av. Demo 104', categoria: 'plata' },
];

const productosDemo = [
  { nombre: 'Reloj Omega vintage demo', categoria: 'comun', precioBase: 120000, duenio: 0, ubicacion: 'Demo SubastUP - Sala Común', descripcion: 'Reloj vintage en excelente estado, con estuche.', moneda: 'ARS' },
  { nombre: 'Guitarra Gibson demo', categoria: 'especial', precioBase: 850000, duenio: 1, ubicacion: 'Demo SubastUP - Sala Especial', descripcion: 'Guitarra eléctrica de colección.', moneda: 'ARS' },
  { nombre: 'Moneda de oro demo', categoria: 'oro', precioBase: 1500, duenio: 2, ubicacion: 'Demo SubastUP - Sala Oro', descripcion: 'Moneda de oro para subasta especializada.', moneda: 'USD' },
  { nombre: 'Cámara Leica demo', categoria: 'plata', precioBase: 420000, duenio: 3, ubicacion: 'Demo SubastUP - Sala Plata', descripcion: 'Cámara analógica lista para colección.', moneda: 'ARS' },
  { nombre: 'Radio antigua programada demo', categoria: 'comun', precioBase: 90000, duenio: 0, ubicacion: 'Demo SubastUP - Sala Programada', descripcion: 'Radio antigua cargada para probar subasta próximamente.', moneda: 'ARS', estado: 'programada' },
];

const resumen = { usuarios: 0, metodosPago: 0, subastas: 0, productos: 0, items: 0, pujas: 0 };

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunkPng(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function pngDemo([r, g, b]) {
  const width = 600;
  const height = 420;
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const idx = row + 1 + x * 3;
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunkPng('IHDR', ihdr),
    chunkPng('IDAT', zlib.deflateSync(raw)),
    chunkPng('IEND', Buffer.alloc(0)),
  ]);
}

// @TASK: Calcula fechas de la próxima semana sin depender de una fecha fija.
const proximoDia = (offset) => {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  const diasHastaLunes = ((8 - fecha.getDay()) % 7) || 7;
  fecha.setDate(fecha.getDate() + diasHastaLunes + offset);
  return fecha;
};

// @TASK: Crea el empleado técnico que verifica usuarios y administra catálogos.
async function asegurarEquipoDemo() {
  let persona = await prisma.personas.findFirst({ where: { documento: '90000000' } });
  if (!persona) {
    persona = await prisma.personas.create({
      data: { documento: '90000000', nombre: 'Equipo Demo SubastUP', direccion: 'Sede Demo', estado: 'activo' },
    });
  }

  let empleado = await prisma.empleados.findUnique({ where: { identificador: persona.identificador } });
  if (!empleado) {
    empleado = await prisma.empleados.create({
      data: { identificador: persona.identificador, cargo: 'Revisor técnico del sistema' },
    });
  }

  let subastador = await prisma.subastadores.findUnique({ where: { identificador: persona.identificador } });
  if (!subastador) {
    subastador = await prisma.subastadores.create({
      data: { identificador: persona.identificador, matricula: 'DEMO-001', region: 'Demo' },
    });
  }

  return { empleadoId: empleado.identificador, subastadorId: subastador.identificador };
}

// @TASK: Crea o recupera un usuario demo y sus roles de cliente y dueño.
async function asegurarUsuario(demo, verificadorId, indice) {
  let registro = await prisma.registros.findFirst({ where: { email: demo.email } });

  if (!registro) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(demo.password, salt);
    const persona = await prisma.personas.create({
      data: {
        documento: demo.documento,
        nombre: demo.nombre,
        direccion: demo.direccion,
        estado: 'activo',
      },
    });

    registro = await prisma.registros.create({
      data: {
        persona: persona.identificador,
        email: demo.email,
        telefono: demo.telefono,
        estado: 'aprobado',
        rol: 'usuario',
        categoria: demo.categoria,
      },
    });

    await prisma.perfilesContacto.create({ data: { persona: persona.identificador, telefono: demo.telefono } });

    await prisma.logins.create({
      data: { registro: registro.identificador, passwordHash, salt, intentosFallidos: 0, bloqueado: false },
    });
    resumen.usuarios += 1;
  }

  const personaId = registro.persona;
  const cliente = await prisma.clientes.findUnique({ where: { identificador: personaId } });
  if (!cliente) {
    await prisma.clientes.create({
      data: { identificador: personaId, admitido: 'si', categoria: demo.categoria, verificador: verificadorId },
    });
  }

  const duenio = await prisma.duenios.findUnique({ where: { identificador: personaId } });
  if (!duenio) {
    await prisma.duenios.create({
      data: { identificador: personaId, verificacionFinanciera: 'si', verificacionJudicial: 'si', calificacionRiesgo: 1, verificador: verificadorId },
    });
  }

  const tarjetaExistente = await prisma.metodosPago.findFirst({
    where: { persona: personaId, tipo: 'tarjeta', activo: true },
  });
  if (!tarjetaExistente) {
    const metodo = await prisma.metodosPago.create({
      data: { persona: personaId, tipo: 'tarjeta', activo: true, verificado: true },
    });
    await prisma.tarjetas.create({
      data: {
        identificador: metodo.identificador,
        titular: demo.nombre,
        numeroTarjeta: `41111111111111${String(indice + 1).padStart(2, '0')}`,
        mesVencimiento: '12',
        anioVencimiento: '2030',
        codigoSeguridad: '123',
        direccion: demo.direccion,
        codigoPostal: '1000',
        pais: 'Argentina',
        localidad: 'Buenos Aires',
      },
    });
    resumen.metodosPago += 1;
  }

  return personaId;
}

// @TASK: Crea o recupera una subasta, su catálogo, producto e ítem disponible.
async function asegurarProductoDemo(config, indice, duenios, equipo) {
  const fechaSubasta = proximoDia(indice);
  const estadoSubasta = config.estado || 'abierta';
  let subasta = await prisma.subastas.findFirst({ where: { ubicacion: config.ubicacion } });
  if (!subasta) {
    subasta = await prisma.subastas.create({
      data: {
        fecha: fechaSubasta,
        hora: new Date('1970-01-01T15:00:00.000Z'),
        estado: estadoSubasta,
        subastador: equipo.subastadorId,
        ubicacion: config.ubicacion,
        capacidadAsistentes: 100,
        tieneDeposito: 'si',
        seguridadPropia: 'si',
        categoria: config.categoria,
      },
    });
    resumen.subastas += 1;
  } else if (subasta.estado !== estadoSubasta) {
    await prisma.subastas.update({
      where: { identificador: subasta.identificador },
      data: { estado: estadoSubasta },
    });
  }

  const descripcionCatalogo = `Catálogo demo ${config.categoria}`;
  let catalogo = await prisma.catalogos.findFirst({ where: { descripcion: descripcionCatalogo, subasta: subasta.identificador } });
  if (!catalogo) {
    catalogo = await prisma.catalogos.create({
      data: { descripcion: descripcionCatalogo, subasta: subasta.identificador, responsable: equipo.empleadoId },
    });
  }

  let detalleExistente = await prisma.productosDetalle.findFirst({ where: { nombre: config.nombre } });
  let producto = detalleExistente
    ? await prisma.productos.findFirst({ where: { identificador: detalleExistente.producto } })
    : null;
  if (!producto) {
    producto = await prisma.productos.create({
      data: {
        fecha: new Date(),
        disponible: 'si',
        descripcionCatalogo: config.descripcion,
        descripcionCompleta: config.descripcion,
        revisor: equipo.empleadoId,
        duenio: duenios[config.duenio],
      },
    });
    await prisma.productosDetalle.create({
      data: {
        producto: producto.identificador,
        nombre: config.nombre,
        estado: 'aprobado',
        revisor: equipo.empleadoId,
        direccionEnvio: 'Depósito Demo SubastUP',
      },
    });
    resumen.productos += 1;
  }

  const fotosExistentes = await prisma.fotos.count({ where: { producto: producto.identificador } });
  if (fotosExistentes === 0) {
    const colores = [
      [139, 0, 0],
      [162, 59, 0],
      [47, 72, 88],
    ];
    await prisma.fotos.createMany({
      data: colores.map((color) => ({ producto: producto.identificador, foto: pngDemo(color) })),
    });
  }

  let item = await prisma.itemsCatalogo.findFirst({ where: { producto: producto.identificador } });
  if (!item) {
    item = await prisma.itemsCatalogo.create({
      data: {
        catalogo: catalogo.identificador,
        producto: producto.identificador,
        precioBase: config.precioBase,
        comision: Math.round(config.precioBase * 0.1),
        subastado: 'no',
      },
    });
    await prisma.itemsCatalogoDetalle.create({ data: { item: item.identificador, moneda: config.moneda, fechaSubasta, horaSubasta: '15:00', lugarSubasta: config.ubicacion, aceptadoPorDuenio: true, cerrado: false } });
    resumen.items += 1;
  } else {
    await prisma.itemsCatalogo.update({
      where: { identificador: item.identificador },
      data:  { subastado: 'no' },
    });
    await prisma.itemsCatalogoDetalle.upsert({
      where:  { item: item.identificador },
      create: { item: item.identificador, moneda: config.moneda, fechaSubasta, horaSubasta: '15:00', lugarSubasta: config.ubicacion, aceptadoPorDuenio: true, cerrado: false },
      update: { moneda: config.moneda, fechaSubasta, horaSubasta: '15:00', lugarSubasta: config.ubicacion, aceptadoPorDuenio: true, cerrado: false, ultimaPuja: null },
    });
  }

  return { subastaId: subasta.identificador, itemId: item.identificador };
}

// @TASK: Crea asistentes y pujas de ejemplo para dos artículos de la demo.
async function asegurarPuja(asistente, itemId, importe, ganador) {
  let puja = await prisma.pujos.findFirst({ where: { asistente, item: itemId, importe } });
  if (!puja) {
    puja = await prisma.pujos.create({ data: { asistente, item: itemId, importe, ganador } });
    resumen.pujas += 1;
  }
  await prisma.pujosDetalle.upsert({
    where:  { puja: puja.identificador },
    create: { puja: puja.identificador },
    update: {},
  });
}

// @TASK: Asegura que un usuario pueda participar en una subasta demo.
async function asegurarAsistente(cliente, subasta, numeroPostor) {
  let asistente = await prisma.asistentes.findFirst({ where: { cliente, subasta } });
  if (!asistente) {
    asistente = await prisma.asistentes.create({ data: { numeroPostor, cliente, subasta } });
  }
  return asistente;
}

// @TASK: Ejecuta la preparación idempotente de usuarios, subastas, ítems y pujas.
async function main() {
  const equipo = await asegurarEquipoDemo();
  const personasDemo = [];

  for (const [indice, demo] of usuariosDemo.entries()) {
    personasDemo.push(await asegurarUsuario(demo, equipo.empleadoId, indice));
  }

  const subastas = [];
  for (const [indice, producto] of productosDemo.entries()) {
    subastas.push(await asegurarProductoDemo(producto, indice, personasDemo, equipo));
  }

  const asistentes = [];
  for (const [indice, personaId] of personasDemo.entries()) {
    const subastaId = subastas[indice % subastas.length].subastaId;
    let asistente = await prisma.asistentes.findFirst({ where: { cliente: personaId, subasta: subastaId } });
    if (!asistente) {
      asistente = await prisma.asistentes.create({ data: { numeroPostor: indice + 1, cliente: personaId, subasta: subastaId } });
    }
    asistentes.push(asistente);
  }

  const asistenteItemUno = asistentes[0];
  let segundoAsistente = await prisma.asistentes.findFirst({ where: { cliente: personasDemo[1], subasta: subastas[0].subastaId } });
  if (!segundoAsistente) {
    segundoAsistente = await prisma.asistentes.create({ data: { numeroPostor: 20, cliente: personasDemo[1], subasta: subastas[0].subastaId } });
  }
  await asegurarPuja(asistenteItemUno.identificador, subastas[0].itemId, 130000, 'no');
  await asegurarPuja(segundoAsistente.identificador, subastas[0].itemId, 145000, 'si');

  let asistenteItemDos = await prisma.asistentes.findFirst({ where: { cliente: personasDemo[2], subasta: subastas[1].subastaId } });
  if (!asistenteItemDos) {
    asistenteItemDos = await prisma.asistentes.create({ data: { numeroPostor: 30, cliente: personasDemo[2], subasta: subastas[1].subastaId } });
  }
  let cuartoAsistente = await prisma.asistentes.findFirst({ where: { cliente: personasDemo[3], subasta: subastas[1].subastaId } });
  if (!cuartoAsistente) {
    cuartoAsistente = await prisma.asistentes.create({ data: { numeroPostor: 40, cliente: personasDemo[3], subasta: subastas[1].subastaId } });
  }
  await asegurarPuja(asistenteItemDos.identificador, subastas[1].itemId, 900000, 'no');
  await asegurarPuja(cuartoAsistente.identificador, subastas[1].itemId, 950000, 'si');

  const asistenteOroUno = await asegurarAsistente(personasDemo[1], subastas[2].subastaId, 50);
  const asistenteOroDos = await asegurarAsistente(personasDemo[2], subastas[2].subastaId, 60);
  await asegurarPuja(asistenteOroUno.identificador, subastas[2].itemId, 1600, 'no');
  await asegurarPuja(asistenteOroDos.identificador, subastas[2].itemId, 1750, 'si');

  const asistentePlataUno = await asegurarAsistente(personasDemo[2], subastas[3].subastaId, 70);
  const asistentePlataDos = await asegurarAsistente(personasDemo[3], subastas[3].subastaId, 80);
  await asegurarPuja(asistentePlataUno.identificador, subastas[3].itemId, 450000, 'no');
  await asegurarPuja(asistentePlataDos.identificador, subastas[3].itemId, 480000, 'si');

  console.log('Resumen demo creado o reutilizado:');
  console.log(`Usuarios nuevos: ${resumen.usuarios}`);
  console.log(`Métodos de pago nuevos: ${resumen.metodosPago}`);
  console.log(`Subastas nuevas: ${resumen.subastas}`);
  console.log(`Productos nuevos: ${resumen.productos}`);
  console.log(`Ítems nuevos: ${resumen.items}`);
  console.log(`Pujas nuevas: ${resumen.pujas}`);
  console.log('Credenciales demo: demo1@subastup.com a demo4@subastup.com / Demo1234');
}

main()
  .catch((error) => {
    console.error('Error al crear datos demo:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
