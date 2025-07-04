const API_TOKEN = 'GUID';
const API_CODIGO_INMOBILIARIA = 'SOM';
const API_CODIGO_SUCURSAL = '00';

async function cargarDatosInmobiliaria() {
    try {
        const url = `https://apmovil.som.com.ar/InmobiliariasServiceV2.aspx?token=${API_TOKEN}&codigoInmobiliaria=${API_CODIGO_INMOBILIARIA}&codigoSucursal=${API_CODIGO_SUCURSAL}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener datos');
        const data = await response.json();
        mostrarDatosEnContacto(data);
        mostrarLogoNavbar(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarDatosEnContacto(data) {
    const tel = document.querySelector('#contacto .fa-phone-alt')?.parentElement?.querySelector('p');
    if (tel) tel.textContent = data.telefonos || '';
    const wsp = document.querySelector('#contacto .fa-whatsapp')?.parentElement?.querySelector('p');
    if (wsp) wsp.textContent = data.whatsapp || '';
    const email = document.querySelector('#contacto .fa-envelope')?.parentElement?.querySelector('p');
    if (email) email.textContent = data.email || '';
    const dir = document.querySelector('#contacto .fa-map-marker-alt')?.parentElement?.querySelector('p');
    if (dir) dir.textContent = data.direccion || '';
    const logoImg = document.querySelector('#contacto img');
    if (logoImg && data.inmobiliaria) {
        logoImg.src = `https://sistema.som.com.ar/img/logos/${data.inmobiliaria}.gif`;
        logoImg.alt = data.nombre || 'Logo Inmobiliaria';
    }
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        if (data.latitud && data.longitud) {
            const mapa = document.querySelector('#ubicacion iframe');
            if (mapa) {
                mapa.src = `https://maps.google.com/maps?q=${data.latitud},${data.longitud}&z=15&output=embed`;
            }
        }
    }
    // Cambia el título de la página según la sección
    let pageTitle = '';
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        pageTitle = 'Inicio';
    } else if (window.location.pathname.endsWith('venta.html')) {
        pageTitle = 'Propiedades en Venta';
    } else if (window.location.pathname.endsWith('alquiler.html')) {
        pageTitle = 'Propiedades en Alquiler';
    } else if (window.location.pathname.endsWith('ficha.html')) {
        pageTitle = 'Ficha de Propiedad';
    }
    if (data.nombre) {
        document.title = `${pageTitle ? pageTitle + ' | ' : ''}${data.nombre}`;
    }
}

function mostrarLogoNavbar(data) {
    const logoNavbar = document.querySelector('header img');
    if (logoNavbar && data.inmobiliaria) {
        logoNavbar.src = `https://sistema.som.com.ar/img/logos/${data.inmobiliaria}.gif`;
        logoNavbar.alt = data.nombre || 'Logo Inmobiliaria';
        logoNavbar.classList.remove('hidden');
    }
}

async function cargarPropiedadesDestacadas() {
    const url = `https://apmovil.som.com.ar/BusquedaServiceV2.aspx?token=${API_TOKEN}&codigoInmobiliaria=${API_CODIGO_INMOBILIARIA}&codigoSucursal=${API_CODIGO_SUCURSAL}&productoTipo=&productoSubTipo=&operacionTipo=Venta&moneda=&pais=&provincia=&localidad=&barrio=&precioDesde=&precioHasta=&destacadas=Si&pagina=1&cantidad=3&orden=&zona=&inventario=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener propiedades destacadas');
        const data = await response.json();
        mostrarPropiedadesDestacadas(data.inmuebles || []);
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarPropiedadesDestacadas(inmuebles) {
    const contenedor = document.querySelector('#ofertas .grid');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    inmuebles.forEach(inmueble => {
        const card = document.createElement('div');
        card.className = 'bg-gray-700 rounded shadow p-4 cursor-pointer';
        card.onclick = () => { window.location.href = `ficha.html?id=${inmueble.ID}`; };
        card.innerHTML = `
            <img src="https://sistema.som.com.ar/imagenes/mediano/${inmueble.UrlFoto}" class="w-full h-60 object-cover rounded mb-2" alt="${inmueble.TipoProducto}">
            <h3 class="text-xl font-semibold">${inmueble.TipoProducto}</h3>
            <p class="text-blue-400"><b>${inmueble.OperacionPrecio}</b></p>
            <p class="text-gray-300 text-sm mt-1">${inmueble.DireccionAproximada || inmueble.Direccion || ''} ${inmueble.Localidad ? ' - ' + inmueble.Localidad : ''}</p>
        `;
        contenedor.appendChild(card);
    });
}

let paginaActual = 1;
let operacionActual = '';
let cantidadActual = 21;
let totalResultados = null;

async function cargarPropiedades(operacion, pagina, cantidad) {
    operacionActual = operacion;
    paginaActual = pagina;
    cantidadActual = cantidad;
    const url = `https://apmovil.som.com.ar/BusquedaServiceV2.aspx?token=${API_TOKEN}&codigoInmobiliaria=${API_CODIGO_INMOBILIARIA}&codigoSucursal=${API_CODIGO_SUCURSAL}&productoTipo=&productoSubTipo=&operacionTipo=${encodeURIComponent(operacion)}&moneda=&pais=&provincia=&localidad=&barrio=&precioDesde=&precioHasta=&pagina=${pagina}&cantidad=${cantidad}&orden=&zona=&inventario=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener propiedades');
        const data = await response.json();
        totalResultados = parseInt(data.totales?.Total || '0', 10);
        mostrarPropiedades(data.inmuebles || [], pagina > 1);
        actualizarBotonCargarMas(data.inmuebles?.length || 0);
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarPropiedades(inmuebles, append = false) {
    const contenedor = document.querySelector('#propiedades-listado');
    if (!contenedor) return;
    if (!append) contenedor.innerHTML = '';
    if (inmuebles.length === 0 && !append) {
        // Mostrar mensaje de "no hay ofertas"
        const card = document.createElement('div');
        card.className = 'col-span-full bg-gray-800 rounded-xl shadow-lg p-8 text-center text-gray-300 mt-8';
        card.innerHTML = `<i class='fas fa-info-circle text-3xl text-blue-400 mb-4'></i><div class='text-xl font-semibold mb-2'>No hay propiedades para mostrar en este momento.</div><div class='text-gray-400'>Vuelve a intentarlo más tarde o ajusta los filtros de búsqueda.</div>`;
        contenedor.appendChild(card);
        return;
    }
    inmuebles.forEach(inmueble => {
        const card = document.createElement('div');
        card.className = 'bg-gray-700 rounded shadow p-4 cursor-pointer';
        card.onclick = () => { window.location.href = `ficha.html?id=${inmueble.ID}`; };
        card.innerHTML = `
            <img src="https://sistema.som.com.ar/imagenes/mediano/${inmueble.UrlFoto}" class="w-full h-60 object-cover rounded mb-2" alt="${inmueble.TipoProducto}">
            <h3 class="text-xl font-semibold">${inmueble.TipoProducto}</h3>
            <p class="text-blue-400"><b>${inmueble.OperacionPrecio}</b></p>
            <p class="text-gray-300 text-sm mt-1">${inmueble.DireccionAproximada || inmueble.Direccion || ''} ${inmueble.Localidad ? ' - ' + inmueble.Localidad : ''}</p>
        `;
        contenedor.appendChild(card);
    });
}

function actualizarBotonCargarMas(cantidadUltimaPagina) {
    const btn = document.getElementById('btn-cargar-mas');
    if (!btn) return;
    const mostrados = paginaActual * cantidadActual;
    if (mostrados >= totalResultados || cantidadUltimaPagina < cantidadActual) {
        btn.style.display = 'none';
    } else {
        btn.style.display = '';
    }
}

function cargarMasResultados() {
    cargarPropiedades(operacionActual, paginaActual + 1, cantidadActual);
}

async function cargarFichaPropiedad(idFicha) {
    const url = `https://apmovil.som.com.ar/BusquedaServiceV2.aspx?token=${API_TOKEN}&codigoInmobiliaria=${API_CODIGO_INMOBILIARIA}&codigoSucursal=${API_CODIGO_SUCURSAL}&Id=${idFicha}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener ficha');
        const data = await response.json();
        mostrarFichaPropiedad(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarFichaPropiedad(data) {
    // Galería de fotos
    const galeria = document.querySelector('.swiper-wrapper');
    const galeriaSection = galeria ? galeria.closest('.swiper') : null;
    let hayFotos = false;
    if (galeria && Array.isArray(data.fotos) && data.fotos.length > 0) {
        galeria.innerHTML = '';
        data.fotos.forEach(foto => {
            if (foto && foto.url) {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide flex items-center justify-center bg-black';
                slide.innerHTML = `<img src="${foto.url}" alt="Foto propiedad" class="max-w-full max-h-full object-contain w-full h-full"/>`;
                galeria.appendChild(slide);
                hayFotos = true;
            }
        });
    }
    if (galeriaSection) {
        galeriaSection.style.display = hayFotos ? '' : 'none';
    }
    // Si hay fotos, reinicializa Swiper para que tome los nuevos slides y los controles funcionen desde el inicio
    if (hayFotos && window.Swiper) {
        setTimeout(() => {
            if (galeria.closest('.swiper').swiper) {
                galeria.closest('.swiper').swiper.update();
                galeria.closest('.swiper').swiper.slideTo(0, 0, false);
            } else {
                // Si no existe, inicializa Swiper
                new window.Swiper('.swiper', {
                    loop: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    spaceBetween: 20,
                    centeredSlides: true,
                });
            }
        }, 100);
    }
    // Dirección
    const direccion = document.querySelector('.ficha-direccion');
    if (direccion) {
        direccion.textContent = `${data.Calle || ''} ${data.Altura || ''}, ${data.Ubicacion || ''}`.trim();
    }
    // Precio
    const precio = document.querySelector('.ficha-precio');
    if (precio) {
        precio.textContent = `${data.TipoOperacion || ''} - ${data.Moneda || ''} ${data.Importe || ''}`.trim();
    }
    // Descripción (Destacable)
    const descripcion = document.querySelector('.ficha-descripcion');
    if (descripcion) {
        descripcion.innerHTML = (data.Destacable || '').replace(/\r?\n/g, '<br>');
    }
    // Características (Atributos separados por punto y coma)
    const caracteristicas = document.querySelector('.ficha-caracteristicas');
    const caracteristicasSection = caracteristicas ? caracteristicas.closest('section') : null;
    let hayAtributos = false;
    if (caracteristicas) {
        caracteristicas.innerHTML = '';
        if (typeof data.Atributos === 'string' && data.Atributos.trim() !== '') {
            data.Atributos.split(';').forEach(attr => {
                const cleanAttr = attr.trim();
                if (cleanAttr) {
                    const li = document.createElement('li');
                    li.textContent = cleanAttr;
                    caracteristicas.appendChild(li);
                    hayAtributos = true;
                }
            });
        }
    }
    if (caracteristicasSection) {
        caracteristicasSection.style.display = hayAtributos ? '' : 'none';
    }
    // Contacto
    const contacto = document.querySelector('.ficha-contacto');
    if (contacto) {
        contacto.innerHTML = `
            <h3 class="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Contacto</h3>
            <p class="gap-3 mb-3"><i class="fas fa-user text-blue-400"></i> ${data.InmobiliariaNombre || ''}</p>
            <p class="gap-3 mb-3"><i class="fas fa-phone text-green-400"></i> ${data.InmobiliariaTelefono || ''}</p>
            <p class="gap-3 mb-3"><i class="fab fa-whatsapp text-green-500"></i> ${data.InmobiliariaWhatsapp || ''}</p>
            <p class="gap-3 mb-4"><i class="fas fa-envelope text-yellow-400"></i> ${data.InmobiliariaEmail || ''}</p>
        `;
    }
    // Mapa
    const mapa = document.querySelector('.ficha-mapa');
    const mapaSection = mapa ? mapa.closest('section') : null;
    if (
        data.Latitud != null && data.Longitud != null &&
        String(data.Latitud).trim() !== '' && String(data.Longitud).trim() !== '' &&
        !isNaN(Number(data.Latitud)) && !isNaN(Number(data.Longitud))
    ) {
        const lat = Number(data.Latitud);
        const lng = Number(data.Longitud);
        if (mapa) {
            mapa.setAttribute('src', `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed&cb=${Date.now()}`);
            mapa.style.display = '';
        }
        if (mapaSection) {
            mapaSection.style.display = '';
        }
    } else {
        // Oculta el mapa y la sección si no hay coordenadas válidas
        if (mapa) {
            mapa.removeAttribute('src');
            mapa.style.display = 'none';
        }
        if (mapaSection) {
            mapaSection.style.display = 'none';
        }
    }
    // Tipo de propiedad y subtipo (debe ir arriba, antes de dirección)
    const tipoOferta = document.querySelector('.ficha-tipo-oferta');
    if (tipoOferta) {
        let tipo = data.TipoPropiedad || '';
        let subtipo = data.SubtipoPropiedad || '';
        tipoOferta.innerHTML = `<span class="icono-tipo">🏠</span> ${tipo && subtipo ? tipo + ' - ' + subtipo : (tipo || subtipo || '')}`;
        tipoOferta.classList.add('flex', 'justify-center', 'items-center', 'gap-2', 'text-center');
    }
}

if (
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('alquiler.html') ||
    window.location.pathname.endsWith('venta.html') ||
    window.location.pathname.endsWith('ficha.html')
) {
    window.addEventListener('DOMContentLoaded', () => {
        cargarDatosInmobiliaria();
        cargarPropiedadesDestacadas();
    });
}
