const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const RUTA_JS = path.join(__dirname, '../js');

const archivosCategorias = {
  "Linea Blanca": "lineaBlanca.js",
  "Cocinas": "cocinas.js",
  "Colchoneria": "colchoneria.js",
  "Comedores": "comedores.js",
  "Tubulares": "tubulares.js",
  "Salas": "salas.js",
  "Recamaras": "recamaras.js",
  "Closet": "closet.js",
  "Deportivos": "deportivos.js",
  "Descanso": "descanso.js",
  "Hogar": "hogar.js",
  "Ropa y Calzado": "ropaycalzado.js"
};

// PANEL ADMIN PRINCIPAL
app.get('/admin', (req, res) => {
  let seccionesHtml = '';

  Object.keys(archivosCategorias).forEach((cat, index) => {
    const archivo = archivosCategorias[cat];
    const rutaArchivo = path.join(RUTA_JS, archivo);
    let filasProductos = '';

    if (fs.existsSync(rutaArchivo)) {
      const contenido = fs.readFileSync(rutaArchivo, 'utf8');
      const bloques = [...contenido.matchAll(/\{\s*([\s\S]*?)\s*\}/g)];

      bloques.forEach(b => {
        const textoObjeto = b[1];
        
        const matchId = textoObjeto.match(/id:\s*(\d+)/);
        const matchTitulo = textoObjeto.match(/titulo:\s*"([^"]*)"/);
        const matchSubcat = textoObjeto.match(/subcategoria:\s*"([^"]*)"/);
        const matchEstado = textoObjeto.match(/estado:\s*"([^"]*)"/);
        const matchDesc = textoObjeto.match(/descripcion:\s*"([\s\S]*?)"/);
        const matchImg = textoObjeto.match(/"([^"]+\/\d+\.jpg)"/);

        if (matchId && matchTitulo) {
          const id = matchId[1];
          const titulo = matchTitulo[1];
          const subcategoria = matchSubcat ? matchSubcat[1] : '';
          const estado = matchEstado ? matchEstado[1] : 'disponible';
          const descripcionCruda = matchDesc ? matchDesc[1].replace(/\\n/g, '\n').replace(/"/g, '&quot;') : '';
          
          let rutaCarpetaSugerida = "";
          if (matchImg) {
            rutaCarpetaSugerida = matchImg[1].replace(/\d+\.jpg$/, '');
          }

          filasProductos += `
            <tr>
              <td><b>${id}</b></td>
              <td>${titulo}</td>
              <td>${subcategoria || '<span style="color:#aaa;">(Sin subcategoría)</span>'}</td>
              <td><span class="badge ${estado}">${estado}</span></td>
              <td>
                <button type="button" class="btn-editar" onclick="cargarParaEditar('${id}', '${cat.replace(/'/g, "\\'")}', '${subcategoria.replace(/'/g, "\\'")}', '${titulo.replace(/'/g, "\\'")}', '${estado}', \`${descripcionCruda.replace(/`/g, '\\`')}\`, '${rutaCarpetaSugerida}')">Editar</button>
                
                <form action="/eliminar" method="POST" style="display:inline; margin-left:5px;">
                  <input type="hidden" name="categoria" value="${cat}">
                  <input type="hidden" name="id" value="${id}">
                  <button type="submit" class="btn-eliminar" onclick="return confirm('¿Seguro que deseas eliminar este producto?')">Eliminar</button>
                </form>
              </td>
            </tr>
          `;
        }
      });
    }

    // Identificador limpio para clases CSS y IDs de pestañas
    const catId = cat.replace(/\s+/g, '');
    const claseActiva = index === 0 ? 'active' : '';
    const estiloDisplay = index === 0 ? 'block' : 'none';

    seccionesHtml += `
      <div id="seccion-${catId}" class="categoria-seccion" style="display: ${estiloDisplay};">
        <h3>📂 Categoría seleccionada: ${cat}</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 70px;">ID</th>
              <th>Título del Producto</th>
              <th>Subcategoría</th>
              <th style="width: 100px;">Estado</th>
              <th style="width: 160px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filasProductos || '<tr><td colspan="5" style="text-align:center; color:#777;">No hay productos en esta categoría.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  });

  // Generar botones interactivos del menú superior
  let botonesMenuHtml = '';
  Object.keys(archivosCategorias).forEach((cat, index) => {
    const catId = cat.replace(/\s+/g, '');
    const claseActiva = index === 0 ? 'btn-cat-activo' : '';
    botonesMenuHtml += `<button type="button" class="btn-categoria ${claseActiva}" onclick="mostrarCategoria('${catId}', this)">${cat}</button>`;
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Panel Admin - Muebleria Daguerr</title>
      <style>
        body { font-family: 'Poppins', sans-serif; background: #fcfaf8; color: #2c2c2c; padding: 20px; max-width: 1100px; margin: 0 auto; }
        h1, h2, h3 { color: #c2290a; }
        h1 { text-align: center; margin-bottom: 25px; }
        .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 25px; }
        .form-grupo { margin-bottom: 15px; }
        label { display: block; font-weight: 600; margin-bottom: 5px; }
        input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-family: inherit; box-sizing: border-box; }
        textarea { height: 90px; }
        button { background-color: #c2290a; color: white; border: none; padding: 12px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%; }
        button:hover { background-color: #a52208; }
        .btn-editar { background-color: #f0ad4e; padding: 6px 12px; width: auto; font-size: 0.85rem; color: white; }
        .btn-editar:hover { background-color: #ec971f; }
        .btn-eliminar { background-color: #d9534f; padding: 6px 12px; width: auto; font-size: 0.85rem; }
        .btn-eliminar:hover { background-color: #c9302c; }
        .btn-cancelar { background-color: #6c757d; margin-top: 8px; display: none; }
        .btn-cancelar:hover { background-color: #5a6268; }
        .checkbox-grupo { display: flex; align-items: center; gap: 10px; background: #f4f0ec; padding: 10px; border-radius: 6px; }
        .checkbox-grupo input { width: 20px; height: 20px; cursor: pointer; }
        
        /* Estilos del Menú Interactivo de Categorías */
        .menu-categorias { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .btn-categoria { background-color: #e6e0da; color: #444; width: auto; padding: 10px 15px; font-size: 0.9rem; border-radius: 20px; transition: all 0.2s; }
        .btn-categoria:hover { background-color: #d4cdc6; color: #000; }
        .btn-categoria.btn-cat-activo { background-color: #c2290a; color: white; }

        .categoria-seccion { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 0.9rem; }
        th { background: #f4f0ec; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; color: white; text-transform: uppercase; }
        .badge.disponible { background-color: #5cb85c; }
        .badge.pedido { background-color: #f0ad4e; }
        .badge.agotado { background-color: #d9534f; }
      </style>
    </head>
    <body>
      <h1>Panel de Control - Muebleria Daguerr</h1>
      
      <div class="card">
        <h2 id="form-titulo">Agregar Nuevo Producto</h2>
        <form action="/guardar" method="POST">
          <input type="hidden" name="editandoId" id="editandoId" value="">

          <div class="form-grupo">
            <label>Categoría:</label>
            <select name="categoria" id="cat-select" onchange="cambiarCategoria()">
              <option value="Linea Blanca">Linea Blanca</option>
              <option value="Cocinas">Cocinas</option>
              <option value="Colchoneria">Colchoneria</option>
              <option value="Comedores">Comedores</option>
              <option value="Tubulares">Tubulares</option>
              <option value="Salas">Salas</option>
              <option value="Recamaras">Recamaras</option>
              <option value="Closet">Closet</option>
              <option value="Deportivos">Deportivos</option>
              <option value="Descanso">Descanso</option>
              <option value="Hogar">Hogar</option>
              <option value="Ropa y Calzado">Ropa y Calzado</option>
            </select>
          </div>

          <div class="form-grupo">
            <label>Subcategoría:</label>
            <select name="subcategoria" id="subcat-select">
              <!-- Dinámico según la categoría -->
            </select>
          </div>

          <div class="form-grupo">
            <label>Título del Producto:</label>
            <input type="text" name="titulo" id="input-titulo" required placeholder="Ej. Artículo o Mueble">
          </div>

          <div class="form-grupo">
            <label>Estado:</label>
            <select name="estado" id="select-estado">
              <option value="disponible">disponible</option>
              <option value="pedido">pedido</option>
              <option value="agotado">agotado</option>
            </select>
          </div>

          <div class="form-grupo">
            <label>Características / Descripción:</label>
            <textarea name="descripcion" id="input-desc" placeholder="Escribe aquí las características..."></textarea>
          </div>

          <div class="form-grupo">
            <div class="checkbox-grupo">
              <input type="checkbox" name="conPuntos" id="conPuntos" checked>
              <label for="conPuntos" style="margin-bottom:0; cursor:pointer;">Formatear cada renglón con puntos automáticos (•)</label>
            </div>
          </div>

          <div class="form-grupo">
            <label>Ruta de la carpeta de imágenes:</label>
            <input type="text" name="rutaCarpeta" id="input-ruta" value="Imagenes/LineaBlanca/Refrigeradores/NombreCarpeta/">
          </div>

          <div class="form-grupo">
            <label>¿Cuántas imágenes tendrá?</label>
            <input type="number" name="cantidadImg" id="input-cant-img" value="4" min="1" max="20">
          </div>

          <button type="submit" id="btn-submit-text">Guardar Nuevo Producto</button>
          <button type="button" id="btn-cancelar" class="btn-cancelar" onclick="cancelarEdicion()">Cancelar Edición</button>
        </form>
      </div>

      <h2>Inventario por Categoría</h2>
      
      <!-- Menú Interactivo de Botones -->
      <div class="menu-categorias">
        ${botonesMenuHtml}
      </div>

      <!-- Tablas de Secciones -->
      ${seccionesHtml}

      <script>
        const subcategoriasPorCategoria = {
          "Linea Blanca": ["Refrigeradores", "Estufas", "Lavadoras", "Boilers", "Abanicos/AC"],
          "Cocinas": [""],
          "Colchoneria": [""],
          "Comedores": [""],
          "Tubulares": [""],
          "Salas": [""],
          "Recamaras": [""],
          "Closet": [""],
          "Deportivos": [""],
          "Descanso": [""],
          "Hogar": [""],
          "Ropa y Calzado": [""]
        };

        function mostrarCategoria(catId, btnElement) {
          // Ocultar todas las secciones de categorías
          const secciones = document.querySelectorAll('.categoria-seccion');
          secciones.forEach(sec => sec.style.display = 'none');

          // Mostrar únicamente la seleccionada
          document.getElementById('seccion-' + catId).style.display = 'block';

          // Cambiar estilos activos de los botones del menú
          const botones = document.querySelectorAll('.btn-categoria');
          botones.forEach(b => b.classList.remove('btn-cat-activo'));
          btnElement.classList.add('btn-cat-activo');
        }

        function actualizarSubcategorias(categoriaSeleccionada, subcatSeleccionada = "") {
          const selectSub = document.getElementById('subcat-select');
          selectSub.innerHTML = "";
          
          const lista = subcategoriasPorCategoria[categoriaSeleccionada] || [""];
          
          lista.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.innerText = sub === "" ? "(Sin subcategoría)" : sub;
            if(sub === subcatSeleccionada) {
              opt.selected = true;
            }
            selectSub.appendChild(opt);
          });
        }

        function actualizarSugerenciaRuta() {
          const cat = document.getElementById('cat-select').value;
          const limpia = cat.replace(/\\s+/g, '');
          document.getElementById('input-ruta').value = \`Imagenes/\${limpia}/CarpetaProducto/\`;
        }

        function cambiarCategoria() {
          const cat = document.getElementById('cat-select').value;
          actualizarSubcategorias(cat);
          actualizarSugerenciaRuta();
        }

        window.onload = function() {
          actualizarSubcategorias("Linea Blanca");
        };

        function cargarParaEditar(id, categoria, subcategoria, titulo, estado, descripcion, rutaCarpeta) {
          document.getElementById('editandoId').value = id;
          document.getElementById('cat-select').value = categoria;
          
          actualizarSubcategorias(categoria, subcategoria);
          
          document.getElementById('input-titulo').value = titulo;
          document.getElementById('select-estado').value = estado;
          document.getElementById('input-desc').value = descripcion.replace(/• /g, ''); 
          if(rutaCarpeta) document.getElementById('input-ruta').value = rutaCarpeta;
          
          document.getElementById('form-titulo').innerText = "Editando Producto (ID: " + id + ")";
          document.getElementById('btn-submit-text').innerText = "Actualizar Cambios del Producto";
          document.getElementById('btn-cancelar').style.display = "block";
          
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function cancelarEdicion() {
          document.getElementById('editandoId').value = "";
          document.getElementById('cat-select').value = "Linea Blanca";
          actualizarSubcategorias("Linea Blanca");
          document.getElementById('input-titulo').value = "";
          document.getElementById('select-estado').value = "disponible";
          document.getElementById('input-desc').value = "";
          actualizarSugerenciaRuta();

          document.getElementById('form-titulo').innerText = "Agregar Nuevo Producto";
          document.getElementById('btn-submit-text').innerText = "Guardar Nuevo Producto";
          document.getElementById('btn-cancelar').style.display = "none";
        }
      </script>
    </body>
    </html>
  `);
});

// GUARDAR O ACTUALIZAR PRODUCTO
app.post('/guardar', (req, res) => {
  const { editandoId, categoria, subcategoria, titulo, estado, descripcion, conPuntos, rutaCarpeta, cantidadImg } = req.body;
  const nombreArchivoJs = archivosCategorias[categoria];
  
  if (!nombreArchivoJs) return res.send("Categoría no válida.");
  const rutaCompletaArchivo = path.join(RUTA_JS, nombreArchivoJs);

  fs.readFile(rutaCompletaArchivo, 'utf8', (err, data) => {
    let contenidoActual = data || "const productos = [];";
    
    if (editandoId) {
      const regexViejo = new RegExp(`\\s*\\{\\s*id:\\s*${editandoId},[\\s\\S]*?\\n\\s*\\},?`, 'g');
      contenidoActual = contenidoActual.replace(regexViejo, '');
    }

    let idFinal = editandoId;
    if (!idFinal) {
      const idsEncontrados = [...contenidoActual.matchAll(/id:\s*(\d+)/g)].map(m => parseInt(m[1]));
      idFinal = idsEncontrados.length > 0 ? Math.max(...idsEncontrados) + 1 : 1000;
    }

    const lineas = descripcion.split('\n').filter(l => l.trim() !== '');
    let descripcionFormateada = "";

    if (conPuntos) {
      descripcionFormateada = lineas.map(l => `• ${l.trim()}`).join('\\n');
    } else {
      descripcionFormateada = lineas.join('\\n');
    }

    let imagenesJs = [];
    for (let i = 1; i <= parseInt(cantidadImg); i++) {
      imagenesJs.push(`      "${rutaCarpeta}${i}.jpg"`);
    }

    const subcatValor = subcategoria ? subcategoria : "";

    const nuevoProductoString = `  {
    id: ${idFinal},
    titulo: "${titulo}",
    categoria: "${categoria}",
    subcategoria: "${subcatValor}",
    estado: "${estado}",
    descripcion: "${descripcionFormateada}",
    oculto: false, 
    imagenes: [
${imagenesJs.join(',\n')}
    ]
  },`;

    let nuevoContenido = "";
    if (contenidoActual.includes('];')) {
      const ultimoIndice = contenidoActual.lastIndexOf('];');
      nuevoContenido = contenidoActual.substring(0, ultimoIndice) + "\n" + nuevoProductoString + "\n" + contenidoActual.substring(ultimoIndice);
    } else {
      nuevoContenido = contenidoActual + "\n" + nuevoProductoString;
    }

    fs.writeFile(rutaCompletaArchivo, nuevoContenido, 'utf8', (err) => {
      if (err) return res.send("Error al guardar: " + err.message);
      res.send(`<h2>¡Producto ${editandoId ? 'actualizado' : 'guardado'} con éxito! (ID: ${idFinal})</h2><br><a href="/admin">Regresar al Panel</a>`);
    });
  });
});

// ELIMINAR PRODUCTO
app.post('/eliminar', (req, res) => {
  const { categoria, id } = req.body;
  const nombreArchivoJs = archivosCategorias[categoria];
  if (!nombreArchivoJs) return res.send("Categoría no válida.");

  const rutaCompletaArchivo = path.join(RUTA_JS, nombreArchivoJs);

  fs.readFile(rutaCompletaArchivo, 'utf8', (err, data) => {
    if (err) return res.send("Error al leer el archivo.");

    const regex = new RegExp(`\\s*\\{\\s*id:\\s*${id},[\\s\\S]*?\\n\\s*\\},?`, 'g');
    let contenidoNuevo = data.replace(regex, '');

    fs.writeFile(rutaCompletaArchivo, contenidoNuevo, 'utf8', (err) => {
      if (err) return res.send("Error al eliminar el producto.");
      res.send(`<h2>¡Producto con ID ${id} eliminado correctamente!</h2><br><a href="/admin">Regresar al Panel</a>`);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/admin`);
});