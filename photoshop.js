class AdobePhotoshop {
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
        this.brushSize = 10;
        this.brushHardness = 100;
        this.brushOpacity = 100;
        this.selection = null;
        this.transform = null;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupToolbar();
        this.setupPanels();
        this.setupKeyboardShortcuts();
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
        this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        
        // File input
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        
        // Window events
        window.addEventListener('keydown', this.handleKeyboard.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Drag and drop
        this.canvas.addEventListener('dragover', this.handleDragOver.bind(this));
        this.canvas.addEventListener('drop', this.handleDrop.bind(this));
    }

    setupToolbar() {
        // Tool buttons
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                toolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
                this.updateCursor();
                this.updateToolOptions();
                this.updateToolInfo();
            });
        });

        // Dropdown tools
        const dropdownTools = document.querySelectorAll('.dropdown-tool');
        dropdownTools.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                const parentSlot = btn.closest('.tool-slot');
                const mainTool = parentSlot.querySelector('.tool-btn');
                mainTool.classList.add('active');
                this.currentTool = btn.dataset.tool;
                this.updateCursor();
                this.updateToolOptions();
                this.updateToolInfo();
            });
        });

        // Color controls
        document.getElementById('foregroundColor').addEventListener('click', () => {
            this.showColorPicker('foreground');
        });

        document.getElementById('backgroundColor').addEventListener('click', () => {
            this.showColorPicker('background');
        });

        document.querySelector('.color-swap').addEventListener('click', () => {
            this.swapColors();
        });

        document.querySelector('.color-reset').addEventListener('click', () => {
            this.resetColors();
        });
    }

    setupPanels() {
        // Layer controls
        document.getElementById('addLayer').addEventListener('click', () => this.addLayer());
        document.getElementById('deleteLayer').addEventListener('click', () => this.deleteLayer());
        document.getElementById('duplicateLayer').addEventListener('click', () => this.duplicateLayer());
        document.getElementById('addMask').addEventListener('click', () => this.addLayerMask());
        document.getElementById('addAdjustment').addEventListener('click', () => this.addAdjustmentLayer());

        // Color panel
        this.setupColorPanel();

        // Panel close buttons
        document.querySelectorAll('.panel-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const panel = btn.closest('.panel');
                panel.style.display = 'none';
            });
        });

        // Panel dragging
        this.setupPanelDragging();
    }

    setupColorPanel() {
        const redSlider = document.getElementById('redSlider');
        const greenSlider = document.getElementById('greenSlider');
        const blueSlider = document.getElementById('blueSlider');
        const hexInput = document.getElementById('hexColor');

        const updateColorFromSliders = () => {
            const r = parseInt(redSlider.value);
            const g = parseInt(greenSlider.value);
            const b = parseInt(blueSlider.value);
            const hex = this.rgbToHex(r, g, b);
            
            this.foregroundColor = hex;
            hexInput.value = hex;
            document.getElementById('redValue').value = r;
            document.getElementById('greenValue').value = g;
            document.getElementById('blueValue').value = b;
            
            this.updateColorDisplay();
        };

        const updateColorFromHex = () => {
            const hex = hexInput.value;
            const rgb = this.hexToRgb(hex);
            
            if (rgb) {
                this.foregroundColor = hex;
                redSlider.value = rgb.r;
                greenSlider.value = rgb.g;
                blueSlider.value = rgb.b;
                document.getElementById('redValue').value = rgb.r;
                document.getElementById('greenValue').value = rgb.g;
                document.getElementById('blueValue').value = rgb.b;
                
                this.updateColorDisplay();
            }
        };

        redSlider.addEventListener('input', updateColorFromSliders);
        greenSlider.addEventListener('input', updateColorFromSliders);
        blueSlider.addEventListener('input', updateColorFromSliders);
        hexInput.addEventListener('input', updateColorFromHex);
    }

    setupKeyboardShortcuts() {
        // These are handled in the handleKeyboard method
    }

    createInitialLayer() {
        const layer = {
            id: 0,
            name: 'Background',
            visible: true,
            opacity: 1,
            blendMode: 'normal',
            locked: false,
            imageData: this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height),
            thumbnail: null,
            mask: null
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
            case 'move':
                this.startMove(x, y);
                break;
            case 'brush':
                this.startBrushStroke(x, y);
                break;
            case 'eraser':
                this.startEraserStroke(x, y);
                break;
            case 'pencil':
                this.startPencilStroke(x, y);
                break;
            case 'clone-stamp':
                this.startCloneStamp(x, y);
                break;
            case 'healing':
                this.startHealingBrush(x, y);
                break;
            case 'spot-healing':
                this.startSpotHealing(x, y);
                break;
            case 'eyedropper':
                this.pickColor(x, y);
                break;
            case 'marquee-rect':
            case 'marquee-ellipse':
                this.startMarqueeSelection(x, y);
                break;
            case 'lasso':
                this.startLassoSelection(x, y);
                break;
            case 'polygonal-lasso':
                this.startPolygonalLasso(x, y);
                break;
            case 'magnetic-lasso':
                this.startMagneticLasso(x, y);
                break;
            case 'quick-selection':
                this.startQuickSelection(x, y);
                break;
            case 'magic-wand':
                this.startMagicWand(x, y);
                break;
            case 'type':
                this.addText(x, y);
                break;
            case 'rectangle':
            case 'ellipse':
                this.startShape(x, y);
                break;
            case 'pen':
                this.startPenTool(x, y);
                break;
            case 'gradient':
                this.startGradient(x, y);
                break;
            case 'paint-bucket':
                this.startPaintBucket(x, y);
                break;
            case 'blur':
            case 'sharpen':
            case 'smudge':
                this.startRetouching(x, y);
                break;
            case 'dodge':
            case 'burn':
            case 'sponge':
                this.startDodgeBurn(x, y);
                break;
            case 'crop':
                this.startCrop(x, y);
                break;
            case 'hand':
                this.startHandTool(x, y);
                break;
            case 'zoom':
                this.startZoomTool(x, y);
                break;
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;
        
        // Update cursor position
        document.getElementById('cursorPos').textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
        
        if (!this.isDrawing) return;
        
        switch (this.currentTool) {
            case 'brush':
                this.drawBrushStroke(x, y);
                break;
            case 'eraser':
                this.drawEraserStroke(x, y);
                break;
            case 'pencil':
                this.drawPencilStroke(x, y);
                break;
            case 'clone-stamp':
                this.drawCloneStamp(x, y);
                break;
            case 'healing':
                this.drawHealingBrush(x, y);
                break;
            case 'spot-healing':
                this.drawSpotHealing(x, y);
                break;
            case 'lasso':
                this.drawLassoSelection(x, y);
                break;
            case 'polygonal-lasso':
                this.drawPolygonalLasso(x, y);
                break;
            case 'magnetic-lasso':
                this.drawMagneticLasso(x, y);
                break;
            case 'quick-selection':
                this.drawQuickSelection(x, y);
                break;
            case 'rectangle':
            case 'ellipse':
                this.drawShape(x, y);
                break;
            case 'pen':
                this.drawPenTool(x, y);
                break;
            case 'gradient':
                this.drawGradient(x, y);
                break;
            case 'blur':
            case 'sharpen':
            case 'smudge':
                this.drawRetouching(x, y);
                break;
            case 'dodge':
            case 'burn':
            case 'sponge':
                this.drawDodgeBurn(x, y);
                break;
            case 'crop':
                this.drawCrop(x, y);
                break;
            case 'hand':
                this.drawHandTool(x, y);
                break;
        }
    }

    handleMouseUp(e) {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
            this.updateLayerThumbnail();
            
            // Handle selection completion
            if (this.currentTool.includes('marquee') || this.currentTool.includes('lasso') || 
                this.currentTool.includes('selection')) {
                this.finalizeSelection();
            }
        }
    }

    handleWheel(e) {
        e.preventDefault();
        
        if (e.ctrlKey || e.metaKey) {
            // Zoom with Ctrl/Cmd + wheel
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoomCanvas(delta);
        } else if (this.currentTool === 'hand') {
            // Pan with hand tool
            this.panX += e.deltaX;
            this.panY += e.deltaY;
            this.updateCanvasTransform();
        }
    }

    handleKeyboard(e) {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 's':
                    e.preventDefault();
                    this.saveImage();
                    break;
                case 'o':
                    e.preventDefault();
                    this.openImage();
                    break;
                case 'n':
                    e.preventDefault();
                    this.newDocument();
                    break;
                case 'c':
                    e.preventDefault();
                    this.copy();
                    break;
                case 'v':
                    e.preventDefault();
                    this.paste();
                    break;
                case 'x':
                    e.preventDefault();
                    this.cut();
                    break;
                case 'a':
                    e.preventDefault();
                    this.selectAll();
                    break;
                case 'd':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.deselect();
                    } else {
                        this.duplicate();
                    }
                    break;
                case 't':
                    e.preventDefault();
                    this.freeTransform();
                    break;
                case 'l':
                    e.preventDefault();
                    this.adjustLevels();
                    break;
                case 'm':
                    e.preventDefault();
                    this.curves();
                    break;
                case 'b':
                    e.preventDefault();
                    this.balance();
                    break;
                case 'i':
                    e.preventDefault();
                    this.invert();
                    break;
                case 'h':
                    e.preventDefault();
                    this.showHistogram();
                    break;
            }
        } else {
            // Tool shortcuts
            switch (e.key.toLowerCase()) {
                case 'v':
                    this.selectTool('move');
                    break;
                case 'm':
                    this.selectTool('marquee-rect');
                    break;
                case 'l':
                    this.selectTool('lasso');
                    break;
                case 'w':
                    this.selectTool('quick-selection');
                    break;
                case 'c':
                    this.selectTool('crop');
                    break;
                case 'i':
                    this.selectTool('eyedropper');
                    break;
                case 'j':
                    this.selectTool('spot-healing');
                    break;
                case 'b':
                    this.selectTool('brush');
                    break;
                case 'e':
                    this.selectTool('eraser');
                    break;
                case 'g':
                    this.selectTool('gradient');
                    break;
                case 's':
                    this.selectTool('clone-stamp');
                    break;
                case 'r':
                    this.selectTool('blur');
                    break;
                case 'o':
                    this.selectTool('dodge');
                    break;
                case 'p':
                    this.selectTool('pen');
                    break;
                case 't':
                    this.selectTool('type');
                    break;
                case 'a':
                    this.selectTool('path-selection');
                    break;
                case 'u':
                    this.selectTool('rectangle');
                    break;
                case 'h':
                    this.selectTool('hand');
                    break;
                case 'z':
                    this.selectTool('zoom');
                    break;
                case 'd':
                    this.resetColors();
                    break;
                case 'x':
                    this.swapColors();
                    break;
                case '[':
                    this.decreaseBrushSize();
                    break;
                case ']':
                    this.increaseBrushSize();
                    break;
                case '0':
                    this.setZoom(100);
                    break;
                case '1':
                    this.setZoom(100);
                    break;
                case '2':
                    this.setZoom(200);
                    break;
                case '3':
                    this.setZoom(300);
                    break;
                case '4':
                    this.setZoom(400);
                    break;
                case '5':
                    this.setZoom(500);
                    break;
                case '-':
                    this.zoomCanvas(-0.1);
                    break;
                case '+':
                case '=':
                    this.zoomCanvas(0.1);
                    break;
                case ' ':
                    e.preventDefault();
                    this.temporarilySelectTool('hand');
                    break;
            }
        }
    }

    // Tool implementations
    startBrushStroke(x, y) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.foregroundColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalAlpha = this.brushOpacity / 100;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    drawBrushStroke(x, y) {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    startEraserStroke(x, y) {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalAlpha = this.brushOpacity / 100;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    drawEraserStroke(x, y) {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    startPencilStroke(x, y) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.foregroundColor;
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'square';
        this.ctx.lineJoin = 'miter';
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    drawPencilStroke(x, y) {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    startCloneStamp(x, y) {
        if (!this.cloneSource) {
            this.cloneSource = { x: x, y: y };
            this.showCrosshair(x, y);
        } else {
            this.cloneTarget = { x: x, y: y };
            this.performCloneStamp();
        }
    }

    drawCloneStamp(x, y) {
        if (this.cloneSource) {
            this.cloneTarget = { x: x, y: y };
            this.performCloneStamp();
        }
    }

    performCloneStamp() {
        if (!this.cloneSource || !this.cloneTarget) return;
        
        const dx = this.cloneTarget.x - this.cloneSource.x;
        const dy = this.cloneTarget.y - this.cloneSource.y;
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = this.brushOpacity / 100;
        
        // Get source area
        const sourceData = this.ctx.getImageData(
            this.cloneSource.x - this.brushSize/2,
            this.cloneSource.y - this.brushSize/2,
            this.brushSize,
            this.brushSize
        );
        
        // Draw at target
        this.ctx.putImageData(sourceData, this.cloneTarget.x - this.brushSize/2, this.cloneTarget.y - this.brushSize/2);
        
        this.ctx.restore();
    }

    startHealingBrush(x, y) {
        if (!this.healingSource) {
            this.healingSource = { x: x, y: y };
            this.showCrosshair(x, y);
        } else {
            this.healingTarget = { x: x, y: y };
            this.performHealing();
        }
    }

    drawHealingBrush(x, y) {
        if (this.healingSource) {
            this.healingTarget = { x: x, y: y };
            this.performHealing();
        }
    }

    performHealing() {
        if (!this.healingSource || !this.healingTarget) return;
        
        // Simplified healing - blend source and target areas
        const sourceData = this.ctx.getImageData(
            this.healingSource.x - this.brushSize/2,
            this.healingSource.y - this.brushSize/2,
            this.brushSize,
            this.brushSize
        );
        
        const targetData = this.ctx.getImageData(
            this.healingTarget.x - this.brushSize/2,
            this.healingTarget.y - this.brushSize/2,
            this.brushSize,
            this.brushSize
        );
        
        // Blend the two areas
        for (let i = 0; i < sourceData.data.length; i += 4) {
            sourceData.data[i] = (sourceData.data[i] + targetData.data[i]) / 2;
            sourceData.data[i + 1] = (sourceData.data[i + 1] + targetData.data[i + 1]) / 2;
            sourceData.data[i + 2] = (sourceData.data[i + 2] + targetData.data[i + 2]) / 2;
        }
        
        this.ctx.putImageData(sourceData, this.healingTarget.x - this.brushSize/2, this.healingTarget.y - this.brushSize/2);
    }

    startSpotHealing(x, y) {
        this.spotHealingCenter = { x: x, y: y };
        this.performSpotHealing();
    }

    drawSpotHealing(x, y) {
        this.spotHealingCenter = { x: x, y: y };
        this.performSpotHealing();
    }

    performSpotHealing() {
        if (!this.spotHealingCenter) return;
        
        // Get area around the spot
        const radius = this.brushSize / 2;
        const data = this.ctx.getImageData(
            this.spotHealingCenter.x - radius,
            this.spotHealingCenter.y - radius,
            radius * 2,
            radius * 2
        );
        
        // Apply healing algorithm (simplified)
        for (let y = 0; y < data.height; y++) {
            for (let x = 0; x < data.width; x++) {
                const distance = Math.sqrt(Math.pow(x - radius, 2) + Math.pow(y - radius, 2));
                if (distance < radius) {
                    const index = (y * data.width + x) * 4;
                    // Sample surrounding pixels and average them
                    let r = 0, g = 0, b = 0, count = 0;
                    
                    for (let dy = -2; dy <= 2; dy++) {
                        for (let dx = -2; dx <= 2; dx++) {
                            const sx = x + dx;
                            const sy = y + dy;
                            if (sx >= 0 && sx < data.width && sy >= 0 && sy < data.height) {
                                const sIndex = (sy * data.width + sx) * 4;
                                r += data.data[sIndex];
                                g += data.data[sIndex + 1];
                                b += data.data[sIndex + 2];
                                count++;
                            }
                        }
                    }
                    
                    data.data[index] = r / count;
                    data.data[index + 1] = g / count;
                    data.data[index + 2] = b / count;
                }
            }
        }
        
        this.ctx.putImageData(data, this.spotHealingCenter.x - radius, this.spotHealingCenter.y - radius);
    }

    startMarqueeSelection(x, y) {
        this.selection = {
            type: 'marquee',
            shape: this.currentTool === 'marquee-ellipse' ? 'ellipse' : 'rectangle',
            startX: x,
            startY: y,
            endX: x,
            endY: y
        };
    }

    drawMarqueeSelection(x, y) {
        if (!this.selection) return;
        
        this.selection.endX = x;
        this.selection.endY = y;
        this.drawSelectionOverlay();
    }

    startLassoSelection(x, y) {
        this.selection = {
            type: 'lasso',
            points: [{x: x, y: y}],
            currentX: x,
            currentY: y
        };
    }

    drawLassoSelection(x, y) {
        if (!this.selection) return;
        
        this.selection.points.push({x: x, y: y});
        this.selection.currentX = x;
        this.selection.currentY = y;
        this.drawSelectionOverlay();
    }

    startPolygonalLasso(x, y) {
        if (!this.selection) {
            this.selection = {
                type: 'polygonal-lasso',
                points: [{x: x, y: y}],
                currentX: x,
                currentY: y
            };
        } else {
            this.selection.points.push({x: x, y: y});
        }
    }

    drawPolygonalLasso(x, y) {
        if (!this.selection) return;
        
        this.selection.currentX = x;
        this.selection.currentY = y;
        this.drawSelectionOverlay();
    }

    startMagneticLasso(x, y) {
        this.selection = {
            type: 'magnetic-lasso',
            points: [{x: x, y: y}],
            currentX: x,
            currentY: y
        };
    }

    drawMagneticLasso(x, y) {
        if (!this.selection) return;
        
        // Detect edges and snap to them
        const edgePoint = this.detectEdge(x, y);
        this.selection.points.push(edgePoint);
        this.selection.currentX = edgePoint.x;
        this.selection.currentY = edgePoint.y;
        this.drawSelectionOverlay();
    }

    detectEdge(x, y) {
        // Simplified edge detection
        const data = this.ctx.getImageData(x - 5, y - 5, 10, 10);
        let maxGradient = 0;
        let edgePoint = {x: x, y: y};
        
        for (let dy = 0; dy < 10; dy++) {
            for (let dx = 0; dx < 10; dx++) {
                const index = (dy * 10 + dx) * 4;
                const r = data.data[index];
                const g = data.data[index + 1];
                const b = data.data[index + 2];
                
                // Calculate gradient (simplified)
                let gradient = 0;
                if (dx > 0) {
                    const prevIndex = (dy * 10 + (dx - 1)) * 4;
                    gradient += Math.abs(r - data.data[prevIndex]);
                    gradient += Math.abs(g - data.data[prevIndex + 1]);
                    gradient += Math.abs(b - data.data[prevIndex + 2]);
                }
                
                if (gradient > maxGradient) {
                    maxGradient = gradient;
                    edgePoint = {x: x - 5 + dx, y: y - 5 + dy};
                }
            }
        }
        
        return edgePoint;
    }

    startQuickSelection(x, y) {
        this.selection = {
            type: 'quick-selection',
            centerX: x,
            centerY: y,
            radius: 0
        };
    }

    drawQuickSelection(x, y) {
        if (!this.selection) return;
        
        const dx = x - this.selection.centerX;
        const dy = y - this.selection.centerY;
        this.selection.radius = Math.sqrt(dx * dx + dy * dy);
        this.drawSelectionOverlay();
    }

    startMagicWand(x, y) {
        this.selection = {
            type: 'magic-wand',
            centerX: x,
            centerY: y,
            tolerance: 32
        };
        this.performMagicWand();
    }

    performMagicWand() {
        if (!this.selection) return;
        
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const targetColor = this.getPixelColor(data, this.selection.centerX, this.selection.centerY, this.canvas.width);
        const selectedPixels = new Set();
        const pixelsToCheck = [{x: this.selection.centerX, y: this.selection.centerY}];
        
        while (pixelsToCheck.length > 0) {
            const pixel = pixelsToCheck.pop();
            const key = `${pixel.x},${pixel.y}`;
            
            if (selectedPixels.has(key)) continue;
            selectedPixels.add(key);
            
            // Check neighboring pixels
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    
                    const nx = pixel.x + dx;
                    const ny = pixel.y + dy;
                    
                    if (nx >= 0 && nx < this.canvas.width && ny >= 0 && ny < this.canvas.height) {
                        const neighborKey = `${nx},${ny}`;
                        if (!selectedPixels.has(neighborKey)) {
                            const neighborColor = this.getPixelColor(data, nx, ny, this.canvas.width);
                            if (this.colorDistance(targetColor, neighborColor) < this.selection.tolerance) {
                                pixelsToCheck.push({x: nx, y: ny});
                            }
                        }
                    }
                }
            }
        }
        
        this.selection.pixels = Array.from(selectedPixels);
        this.drawSelectionOverlay();
    }

    getPixelColor(data, x, y, width) {
        const index = (Math.floor(y) * width + Math.floor(x)) * 4;
        return {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3]
        };
    }

    colorDistance(color1, color2) {
        const dr = color1.r - color2.r;
        const dg = color1.g - color2.g;
        const db = color1.b - color2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    startShape(x, y) {
        this.selection = {
            type: 'shape',
            shape: this.currentTool === 'ellipse' ? 'ellipse' : 'rectangle',
            startX: x,
            startY: y,
            endX: x,
            endY: y
        };
    }

    drawShape(x, y) {
        if (!this.selection) return;
        
        this.selection.endX = x;
        this.selection.endY = y;
        this.drawShapeOverlay();
    }

    startPenTool(x, y) {
        this.selection = {
            type: 'pen',
            points: [{x: x, y: y}],
            currentX: x,
            currentY: y
        };
    }

    drawPenTool(x, y) {
        if (!this.selection) return;
        
        this.selection.points.push({x: x, y: y});
        this.selection.currentX = x;
        this.selection.currentY = y;
        this.drawPenOverlay();
    }

    startGradient(x, y) {
        this.selection = {
            type: 'gradient',
            startX: x,
            startY: y,
            endX: x,
            endY: y
        };
    }

    drawGradient(x, y) {
        if (!this.selection) return;
        
        this.selection.endX = x;
        this.selection.endY = y;
        this.drawGradientOverlay();
    }

    startPaintBucket(x, y) {
        this.performPaintBucket(x, y);
    }

    performPaintBucket(x, y) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const targetColor = this.getPixelColor(data, x, y, this.canvas.width);
        const fillColor = this.hexToRgb(this.foregroundColor);
        
        if (this.colorDistance(targetColor, fillColor) < 5) return;
        
        const pixelsToFill = new Set();
        const pixelsToCheck = [{x: Math.floor(x), y: Math.floor(y)}];
        
        while (pixelsToCheck.length > 0) {
            const pixel = pixelsToCheck.pop();
            const key = `${pixel.x},${pixel.y}`;
            
            if (pixelsToFill.has(key)) continue;
            pixelsToFill.add(key);
            
            // Fill the pixel
            const index = (pixel.y * this.canvas.width + pixel.x) * 4;
            data[index] = fillColor.r;
            data[index + 1] = fillColor.g;
            data[index + 2] = fillColor.b;
            data[index + 3] = 255;
            
            // Check neighboring pixels
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    
                    const nx = pixel.x + dx;
                    const ny = pixel.y + dy;
                    
                    if (nx >= 0 && nx < this.canvas.width && ny >= 0 && ny < this.canvas.height) {
                        const neighborKey = `${nx},${ny}`;
                        if (!pixelsToFill.has(neighborKey)) {
                            const neighborColor = this.getPixelColor(data, nx, ny, this.canvas.width);
                            if (this.colorDistance(targetColor, neighborColor) < 32) {
                                pixelsToCheck.push({x: nx, y: ny});
                            }
                        }
                    }
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    startRetouching(x, y) {
        this.retouchingStart = {x: x, y: y};
    }

    drawRetouching(x, y) {
        if (!this.retouchingStart) return;
        
        const radius = this.brushSize / 2;
        const imageData = this.ctx.getImageData(
            x - radius,
            y - radius,
            radius * 2,
            radius * 2
        );
        
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            switch (this.currentTool) {
                case 'blur':
                    // Apply blur effect
                    data[i] = data[i] * 0.8;
                    data[i + 1] = data[i + 1] * 0.8;
                    data[i + 2] = data[i + 2] * 0.8;
                    break;
                case 'sharpen':
                    // Apply sharpen effect
                    data[i] = Math.min(255, data[i] * 1.2);
                    data[i + 1] = Math.min(255, data[i + 1] * 1.2);
                    data[i + 2] = Math.min(255, data[i + 2] * 1.2);
                    break;
                case 'smudge':
                    // Apply smudge effect (simplified)
                    data[i] = data[i] * 0.9 + Math.random() * 25;
                    data[i + 1] = data[i + 1] * 0.9 + Math.random() * 25;
                    data[i + 2] = data[i + 2] * 0.9 + Math.random() * 25;
                    break;
            }
        }
        
        this.ctx.putImageData(imageData, x - radius, y - radius);
    }

    startDodgeBurn(x, y) {
        this.dodgeBurnStart = {x: x, y: y};
    }

    drawDodgeBurn(x, y) {
        if (!this.dodgeBurnStart) return;
        
        const radius = this.brushSize / 2;
        const imageData = this.ctx.getImageData(
            x - radius,
            y - radius,
            radius * 2,
            radius * 2
        );
        
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            switch (this.currentTool) {
                case 'dodge':
                    // Lighten pixels
                    data[i] = Math.min(255, data[i] * 1.3);
                    data[i + 1] = Math.min(255, data[i + 1] * 1.3);
                    data[i + 2] = Math.min(255, data[i + 2] * 1.3);
                    break;
                case 'burn':
                    // Darken pixels
                    data[i] = data[i] * 0.7;
                    data[i + 1] = data[i + 1] * 0.7;
                    data[i + 2] = data[i + 2] * 0.7;
                    break;
                case 'sponge':
                    // Saturate/desaturate
                    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    data[i] = data[i] * 0.5 + gray * 0.5;
                    data[i + 1] = data[i + 1] * 0.5 + gray * 0.5;
                    data[i + 2] = data[i + 2] * 0.5 + gray * 0.5;
                    break;
            }
        }
        
        this.ctx.putImageData(imageData, x - radius, y - radius);
    }

    startCrop(x, y) {
        this.selection = {
            type: 'crop',
            startX: x,
            startY: y,
            endX: x,
            endY: y
        };
    }

    drawCrop(x, y) {
        if (!this.selection) return;
        
        this.selection.endX = x;
        this.selection.endY = y;
        this.drawCropOverlay();
    }

    startHandTool(x, y) {
        this.handStart = {x: x, y: y};
    }

    drawHandTool(x, y) {
        if (!this.handStart) return;
        
        const dx = x - this.handStart.x;
        const dy = y - this.handStart.y;
        
        this.panX += dx;
        this.panY += dy;
        this.handStart = {x: x, y: y};
        this.updateCanvasTransform();
    }

    startZoomTool(x, y) {
        this.performZoom(x, y);
    }

    performZoom(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x * this.zoom;
        const canvasY = y * this.zoom;
        
        if (this.zoom < 2) {
            this.zoom = 2;
        } else {
            this.zoom = 0.5;
        }
        
        this.updateCanvasTransform();
        this.updateZoomDisplay();
    }

    // Utility methods
    selectTool(tool) {
        const toolBtn = document.querySelector(`[data-tool="${tool}"]`);
        if (toolBtn) {
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
            toolBtn.classList.add('active');
            this.currentTool = tool;
            this.updateCursor();
            this.updateToolOptions();
            this.updateToolInfo();
        }
    }

    temporarilySelectTool(tool) {
        this.previousTool = this.currentTool;
        this.selectTool(tool);
    }

    updateCursor() {
        const cursors = {
            'move': 'move',
            'brush': 'crosshair',
            'pencil': 'crosshair',
            'eraser': 'crosshair',
            'clone-stamp': 'crosshair',
            'healing': 'crosshair',
            'spot-healing': 'crosshair',
            'eyedropper': 'crosshair',
            'marquee-rect': 'crosshair',
            'marquee-ellipse': 'crosshair',
            'lasso': 'crosshair',
            'polygonal-lasso': 'crosshair',
            'magnetic-lasso': 'crosshair',
            'quick-selection': 'crosshair',
            'magic-wand': 'crosshair',
            'type': 'text',
            'rectangle': 'crosshair',
            'ellipse': 'crosshair',
            'pen': 'crosshair',
            'gradient': 'crosshair',
            'paint-bucket': 'crosshair',
            'blur': 'crosshair',
            'sharpen': 'crosshair',
            'smudge': 'crosshair',
            'dodge': 'crosshair',
            'burn': 'crosshair',
            'sponge': 'crosshair',
            'crop': 'crosshair',
            'hand': 'grab',
            'zoom': 'zoom-in'
        };
        
        this.canvas.style.cursor = cursors[this.currentTool] || 'default';
    }

    updateToolOptions() {
        const toolOptions = document.getElementById('toolOptions');
        toolOptions.innerHTML = '';
        
        switch (this.currentTool) {
            case 'brush':
            case 'pencil':
            case 'eraser':
                this.createBrushOptions(toolOptions);
                break;
            case 'clone-stamp':
            case 'healing':
            case 'spot-healing':
                this.createCloneOptions(toolOptions);
                break;
            case 'marquee-rect':
            case 'marquee-ellipse':
                this.createMarqueeOptions(toolOptions);
                break;
            case 'lasso':
            case 'polygonal-lasso':
            case 'magnetic-lasso':
                this.createLassoOptions(toolOptions);
                break;
            case 'quick-selection':
            case 'magic-wand':
                this.createSelectionOptions(toolOptions);
                break;
            case 'gradient':
                this.createGradientOptions(toolOptions);
                break;
            case 'blur':
            case 'sharpen':
            case 'smudge':
            case 'dodge':
            case 'burn':
            case 'sponge':
                this.createRetouchingOptions(toolOptions);
                break;
            case 'type':
                this.createTypeOptions(toolOptions);
                break;
            case 'rectangle':
            case 'ellipse':
                this.createShapeOptions(toolOptions);
                break;
            case 'crop':
                this.createCropOptions(toolOptions);
                break;
        }
    }

    createBrushOptions(container) {
        const options = document.createElement('div');
        options.className = 'brush-options';
        options.innerHTML = `
            <div class="size-slider">
                <label>Size:</label>
                <input type="range" min="1" max="100" value="${this.brushSize}" id="brushSizeSlider">
                <span id="brushSizeValue">${this.brushSize}px</span>
            </div>
            <div class="hardness-slider">
                <label>Hardness:</label>
                <input type="range" min="0" max="100" value="${this.brushHardness}" id="brushHardnessSlider">
                <span id="brushHardnessValue">${this.brushHardness}%</span>
            </div>
            <div class="opacity-slider">
                <label>Opacity:</label>
                <input type="range" min="0" max="100" value="${this.brushOpacity}" id="brushOpacitySlider">
                <span id="brushOpacityValue">${this.brushOpacity}%</span>
            </div>
        `;
        
        container.appendChild(options);
        
        // Add event listeners
        document.getElementById('brushSizeSlider').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('brushSizeValue').textContent = this.brushSize + 'px';
        });
        
        document.getElementById('brushHardnessSlider').addEventListener('input', (e) => {
            this.brushHardness = parseInt(e.target.value);
            document.getElementById('brushHardnessValue').textContent = this.brushHardness + '%';
        });
        
        document.getElementById('brushOpacitySlider').addEventListener('input', (e) => {
            this.brushOpacity = parseInt(e.target.value);
            document.getElementById('brushOpacityValue').textContent = this.brushOpacity + '%';
        });
    }

    createCloneOptions(container) {
        const options = document.createElement('div');
        options.className = 'clone-options';
        options.innerHTML = `
            <div class="size-slider">
                <label>Size:</label>
                <input type="range" min="1" max="100" value="${this.brushSize}" id="cloneSizeSlider">
                <span id="cloneSizeValue">${this.brushSize}px</span>
            </div>
            <div class="opacity-slider">
                <label>Opacity:</label>
                <input type="range" min="0" max="100" value="${this.brushOpacity}" id="cloneOpacitySlider">
                <span id="cloneOpacityValue">${this.brushOpacity}%</span>
            </div>
            <div class="aligned">
                <label>
                    <input type="checkbox" id="cloneAligned"> Aligned
                </label>
            </div>
            <div class="sample">
                <label>Sample:</label>
                <select id="cloneSample">
                    <option value="current">Current Layer</option>
                    <option value="all">All Layers</option>
                </select>
            </div>
        `;
        
        container.appendChild(options);
        
        // Add event listeners
        document.getElementById('cloneSizeSlider').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('cloneSizeValue').textContent = this.brushSize + 'px';
        });
        
        document.getElementById('cloneOpacitySlider').addEventListener('input', (e) => {
            this.brushOpacity = parseInt(e.target.value);
            document.getElementById('cloneOpacityValue').textContent = this.brushOpacity + '%';
        });
    }

    createMarqueeOptions(container) {
        const options = document.createElement('div');
        options.className = 'marquee-options';
        options.innerHTML = `
            <div class="style">
                <label>Style:</label>
                <select id="marqueeStyle">
                    <option value="normal">Normal</option>
                    <option value="fixed-ratio">Fixed Ratio</option>
                    <option value="fixed-size">Fixed Size</option>
                </select>
            </div>
            <div class="width-height">
                <label>W:</label>
                <input type="number" id="marqueeWidth" value="100">
                <label>H:</label>
                <input type="number" id="marqueeHeight" value="100">
            </div>
            <div class="feather">
                <label>Feather:</label>
                <input type="number" id="marqueeFeather" value="0" min="0" max="250">
            </div>
            <div class="anti-alias">
                <label>
                    <input type="checkbox" id="marqueeAntiAlias" checked> Anti-alias
                </label>
            </div>
        `;
        
        container.appendChild(options);
    }

    createLassoOptions(container) {
        const options = document.createElement('div');
        options.className = 'lasso-options';
        options.innerHTML = `
            <div class="feather">
                <label>Feather:</label>
                <input type="number" id="lassoFeather" value="0" min="0" max="250">
            </div>
            <div class="anti-alias">
                <label>
                    <input type="checkbox" id="lassoAntiAlias" checked> Anti-alias
                </label>
            </div>
        `;
        
        container.appendChild(options);
    }

    createSelectionOptions(container) {
        const options = document.createElement('div');
        options.className = 'selection-options';
        options.innerHTML = `
            <div class="selection-type">
                <label>Selection Type:</label>
                <select id="selectionType">
                    <option value="new">New</option>
                    <option value="add">Add to selection</option>
                    <option value="subtract">Subtract from selection</option>
                    <option value="intersect">Intersect with selection</option>
                </select>
            </div>
        `;
        
        if (this.currentTool === 'magic-wand') {
            options.innerHTML += `
                <div class="tolerance">
                    <label>Tolerance:</label>
                    <input type="range" min="0" max="255" value="32" id="magicWandTolerance">
                    <span id="magicWandToleranceValue">32</span>
                </div>
                <div class="anti-alias">
                    <label>
                        <input type="checkbox" id="magicWandAntiAlias" checked> Anti-alias
                    </label>
                </div>
                <div class="contiguous">
                    <label>
                        <input type="checkbox" id="magicWandContiguous" checked> Contiguous
                    </label>
                </div>
                <div class="sample-all-layers">
                    <label>
                        <input type="checkbox" id="magicWandSampleAll"> Sample All Layers
                    </label>
                </div>
            `;
            
            // Add event listener for tolerance
            setTimeout(() => {
                const toleranceSlider = document.getElementById('magicWandTolerance');
                const toleranceValue = document.getElementById('magicWandToleranceValue');
                
                toleranceSlider.addEventListener('input', (e) => {
                    toleranceValue.textContent = e.target.value;
                    if (this.selection && this.selection.type === 'magic-wand') {
                        this.selection.tolerance = parseInt(e.target.value);
                    }
                });
            }, 0);
        }
        
        container.appendChild(options);
    }

    createGradientOptions(container) {
        const options = document.createElement('div');
        options.className = 'gradient-options';
        options.innerHTML = `
            <div class="gradient-picker">
                <label>Gradient:</label>
                <div class="gradient-preview" id="gradientPreview"></div>
                <button id="editGradient">Edit...</button>
            </div>
            <div class="gradient-style">
                <label>Style:</label>
                <select id="gradientStyle">
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                    <option value="angle">Angle</option>
                    <option value="reflected">Reflected</option>
                    <option value="diamond">Diamond</option>
                </select>
            </div>
            <div class="reverse">
                <label>
                    <input type="checkbox" id="gradientReverse"> Reverse
                </label>
            </div>
            <div class="dither">
                <label>
                    <input type="checkbox" id="gradientDither"> Dither
                </label>
            </div>
            <div class="transparency">
                <label>
                    <input type="checkbox" id="gradientTransparency" checked> Transparency
                </label>
            </div>
        `;
        
        container.appendChild(options);
    }

    createRetouchingOptions(container) {
        const options = document.createElement('div');
        options.className = 'retouching-options';
        options.innerHTML = `
            <div class="size-slider">
                <label>Size:</label>
                <input type="range" min="1" max="100" value="${this.brushSize}" id="retouchSizeSlider">
                <span id="retouchSizeValue">${this.brushSize}px</span>
            </div>
            <div class="hardness-slider">
                <label>Hardness:</label>
                <input type="range" min="0" max="100" value="${this.brushHardness}" id="retouchHardnessSlider">
                <span id="retouchHardnessValue">${this.brushHardness}%</span>
            </div>
        `;
        
        if (this.currentTool === 'dodge' || this.currentTool === 'burn') {
            options.innerHTML += `
                <div class="range">
                    <label>Range:</label>
                    <select id="dodgeBurnRange">
                        <option value="midtones">Midtones</option>
                        <option value="shadows">Shadows</option>
                        <option value="highlights">Highlights</option>
                    </select>
                </div>
                <div class="exposure">
                    <label>Exposure:</label>
                    <input type="range" min="0" max="100" value="50" id="dodgeBurnExposure">
                    <span id="dodgeBurnExposureValue">50%</span>
                </div>
            `;
        }
        
        container.appendChild(options);
        
        // Add event listeners
        document.getElementById('retouchSizeSlider').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('retouchSizeValue').textContent = this.brushSize + 'px';
        });
        
        document.getElementById('retouchHardnessSlider').addEventListener('input', (e) => {
            this.brushHardness = parseInt(e.target.value);
            document.getElementById('retouchHardnessValue').textContent = this.brushHardness + '%';
        });
    }

    createTypeOptions(container) {
        const options = document.createElement('div');
        options.className = 'type-options';
        options.innerHTML = `
            <div class="font-family">
                <label>Font:</label>
                <select id="fontFamily">
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Palatino">Palatino</option>
                    <option value="Garamond">Garamond</option>
                    <option value="Bookman">Bookman</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Trebuchet MS">Trebuchet MS</option>
                    <option value="Arial Black">Arial Black</option>
                    <option value="Impact">Impact</option>
                </select>
            </div>
            <div class="font-style">
                <label>Style:</label>
                <select id="fontStyle">
                    <option value="regular">Regular</option>
                    <option value="bold">Bold</option>
                    <option value="italic">Italic</option>
                    <option value="bold-italic">Bold Italic</option>
                </select>
            </div>
            <div class="font-size">
                <label>Size:</label>
                <input type="number" id="fontSize" value="12" min="6" max="1296">
                <select id="fontSizeUnit">
                    <option value="px">px</option>
                    <option value="pt">pt</option>
                </select>
            </div>
            <div class="text-align">
                <button id="alignLeft">Left</button>
                <button id="alignCenter">Center</button>
                <button id="alignRight">Right</button>
                <button id="alignJustify">Justify</button>
            </div>
            <div class="text-color">
                <label>Color:</label>
                <input type="color" id="textColor" value="${this.foregroundColor}">
            </div>
            <div class="text-options">
                <button id="textBold">B</button>
                <button id="textItalic">I</button>
                <button id="textUnderline">U</button>
                <button id="textStrike">S</button>
            </div>
        `;
        
        container.appendChild(options);
    }

    createShapeOptions(container) {
        const options = document.createElement('div');
        options.className = 'shape-options';
        options.innerHTML = `
            <div class="shape-tool">
                <label>Tool:</label>
                <select id="shapeTool">
                    <option value="shape">Shape</option>
                    <option value="path">Path</option>
                    <option value="pixels">Pixels</option>
                </select>
            </div>
            <div class="fill-color">
                <label>Fill:</label>
                <input type="color" id="shapeFillColor" value="${this.foregroundColor}">
                <button id="noFill">No Fill</button>
            </div>
            <div class="stroke-color">
                <label>Stroke:</label>
                <input type="color" id="shapeStrokeColor" value="#000000">
                <input type="number" id="strokeWidth" value="1" min="0" max="1000">
                <button id="noStroke">No Stroke</button>
            </div>
            <div class="width-height">
                <label>W:</label>
                <input type="number" id="shapeWidth" value="100">
                <label>H:</label>
                <input type="number" id="shapeHeight" value="100">
            </div>
            <div class="from-center">
                <label>
                    <input type="checkbox" id="shapeFromCenter"> From Center
                </label>
            </div>
        `;
        
        container.appendChild(options);
    }

    createCropOptions(container) {
        const options = document.createElement('div');
        options.className = 'crop-options';
        options.innerHTML = `
            <div class="ratio">
                <label>Ratio:</label>
                <select id="cropRatio">
                    <option value="original">Original</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:3">4:3</option>
                    <option value="3:2">3:2</option>
                    <option value="16:9">16:9</option>
                    <option value="free">Free</option>
                </select>
            </div>
            <div class="width-height">
                <label>W:</label>
                <input type="number" id="cropWidth" value="${this.canvas.width}">
                <label>H:</label>
                <input type="number" id="cropHeight" value="${this.canvas.height}">
                <label>Resolution:</label>
                <input type="number" id="cropResolution" value="72">
            </div>
            <div class="crop-options-buttons">
                <button id="cropStraighten">Straighten</button>
                <button id="cropOverlay">Overlay</button>
                <button id="cropGrid">Grid</button>
            </div>
            <div class="delete-cropped">
                <label>
                    <input type="checkbox" id="deleteCropped"> Delete Cropped Pixels
                </label>
            </div>
            <div class="crop-actions">
                <button id="cropApply">Apply</button>
                <button id="cropCancel">Cancel</button>
            </div>
        `;
        
        container.appendChild(options);
    }

    updateToolInfo() {
        const toolNames = {
            'move': 'Move Tool (V)',
            'marquee-rect': 'Rectangular Marquee Tool (M)',
            'marquee-ellipse': 'Elliptical Marquee Tool (M)',
            'lasso': 'Lasso Tool (L)',
            'polygonal-lasso': 'Polygonal Lasso Tool (L)',
            'magnetic-lasso': 'Magnetic Lasso Tool (L)',
            'quick-selection': 'Quick Selection Tool (W)',
            'magic-wand': 'Magic Wand Tool (W)',
            'object-selection': 'Object Selection Tool (W)',
            'crop': 'Crop Tool (C)',
            'slice': 'Slice Tool (C)',
            'perspective-crop': 'Perspective Crop Tool (C)',
            'eyedropper': 'Eyedropper Tool (I)',
            'color-sampler': 'Color Sampler Tool (I)',
            'ruler': 'Ruler Tool (I)',
            'note': 'Note Tool (I)',
            'spot-healing': 'Spot Healing Brush Tool (J)',
            'healing': 'Healing Brush Tool (J)',
            'patch': 'Patch Tool (J)',
            'content-aware-move': 'Content-Aware Move Tool (J)',
            'red-eye': 'Red Eye Tool (J)',
            'brush': 'Brush Tool (B)',
            'pencil': 'Pencil Tool (B)',
            'color-replacement': 'Color Replacement Tool (B)',
            'mixer-brush': 'Mixer Brush Tool (B)',
            'clone-stamp': 'Clone Stamp Tool (S)',
            'pattern-stamp': 'Pattern Stamp Tool (S)',
            'history-brush': 'History Brush Tool (Y)',
            'art-history-brush': 'Art History Brush Tool (Y)',
            'eraser': 'Eraser Tool (E)',
            'background-eraser': 'Background Eraser Tool (E)',
            'magic-eraser': 'Magic Eraser Tool (E)',
            'gradient': 'Gradient Tool (G)',
            'paint-bucket': 'Paint Bucket Tool (G)',
            '3d-material-drop': '3D Material Drop Tool (G)',
            'blur': 'Blur Tool',
            'sharpen': 'Sharpen Tool',
            'smudge': 'Smudge Tool',
            'dodge': 'Dodge Tool (O)',
            'burn': 'Burn Tool (O)',
            'sponge': 'Sponge Tool (O)',
            'pen': 'Pen Tool (P)',
            'freeform-pen': 'Freeform Pen Tool (P)',
            'curvature-pen': 'Curvature Pen Tool (P)',
            'path-selection': 'Path Selection Tool (A)',
            'direct-selection': 'Direct Selection Tool (A)',
            'type': 'Horizontal Type Tool (T)',
            'type-vertical': 'Vertical Type Tool (T)',
            'type-mask': 'Horizontal Type Mask Tool (T)',
            'type-mask-vertical': 'Vertical Type Mask Tool (T)',
            'rectangle': 'Rectangle Tool (U)',
            'ellipse': 'Ellipse Tool (U)',
            'triangle': 'Triangle Tool (U)',
            'polygon': 'Polygon Tool (U)',
            'line': 'Line Tool (U)',
            'custom-shape': 'Custom Shape Tool (U)',
            'hand': 'Hand Tool (H)',
            'rotate-view': 'Rotate View Tool (R)',
            'zoom': 'Zoom Tool (Z)',
            'artboard': 'Artboard Tool (V)'
        };
        
        document.getElementById('toolInfo').textContent = toolNames[this.currentTool] || '';
    }

    // Layer management
    addLayer() {
        const layerId = this.layers.length;
        const layer = {
            id: layerId,
            name: `Layer ${layerId}`,
            visible: true,
            opacity: 1,
            blendMode: 'normal',
            locked: false,
            imageData: this.ctx.createImageData(this.canvas.width, this.canvas.height),
            thumbnail: null,
            mask: null
        };
        
        this.layers.push(layer);
        this.currentLayer = layerId;
        this.updateLayersPanel();
    }

    deleteLayer() {
        if (this.layers.length > 1 && this.currentLayer >= 0) {
            this.layers.splice(this.currentLayer, 1);
            this.currentLayer = Math.max(0, this.currentLayer - 1);
            this.updateLayersPanel();
            this.redrawCanvas();
        }
    }

    duplicateLayer() {
        if (this.currentLayer >= 0) {
            const sourceLayer = this.layers[this.currentLayer];
            const newLayer = {
                ...sourceLayer,
                id: this.layers.length,
                name: sourceLayer.name + ' copy',
                imageData: new ImageData(
                    new Uint8ClampedArray(sourceLayer.imageData.data),
                    sourceLayer.imageData.width,
                    sourceLayer.imageData.height
                )
            };
            
            this.layers.push(newLayer);
            this.currentLayer = newLayer.id;
            this.updateLayersPanel();
        }
    }

    addLayerMask() {
        if (this.currentLayer >= 0) {
            const layer = this.layers[this.currentLayer];
            if (!layer.mask) {
                layer.mask = {
                    imageData: this.ctx.createImageData(this.canvas.width, this.canvas.height),
                    enabled: true
                };
                this.updateLayersPanel();
            }
        }
    }

    addAdjustmentLayer() {
        // Create adjustment layer
        const adjustmentLayer = {
            id: this.layers.length,
            name: 'Adjustment Layer',
            visible: true,
            opacity: 1,
            blendMode: 'normal',
            locked: false,
            type: 'adjustment',
            adjustment: 'brightness-contrast',
            values: { brightness: 0, contrast: 0 },
            thumbnail: null,
            mask: null
        };
        
        this.layers.push(adjustmentLayer);
        this.currentLayer = adjustmentLayer.id;
        this.updateLayersPanel();
    }

    updateLayersPanel() {
        const layersList = document.getElementById('layersList');
        layersList.innerHTML = '';
        
        // Display layers in reverse order (top to bottom)
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            const layerEl = document.createElement('div');
            layerEl.className = `layer ${i === this.currentLayer ? 'active' : ''}`;
            layerEl.dataset.layer = i;
            
            layerEl.innerHTML = `
                <div class="layer-thumbnail">
                    <canvas width="40" height="40"></canvas>
                </div>
                <div class="layer-info">
                    <input type="text" class="layer-name" value="${layer.name}">
                    <div class="layer-opacity">
                        <input type="range" min="0" max="100" value="${layer.opacity * 100}">
                        <span>${Math.round(layer.opacity * 100)}%</span>
                    </div>
                </div>
                <div class="layer-controls">
                    <button class="layer-visibility ${layer.visible ? 'active' : ''}" title="Visibility">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                    </button>
                    <button class="layer-lock ${layer.locked ? 'active' : ''}" title="Lock">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                    </button>
                </div>
            `;
            
            layerEl.addEventListener('click', () => {
                this.currentLayer = i;
                this.updateLayersPanel();
            });
            
            // Add event listeners for layer controls
            const nameInput = layerEl.querySelector('.layer-name');
            nameInput.addEventListener('change', (e) => {
                layer.name = e.target.value;
            });
            
            const opacitySlider = layerEl.querySelector('.layer-opacity input');
            const opacitySpan = layerEl.querySelector('.layer-opacity span');
            opacitySlider.addEventListener('input', (e) => {
                layer.opacity = e.target.value / 100;
                opacitySpan.textContent = e.target.value + '%';
                this.redrawCanvas();
            });
            
            const visibilityBtn = layerEl.querySelector('.layer-visibility');
            visibilityBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                visibilityBtn.classList.toggle('active');
                this.redrawCanvas();
            });
            
            const lockBtn = layerEl.querySelector('.layer-lock');
            lockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.locked = !layer.locked;
                lockBtn.classList.toggle('active');
            });
            
            layersList.appendChild(layerEl);
        }
        
        // Update blend mode dropdown
        const blendModeSelect = document.getElementById('blendMode');
        if (blendModeSelect && this.currentLayer >= 0) {
            blendModeSelect.value = this.layers[this.currentLayer].blendMode;
            blendModeSelect.addEventListener('change', (e) => {
                this.layers[this.currentLayer].blendMode = e.target.value;
                this.redrawCanvas();
            });
        }
    }

    updateLayerThumbnail() {
        if (this.currentLayer >= 0) {
            const layer = this.layers[this.currentLayer];
            if (layer.imageData) {
                layer.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all visible layers
        this.layers.forEach(layer => {
            if (layer.visible && layer.imageData) {
                this.ctx.save();
                this.ctx.globalAlpha = layer.opacity;
                this.ctx.globalCompositeOperation = this.getBlendMode(layer.blendMode);
                this.ctx.putImageData(layer.imageData, 0, 0);
                this.ctx.restore();
            }
        });
    }

    getBlendMode(mode) {
        const modes = {
            'normal': 'source-over',
            'multiply': 'multiply',
            'screen': 'screen',
            'overlay': 'overlay',
            'soft-light': 'soft-light',
            'hard-light': 'hard-light',
            'color-dodge': 'color-dodge',
            'color-burn': 'color-burn',
            'darken': 'darken',
            'lighten': 'lighten',
            'difference': 'difference',
            'exclusion': 'exclusion',
            'hue': 'hue',
            'saturation': 'saturation',
            'color': 'color',
            'luminosity': 'luminosity'
        };
        
        return modes[mode] || 'source-over';
    }

    // Color management
    pickColor(x, y) {
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
        this.foregroundColor = hex;
        this.updateColorDisplay();
        this.updateColorPanel();
    }

    swapColors() {
        const temp = this.foregroundColor;
        this.foregroundColor = this.backgroundColor;
        this.backgroundColor = temp;
        this.updateColorDisplay();
        this.updateColorPanel();
    }

    resetColors() {
        this.foregroundColor = '#000000';
        this.backgroundColor = '#ffffff';
        this.updateColorDisplay();
        this.updateColorPanel();
    }

    updateColorDisplay() {
        const fgSwatch = document.querySelector('#foregroundColor .color-swatch');
        const bgSwatch = document.querySelector('#backgroundColor .color-swatch');
        
        if (fgSwatch) fgSwatch.style.backgroundColor = this.foregroundColor;
        if (bgSwatch) bgSwatch.style.backgroundColor = this.backgroundColor;
    }

    updateColorPanel() {
        const rgb = this.hexToRgb(this.foregroundColor);
        if (rgb) {
            document.getElementById('redSlider').value = rgb.r;
            document.getElementById('greenSlider').value = rgb.g;
            document.getElementById('blueSlider').value = rgb.b;
            document.getElementById('redValue').value = rgb.r;
            document.getElementById('greenValue').value = rgb.g;
            document.getElementById('blueValue').value = rgb.b;
            document.getElementById('hexColor').value = this.foregroundColor;
        }
    }

    showColorPicker(type) {
        // Create color picker dialog
        const color = type === 'foreground' ? this.foregroundColor : this.backgroundColor;
        const input = document.createElement('input');
        input.type = 'color';
        input.value = color;
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        
        document.body.appendChild(input);
        input.click();
        
        input.addEventListener('change', (e) => {
            if (type === 'foreground') {
                this.foregroundColor = e.target.value;
            } else {
                this.backgroundColor = e.target.value;
            }
            this.updateColorDisplay();
            this.updateColorPanel();
            document.body.removeChild(input);
        });
        
        input.addEventListener('cancel', () => {
            document.body.removeChild(input);
        });
    }

    // Text tool
    addText(x, y) {
        const text = prompt('Enter text:');
        if (text) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = this.foregroundColor;
            this.ctx.font = `${this.brushSize * 2}px Arial`;
            this.ctx.fillText(text, x, y);
            this.ctx.restore();
            this.saveState();
            this.updateLayerThumbnail();
        }
    }

    // Zoom and pan
    zoomCanvas(delta) {
        this.zoom = Math.max(0.1, Math.min(5, this.zoom + delta));
        this.updateCanvasTransform();
        this.updateZoomDisplay();
    }

    setZoom(level) {
        this.zoom = level / 100;
        this.updateCanvasTransform();
        this.updateZoomDisplay();
    }

    updateCanvasTransform() {
        this.canvas.style.transform = `scale(${this.zoom}) translate(${this.panX}px, ${this.panY}px)`;
    }

    updateZoomDisplay() {
        document.getElementById('zoomLevel').textContent = Math.round(this.zoom * 100) + '%';
    }

    // History management
    saveState() {
        this.historyStep++;
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        this.history.push(this.canvas.toDataURL());
        
        // Limit history to 50 states
        if (this.history.length > 50) {
            this.history.shift();
            this.historyStep--;
        }
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

    // File operations
    saveImage() {
        const link = document.createElement('a');
        link.download = 'photoshop-export.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }

    openImage() {
        document.getElementById('fileInput').click();
    }

    newDocument() {
        if (confirm('Create new document? Unsaved changes will be lost.')) {
            this.setupCanvas();
            this.layers = [];
            this.createInitialLayer();
            this.updateUI();
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
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0);
        
        this.updateCanvasSize();
        this.saveState();
        this.updateLayerThumbnail();
    }

    // Drag and drop
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    handleDrop(e) {
        e.preventDefault();
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
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
    }

    // Selection operations
    selectAll() {
        this.selection = {
            type: 'all',
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        };
        this.drawSelectionOverlay();
    }

    deselect() {
        this.selection = null;
        this.clearSelectionOverlay();
    }

    copy() {
        if (this.selection) {
            // Copy selected area to clipboard
            const imageData = this.ctx.getImageData(
                this.selection.x || 0,
                this.selection.y || 0,
                this.selection.width || this.canvas.width,
                this.selection.height || this.canvas.height
            );
            this.clipboard = imageData;
        }
    }

    paste() {
        if (this.clipboard) {
            // Paste from clipboard
            this.ctx.putImageData(this.clipboard, 0, 0);
            this.saveState();
            this.updateLayerThumbnail();
        }
    }

    cut() {
        this.copy();
        if (this.selection) {
            // Clear selected area
            this.ctx.clearRect(
                this.selection.x || 0,
                this.selection.y || 0,
                this.selection.width || this.canvas.width,
                this.selection.height || this.canvas.height
            );
            this.saveState();
            this.updateLayerThumbnail();
        }
    }

    duplicate() {
        this.copy();
        this.paste();
    }

    freeTransform() {
        // Enter free transform mode
        this.transform = {
            active: true,
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        };
        this.drawTransformOverlay();
    }

    // Adjustment functions
    adjustLevels() {
        const brightness = prompt('Enter brightness (-100 to 100):', '0');
        const contrast = prompt('Enter contrast (-100 to 100):', '0');
        
        if (brightness !== null && contrast !== null) {
            const b = parseInt(brightness);
            const c = parseInt(contrast);
            
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            const factor = (259 * (c + 255)) / (255 * (259 - c));
            
            for (let i = 0; i < data.length; i += 4) {
                data[i] = factor * (data[i] - 128) + 128 + b;
                data[i + 1] = factor * (data[i + 1] - 128) + 128 + b;
                data[i + 2] = factor * (data[i + 2] - 128) + 128 + b;
            }
            
            this.ctx.putImageData(imageData, 0, 0);
            this.saveState();
            this.updateLayerThumbnail();
        }
    }

    curves() {
        alert('Curves adjustment - would open curves dialog');
    }

    balance() {
        alert('Color Balance adjustment - would open color balance dialog');
    }

    invert() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
        this.updateLayerThumbnail();
    }

    showHistogram() {
        alert('Histogram - would show histogram panel');
    }

    // Brush size controls
    decreaseBrushSize() {
        this.brushSize = Math.max(1, this.brushSize - 1);
        this.updateBrushSizeDisplay();
    }

    increaseBrushSize() {
        this.brushSize = Math.min(100, this.brushSize + 1);
        this.updateBrushSizeDisplay();
    }

    updateBrushSizeDisplay() {
        const sizeSlider = document.getElementById('brushSizeSlider');
        const sizeValue = document.getElementById('brushSizeValue');
        
        if (sizeSlider) sizeSlider.value = this.brushSize;
        if (sizeValue) sizeValue.textContent = this.brushSize + 'px';
    }

    // Overlay drawing methods
    drawSelectionOverlay() {
        this.clearSelectionOverlay();
        
        if (!this.selection) return;
        
        const overlay = document.getElementById('canvasOverlay');
        const ctx = overlay.getContext('2d');
        
        overlay.width = this.canvas.width;
        overlay.height = this.canvas.height;
        
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        switch (this.selection.type) {
            case 'marquee':
                if (this.selection.shape === 'rectangle') {
                    ctx.strokeRect(
                        this.selection.startX,
                        this.selection.startY,
                        this.selection.endX - this.selection.startX,
                        this.selection.endY - this.selection.startY
                    );
                } else {
                    // Draw ellipse
                    const centerX = (this.selection.startX + this.selection.endX) / 2;
                    const centerY = (this.selection.startY + this.selection.endY) / 2;
                    const radiusX = Math.abs(this.selection.endX - this.selection.startX) / 2;
                    const radiusY = Math.abs(this.selection.endY - this.selection.startY) / 2;
                    
                    ctx.beginPath();
                    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                break;
                
            case 'lasso':
                if (this.selection.points && this.selection.points.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(this.selection.points[0].x, this.selection.points[0].y);
                    
                    for (let i = 1; i < this.selection.points.length; i++) {
                        ctx.lineTo(this.selection.points[i].x, this.selection.points[i].y);
                    }
                    
                    ctx.closePath();
                    ctx.stroke();
                }
                break;
                
            case 'quick-selection':
                if (this.selection.centerX && this.selection.centerY && this.selection.radius) {
                    ctx.beginPath();
                    ctx.arc(this.selection.centerX, this.selection.centerY, this.selection.radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                break;
        }
    }

    drawShapeOverlay() {
        this.clearSelectionOverlay();
        
        if (!this.selection) return;
        
        const overlay = document.getElementById('canvasOverlay');
        const ctx = overlay.getContext('2d');
        
        overlay.width = this.canvas.width;
        overlay.height = this.canvas.height;
        
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        if (this.selection.shape === 'rectangle') {
            ctx.strokeRect(
                this.selection.startX,
                this.selection.startY,
                this.selection.endX - this.selection.startX,
                this.selection.endY - this.selection.startY
            );
        } else {
            // Draw ellipse
            const centerX = (this.selection.startX + this.selection.endX) / 2;
            const centerY = (this.selection.startY + this.selection.endY) / 2;
            const radiusX = Math.abs(this.selection.endX - this.selection.startX) / 2;
            const radiusY = Math.abs(this.selection.endY - this.selection.startY) / 2;
            
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    drawPenOverlay() {
        this.clearSelectionOverlay();
        
        if (!this.selection) return;
        
        const overlay = document.getElementById('canvasOverlay');
        const ctx = overlay.getContext('2d');
        
        overlay.width = this.canvas.width;
        overlay.height = this.canvas.height;
        
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        if (this.selection.points && this.selection.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.selection.points[0].x, this.selection.points[0].y);
            
            for (let i = 1; i < this.selection.points.length; i++) {
                ctx.lineTo(this.selection.points[i].x, this.selection.points[i].y);
            }
            
            ctx.stroke();
        }
    }

    drawGradientOverlay() {
        this.clearSelectionOverlay();
        
        if (!this.selection) return;
        
        const overlay = document.getElementById('canvasOverlay');
        const ctx = overlay.getContext('2d');
        
        overlay.width = this.canvas.width;
        overlay.height = this.canvas.height;
        
        // Draw gradient line
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(this.selection.startX, this.selection.startY);
        ctx.lineTo(this.selection.endX, this.selection.endY);
        ctx.stroke();
        
        // Draw gradient preview
        const gradient = ctx.createLinearGradient(
            this.selection.startX,
            this.selection.startY,
            this.selection.endX,
            this.selection.endY
        );
        gradient.addColorStop(0, this.foregroundColor);
        gradient.addColorStop(1, this.backgroundColor);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20;
        ctx.globalAlpha = 0.5;
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.moveTo(this.selection.startX, this.selection.startY);
        ctx.lineTo(this.selection.endX, this.selection.endY);
        ctx.stroke();
    }

    drawCropOverlay() {
        this.clearSelectionOverlay();
        
        if (!this.selection) return;
        
        const overlay = document.getElementById('canvasOverlay');
        const ctx = overlay.getContext('2d');
        
        overlay.width = this.canvas.width;
        overlay.height = this.canvas.height;
        
        // Draw crop area
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        ctx.strokeRect(
            this.selection.startX,
            this.selection.startY,
            this.selection.endX - this.selection.startX,
            this.selection.endY - this.selection.startY
        );
        
        // Draw crop handles
        const handleSize = 8;
        const handles = [
            {x: this.selection.startX, y: this.selection.startY},
            {x: this.selection.endX, y: this.selection.startY},
            {x: this.selection.startX, y: this.selection.endY},
            {x: this.selection.endX, y: this.selection.endY},
            {x: (this.selection.startX + this.selection.endX) / 2, y: this.selection.startY},
            {x: (this.selection.startX + this.selection.endX) / 2, y: this.selection.endY},
            {x: this.selection.startX, y: (this.selection.startY + this.selection.endY) / 2},
            {x: this.selection.endX, y: (this.selection.startY + this.selection.endY) / 2}
        ];
        
        ctx.fillStyle = '#007acc';
        ctx.setLineDash([]);
        
        handles.forEach(handle => {
            ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
        
        // Draw dimmed areas outside crop
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        
        // Top
        ctx.fillRect(0, 0, this.canvas.width, this.selection.startY);
        // Bottom
        ctx.fillRect(0, this.selection.endY, this.canvas.width, this.canvas.height - this.selection.endY);
        // Left
        ctx.fillRect(0, this.selection.startY, this.selection.startX, this.selection.endY - this.selection.startY);
        // Right
        ctx.fillRect(this.selection.endX, this.selection.startY, this.canvas.width - this.selection.endX, this.selection.endY - this.selection.startY);
    }

    drawTransformOverlay() {
        this.clearSelectionOverlay();
        
        if (!this.transform) return;
        
        const overlay = document.getElementById('canvasOverlay');
        const ctx = overlay.getContext('2d');
        
        overlay.width = this.canvas.width;
        overlay.height = this.canvas.height;
        
        // Draw transform box
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        ctx.strokeRect(
            this.transform.x,
            this.transform.y,
            this.transform.width,
            this.transform.height
        );
        
        // Draw transform handles
        const handleSize = 8;
        const handles = [
            {x: this.transform.x, y: this.transform.y},
            {x: this.transform.x + this.transform.width, y: this.transform.y},
            {x: this.transform.x, y: this.transform.y + this.transform.height},
            {x: this.transform.x + this.transform.width, y: this.transform.y + this.transform.height},
            {x: this.transform.x + this.transform.width / 2, y: this.transform.y},
            {x: this.transform.x + this.transform.width / 2, y: this.transform.y + this.transform.height},
            {x: this.transform.x, y: this.transform.y + this.transform.height / 2},
            {x: this.transform.x + this.transform.width, y: this.transform.y + this.transform.height / 2}
        ];
        
        ctx.fillStyle = '#007acc';
        ctx.setLineDash([]);
        
        handles.forEach(handle => {
            ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
    }

    clearSelectionOverlay() {
        const overlay = document.getElementById('canvasOverlay');
        const ctx = overlay.getContext('2d');
        ctx.clearRect(0, 0, overlay.width, overlay.height);
    }

    finalizeSelection() {
        // Finalize the current selection
        if (this.selection) {
            // Convert selection to a proper format
            if (this.selection.type === 'marquee') {
                this.selection = {
                    type: 'rect',
                    x: Math.min(this.selection.startX, this.selection.endX),
                    y: Math.min(this.selection.startY, this.selection.endY),
                    width: Math.abs(this.selection.endX - this.selection.startX),
                    height: Math.abs(this.selection.endY - this.selection.startY)
                };
            }
        }
    }

    // UI updates
    updateUI() {
        this.updateCanvasSize();
        this.updateToolInfo();
        this.updateCursor();
        this.updateZoomDisplay();
    }

    updateCanvasSize() {
        document.getElementById('docSize').textContent = `${this.canvas.width} × ${this.canvas.height}`;
    }

    handleResize() {
        // Handle window resize
        this.updateCanvasTransform();
    }

    handleContextMenu(e) {
        e.preventDefault();
        // Show context menu
        this.showContextMenu(e.clientX, e.clientY);
    }

    showContextMenu(x, y) {
        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        
        const items = [
            'Copy',
            'Paste',
            'Cut',
            'Select All',
            'Deselect',
            'Free Transform',
            'Rotate 90° CW',
            'Rotate 90° CCW',
            'Flip Horizontal',
            'Flip Vertical'
        ];
        
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item;
            menuItem.addEventListener('click', () => {
                this.handleContextMenuAction(item);
                document.body.removeChild(menu);
            });
            menu.appendChild(menuItem);
        });
        
        document.body.appendChild(menu);
        
        // Remove menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removeMenu() {
                if (document.body.contains(menu)) {
                    document.body.removeChild(menu);
                }
                document.removeEventListener('click', removeMenu);
            });
        }, 0);
    }

    handleContextMenuAction(action) {
        switch (action) {
            case 'Copy':
                this.copy();
                break;
            case 'Paste':
                this.paste();
                break;
            case 'Cut':
                this.cut();
                break;
            case 'Select All':
                this.selectAll();
                break;
            case 'Deselect':
                this.deselect();
                break;
            case 'Free Transform':
                this.freeTransform();
                break;
            case 'Rotate 90° CW':
                this.rotateCanvas(90);
                break;
            case 'Rotate 90° CCW':
                this.rotateCanvas(-90);
                break;
            case 'Flip Horizontal':
                this.flipCanvas('horizontal');
                break;
            case 'Flip Vertical':
                this.flipCanvas('vertical');
                break;
        }
    }

    rotateCanvas(degrees) {
        const radians = degrees * Math.PI / 180;
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate new dimensions
        const newWidth = Math.abs(this.canvas.width * Math.cos(radians)) + Math.abs(this.canvas.height * Math.sin(radians));
        const newHeight = Math.abs(this.canvas.width * Math.sin(radians)) + Math.abs(this.canvas.height * Math.cos(radians));
        
        // Resize canvas
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        
        // Clear and fill with white
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, newWidth, newHeight);
        
        // Rotate and draw
        this.ctx.save();
        this.ctx.translate(newWidth / 2, newHeight / 2);
        this.ctx.rotate(radians);
        this.ctx.putImageData(imageData, -imageData.width / 2, -imageData.height / 2);
        this.ctx.restore();
        
        this.saveState();
        this.updateLayerThumbnail();
        this.updateUI();
    }

    flipCanvas(direction) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Flip and draw
        this.ctx.save();
        
        if (direction === 'horizontal') {
            this.ctx.translate(this.canvas.width, 0);
            this.ctx.scale(-1, 1);
        } else {
            this.ctx.translate(0, this.canvas.height);
            this.ctx.scale(1, -1);
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.ctx.restore();
        
        this.saveState();
        this.updateLayerThumbnail();
    }

    showCrosshair(x, y) {
        // Show crosshair for clone stamp and healing brush
        const overlay = document.getElementById('canvasOverlay');
        const ctx = overlay.getContext('2d');
        
        overlay.width = this.canvas.width;
        overlay.height = this.canvas.height;
        
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        
        // Draw crosshair
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + 10, y);
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y + 10);
        ctx.stroke();
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(x, y, this.brushSize / 2, 0, 2 * Math.PI);
        ctx.stroke();
    }

    // Panel management
    setupPanelDragging() {
        // Allow panels to be rearranged
        const panels = document.querySelectorAll('.panel');
        
        panels.forEach(panel => {
            const header = panel.querySelector('.panel-header');
            let isDragging = false;
            let startY = 0;
            let startHeight = 0;
            
            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('panel-close') || e.target.tagName === 'BUTTON') return;
                
                isDragging = true;
                startY = e.clientY;
                startHeight = panel.offsetHeight;
                
                document.addEventListener('mousemove', handleDrag);
                document.addEventListener('mouseup', stopDrag);
            });
            
            function handleDrag(e) {
                if (!isDragging) return;
                
                const deltaY = e.clientY - startY;
                const newHeight = Math.max(100, startHeight + deltaY);
                panel.style.height = newHeight + 'px';
            }
            
            function stopDrag() {
                isDragging = false;
                document.removeEventListener('mousemove', handleDrag);
                document.removeEventListener('mouseup', stopDrag);
            }
        });
    }

    // Utility functions
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Menu handlers
    handleMenuClick(menuType) {
        switch (menuType) {
            case 'file':
                this.showFileMenu();
                break;
            case 'edit':
                this.showEditMenu();
                break;
            case 'image':
                this.showImageMenu();
                break;
            case 'layer':
                this.showLayerMenu();
                break;
            case 'select':
                this.showSelectMenu();
                break;
            case 'filter':
                this.showFilterMenu();
                break;
            case 'view':
                this.showViewMenu();
                break;
            case 'window':
                this.showWindowMenu();
                break;
            case 'help':
                this.showHelpMenu();
                break;
        }
    }

    showFileMenu() {
        alert('File Menu - New, Open, Save, Save As, Export, Print, etc.');
    }

    showEditMenu() {
        alert('Edit Menu - Undo, Redo, Cut, Copy, Paste, Free Transform, etc.');
    }

    showImageMenu() {
        alert('Image Menu - Mode, Adjustments, Auto Tone, Auto Contrast, Auto Color, etc.');
    }

    showLayerMenu() {
        alert('Layer Menu - New Layer, Duplicate Layer, Delete Layer, Layer Style, etc.');
    }

    showSelectMenu() {
        alert('Select Menu - All, Deselect, Color Range, Modify, Transform Selection, etc.');
    }

    showFilterMenu() {
        alert('Filter Menu - Blur, Sharpen, Noise, Pixelate, Render, Stylize, etc.');
    }

    showViewMenu() {
        alert('View Menu - Proof Setup, Gamut Warning, Zoom, Screen Mode, Show, etc.');
    }

    showWindowMenu() {
        alert('Window Menu - Arrange, Workspace, Lock Panels, etc.');
    }

    showHelpMenu() {
        alert('Help Menu - Photoshop Help, About Photoshop, etc.');
    }

    // Adjustment layer handlers
    setupAdjustmentLayers() {
        const adjustmentBtns = document.querySelectorAll('.adjustment-btn');
        adjustmentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const adjustment = btn.dataset.adjustment;
                this.createAdjustmentLayer(adjustment);
            });
        });
    }

    createAdjustmentLayer(type) {
        const adjustmentLayer = {
            id: this.layers.length,
            name: this.getAdjustmentName(type),
            visible: true,
            opacity: 1,
            blendMode: 'normal',
            locked: false,
            type: 'adjustment',
            adjustment: type,
            values: this.getDefaultAdjustmentValues(type),
            thumbnail: null,
            mask: null
        };
        
        this.layers.push(adjustmentLayer);
        this.currentLayer = adjustmentLayer.id;
        this.updateLayersPanel();
        this.showAdjustmentDialog(type);
    }

    getAdjustmentName(type) {
        const names = {
            'brightness': 'Brightness/Contrast',
            'levels': 'Levels',
            'curves': 'Curves',
            'exposure': 'Exposure',
            'vibrance': 'Vibrance',
            'hue': 'Hue/Saturation',
            'color-balance': 'Color Balance',
            'black-white': 'Black & White',
            'photo-filter': 'Photo Filter',
            'channel-mixer': 'Channel Mixer',
            'color-lookup': 'Color Lookup',
            'invert': 'Invert',
            'posterize': 'Posterize',
            'threshold': 'Threshold',
            'gradient-map': 'Gradient Map',
            'selective-color': 'Selective Color'
        };
        
        return names[type] || 'Adjustment Layer';
    }

    getDefaultAdjustmentValues(type) {
        const defaults = {
            'brightness': { brightness: 0, contrast: 0 },
            'levels': { input: [0, 255, 255], output: [0, 255], gamma: 1.0 },
            'curves': { points: [] },
            'exposure': { exposure: 0, offset: 0, gamma: 1.0 },
            'vibrance': { vibrance: 0, saturation: 0 },
            'hue': { hue: 0, saturation: 0, lightness: 0 },
            'color-balance': { shadows: [0, 0, 0], midtones: [0, 0, 0], highlights: [0, 0, 0] },
            'black-white': { preset: 'default', tint: 0 },
            'photo-filter': { color: '#ff9900', density: 25, preserveLuminosity: true },
            'channel-mixer': { red: [100, 0, 0], green: [0, 100, 0], blue: [0, 0, 100] },
            'color-lookup': { lut: 'none' },
            'invert': {},
            'posterize': { levels: 4 },
            'threshold': { level: 128 },
            'gradient-map': { gradient: 'black-to-white' },
            'selective-color': { colors: {} }
        };
        
        return defaults[type] || {};
    }

    showAdjustmentDialog(type) {
        alert(`Adjustment Dialog: ${this.getAdjustmentName(type)} - would show specific adjustment controls`);
    }

    // Initialize adjustment layer handlers
    initializeAdjustmentLayers() {
        this.setupAdjustmentLayers();
    }
}

// Initialize the Photoshop application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const photoshop = new AdobePhotoshop();
    
    // Make it globally available for debugging
    window.photoshop = photoshop;
    
    // Initialize menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            photoshop.handleMenuClick(item.dataset.menu);
        });
    });
    
    // Initialize adjustment layers
    photoshop.initializeAdjustmentLayers();
});
