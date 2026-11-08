# 🎨 Img2 PBR Generator

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen.svg)
![Android](https://img.shields.io/badge/Android-APK-success.svg)
![Offline](https://img.shields.io/badge/Offline-100%25-success.svg)
![Privacy](https://img.shields.io/badge/No_Tracking-Privacy-green.svg)

**Img2 PBR Generator** es una herramienta multiplataforma diseñada para artistas 3D, desarrolladores de videojuegos y diseñadores. Permite generar mapas PBR (Physically Based Rendering) de alta calidad a partir de texturas base, operando **100% de forma local y offline**.

---

## Características Principales

### 6 Tipos de Mapas PBR
* **Normal Maps:** Simula detalles de superficie (grietas, costuras) sin añadir geometría 3D extra.
* **Height / Displacement:** Mapa de alturas en escala de grises (Blanco=alto, Negro=bajo) ideal para parallax.
* **Ambient Occlusion (AO):** Añade sombras de contacto y profundidad en rincones y grietas.
* **Roughness:** Define la rugosidad del material (Blanco=mate, Negro=brillante).
* **Metalness:** Separa áreas metálicas (Blanco) de no metálicas (Negro).
* **Opacity:** Controla la transparencia del material (Blanco=opaco).

### Control Avanzado
* **Intensidad ajustable:** Control deslizante (0.1 a 5.0) adaptado a cada tipo de mapa.
* **Compatibilidad multiplataforma:** Opciones de inversión para canales Y, R y G (OpenGL vs. DirectX).
* **Procesamiento en tiempo real:** Generación instantánea sin recargar la página.

### Exportación Flexible
* **PNG:** Calidad máxima sin pérdidas (Ideal para Normal Maps).
* **JPG:** Compresión ligera (Ideal para texturas de color).
* **WEBP:** Formato moderno con balance entre peso y calidad.
* **Descarga ZIP:** Exporta todos los mapas generados en un solo clic.

### Experiencia Multiplataforma
* **Web (PWA):** Instalable en PC y móvil directamente desde el navegador.
* **Android (APK):** Aplicación nativa para dispositivos Android.

---

## Plataformas y Descargas

### Android (APK)
La versión para Android ha sido empaquetada utilizando **WebToApp**, una herramienta que convierte mi PWA (Web App Progresiva) en un contenedor nativo.

Esto garantiza el mismo rendimiento, interfaz y funcionamiento offline que la versión web, pero con la comodidad de una instalación tradicional.
* **Descargar APK:** [Haz clic aquí para descargar la última versión](https://github.com/Yandrox/Img2-PBR-Generator/releases/)
* **Instalación:** Es posible que debas habilitar la "Instalación de fuentes desconocidas" en los ajustes de seguridad de tu dispositivo.

### Web (PWA)
Puedes usar la aplicación directamente en tu navegador o instalarla como una App Nativa (PWA):
1. Abre la aplicación en tu navegador (Chrome, Edge, Safari).
2. En la barra de direcciones o en el menú del navegador, busca la opción **"Instalar Aplicación"** o **"Añadir a la pantalla de inicio"**.
3. ¡Listo! Funcionará sin conexión a internet.

---

## Guía Rápida de Uso
1. **Carga tu textura base** (Formatos soportados: JPG, PNG, WEBP, GIF).
2. **Selecciona el tipo de mapa** PBR que deseas generar (Normal, Height, AO, etc.).
3. **Ajusta la intensidad** utilizando el control deslizante para ver el resultado en tiempo real.
4. **Configura las inversiones** (Y, R, G) si necesitas adaptar el mapa para un motor específico como Unity o Unreal Engine.
5. Haz clic en **"Generar Mapa"**.
6. **Guarda el resultado** en tu formato preferido (PNG, JPG, WEBP) o descarga todo el conjunto en un archivo **ZIP**.

---

## Tecnologías Utilizadas
* **HTML5 Canvas:** Procesamiento de imágenes y manipulación de píxeles.
* **JavaScript (ES6+):** Algoritmos de generación de mapas (Sobel, pases de contraste, etc.).
* **Service Workers:** Soporte para funcionamiento offline y caché (PWA).
* **Web App Manifest:** Configuración para instalación en dispositivos móviles y PC.
* **JSZip:** Generación de archivos comprimidos para la descarga múltiple.
* **WebToApp:** Empaquetado de la PWA en un archivo APK para su distribución en Android.

---

## Hoja de Ruta (Roadmap)

Actualmente trabajando en futuras versiones:

- ✅ Generación de 6 mapas PBR base.
- ✅ Exportación múltiple en ZIP.
- ✅ Versión App Web Progresiva (PWA).
- ✅ Versión Android (APK vía WebToApp).
- ❌ Implementación de algoritmos de generación avanzados (Edge detection para AO).
- ❌ Soporte para texturas de alta resolución (4K sin pérdida de rendimiento).
- ❌ Modo de previsualización 3D en tiempo real (Three.js).

---

## Contribuir

¡Las contribuciones de la comunidad son lo que hace que el código abierto sea un lugar increíble para aprender, inspirar y crear! Cualquier contribución que hagas será muy apreciada.

Si encuentras un error, por favor abre un Issue detallando el problema.

---

## Licencia

Este proyecto está distribuido bajo la Licencia Apache 2.0. 
Esto significa que puedes:

- ✅ Usar la aplicación para cualquier propósito (personal o comercial).
- ✅ Modificar el código fuente a tu gusto.
- ✅ Distribuir copias modificadas.

**Condición:** Debes incluir el aviso de copyright original y los avisos de atribución en todas las copias o derivados del proyecto.

Para más detalles, consulta el archivo LICENSE.

---

## Desarrollador

Yandrox - Desarrollador Independiente

- GitHub: @Yandrox
- Email: yandrox9012@gmail.com
- Telegram: @yandrox

---

## Agradecimientos

- A la comunidad de artistas 3D por el feedback y los casos de prueba.
- A la comunidad Open Source por el soporte con JSZip y las herramientas base.
- A WebToApp por facilitar el empaquetado de la PWA para Android.
- A la documentación de Mozilla Developer Network (MDN) por las guías sobre Canvas API.

---

## ⭐ ¿Te gusta el proyecto?

¡Considera darle una estrella en GitHub!

Esto ayuda a que más personas descubran la herramienta.