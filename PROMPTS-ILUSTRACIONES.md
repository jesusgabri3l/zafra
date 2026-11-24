# ZAFRA: prompts de ilustraciones (v5 gouache)

Generar en ChatGPT, **en este orden**. Aprueba cada una antes de usarla como referencia de la siguiente.
Fondo azul `#2F6BFF` para que se pueda recortar (menos postales, brochazo y papel). Guarda cada imagen con el nombre indicado y pásamela para recortarla y montarla.
Rutas relativas a `web-demos-for-business/03-bebida/`.
**Logo (v5.2):** "ZAFRA sudando", la palabra sola con gotas de condensación. Sin caña en ninguna pieza.

## Estado (2026-11-23, al limpiar el proyecto)

Todas las ilustraciones de abajo ya se generaron y la página está cerrada en lo visual; solo se vuelven a usar estos prompts si Jesús pide cambiar una pieza. Flujo de siempre: generar con fondo azul `#2F6BFF` → recortar (alfa) → guardar el original en `fuentes/` → exportar a WebP en `public/`.

| # | Pieza | Estado | Original en `fuentes/` | Servido |
|---|---|---|---|---|
| 0, 1 | Logo letras tinta / maracuyá | En uso | `logo/gouache/*.png` | `public/img/logo-gouache*.webp` (`exportar_botellas.mjs`) |
| 2-4 | Chapas por sabor | En uso | `chapas-gouache/<sabor>-frente.png` | `public/img/chapas/<sabor>-frente.webp` |
| 5-7 | Botellas con chapa | En uso | `botella-gouache/<sabor>.png` | `public/bottle/{2x,1x,m}/<sabor>.webp` (`exportar_botellas.mjs`) |
| 8-10 | Botellas destapadas | **Descartadas** (el footer ya no hace el destape; los PNG quedan en `botella-gouache/*-destapada.png`, sin WebP ni código) | `botella-gouache/*-destapada.png` | Ninguno |
| 11-13 | Postales | En uso | `postales/<sabor>.png` | `public/img/postales/<sabor>.webp` y `-m.webp` |
| 14 | Brochazo | En uso | `brochazo.png` | `public/img/brochazo.webp` |
| 15 | Textura de papel | En uso | `textura-papel.png` | `public/img/papel.webp` y `papel-sombra.webp` |
| 16 | Panela | En uso | `recortes/panela-gouache.png` | `public/img/panela-{1x,2x}.webp` |
| 17, 18 | Mesa de A: pulpa y burbujas | En uso | `recortes/a-pulpa.png`, `a-burbujas.png` | `public/img/a-pulpa-*`, `a-burbujas-*` |
| 19 | Gotas frías de B | **Descartadas** (B quedó con hielo, sin gotas sueltas; se borraron los recortes y los WebP) | solo la hoja `fuentes/png/gotas.png` | Ninguno |
| 20 | Paisaje del footer | En uso | `footer-paisaje.png` (`footer-paisaje-original.png` es la hoja completa) | `public/img/footer-paisaje-full*.webp` |

Los WebP de panela, a-pulpa, a-burbujas, postales, chapas, brochazo, papel y paisaje se exportaron con comandos sueltos de `sharp` (no hay script); ver el paso 2 de `ESTADO.md`.

---

## 0. `logo-gouache.png`

Formato: 3:1 (si no lo deja, 16:9). Va primero: fija cómo se pinta ZAFRA en las chapas y en la botella. Esta es la versión con letras tinta, para fondos claros (hero maracuyá). El favicon y la barra se quedan en vector (a 16-30 px el gouache no se lee).

**Referencias que adjuntas (en este orden):**
- Imagen 1 `fuentes/chapas-gouache/maracuya-frente.png` (solo cómo se pintan a pincel las letras ZAFRA; ignora la chapa, la caña y la fruta)
- Imagen 2 `fuentes/recortes/hielo.png` (cómo se pinta lo frío)
- Imagen 3 `fuentes/recortes/maracuya-entera.png` (pincelada y luz)

**Prompt:**

```text
Usa la imagen 1 solo como referencia de cómo se pintan a pincel las letras de esta marca (la palabra ZAFRA de la chapa; ignora la chapa, la caña y la fruta), la imagen 2 solo como referencia de cómo se pinta lo frío y la imagen 3 como referencia de pincelada y luz. Pinta el logo de una soda helada: la palabra ZAFRA sola, horizontal y de frente, sin perspectiva, en letras mayúsculas condensadas, muy gruesas, sin remates, de trazo recto y curvas llenas, con poco espacio entre letras, perfectamente legibles y bien escritas: Z-A-F-R-A. Las letras son vino casi negro (#2B0A1F), pintadas a pincel con bordes nítidos pero un poco irregulares, con un brillo pintado con pincel seco en vino más claro arriba a la izquierda de cada letra y una sombra un tono más oscura abajo. Las letras están heladas y sudando, como el vidrio de una botella recién sacada de la nevera: sobre su cara hay unas 14 gotas de condensación redondas de tamaños distintos, más pequeñas arriba y más grandes abajo, cada una con un toque de azul hielo (#CDEBEA) en su parte de abajo, un punto de luz crema (#FFF3DE) arriba a la izquierda y un borde fino más oscuro. De la base de la R baja una sola gota grande que se escurre un poco por debajo de la letra y deja un rastro limpio y brillante; de la base de la Z cuelga una gota redonda a punto de caer. Nada se derrite: las letras conservan sus bordes rectos; son gotas de agua fría, no pintura chorreada. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma, sombreado en 2 o 3 tonos por color, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, con 8 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin textura de papel, sin borde blanco tipo sticker, sin sello ni círculo alrededor, sin hielo, fruta, caña ni botella, sin ningún texto aparte de ZAFRA.
```

---

## 1. `logo-gouache-maracuya.png`

Formato: el mismo de la imagen 1. Versión para fondos oscuros (mora y footer tinta).

**Referencias que adjuntas (en este orden):**
- Imagen 1 `logo-gouache.png`, el del paso 0 ya aprobado (todo exacto)

**Prompt:**

```text
La imagen 1 es el logo aprobado. Devuélvelo idéntico: mismo encuadre, tamaño, letras, gotas, rastro y pinceladas. El único cambio: las letras son amarillo maracuyá (#FFC21A), con el brillo en crema cálido (#FFF3DE) arriba a la izquierda y la sombra en ámbar tostado abajo; las gotas llevan un toque ámbar oscuro en su parte de abajo y su punto de luz crema arriba. Estilo: pintura en gouache hecha a mano, igual a la de la imagen 1: pinceladas opacas y visibles que siguen la forma, sombreado en 2 o 3 tonos por color, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, con 8 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin textura de papel, sin borde blanco tipo sticker, sin ningún texto aparte de ZAFRA.
```

---

## 2. `chapa-maracuya.png`

Formato: 1:1; fija el estilo de las chapas nuevas. Al montarla reemplaza a `fuentes/chapas-gouache/maracuya-frente.png` (no borres la vieja hasta tener las 3 nuevas: es referencia).

**Referencias que adjuntas (en este orden):**
- Imagen 1 `fuentes/chapas-gouache/maracuya-frente.png` (la chapa aprobada: forma, pliegues, filo, color, anillo, fruta, pincelada y luz; todo menos la caña)
- Imagen 2 `logo-gouache.png`, el del paso 0 ya aprobado (el logo nuevo)

**Prompt:**

```text
La imagen 1 es la chapa aprobada de esta serie: pinta la misma chapa corona exacta, vista de frente, con el mismo encuadre, tamaño, forma, número de pliegues, filo plateado, laca amarillo maracuyá (#FFC21A), anillo fino en vino casi negro (#2B0A1F), maracuyá partida de arriba, pincelada y luz. Usa la imagen 2 solo como referencia del logo. Solo cambia una cosa: quita por completo el trozo de caña del centro y, en su lugar, pinta el logo de la imagen 2 en vino casi negro (#2B0A1F): la palabra ZAFRA horizontal, en letras mayúsculas condensadas y muy gruesas, perfectamente legibles y bien escritas: Z-A-F-R-A, con sus gotas de condensación sobre las letras y la gota que se escurre de la base de la R. Ocupa el 64 % del ancho de la tapa, centrada en el espacio debajo de la maracuyá, y la gota escurrida termina antes del anillo, sin tocarlo. Las letras van pintadas directo sobre la laca, con el mismo grosor de pincel y los mismos bordes que el dibujo de la imagen 1. Nada de caña. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma, sombreado en 2 o 3 tonos por color, brillos pintados con pincel seco en crema cálido arriba a la izquierda, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, con 8 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin metal cromado, sin textura de papel, sin borde blanco tipo sticker, sin texto en anillo, sin ningún texto aparte de ZAFRA.
```

---

## 3. `chapa-mora.png`

Formato: 1:1. Al montarla reemplaza a `fuentes/chapas-gouache/mora-frente.png`.

**Referencias que adjuntas (en este orden):**
- Imagen 1 `chapa-maracuya.png`, la del paso 2 ya aprobada (estilo, encuadre, logo y composición exactos)
- Imagen 2 `fuentes/chapas-gouache/mora-frente.png` (solo el color de la laca y el dibujo de la mora; ignora la caña)

**Prompt:**

```text
La imagen 1 es la chapa aprobada: pinta la misma chapa exacta, con el mismo encuadre, tamaño, forma, pliegues, filo plateado, anillo, composición, logo ZAFRA con sus gotas y pinceladas. Usa la imagen 2 solo para el color de la laca y el dibujo de la fruta. Solo cambian tres cosas: (1) la laca es vino (#6E1030); (2) todo el dibujo (anillo, fruta y ZAFRA) va en crema cálido (#FFF3DE), y las gotas sobre las letras llevan un toque vino oscuro en su parte de abajo y su punto de luz crema arriba; (3) en lugar de la maracuyá, arriba va un racimo de mora con su cáliz, en una sola tinta crema, del mismo tamaño y en el mismo lugar que la maracuyá de la imagen 1. Nada de caña. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma, sombreado en 2 o 3 tonos por color, brillos pintados con pincel seco en crema cálido arriba a la izquierda, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, con 8 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin metal cromado, sin textura de papel, sin borde blanco tipo sticker, sin texto en anillo, sin ningún texto aparte de ZAFRA.
```

---

## 4. `chapa-lulo.png`

Formato: 1:1. Al montarla reemplaza a `fuentes/chapas-gouache/lulo-frente.png`.

**Referencias que adjuntas (en este orden):**
- Imagen 1 `chapa-maracuya.png`, la del paso 2 ya aprobada (estilo, encuadre, logo y composición exactos)
- Imagen 2 `fuentes/chapas-gouache/lulo-frente.png` (solo el color de la laca y el dibujo del lulo; ignora la caña)

**Prompt:**

```text
La imagen 1 es la chapa aprobada: pinta la misma chapa exacta, con el mismo encuadre, tamaño, forma, pliegues, filo plateado, anillo, composición, logo ZAFRA con sus gotas y pinceladas. Usa la imagen 2 solo para el color de la laca y el dibujo de la fruta. Solo cambian dos cosas: (1) la laca es verde lima (#A9D13F); el dibujo (anillo, fruta y ZAFRA) sigue en vino casi negro (#2B0A1F); (2) en lugar de la maracuyá, arriba va un lulo partido con el borde de pelusa fina y sus cuatro celdas en cruz con semillas, en una sola tinta vino casi negro, del mismo tamaño y en el mismo lugar que la maracuyá de la imagen 1. Nada de caña. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma, sombreado en 2 o 3 tonos por color, brillos pintados con pincel seco en crema cálido arriba a la izquierda, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, con 8 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin metal cromado, sin textura de papel, sin borde blanco tipo sticker, sin texto en anillo, sin ningún texto aparte de ZAFRA.
```

---

## 5. `botella-maracuya.png`

Formato: 2:3; fija el estilo de la botella

**Referencias que adjuntas (en este orden):**
- Imagen 1 `chapa-maracuya.png`, la del paso 2 ya aprobada (estilo de pincel, color de la chapa y cómo se pinta el logo)
- Imagen 2 `fuentes/recortes/maracuya-entera.png` (cómo se pinta el volumen y la luz)
- Imagen 3 `fuentes/botella-objetivo.png` (solo silueta, proporciones y lugar del collarín; su etiqueta "ZAFRA" grande es vieja y la maracuyá de al lado no va)
- Imagen 4 `logo-gouache.png`, el del paso 0 ya aprobado (forma de las letras ZAFRA de la etiqueta)

**Prompt:**

```text
Usa las imágenes 1 y 2 solo como referencia de estilo de pintura y la imagen 3 solo como referencia de silueta, proporciones y lugar del collarín; no copies su acabado fotográfico, ni su etiqueta, ni la fruta que tiene al lado. Pinta una botella de vidrio de soda de 330 ml, corta y gruesa, de pie, vista de frente a la altura del hombro con un leve picado, con las mismas proporciones de la imagen 3: cuerpo recto, hombro redondeado y lleno, cuello corto con un anillo de vidrio grueso y una chapa corona en la boca. Está llena hasta la base del cuello de soda de maracuyá color ámbar dorado (#F2A21B), un poco turbia, más clara cerca de las paredes y más intensa en el centro, con burbujitas pintadas como puntos de luz y una línea clara donde termina el líquido. El vidrio vacío del cuello y los bordes del vidrio se pintan opacos, en verde agua muy pálido (#CDEBEA) con toques de ámbar tostado en las sombras: el fondo no se ve a través de la botella. Un brillo alto y angosto pintado en crema cálido (#FFF3DE), con pinceladas verticales, en el lado izquierdo del cuerpo, que se dobla en el hombro y sigue como una línea por el cuello; un brillo más fino a la derecha. Gotas de condensación de tamaños distintos sobre el cuerpo, cada una con un toque oscuro abajo y un punto de luz crema arriba, y dos gotas grandes que bajan dejando un rastro limpio. La chapa corona es amarilla (#FFC21A), vista de lado, con sus pliegues redondeados y el filo plateado, pintada igual que la chapa de la imagen 1. En el centro del cuerpo, la etiqueta pintada directo sobre el vidrio, en el mismo lugar que en la imagen 3: la palabra ZAFRA en vertical, leyéndose de abajo hacia arriba, en letras mayúsculas condensadas y muy gruesas color crema (#FFF3DE), con la misma forma de letra del logo de la imagen 4 pero en crema y sin sus gotas propias (las gotas de condensación de la botella pasan por encima de las letras igual que por el resto del vidrio), con una sombra sólida corta en vino casi negro (#2B0A1F) hacia abajo a la derecha, sin desenfoque. Sin caña. En el cuello, un collarín de papel crema mate (#F3E6C8) con una franja amarilla fina abajo y, al centro, una maracuyá partida pequeña pintada en una sola tinta vino, sin texto. Sin hielo, sin vaso, sin fruta alrededor, sin otro texto aparte de ZAFRA. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma del objeto, sombreado en 2 o 3 tonos por color, brillos pintados con pincel seco en crema cálido arriba a la izquierda, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, con 10 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin reflejos de entorno, sin metal cromado, sin textura de papel, sin borde blanco tipo sticker, sin mesa, sin texto aparte del que se pide arriba.
```

---

## 6. `botella-mora.png`

Formato: 2:3

**Referencias que adjuntas (en este orden):**
- Imagen 1 `botella-maracuya.png`, la del paso 5 ya aprobada (estilo, forma y encuadre exactos)
- Imagen 2 `chapa-mora.png`, la del paso 3 ya aprobada (color de la chapa)

**Prompt:**

```text
La imagen 1 es la botella aprobada: pinta la misma botella exacta, con el mismo encuadre, tamaño, posición, forma, luz, brillos, gotas, etiqueta y pinceladas. Usa la imagen 2 solo para el color de la chapa. Solo cambian tres cosas: (1) el líquido es soda de mora color vino oscuro casi negro (#6E1030), con reflejos rubí profundo en el centro y en los bordes, limpio y sin turbidez, nunca rosado ni fucsia; las burbujitas se ven como puntos rubí claro; (2) la chapa corona es vino (#6E1030), vista de lado como en la imagen 1, con el filo plateado; (3) el collarín crema lleva una franja vino abajo y, al centro, un racimo de mora pequeño en una sola tinta vino. Los bordes del vidrio llevan toques de vino tostado en las sombras. La etiqueta sigue igual: ZAFRA en vertical en crema (#FFF3DE) con su sombra sólida corta en vino casi negro (#2B0A1F), sin caña. Sin otro texto aparte de ZAFRA. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma del objeto, sombreado en 2 o 3 tonos por color, brillos pintados con pincel seco en crema cálido arriba a la izquierda, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, con 10 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin reflejos de entorno, sin metal cromado, sin textura de papel, sin borde blanco tipo sticker, sin mesa, sin texto aparte del que se pide arriba.
```

---

## 7. `botella-lulo.png`

Formato: 2:3

**Referencias que adjuntas (en este orden):**
- Imagen 1 `botella-maracuya.png`, la del paso 5 ya aprobada (estilo, forma y encuadre exactos)
- Imagen 2 `chapa-lulo.png`, la del paso 4 ya aprobada (color de la chapa)

**Prompt:**

```text
La imagen 1 es la botella aprobada: pinta la misma botella exacta, con el mismo encuadre, tamaño, posición, forma, luz, brillos, gotas, etiqueta y pinceladas. Usa la imagen 2 solo para el color de la chapa. Solo cambian tres cosas: (1) el líquido es soda de lulo verde lima amarillento (#B5C43A), turbia, con motas finas de pulpa y semillitas cerca del fondo; (2) la chapa corona es verde lima (#A9D13F), vista de lado como en la imagen 1, con el filo plateado; (3) el collarín crema lleva una franja verde lima abajo y, al centro, un lulo partido pequeño con sus cuatro celdas en cruz, en una sola tinta vino. Los bordes del vidrio llevan toques de verde oliva en las sombras. La etiqueta sigue igual: ZAFRA en vertical en crema (#FFF3DE) con su sombra sólida corta en vino casi negro (#2B0A1F), sin caña. Sin otro texto aparte de ZAFRA. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma del objeto, sombreado en 2 o 3 tonos por color, brillos pintados con pincel seco en crema cálido arriba a la izquierda, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, con 10 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin reflejos de entorno, sin metal cromado, sin textura de papel, sin borde blanco tipo sticker, sin mesa, sin texto aparte del que se pide arriba.
```

---

## 8, 9 y 10. `botella-maracuya-destapada.png`, `botella-mora-destapada.png`, `botella-lulo-destapada.png`

Formato: 2:3; una por sabor, para el destape del footer

**Referencias que adjuntas (en este orden):**
- Imagen 1 la botella aprobada de ese sabor: `botella-maracuya.png` (paso 5), `botella-mora.png` (paso 6) o `botella-lulo.png` (paso 7)

_Si sale corrida, se alinea en Photopea sobre la versión con chapa (capa al 50 %, por la base y el eje)._

**Prompt:**

```text
La imagen 1 es la botella aprobada. Devuélvela idéntica: mismo encuadre, mismo tamaño y posición de la botella, mismas pinceladas, gotas, etiqueta y collarín. El único cambio: quita la chapa corona. La boca queda abierta: el anillo de vidrio grueso del borde pintado en verde agua pálido (#CDEBEA) con un brillo crema arriba a la izquierda, y dentro de la boca asoma un poco de espuma del color del líquido, más clara, con burbujitas. No cambies nada más. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma del objeto, sombreado en 2 o 3 tonos por color, brillos pintados con pincel seco en crema cálido arriba a la izquierda, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, con 10 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin reflejos de entorno, sin metal cromado, sin textura de papel, sin borde blanco tipo sticker, sin mesa, sin texto aparte del que se pide arriba.
```

---

## 11. `postal-maracuya.png`

Formato: 3:2; fija el estilo de las postales; sin fondo azul ni recorte

**Referencias que adjuntas (en este orden):**
- Imagen 1 `fuentes/recortes/maracuya-entera.png` (pincelada y cómo se pinta la fruta)

**Prompt:**

```text
Usa la imagen 1 solo como referencia de pincelada y de cómo se pinta la fruta. Pinta un paisaje de un cultivo de maracuyá en tierra caliente colombiana, en formato horizontal. Primer plano, a la izquierda y grande (ocupa casi la mitad del cuadro): una enredadera de maracuyá en una espaldera de alambre, con hojas verdes de tres lóbulos, zarcillos, una flor de maracuyá abierta, blanca con su corona morada, y tres maracuyás amarillas maduras colgando. Plano medio: hileras de espalderas iguales que se alejan en diagonal. Fondo: colinas bajas y onduladas en verdes amarillos y un cielo amarillo pálido y limpio, un poco mandarina cerca del horizonte, con una sola nube crema. Paleta: amarillo maracuyá (#FFC21A), verdes hoja, mandarina (#FF7A1A), crema (#F3E6C8) y sombras en vino oscuro (#2B0A1F), nunca negro. Estilo: pintura en gouache hecha a mano con la misma pincelada de la imagen 1: pinceladas opacas, gruesas y visibles, formas simplificadas en planos de 2 o 3 tonos por color, bordes limpios, sin contorno negro. Luz cálida de media mañana desde la izquierda. La pintura llena todo el cuadro hasta los bordes: sin marco, sin borde blanco, sin papel visible, sin esquinas redondeadas. Sin texto, letras, números ni logos; sin personas ni animales; sin casas, sombreros, banderas ni vehículos; sin fotorrealismo, sin render 3D, sin degradados digitales.
```

---

## 12. `postal-mora.png`

Formato: 3:2

**Referencias que adjuntas (en este orden):**
- Imagen 1 `postal-maracuya.png`, la del paso 11 ya aprobada (estilo y pincelada exactos)

**Prompt:**

```text
Mismo estilo, pincelada, luz y nivel de detalle exactos de la imagen 1 (es otra postal de la misma serie), pero otro lugar. Pinta un cultivo de mora de Castilla en clima frío de montaña, en formato horizontal. Primer plano, a la derecha y grande (casi la mitad del cuadro): ramas de mora con espinas, hojas verde oscuro dentadas y racimos de moras maduras color vino casi negro con brillos rubí, y algunas todavía rojas. Plano medio: una ladera andina empinada con parcelas en franjas de verdes distintos. Fondo: montañas más altas y niebla baja color crema que corta las laderas; cielo hielo pálido (#CDEBEA). Paleta: vino (#6E1030), verdes fríos, hielo (#CDEBEA), crema (#F3E6C8) y sombras en vino oscuro (#2B0A1F), nunca negro. Estilo: pintura en gouache hecha a mano con la misma pincelada de la imagen 1: pinceladas opacas, gruesas y visibles, formas simplificadas en planos de 2 o 3 tonos por color, bordes limpios, sin contorno negro. Luz cálida de media mañana desde la izquierda. La pintura llena todo el cuadro hasta los bordes: sin marco, sin borde blanco, sin papel visible, sin esquinas redondeadas. Sin texto, letras, números ni logos; sin personas ni animales; sin casas, sombreros, banderas ni vehículos; sin fotorrealismo, sin render 3D, sin degradados digitales.
```

---

## 13. `postal-lulo.png`

Formato: 3:2

**Referencias que adjuntas (en este orden):**
- Imagen 1 `postal-maracuya.png`, la del paso 11 ya aprobada (estilo y pincelada exactos)

**Prompt:**

```text
Mismo estilo, pincelada, luz y nivel de detalle exactos de la imagen 1 (es otra postal de la misma serie), pero otro lugar. Pinta un cultivo de lulo en una ladera húmeda de tierra templada, en formato horizontal. Primer plano, a la izquierda y grande (casi la mitad del cuadro): una mata de lulo con hojas enormes y aterciopeladas, verdes con nervaduras moradas, y cuatro lulos naranja redondos con pelusa fina colgando de las ramas. Plano medio: una quebrada con piedras claras y un grupo de guaduas de tallos verde lima (#A9D13F) con sus nudos. Fondo: montañas verde azulado y un cielo crema cálido. Paleta: naranja lulo, verde lima (#A9D13F), verdes húmedos, crema (#F3E6C8) y sombras en vino oscuro (#2B0A1F), nunca negro. Estilo: pintura en gouache hecha a mano con la misma pincelada de la imagen 1: pinceladas opacas, gruesas y visibles, formas simplificadas en planos de 2 o 3 tonos por color, bordes limpios, sin contorno negro. Luz cálida de media mañana desde la izquierda. La pintura llena todo el cuadro hasta los bordes: sin marco, sin borde blanco, sin papel visible, sin esquinas redondeadas. Sin texto, letras, números ni logos; sin personas ni animales; sin casas, sombreros, banderas ni vehículos; sin fotorrealismo, sin render 3D, sin degradados digitales.
```

---

## 14. `brochazo.png`

**Referencias:** ninguna.

Formato: 3:2; se exporta en escala de grises para `mask-image`

**Prompt:**

```text
Una sola pincelada ancha de gouache negro hecha con una brocha plana grande cargada de pintura, de izquierda a derecha, horizontal y casi recta, con una leve curva hacia arriba al final. Empieza con un borde denso y redondeado; el centro es negro sólido y opaco, sin huecos, en todo su alto; los bordes de arriba y de abajo son irregulares, con pequeñas fibras y dientes; en el último cuarto se abre en cerdas secas: rayas finas paralelas y huecos donde se acaba la pintura. Ocupa el 92 % del ancho y el 60 % del alto del cuadro, centrada. Estilo: una pincelada real de gouache escaneada, en blanco y negro puro de alto contraste: negro sólido #000000 donde hay pintura y blanco puro #FFFFFF en todo lo demás. Sin grises de fondo, sin textura en el papel, sin sombras, sin salpicaduras ni gotas sueltas, sin marco, sin texto.
```

---

## 15. `textura-papel.png`

**Referencias:** ninguna.

Formato: 1:1.

_Después: desaturar, llevar el promedio a #EEEEEE, hacerla mosaico sin costuras en Photopea (Filtro > Otro > Desplazamiento a la mitad + pincel corrector en la cruz) y exportar a 1024._

**Prompt:**

```text
Textura de papel de acuarela prensado en frío de 300 g, vista totalmente plana desde arriba y llenando todo el cuadro: grano fino y uniforme con pequeñas fibras, en gris muy claro casi blanco, con la misma densidad de grano en todo el cuadro para que se pueda repetir en mosaico. Estilo: escaneo plano de papel real, luz pareja sin viñeta ni sombras, sin color. Sin arrugas, dobleces, manchas, bordes, pintura, texto ni objetos.
```

---

## No se generan (se reutilizan)

Hielo (el cubo de arriba de `fuentes/recortes/hielo.png` se recorta solo; está completo), panela, maracuyás, moras, lulo y gotas de pulpa. La chapa del destape es la chapa nueva del sabor girando; las `-abierta` y `-volteada` (render) salen. `cana.png` ya no se genera: A se arma con la panela y las moras que ya existen.

---

# Ronda 2 (2026-11-23): panela, mesa de A, gotas de B y paisaje del footer

Mismo método: ChatGPT, con fondo azul `#2F6BFF` para recortar (menos el paisaje, que va entero). **Orden: 16 → 17 → 18 → 19 → 20.** El 16 fija la mano de los objetos de mesa, así que apruébalo antes del 17 y el 18. El 19 y el 20 no dependen de nada y pueden ir en paralelo. Dónde va cada pieza: `design-brief.md`, v5 §11.

---

## 16. `panela-gouache.png`

Formato: 3:2. Reemplaza a `fuentes/recortes/panela.png` en A y en el footer. Tiene el mismo ángulo y la misma proporción, así que no cambian ni el layout ni el radio de la física.

_Por qué se pixela hoy:_ el 2x exportado mide 680 px y en desktop se muestra a 30vw (≈580 px CSS, que piden ≈1160). Exporta la nueva en 2x a 1400 px de ancho y en 1x a 700. Si la nueva no sale, exportar la actual así ya mejora mucho.

**Referencias que adjuntas (en este orden):**
- Imagen 1 `fuentes/recortes/panela.png` (forma del bloque, ángulo, esquina partida y migas; ignora su acabado, que es más óleo brillante que gouache)
- Imagen 2 `fuentes/recortes/maracuya-entera.png` (pincelada y luz)
- Imagen 3 `fuentes/botella-gouache/maracuya.png` (solo cómo se pintan los brillos con pincel seco en crema y las sombras en vino; ignora la botella)

**Prompt:**

```text
Usa la imagen 1 solo como referencia de forma, ángulo y composición, la imagen 2 como referencia de pincelada y luz, y la imagen 3 solo como referencia de cómo se pintan los brillos en crema y las sombras en vino (ignora la botella). Pinta el mismo bloque de panela colombiana de la imagen 1: un ladrillo rectangular macizo de azúcar sin refinar, visto un poco desde arriba y en tres cuartos, con la cara de arriba plana y un poco irregular, los cantos suavizados por el molde y la esquina de adelante a la derecha partida, con cinco migas sueltas a su lado y dos granitos. Color: ámbar tostado (#D9771E) en la cara de arriba, dorado más claro (#F2A21B) donde le pega la luz, caramelo oscuro (#8A3A12) en las caras de los lados y sombras en vino oscuro (#2B0A1F), nunca negro. La superficie es mate y terrosa, con poros finos y alguna veta de cristal de azúcar; nada de brillo de caramelo ni de plástico. En la partidura se ve el interior más claro y granulado. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma, sombreado en 2 o 3 tonos por color, brillos pintados con pincel seco en crema cálido (#FFF3DE) arriba a la izquierda, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, ocupando el 92 % del ancho del cuadro, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin textura de papel, sin borde blanco tipo sticker, sin plato, mesa, cuchillo ni empaque, sin texto.
```

---

## 17. `a-pulpa.png`

Formato: 1:1. Estación "01 · FRUTA" de A.

**Referencias que adjuntas (en este orden):**
- Imagen 1 `panela-gouache.png`, la del paso 16 ya aprobada (estilo, ángulo de mesa y luz exactos)
- Imagen 2 `fuentes/recortes/maracuya-partida-mitad-1.png` (solo cómo se pinta la pulpa de maracuyá por dentro)
- Imagen 3 `fuentes/recortes/maracuya-entera.png` (pincelada de la cáscara)

**Prompt:**

```text
Usa la imagen 1 como referencia exacta de estilo, ángulo y luz (es otra pieza de la misma mesa), la imagen 2 solo para cómo se pinta la pulpa de maracuyá y la imagen 3 para la pincelada de la cáscara. Pinta, vista un poco desde arriba y en tres cuartos como la imagen 1, una totuma: media calabaza seca y redonda usada como cuenco, por fuera café dorado mate (#B07A3A) con vetas finas y con el borde interior crema (#F3E6C8), llena casi hasta arriba de pulpa de maracuyá recién sacada: jugo ámbar dorado espeso (#F2A21B) con muchas semillas vino casi negro (#2B0A1F), cada una envuelta en su gel amarillo translúcido (#FFC21A), y brillos húmedos pintados en crema. Apoyada en el borde, una cuchara de palo sencilla y clara, con pulpa en la punta. A la izquierda de la base, la cáscara vacía de media maracuyá amarilla, boca arriba. Los tres objetos forman un solo grupo compacto. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma, sombreado en 2 o 3 tonos por color, brillos pintados con pincel seco en crema cálido (#FFF3DE) arriba a la izquierda, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Grupo centrado, con 8 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin textura de papel, sin borde blanco tipo sticker, sin mesa, mantel ni hojas, sin otras frutas, sin texto.
```

---

## 18. `a-burbujas.png`

Formato: 2:3. Estación "03 · BURBUJAS" de A.

**Referencias que adjuntas (en este orden):**
- Imagen 1 `panela-gouache.png`, la del paso 16 ya aprobada (estilo, ángulo de mesa y luz exactos)
- Imagen 2 `fuentes/botella-gouache/maracuya.png` (solo cómo se pintan el vidrio opaco, sus brillos y las gotas de condensación; ignora la botella, el líquido y la etiqueta)
- Imagen 3 `fuentes/recortes/hielo.png` (cómo se pinta el hielo)

**Prompt:**

```text
Usa la imagen 1 como referencia exacta de estilo, ángulo y luz (es otra pieza de la misma mesa), la imagen 2 solo para cómo se pintan el vidrio, sus brillos y las gotas de condensación (ignora la botella, el líquido y la etiqueta) y la imagen 3 para el hielo. Pinta, visto un poco desde arriba como la imagen 1, un vaso de vidrio grueso, recto y sencillo, lleno de agua con gas bien fría, con dos cubos de hielo flotando arriba. El vidrio y el agua se pintan opacos, como en la imagen 2: verde agua muy pálido (#CDEBEA), sombras en azul verdoso apagado (#7FA8A6) y vino (#2B0A1F) solo en lo más oscuro; el fondo no se ve a través del vaso. Por dentro suben tres hilos de burbujas pintadas como puntos de luz crema (#FFF3DE) con un borde fino más oscuro, pequeñas abajo y más grandes arriba; en la superficie hay una corona de burbujas, y por encima del borde saltan unas diez burbujas sueltas y unas gotitas finas, como si se acabara de servir; ocupan el tercio de arriba del cuadro. Por fuera del vaso, gotas de condensación de tamaños distintos, cada una con un toque oscuro abajo y un punto de luz crema arriba, y una gota que baja dejando un rastro limpio. Un brillo alto y angosto en crema, con pinceladas verticales, en el lado izquierdo del vaso. El agua es agua sola, sin color. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma, sombreado en 2 o 3 tonos por color, brillos pintados con pincel seco en crema cálido arriba a la izquierda, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Objeto solo, centrado, con 8 % de aire alrededor, sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada. Sin fotorrealismo, sin render 3D, sin reflejos de entorno, sin textura de papel, sin borde blanco tipo sticker, sin pitillo, limón, fruta, botella ni posavasos, sin texto ni logos.
```

---

## 19. `gotas-frias.png`

Formato: 3:2. Es una hoja de piezas sueltas para B: cada gota se recorta aparte y se exporta como `frio-gota-<n>.webp` (con alfa, a su tamaño nativo, sin ampliar). No las confundas con `gota-1…6`, que son gotas de pulpa.

**Referencias que adjuntas (en este orden):**
- Imagen 1 `fuentes/logo/gouache/logo-gouache.png` (cómo se pintan las gotas sobre letras tinta y la gota que escurre; ignora las letras)
- Imagen 2 `fuentes/botella-gouache/maracuya.png` (solo las gotas que bajan dejando rastro; ignora la botella)

**Prompt:**

```text
Usa la imagen 1 como referencia exacta de cómo se pintan las gotas de condensación sobre letras vino casi negro (ignora las letras: no las pintes) y la imagen 2 solo como referencia de las gotas que escurren dejando un rastro (ignora la botella). Pinta una hoja de muestras con gotas de agua fría sueltas, como si se hubieran recortado de una superficie pintada en vino casi negro (#2B0A1F), ordenadas con mucho aire entre pieza y pieza: ninguna se toca ni se superpone. Cada gota se ve como una lupa de agua sobre esa superficie oscura: cuerpo en vino un poco más claro (#4A1636), una media luna de azul hielo (#CDEBEA) dentro de su parte de abajo, un punto de luz crema (#FFF3DE) nítido arriba a la izquierda y un borde fino más oscuro (#1A0512) en su contorno de arriba. En las dos terceras partes de la izquierda: 12 gotas redondas y ovaladas en 3 filas de 4, de tamaños muy distintos (de muy pequeñas a medianas); dos de ellas son dobles (dos gotas que se están juntando). En el tercio de la derecha: 4 gotas que escurren, en vertical, una al lado de la otra; cada una es una gota grande en forma de lágrima abajo, con un rastro limpio y angosto hacia arriba que se adelgaza hasta terminar en punta; el rastro es vino un poco más claro (#3E1030) con una línea fina de azul hielo en su borde izquierdo. Los rastros miden 2, 3, 4 y 5 veces el alto de su gota. Arriba de esa columna, una gota colgante redonda, a punto de caer, con un cuello corto arriba. Nada se derrite: son gotas de agua fría, no pintura chorreada. Estilo: pintura en gouache hecha a mano, igual a la de las imágenes de estilo: pinceladas opacas y visibles que siguen la forma, sombreado en 2 o 3 tonos por color, bordes limpios y nítidos, sin contorno negro. Luz de estudio suave desde arriba a la izquierda. Sobre fondo azul liso #2F6BFF, sin degradado ni sombra proyectada; detrás de las gotas no hay ninguna superficie dibujada, solo el azul. Sin fotorrealismo, sin render 3D, sin textura de papel, sin borde blanco tipo sticker, sin letras, sin texto.
```

---

## 20. `footer-paisaje.png`

Formato: 3:2 (ChatGPT no hace 4:1). Va sin fondo azul y sin recorte. Se pinta pensado para quedarse con la mitad de abajo: la de arriba es cielo liso del mismo color del footer.

_Después, en Photopea:_ (1) rellena la mitad de arriba con `#2B0A1F` exacto para que empalme con el footer; (2) recorta la mitad de abajo (1536 × 512, 3:1; su tercio de arriba es cielo liso, así que en la página se lee como una franja de ≈4:1); (3) amplía ×4 con Upscayl (gratis, modelo de ilustración) y exporta WebP sin alfa a 2880 × 960 (desktop) y 1440 × 480 (móvil).

**Referencias que adjuntas (en este orden):**
- Imagen 1 `fuentes/postales/maracuya.png` (estilo, pincelada y cómo se pintan las espalderas)
- Imagen 2 `fuentes/postales/mora.png` (la ladera en franjas y la niebla)
- Imagen 3 `fuentes/postales/lulo.png` (las guaduas y la mata de lulo)

**Prompt:**

```text
Mismo estilo, pincelada y nivel de detalle de las imágenes 1, 2 y 3 (es la última postal de la serie), pero ahora es un panorama ancho al final del día que une los tres lugares en un solo horizonte continuo, de izquierda a derecha, sin cortes ni marcos entre ellos. Composición estricta: la mitad de arriba del cuadro es cielo de noche liso, de un solo color vino casi negro (#2B0A1F), sin estrellas, luna, nubes ni textura, igual de borde a borde. El horizonte va al 72 % del alto. Justo encima de las colinas, y solo en el tercio izquierdo, queda el último resplandor del atardecer, pintado en tres bandas horizontales de pincel: una línea fina amarillo maracuyá (#FFC21A) pegada al horizonte, encima mandarina (#FF7A1A) y luego guayaba apagada que se funde en el vino de la noche; hacia el centro y la derecha el cielo ya es vino casi negro. Tercio izquierdo: hileras de espalderas de maracuyá vistas de lado, con postes y alambres a contraluz, y cinco o seis maracuyás amarillas que todavía atrapan la luz. Centro: una ladera andina con parcelas de mora en franjas, en verdes muy oscuros y vino (#5C1236), con una franja baja de niebla crema apagada tendida entre las parcelas, un poco a la derecha del centro. Tercio derecho: un grupo de guaduas altas y las hojas enormes de unas matas de lulo, a contraluz, con un par de lulos naranja apagado. Colinas del fondo en mora (#5C1236) y las de adelante en mora honda (#3D0B24). El 12 % de abajo del cuadro es suelo de primer plano casi negro, vino oscuro (#2B0A1F a #3D0B24), plano y parejo de lado a lado, sin objetos. Luz: última luz del día desde la izquierda, que deja un borde cálido mandarina fino en el lado izquierdo de postes, hojas y colinas; todo lo demás en sombra fría. Estilo: pintura en gouache hecha a mano con la misma pincelada de las imágenes 1 a 3: pinceladas opacas, gruesas y visibles, formas simplificadas en planos de 2 o 3 tonos por color, bordes limpios, sin contorno negro. La pintura llena todo el cuadro hasta los bordes: sin marco, sin borde blanco, sin papel visible, sin esquinas redondeadas. Sin texto, letras, números ni logos; sin personas ni animales; sin casas, sombreros, banderas, vehículos ni trapiches; sin caña; sin sol ni luna visibles; sin fotorrealismo, sin render 3D, sin degradados digitales.
```
