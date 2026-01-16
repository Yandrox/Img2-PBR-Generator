// Img2 PBR Generator - Versión 1.0.0
// Archivo principal de la aplicación

// ===== VARIABLES GLOBALES =====
let originalImageData = null;
let currentResult = null;
let generatedMaps = new Map();
let originalImageSize = { width: 0, height: 0 };
let selectedFormat = 'png';

// ===== ELEMENTOS DEL DOM =====
const elements = {
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    
    // File
    fileInput: document.getElementById('fileInput'),
    selectFileBtn: document.getElementById('selectFile'),
    fileName: document.getElementById('fileName'),
    
    // Canvas
    originalCanvas: document.getElementById('originalCanvas'),
    resultCanvas: document.getElementById('resultCanvas'),
    originalCtx: document.getElementById('originalCanvas').getContext('2d'),
    resultCtx: document.getElementById('resultCanvas').getContext('2d'),
    originalPlaceholder: document.getElementById('originalPlaceholder'),
    resultPlaceholder: document.getElementById('resultPlaceholder'),
    
    // Controls
    mapType: document.getElementById('mapType'),
    mapDescription: document.getElementById('mapDescription'),
    strengthSlider: document.getElementById('strength'),
    strengthValue: document.getElementById('strengthValue'),
    strengthInfo: document.getElementById('strengthInfo'),
    
    // Inversion
    invertY: document.getElementById('invertY'),
    invertR: document.getElementById('invertR'),
    invertG: document.getElementById('invertG'),
    
    // Save
    saveName: document.getElementById('saveName'),
    formatBtns: document.querySelectorAll('.format-btn'),
    saveBtn: document.getElementById('saveBtn'),
    saveAllBtn: document.getElementById('saveAllBtn'),
    
    // Buttons
    generateBtn: document.getElementById('generate'),
    resetBtn: document.getElementById('reset'),
    
    // Thumbnails
    thumbnails: document.getElementById('thumbnails'),
    
    // Message
    messageEl: document.getElementById('message')
};

// ===== DESCRIPCIONES DE MAPAS =====
const mapDescriptions = {
    normal: {
        desc: 'Genera mapas de normales a partir de texturas. Simula detalles de superficie sin geometría adicional.',
        strengthDesc: 'Controla la profundidad aparente de los detalles normales',
        min: 0.1,
        max: 5.0,
        default: 1.0
    },
    height: {
        desc: 'Crea mapas de altura/displacement. Blanco=alto, Negro=bajo. Útil para parallax y displacement mapping.',
        strengthDesc: 'Ajusta el contraste entre áreas altas y bajas',
        min: 0.1,
        max: 5.0,
        default: 1.0
    },
    ao: {
        desc: 'Genera mapas de oclusión ambiental. Simula cómo la luz es bloqueada en grietas y rincones.',
        strengthDesc: 'Controla la intensidad de las sombras de oclusión',
        min: 0.1,
        max: 5.0,
        default: 2.0
    },
    roughness: {
        desc: 'Crea mapas de rugosidad. Controla cuán rugosa o suave es una superficie (Blanco=rugoso, Negro=suave).',
        strengthDesc: 'Ajusta el rango de valores de rugosidad',
        min: 0.1,
        max: 5.0,
        default: 1.5
    },
    metalness: {
        desc: 'Genera mapas de metalicidad. Define qué partes son metálicas (Blanco) y cuáles no (Negro).',
        strengthDesc: 'Controla el contraste entre áreas metálicas y no metálicas',
        min: 0.1,
        max: 5.0,
        default: 2.5
    },
    opacity: {
        desc: 'Crea mapas de opacidad. Controla la transparencia del material (Blanco=opaco, Negro=transparente).',
        strengthDesc: 'Ajusta el rango de transparencia',
        min: 0.1,
        max: 5.0,
        default: 1.0
    }
};

// ===== INICIALIZACIÓN =====
function init() {
    setupTabs();
    setupFileInput();
    setupMapType();
    setupStrengthSlider();
    setupFormatButtons();
    setupButtons();
    setupCanvas();
    
    showMessage('Img2 PBR Generator listo', 'info');
}

// ===== CONFIGURACIÓN DE TABS =====
function setupTabs() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active tab button
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding tab pane
            elements.tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `tab-${tabId}`) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

// ===== CONFIGURACIÓN DE ARCHIVOS =====
function setupFileInput() {
    elements.selectFileBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
        showMessage('Por favor selecciona un archivo de imagen válido', 'error');
        return;
    }
    
    // Update file name display
    elements.fileName.textContent = file.name.length > 30 ? 
        file.name.substring(0, 27) + '...' : file.name;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            loadImageToCanvas(img);
        };
        img.onerror = function() {
            showMessage('Error al cargar la imagen', 'error');
        };
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        showMessage('Error al leer el archivo', 'error');
    };
    
    reader.readAsDataURL(file);
}

function loadImageToCanvas(img) {
    // Save original dimensions
    originalImageSize = {
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
    };
    
    // Calculate display size (max 512px on larger side)
    const maxSize = 512;
    let displayWidth = img.width;
    let displayHeight = img.height;
    
    if (displayWidth > maxSize || displayHeight > maxSize) {
        const ratio = Math.min(maxSize / displayWidth, maxSize / displayHeight);
        displayWidth = Math.floor(displayWidth * ratio);
        displayHeight = Math.floor(displayHeight * ratio);
    }
    
    // Update canvas dimensions
    elements.originalCanvas.width = displayWidth;
    elements.originalCanvas.height = displayHeight;
    elements.resultCanvas.width = displayWidth;
    elements.resultCanvas.height = displayHeight;
    
    // Clear and draw
    elements.originalCtx.clearRect(0, 0, displayWidth, displayHeight);
    elements.originalCtx.drawImage(img, 0, 0, displayWidth, displayHeight);
    
    // Get ImageData for processing
    originalImageData = elements.originalCtx.getImageData(0, 0, displayWidth, displayHeight);
    
    // Show canvas, hide placeholder
    elements.originalCanvas.style.display = 'block';
    elements.originalPlaceholder.style.display = 'none';
    
    showMessage('Imagen cargada: ' + img.width + '×' + img.height + 'px', 'success');
}

// ===== CONFIGURACIÓN DE TIPO DE MAPA =====
function setupMapType() {
    elements.mapType.addEventListener('change', updateMapDescription);
    updateMapDescription(); // Initial update
}

function updateMapDescription() {
    const type = elements.mapType.value;
    const desc = mapDescriptions[type];
    
    if (desc) {
        elements.mapDescription.textContent = desc.desc;
        elements.strengthSlider.min = desc.min;
        elements.strengthSlider.max = desc.max;
        elements.strengthSlider.value = desc.default;
        elements.strengthValue.textContent = desc.default;
        elements.strengthInfo.textContent = desc.strengthDesc;
    }
}

// ===== CONFIGURACIÓN DE SLIDER =====
function setupStrengthSlider() {
    elements.strengthSlider.addEventListener('input', function() {
        elements.strengthValue.textContent = this.value;
    });
}

// ===== CONFIGURACIÓN DE FORMATOS =====
function setupFormatButtons() {
    elements.formatBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            elements.formatBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedFormat = this.dataset.format;
        });
    });
}

// ===== CONFIGURACIÓN DE BOTONES =====
function setupButtons() {
    elements.generateBtn.addEventListener('click', generateMap);
    elements.saveBtn.addEventListener('click', saveImage);
    elements.saveAllBtn.addEventListener('click', saveAllAsZip);
    elements.resetBtn.addEventListener('click', resetApp);
}

// ===== CONFIGURACIÓN DE CANVAS =====
function setupCanvas() {
    // Initial placeholder setup
    elements.originalCanvas.style.display = 'none';
    elements.resultCanvas.style.display = 'none';
}

// ===== GENERACIÓN DE MAPAS =====
function generateMap() {
    if (!originalImageData) {
        showMessage('Primero carga una imagen', 'error');
        return;
    }
    
    const type = elements.mapType.value;
    const strength = parseFloat(elements.strengthSlider.value);
    
    let result;
    
    switch(type) {
        case 'normal':
            result = generateNormalMap(originalImageData, strength);
            break;
        case 'height':
            result = generateHeightMap(originalImageData, strength);
            break;
        case 'ao':
            result = generateAOMap(originalImageData, strength);
            break;
        case 'roughness':
            result = generateRoughnessMap(originalImageData, strength);
            break;
        case 'metalness':
            result = generateMetalnessMap(originalImageData, strength);
            break;
        case 'opacity':
            result = generateOpacityMap(originalImageData, strength);
            break;
        default:
            showMessage('Tipo de mapa no soportado', 'error');
            return;
    }
    
    // Apply inversions if enabled
    if (elements.invertY.checked || elements.invertR.checked || elements.invertG.checked) {
        result = applyInversions(result);
    }
    
    // Save and display
    currentResult = result;
    generatedMaps.set(type, {
        data: result,
        type: type,
        timestamp: new Date().toLocaleTimeString()
    });
    
    // Display result
    elements.resultCtx.putImageData(result, 0, 0);
    elements.resultCanvas.style.display = 'block';
    elements.resultPlaceholder.style.display = 'none';
    
    // Add thumbnail
    addThumbnail(type, result);
    
    showMessage(`Mapa ${type} generado (Fuerza: ${strength})`, 'success');
}

// ===== ALGORITMOS DE GENERACIÓN =====
function generateNormalMap(imageData, strength) {
    const normalMap = new ImageData(imageData.width, imageData.height);
    const data = imageData.data;
    const result = normalMap.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Create height map first
    const heightMap = [];
    for(let y = 0; y < height; y++) {
        heightMap[y] = [];
        for(let x = 0; x < width; x++) {
            heightMap[y][x] = getIntensity(data, x, y, width);
        }
    }
    
    // Apply strength to height differences
    const strengthMultiplier = strength;
    
    for(let y = 1; y < height - 1; y++) {
        for(let x = 1; x < width - 1; x++) {
            // Sobel filter for normals
            const top = heightMap[y-1][x];
            const bottom = heightMap[y+1][x];
            const left = heightMap[y][x-1];
            const right = heightMap[y][x+1];
            
            const dX = (right - left) * strengthMultiplier;
            const dY = (bottom - top) * strengthMultiplier;
            
            // Normalize
            const length = Math.sqrt(dX*dX + dY*dY + 1);
            const nx = -dX / length;
            const ny = -dY / length;
            const nz = 1 / length;
            
            const idx = (y * width + x) * 4;
            result[idx] = (nx * 0.5 + 0.5) * 255;     // R
            result[idx + 1] = (ny * 0.5 + 0.5) * 255; // G
            result[idx + 2] = (nz * 0.5 + 0.5) * 255; // B
            result[idx + 3] = 255;                    // A
        }
    }
    
    return normalMap;
}

function generateHeightMap(imageData, strength) {
    const heightMap = new ImageData(imageData.width, imageData.height);
    const data = imageData.data;
    const result = heightMap.data;
    
    // Apply strength to contrast
    const contrast = strength;
    
    for(let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Apply contrast adjustment
        let adjustedGray = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
        adjustedGray = Math.max(0, Math.min(255, adjustedGray));
        
        result[i] = adjustedGray;
        result[i + 1] = adjustedGray;
        result[i + 2] = adjustedGray;
        result[i + 3] = 255;
    }
    
    return heightMap;
}

function generateAOMap(imageData, strength) {
    const aoMap = new ImageData(imageData.width, imageData.height);
    const data = imageData.data;
    const result = aoMap.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Create height map
    const heightMap = [];
    for(let y = 0; y < height; y++) {
        heightMap[y] = [];
        for(let x = 0; x < width; x++) {
            heightMap[y][x] = getIntensity(data, x, y, width);
        }
    }
    
    // AO settings based on strength
    const radius = Math.floor(strength);
    const intensity = strength * 0.5;
    
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            let occlusion = 0;
            let samples = 0;
            
            for(let dy = -radius; dy <= radius; dy++) {
                for(let dx = -radius; dx <= radius; dx++) {
                    if(dx === 0 && dy === 0) continue;
                    
                    const nx = x + dx;
                    const ny = y + dy;
                    
                    if(nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const current = heightMap[y][x];
                        const neighbor = heightMap[ny][nx];
                        
                        if(neighbor > current) {
                            const distance = Math.sqrt(dx*dx + dy*dy);
                            occlusion += (neighbor - current) * intensity / distance;
                        }
                        samples++;
                    }
                }
            }
            
            const ao = Math.max(0, Math.min(1, 1 - (occlusion / samples)));
            const idx = (y * width + x) * 4;
            const aoValue = ao * 255;
            
            result[idx] = aoValue;
            result[idx + 1] = aoValue;
            result[idx + 2] = aoValue;
            result[idx + 3] = 255;
        }
    }
    
    return aoMap;
}

function generateRoughnessMap(imageData, strength) {
    const roughnessMap = new ImageData(imageData.width, imageData.height);
    const data = imageData.data;
    const result = roughnessMap.data;
    
    // Apply strength to roughness range
    const rangeMultiplier = strength;
    
    for(let i = 0; i < data.length; i += 4) {
        const intensity = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Apply strength to adjust roughness values
        let roughness = (intensity / 255) * rangeMultiplier;
        roughness = Math.min(1, roughness); // Cap at 1
        
        const value = roughness * 255;
        
        result[i] = value;
        result[i + 1] = value;
        result[i + 2] = value;
        result[i + 3] = 255;
    }
    
    return roughnessMap;
}

function generateMetalnessMap(imageData, strength) {
    const metalnessMap = new ImageData(imageData.width, imageData.height);
    const data = imageData.data;
    const result = metalnessMap.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Strength affects contrast between metallic/non-metallic
    const contrast = strength * 2;
    
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            // Calculate saturation and value
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max > 0 ? (max - min) / max : 0;
            const value = max / 255;
            
            // Determine metalness based on saturation and value
            let metalness = 0.1; // Default non-metallic
            
            if (saturation > 0.3 && value > 0.4) {
                // Likely metallic area
                metalness = 0.8 + (saturation * 0.2);
            } else if (saturation > 0.2 && value > 0.6) {
                // Possibly metallic
                metalness = 0.5;
            }
            
            // Apply contrast
            metalness = ((metalness - 0.5) * contrast + 0.5);
            metalness = Math.max(0, Math.min(1, metalness));
            
            const metalValue = metalness * 255;
            
            result[idx] = metalValue;
            result[idx + 1] = metalValue;
            result[idx + 2] = metalValue;
            result[idx + 3] = 255;
        }
    }
    
    return metalnessMap;
}

function generateOpacityMap(imageData, strength) {
    const opacityMap = new ImageData(imageData.width, imageData.height);
    const data = imageData.data;
    const result = opacityMap.data;
    
    // Strength controls opacity range
    const rangeMultiplier = strength;
    
    for(let i = 0; i < data.length; i += 4) {
        // Use brightness for opacity
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Apply strength to adjust opacity range
        let opacity = (brightness / 255) * rangeMultiplier;
        opacity = Math.min(1, opacity); // Cap at 1
        
        const value = opacity * 255;
        
        result[i] = value;
        result[i + 1] = value;
        result[i + 2] = value;
        result[i + 3] = 255;
    }
    
    return opacityMap;
}

function getIntensity(data, x, y, width) {
    const idx = (y * width + x) * 4;
    return (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
}

function applyInversions(imageData) {
    const result = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
    
    const data = result.data;
    
    for(let i = 0; i < data.length; i += 4) {
        if(elements.invertY.checked || elements.invertG.checked) {
            data[i + 1] = 255 - data[i + 1]; // Invert green (Y)
        }
        if(elements.invertR.checked) {
            data[i] = 255 - data[i]; // Invert red (X)
        }
    }
    
    return result;
}

// ===== MINIATURAS =====
function addThumbnail(type, imageData) {
    // Create thumbnail canvas (square 90x90)
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 90;
    thumbCanvas.height = 90;
    const thumbCtx = thumbCanvas.getContext('2d');
    
    // Create temp canvas for scaling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    // Calculate scale for square thumbnail
    const scale = Math.min(90 / imageData.width, 90 / imageData.height);
    const scaledWidth = imageData.width * scale;
    const scaledHeight = imageData.height * scale;
    const offsetX = (90 - scaledWidth) / 2;
    const offsetY = (90 - scaledHeight) / 2;
    
    // Draw centered and scaled
    thumbCtx.clearRect(0, 0, 90, 90);
    thumbCtx.drawImage(tempCanvas, offsetX, offsetY, scaledWidth, scaledHeight);
    
    // Create container
    const container = document.createElement('div');
    container.className = 'thumbnail-item';
    container.title = `Haz clic para cargar el mapa ${type}`;
    
    const label = document.createElement('div');
    label.className = 'thumbnail-label';
    label.textContent = type;
    
    container.appendChild(thumbCanvas);
    container.appendChild(label);
    
    // Click event to load this map
    container.addEventListener('click', () => {
        elements.resultCtx.putImageData(imageData, 0, 0);
        currentResult = imageData;
        elements.resultCanvas.style.display = 'block';
        elements.resultPlaceholder.style.display = 'none';
        showMessage(`Mapa ${type} cargado`, 'info');
    });
    
    elements.thumbnails.appendChild(container);
}

// ===== GUARDADO =====
function saveImage() {
    if (!currentResult) {
        showMessage('No hay mapa para guardar', 'error');
        return;
    }
    
    const name = elements.saveName.value.trim() || 'textura_pbr';
    const link = document.createElement('a');
    link.download = `${name}.${selectedFormat}`;
    
    // Configure quality based on format
    let quality = 0.92;
    let mimeType;
    
    switch(selectedFormat) {
        case 'jpg':
            mimeType = 'image/jpeg';
            quality = 0.85;
            break;
        case 'webp':
            mimeType = 'image/webp';
            quality = 0.80;
            break;
        case 'png':
        default:
            mimeType = 'image/png';
            quality = undefined; // PNG doesn't use quality parameter
    }
    
    // Convert canvas to data URL with selected format
    const dataUrl = elements.resultCanvas.toDataURL(mimeType, quality);
    link.href = dataUrl;
    
    // Simulate click to download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage(`Imagen guardada como ${name}.${selectedFormat}`, 'success');
}

async function saveAllAsZip() {
    if (generatedMaps.size === 0) {
        showMessage('No hay mapas generados', 'error');
        return;
    }
    
    try {
        const zip = new JSZip();
        
        // Add each map to ZIP
        for(const [type, mapInfo] of generatedMaps) {
            // Create temp canvas
            const canvas = document.createElement('canvas');
            canvas.width = mapInfo.data.width;
            canvas.height = mapInfo.data.height;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(mapInfo.data, 0, 0);
            
            // Convert to blob
            const blob = await new Promise(resolve => 
                canvas.toBlob(resolve, 'image/png')
            );
            
            // Add to ZIP with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            zip.file(`${type}_${timestamp}.png`, blob);
        }
        
        // Generate ZIP
        const content = await zip.generateAsync({type: 'blob'});
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `pbr_maps_${new Date().getTime()}.zip`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        
        showMessage(`ZIP descargado con ${generatedMaps.size} mapas`, 'success');
        
    } catch (error) {
        console.error('Error creating ZIP:', error);
        showMessage('Error al crear el archivo ZIP', 'error');
    }
}

// ===== RESET =====
function resetApp() {
    // Reset canvas
    elements.originalCanvas.width = 0;
    elements.originalCanvas.height = 0;
    elements.resultCanvas.width = 0;
    elements.resultCanvas.height = 0;
    
    elements.originalCanvas.style.display = 'none';
    elements.resultCanvas.style.display = 'none';
    elements.originalPlaceholder.style.display = 'flex';
    elements.resultPlaceholder.style.display = 'flex';
    
    // Reset variables
    originalImageData = null;
    currentResult = null;
    originalImageSize = { width: 0, height: 0 };
    generatedMaps.clear();
    
    // Reset UI
    elements.fileName.textContent = 'No hay archivo seleccionado';
    elements.fileInput.value = '';
    elements.saveName.value = 'textura_pbr';
    elements.thumbnails.innerHTML = '';
    
    // Reset checkboxes
    elements.invertY.checked = false;
    elements.invertR.checked = false;
    elements.invertG.checked = false;
    
    // Reset format to PNG
    elements.formatBtns.forEach(btn => {
        if (btn.dataset.format === 'png') {
            btn.classList.add('active');
            selectedFormat = 'png';
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update map description to reset slider
    updateMapDescription();
    
    showMessage('Aplicación reiniciada', 'info');
}

// ===== MENSAJES =====
function showMessage(text, type = 'info') {
    elements.messageEl.textContent = text;
    elements.messageEl.className = 'message ' + type;
    elements.messageEl.style.display = 'block';
    
    // Entrance animation
    elements.messageEl.style.animation = 'slideIn 0.3s ease';
    
    // Hide after 4 seconds
    setTimeout(() => {
        elements.messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            elements.messageEl.style.display = 'none';
        }, 300);
    }, 4000);
}

// ===== INICIALIZAR APLICACIÓN =====
document.addEventListener('DOMContentLoaded', init);

// PWA Installation
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker error: ', err);
            });
    });
}