class PhotoEditor {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'move';
        this.isDrawing = false;
        this.layers = [];
        this.currentLayer = 0;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.history = [];
        this.historyStep = -1;
        this.foregroundColor = '#000000';
        this.backgroundColor = '#ffffff';
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupToolbar();
        this.setupPanels();
        this.createInitialLayer();
        this.updateUI();
    }

    setupCanvas() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Fill with white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save initial state
        this.saveState();
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        
        // File input
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomCanvas(0.1));
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomCanvas(-0.1));
        document.getElementById('fitToScreen').addEventListener('click', () => this.fitToScreen());
        
        // Color pickers
        document.getElementById('foregroundColor').addEventListener('change', (e) => {
            this.foregroundColor = e.target.value;
            document.getElementById('hexColor').value = e.target.value;
        });
        
        document.getElementById('backgroundColor').addEventListener('change', (e) => {
            this.backgroundColor = e.target.value;
        });
        
        document.getElementById('hexColor').addEventListener('change', (e) => {
            this.foregroundColor = e.target.value;
            document.getElementById('foregroundColor').value = e.target.value;
        });
    }

    setupToolbar() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                toolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
                this.updateCursor();
                this.updateToolInfo();
            });
        });
        
        // Menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                this.handleMenuClick(item.dataset.menu);
            });
        });
    }

    setupPanels() {
        // Layer controls
        document.getElementById('addLayer').addEventListener('click', () => this.addLayer());
        document.getElementById('deleteLayer').addEventListener('click', () => this.deleteLayer());
        
        // Property inputs
        document.getElementById('propWidth').addEventListener('change', (e) => {
            this.canvas.width = parseInt(e.target.value);
            this.redrawCanvas();
        });
        
        document.getElementById('propHeight').addEventListener('change', (e) => {
            this.canvas.height = parseInt(e.target.value);
            this.redrawCanvas();
        });
    }

    createInitialLayer() {
        const layer = {
            id: 0,
            name: 'Background',
            visible: true,
            opacity: 1,
            imageData: this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height),
            thumbnail: null
        };
        
        this.layers.push(layer);
        this.updateLayersPanel();
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;
        
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        
        switch (this.currentTool) {
            case 'brush':
                this.startBrushStroke(x, y);
                break;
            case 'eraser':
                this.startEraserStroke(x, y);
                break;
            case 'text':
                this.addText(x, y);
                break;
            case 'eyedropper':
                this.pickColor(x, y);
                break;
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;
        
        // Update cursor position
        document.getElementById('cursorPosition').textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
        
        if (!this.isDrawing) return;
        
        switch (this.currentTool) {
            case 'brush':
                this.drawBrushStroke(x, y);
                break;
            case 'eraser':
                this.drawEraserStroke(x, y);
                break;
            case 'move':
                this.moveLayer(x, y);
                break;
        }
    }

    handleMouseUp(e) {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
            this.updateLayerThumbnail();
        }
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.zoomCanvas(delta);
    }

    handleKeyboard(e) {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveImage();
                    break;
                case 'o':
                    e.preventDefault();
                    this.openImage();
                    break;
            }
        }
        
        // Tool shortcuts
        switch (e.key.toLowerCase()) {
            case 'v':
                this.selectTool('move');
                break;
            case 'b':
                this.selectTool('brush');
                break;
            case 'e':
                this.selectTool('eraser');
                break;
            case 't':
                this.selectTool('text');
                break;
            case 'i':
                this.selectTool('eyedropper');
                break;
            case 'z':
                if (!e.ctrlKey && !e.metaKey) {
                    this.selectTool('zoom');
                }
                break;
        }
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    this.loadImage(img);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    loadImage(img) {
        // Resize canvas to fit image
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        // Draw image
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0);
        
        // Update UI
        this.updateCanvasSize();
        this.saveState();
        this.updateLayerThumbnail();
    }

    startBrushStroke(x, y) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.foregroundColor;
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    drawBrushStroke(x, y) {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    startEraserStroke(x, y) {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.lineWidth = 10;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    drawEraserStroke(x, y) {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    addText(x, y) {
        const text = prompt('Enter text:');
        if (text) {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = this.foregroundColor;
            this.ctx.font = '20px Inter';
            this.ctx.fillText(text, x, y);
            this.saveState();
            this.updateLayerThumbnail();
        }
    }

    pickColor(x, y) {
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
        this.foregroundColor = hex;
        document.getElementById('foregroundColor').value = hex;
        document.getElementById('hexColor').value = hex;
    }

    selectTool(tool) {
        const toolBtn = document.querySelector(`[data-tool="${tool}"]`);
        if (toolBtn) {
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
            toolBtn.classList.add('active');
            this.currentTool = tool;
            this.updateCursor();
            this.updateToolInfo();
        }
    }

    updateCursor() {
        const cursors = {
            move: 'move',
            brush: 'crosshair',
            eraser: 'crosshair',
            text: 'text',
            eyedropper: 'crosshair',
            zoom: 'zoom-in'
        };
        
        this.canvas.style.cursor = cursors[this.currentTool] || 'default';
    }

    updateToolInfo() {
        const toolNames = {
            move: 'Move Tool (V)',
            brush: 'Brush Tool (B)',
            eraser: 'Eraser Tool (E)',
            text: 'Text Tool (T)',
            eyedropper: 'Eyedropper Tool (I)',
            zoom: 'Zoom Tool (Z)'
        };
        
        document.getElementById('toolInfo').textContent = toolNames[this.currentTool] || '';
    }

    zoomCanvas(delta) {
        this.zoom = Math.max(0.1, Math.min(5, this.zoom + delta));
        document.getElementById('zoomLevel').textContent = Math.round(this.zoom * 100) + '%';
        this.canvas.style.transform = `scale(${this.zoom})`;
    }

    fitToScreen() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const scaleX = containerWidth / this.canvas.width;
        const scaleY = containerHeight / this.canvas.height;
        
        this.zoom = Math.min(scaleX, scaleY);
        document.getElementById('zoomLevel').textContent = Math.round(this.zoom * 100) + '%';
        this.canvas.style.transform = `scale(${this.zoom})`;
    }

    addLayer() {
        const layerId = this.layers.length;
        const layer = {
            id: layerId,
            name: `Layer ${layerId}`,
            visible: true,
            opacity: 1,
            imageData: this.ctx.createImageData(this.canvas.width, this.canvas.height),
            thumbnail: null
        };
        
        this.layers.push(layer);
        this.currentLayer = layerId;
        this.updateLayersPanel();
    }

    deleteLayer() {
        if (this.layers.length > 1 && this.currentLayer > 0) {
            this.layers.splice(this.currentLayer, 1);
            this.currentLayer = Math.max(0, this.currentLayer - 1);
            this.updateLayersPanel();
            this.redrawCanvas();
        }
    }

    updateLayersPanel() {
        const layersList = document.getElementById('layersList');
        layersList.innerHTML = '';
        
        this.layers.forEach((layer, index) => {
            const layerEl = document.createElement('div');
            layerEl.className = `layer ${index === this.currentLayer ? 'active' : ''}`;
            layerEl.dataset.layer = index;
            
            layerEl.innerHTML = `
                <div class="layer-thumbnail"></div>
                <div class="layer-info">
                    <span class="layer-name">${layer.name}</span>
                    <span class="layer-opacity">${Math.round(layer.opacity * 100)}%</span>
                </div>
                <div class="layer-controls">
                    <input type="checkbox" ${layer.visible ? 'checked' : ''} class="layer-visibility">
                    <input type="range" min="0" max="100" value="${layer.opacity * 100}" class="layer-opacity-slider">
                </div>
            `;
            
            layerEl.addEventListener('click', () => {
                this.currentLayer = index;
                this.updateLayersPanel();
            });
            
            layersList.appendChild(layerEl);
        });
    }

    updateLayerThumbnail() {
        if (this.layers[this.currentLayer]) {
            this.layers[this.currentLayer].imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw all visible layers
        this.layers.forEach(layer => {
            if (layer.visible && layer.imageData) {
                this.ctx.putImageData(layer.imageData, 0, 0);
            }
        });
    }

    saveState() {
        this.historyStep++;
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        this.history.push(this.canvas.toDataURL());
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState();
        }
    }

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState();
        }
    }

    restoreState() {
        const img = new Image();
        img.src = this.history[this.historyStep];
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
    }

    saveImage() {
        const link = document.createElement('a');
        link.download = 'photopea-export.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }

    openImage() {
        document.getElementById('fileInput').click();
    }

    handleMenuClick(menu) {
        switch (menu) {
            case 'file':
                // Show file menu
                if (confirm('Open new image?')) {
                    this.openImage();
                }
                break;
            case 'edit':
                // Show edit menu
                if (confirm('Undo last action?')) {
                    this.undo();
                }
                break;
            case 'image':
                // Show image menu
                if (confirm('Resize canvas?')) {
                    const width = prompt('New width:', this.canvas.width);
                    const height = prompt('New height:', this.canvas.height);
                    if (width && height) {
                        this.canvas.width = parseInt(width);
                        this.canvas.height = parseInt(height);
                        this.redrawCanvas();
                    }
                }
                break;
            case 'filter':
                // Apply basic filter
                this.applyGrayscaleFilter();
                break;
        }
    }

    applyGrayscaleFilter() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
        this.updateLayerThumbnail();
    }

    updateUI() {
        this.updateCanvasSize();
        this.updateToolInfo();
        this.updateCursor();
    }

    updateCanvasSize() {
        document.getElementById('canvasSize').textContent = `${this.canvas.width} × ${this.canvas.height}`;
        document.getElementById('propWidth').value = this.canvas.width;
        document.getElementById('propHeight').value = this.canvas.height;
    }
}

// Initialize the editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const editor = new PhotoEditor();
    
    // Make it globally available for debugging
    window.photoEditor = editor;
});
