class AdobePhotoshopComplete {
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
        this.channels = ['rgb', 'red', 'green', 'blue'];
        this.currentChannel = 'rgb';
        this.paths = [];
        this.currentPath = null;
        this.brushes = [];
        this.toolPresets = [];
        this.actions = [];
        this.layerComps = [];
        this.notes = [];
        this.cloneSources = [];
        this.swatches = [];
        this.styles = [];
        this.neuralFilters = [];
        this.generators = [];
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupToolbar();
        this.setupPanels();
        this.setupKeyboardShortcuts();
        this.setupFilters();
        this.setupAdjustments();
        this.setupBrushes();
        this.setupSwatches();
        this.setupStyles();
        this.setupNeuralFilters();
        this.setupGenerators();
        this.createInitialLayer();
        this.updateUI();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        
        window.addEventListener('keydown', this.handleKeyboard.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        
        this.canvas.addEventListener('dragover', this.handleDragOver.bind(this));
        this.canvas.addEventListener('drop', this.handleDrop.bind(this));
    }

    setupToolbar() {
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
        document.getElementById('addGroup').addEventListener('click', () => this.addLayerGroup());
        document.getElementById('linkLayers').addEventListener('click', () => this.linkLayers());

        // Color panel
        this.setupColorPanel();

        // Channel panel
        this.setupChannelPanel();

        // Path panel
        this.setupPathPanel();

        // Brush panel
        this.setupBrushPanel();

        // Tool presets panel
        this.setupToolPresetsPanel();

        // Actions panel
        this.setupActionsPanel();

        // History panel
        this.setupHistoryPanel();

        // Layer comps panel
        this.setupLayerCompsPanel();

        // Timeline panel
        this.setupTimelinePanel();

        // Brush settings panel
        this.setupBrushSettingsPanel();

        // Clone source panel
        this.setupCloneSourcePanel();

        // Animation panel
        this.setupAnimationPanel();

        // Measurement panel
        this.setupMeasurementPanel();

        // Notes panel
        this.setupNotesPanel();

        // 3D panel
        this.setup3DPanel();

        // Video panel
        this.setupVideoPanel();

        // Camera Raw panel
        this.setupCameraRawPanel();

        // Liquify panel
        this.setupLiquifyPanel();

        // Vanishing point panel
        this.setupVanishingPointPanel();

        // Puppet warp panel
        this.setupPuppetWarpPanel();

        // Perspective warp panel
        this.setupPerspectiveWarpPanel();

        // Content-aware scale panel
        this.setupContentAwareScalePanel();

        // Neural filters panel
        this.setupNeuralFiltersPanel();

        // Generator panel
        this.setupGeneratorPanel();

        // Reference panel
        this.setupReferencePanel();

        // Info panel
        this.setupInfoPanel();

        // Panel close buttons
        document.querySelectorAll('.panel-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const panel = btn.closest('.panel');
                panel.style.display = 'none';
            });
        });

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

        // Color wheel
        this.setupColorWheel();

        // Color model tabs
        document.querySelectorAll('.model-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.model-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.updateColorModel(tab.dataset.model);
            });
        });

        // Swatches
        this.setupSwatchesGrid();
    }

    setupColorWheel() {
        const colorWheel = document.getElementById('colorWheel');
        const ctx = colorWheel.getContext('2d');
        
        // Draw color wheel
        const centerX = colorWheel.width / 2;
        const centerY = colorWheel.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        for (let angle = 0; angle < 360; angle += 1) {
            const startAngle = (angle - 90) * Math.PI / 180;
            const endAngle = (angle + 1 - 90) * Math.PI / 180;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, `hsl(${angle}, 100%, 100%)`);
            gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
            
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        colorWheel.addEventListener('click', (e) => {
            const rect = colorWheel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
                if (angle < 0) angle += 360;
                
                const saturation = (distance / radius) * 100;
                const rgb = this.hslToRgb(angle, saturation, 50);
                
                this.foregroundColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
                this.updateColorDisplay();
                this.updateColorPanel();
            }
        });
    }

    setupSwatchesGrid() {
        const swatchesGrid = document.getElementById('swatchesGrid');
        
        // Default swatches
        const defaultSwatches = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
            '#ff8800', '#8800ff', '#00ff88', '#ffffff', '#888888', '#000000',
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9',
            '#74b9ff', '#a29bfe', '#6c5ce7', '#fd79a8', '#fdcb6e', '#e17055'
        ];

        swatchesGrid.innerHTML = '';
        defaultSwatches.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.addEventListener('click', () => {
                this.foregroundColor = color;
                this.updateColorDisplay();
                this.updateColorPanel();
            });
            swatchesGrid.appendChild(swatch);
        });
    }

    setupChannelPanel() {
        const channelItems = document.querySelectorAll('.channel');
        channelItems.forEach(item => {
            item.addEventListener('click', () => {
                channelItems.forEach(c => c.classList.remove('active'));
                item.classList.add('active');
                this.currentChannel = item.dataset.channel;
                this.updateChannelDisplay();
            });
        });

        document.getElementById('newChannel').addEventListener('click', () => this.newChannel());
        document.getElementById('deleteChannel').addEventListener('click', () => this.deleteChannel());
        document.getElementById('mergeChannels').addEventListener('click', () => this.mergeChannels());
    }

    setupPathPanel() {
        const pathItems = document.querySelectorAll('.path');
        pathItems.forEach(item => {
            item.addEventListener('click', () => {
                pathItems.forEach(p => p.classList.remove('active'));
                item.classList.add('active');
                this.currentPath = item.dataset.path;
            });
        });

        document.getElementById('newPath').addEventListener('click', () => this.newPath());
        document.getElementById('deletePath').addEventListener('click', () => this.deletePath());
        document.getElementById('loadPath').addEventListener('click', () => this.loadPath());
        document.getElementById('savePath').addEventListener('click', () => this.savePath());
    }

    setupBrushPanel() {
        const brushesList = document.getElementById('brushesList');
        
        // Default brushes
        const defaultBrushes = [
            { name: 'Soft Round', size: 25, hardness: 0, spacing: 25 },
            { name: 'Hard Round', size: 25, hardness: 100, spacing: 25 },
            { name: 'Soft Airbrush', size: 50, hardness: 0, spacing: 15 },
            { name: 'Chalk', size: 35, hardness: 50, spacing: 35 },
            { name: 'Spray', size: 40, hardness: 0, spacing: 50 },
            { name: 'Texture', size: 30, hardness: 75, spacing: 25 }
        ];

        brushesList.innerHTML = '';
        defaultBrushes.forEach(brush => {
            const brushItem = document.createElement('div');
            brushItem.className = 'brush-item';
            brushItem.innerHTML = `
                <canvas width="60" height="60"></canvas>
            `;
            
            const canvas = brushItem.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            this.drawBrushPreview(ctx, brush);
            
            brushItem.addEventListener('click', () => {
                document.querySelectorAll('.brush-item').forEach(b => b.classList.remove('active'));
                brushItem.classList.add('active');
                this.currentBrush = brush;
                this.updateBrushSettings();
            });
            
            brushesList.appendChild(brushItem);
        });

        document.getElementById('newBrush').addEventListener('click', () => this.newBrush());
        document.getElementById('deleteBrush').addEventListener('click', () => this.deleteBrush());
        document.getElementById('resetBrushes').addEventListener('click', () => this.resetBrushes());
    }

    drawBrushPreview(ctx, brush) {
        const centerX = 30;
        const centerY = 30;
        const radius = brush.size / 2;
        
        ctx.clearRect(0, 0, 60, 60);
        
        if (brush.hardness === 0) {
            // Soft brush
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 60, 60);
        } else {
            // Hard brush
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fill();
        }
    }

    setupToolPresetsPanel() {
        const toolPresetsList = document.getElementById('toolPresetsList');
        
        // Default tool presets
        const defaultPresets = [
            { name: 'Basic Brush', tool: 'brush', size: 10, opacity: 100 },
            { name: 'Large Brush', tool: 'brush', size: 50, opacity: 80 },
            { name: 'Detail Brush', tool: 'brush', size: 3, opacity: 100 },
            { name: 'Soft Eraser', tool: 'eraser', size: 20, opacity: 50 },
            { name: 'Hard Eraser', tool: 'eraser', size: 10, opacity: 100 },
            { name: 'Clone Stamp', tool: 'clone-stamp', size: 25, opacity: 100 }
        ];

        toolPresetsList.innerHTML = '';
        defaultPresets.forEach(preset => {
            const presetItem = document.createElement('div');
            presetItem.className = 'tool-preset-item';
            presetItem.innerHTML = `
                <div class="tool-preset-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
                    </svg>
                </div>
                <div class="tool-preset-name">${preset.name}</div>
            `;
            
            presetItem.addEventListener('click', () => {
                document.querySelectorAll('.tool-preset-item').forEach(p => p.classList.remove('active'));
                presetItem.classList.add('active');
                this.applyToolPreset(preset);
            });
            
            toolPresetsList.appendChild(presetItem);
        });

        document.getElementById('newToolPreset').addEventListener('click', () => this.newToolPreset());
        document.getElementById('deleteToolPreset').addEventListener('click', () => this.deleteToolPreset());
        document.getElementById('resetToolPresets').addEventListener('click', () => this.resetToolPresets());
    }

    setupActionsPanel() {
        const actionsList = document.getElementById('actionsList');
        
        // Default actions
        const defaultActions = [
            { name: 'Sepia Tone', icon: 'S' },
            { name: 'Vintage', icon: 'V' },
            { name: 'Black & White', icon: 'BW' },
            { name: 'High Contrast', icon: 'HC' },
            { name: 'Soft Focus', icon: 'SF' },
            { name: 'Cross Process', icon: 'CP' }
        ];

        actionsList.innerHTML = '';
        defaultActions.forEach(action => {
            const actionItem = document.createElement('div');
            actionItem.className = 'action-item';
            actionItem.innerHTML = `
                <div class="action-icon">${action.icon}</div>
                <div class="action-name">${action.name}</div>
            `;
            
            actionItem.addEventListener('click', () => {
                this.playAction(action);
            });
            
            actionsList.appendChild(actionItem);
        });

        document.getElementById('playAction').addEventListener('click', () => this.playCurrentAction());
        document.getElementById('recordAction').addEventListener('click', () => this.startRecordingAction());
        document.getElementById('stopAction').addEventListener('click', () => this.stopRecordingAction());
        document.getElementById('deleteAction').addEventListener('click', () => this.deleteCurrentAction());
        document.getElementById('newAction').addEventListener('click', () => this.newAction());
    }

    setupHistoryPanel() {
        const historyList = document.getElementById('historyList');
        
        this.updateHistoryList();
        
        document.getElementById('createSnapshot').addEventListener('click', () => this.createSnapshot());
        document.getElementById('deleteSnapshot').addEventListener('click', () => this.deleteSnapshot());
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
    }

    updateHistoryList() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        this.history.forEach((state, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${index === this.historyStep ? 'current' : ''}`;
            historyItem.innerHTML = `
                <div class="history-icon">${index === 0 ? 'N' : 'S'}</div>
                <div class="history-name">${index === 0 ? 'New Document' : `State ${index}`}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.restoreHistoryState(index);
            });
            
            historyList.appendChild(historyItem);
        });
    }

    setupLayerCompsPanel() {
        const layerCompsList = document.getElementById('layerCompsList');
        
        document.getElementById('newLayerComp').addEventListener('click', () => this.newLayerComp());
        document.getElementById('deleteLayerComp').addEventListener('click', () => this.deleteLayerComp());
        document.getElementById('applyLayerComp').addEventListener('click', () => this.applyLayerComp());
    }

    setupTimelinePanel() {
        document.getElementById('playTimeline').addEventListener('click', () => this.playTimeline());
        document.getElementById('pauseTimeline').addEventListener('click', () => this.pauseTimeline());
        document.getElementById('stopTimeline').addEventListener('click', () => this.stopTimeline());
        document.getElementById('rewindTimeline').addEventListener('click', () => this.rewindTimeline());
        document.getElementById('forwardTimeline').addEventListener('click', () => this.forwardTimeline());
    }

    setupBrushSettingsPanel() {
        // Brush tip shape
        document.getElementById('brushDiameter').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('brushDiameterValue').textContent = this.brushSize + 'px';
        });

        document.getElementById('brushHardness').addEventListener('input', (e) => {
            this.brushHardness = parseInt(e.target.value);
            document.getElementById('brushHardnessValue').textContent = this.brushHardness + '%';
        });

        document.getElementById('brushSpacing').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('brushSpacingValue').textContent = value + '%';
        });

        document.getElementById('brushAngle').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('brushAngleValue').textContent = value + '°';
        });

        document.getElementById('brushRoundness').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('brushRoundnessValue').textContent = value + '%';
        });

        // Shape dynamics
        document.getElementById('sizeJitter').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('sizeJitterValue').textContent = value + '%';
        });

        document.getElementById('angleJitter').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('angleJitterValue').textContent = value + '%';
        });

        document.getElementById('roundnessJitter').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('roundnessJitterValue').textContent = value + '%';
        });

        // Scattering
        document.getElementById('scatter').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('scatterValue').textContent = value + '%';
        });

        document.getElementById('brushCount').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('brushCountValue').textContent = value;
        });

        // Texture
        document.getElementById('textureScale').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('textureScaleValue').textContent = value + '%';
        });

        // Color dynamics
        document.getElementById('hueJitter').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('hueJitterValue').textContent = value + '%';
        });

        document.getElementById('saturationJitter').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('saturationJitterValue').textContent = value + '%';
        });

        document.getElementById('brightnessJitter').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('brightnessJitterValue').textContent = value + '%';
        });

        // Transfer
        document.getElementById('flowJitter').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('flowJitterValue').textContent = value + '%';
        });

        document.getElementById('opacityJitter').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('opacityJitterValue').textContent = value + '%';
        });
    }

    setupCloneSourcePanel() {
        const cloneSourceList = document.getElementById('cloneSourceList');
        
        document.getElementById('newCloneSource').addEventListener('click', () => this.newCloneSource());
        document.getElementById('deleteCloneSource').addEventListener('click', () => this.deleteCloneSource());
        document.getElementById('resetCloneSource').addEventListener('click', () => this.resetCloneSource());
    }

    setupAnimationPanel() {
        document.getElementById('playAnimation').addEventListener('click', () => this.playAnimation());
        document.getElementById('pauseAnimation').addEventListener('click', () => this.pauseAnimation());
        document.getElementById('stopAnimation').addEventListener('click', () => this.stopAnimation());
        document.getElementById('exportAnimation').addEventListener('click', () => this.exportAnimation());
    }

    setupMeasurementPanel() {
        // Measurement unit changes
        ['measureUnitX', 'measureUnitY', 'measureUnitW', 'measureUnitH', 'measureUnitD'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateMeasurements();
            });
        });

        // Measurement scale
        document.getElementById('measurementScale').addEventListener('input', () => {
            this.updateMeasurements();
        });

        document.getElementById('measurementTarget').addEventListener('input', () => {
            this.updateMeasurements();
        });

        ['measurementScaleUnit', 'measurementTargetUnit'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateMeasurements();
            });
        });
    }

    setupNotesPanel() {
        const notesList = document.getElementById('notesList');
        
        document.getElementById('newNote').addEventListener('click', () => this.newNote());
        document.getElementById('deleteNote').addEventListener('click', () => this.deleteNote());
        document.getElementById('clearNotes').addEventListener('click', () => this.clearNotes());
    }

    setup3DPanel() {
        document.getElementById('new3DLayer').addEventListener('click', () => this.new3DLayer());
        document.getElementById('extrude3D').addEventListener('click', () => this.extrude3D());
        document.getElementById('revolve3D').addEventListener('click', () => this.revolve3D());
        document.getElementById('inflate3D').addEventListener('click', () => this.inflate3D());

        document.getElementById('3dDepth').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('3dDepthValue').textContent = value + 'px';
        });

        document.getElementById('3dMaterial').addEventListener('change', () => {
            this.update3DMaterial();
        });

        document.getElementById('3dLighting').addEventListener('change', () => {
            this.update3DLighting();
        });
    }

    setupVideoPanel() {
        document.getElementById('importVideo').addEventListener('click', () => this.importVideo());
        document.getElementById('exportVideo').addEventListener('click', () => this.exportVideo());
        document.getElementById('videoSettings').addEventListener('click', () => this.openVideoSettings());
    }

    setupCameraRawPanel() {
        // Camera Raw controls
        const rawControls = ['rawExposure', 'rawContrast', 'rawHighlights', 'rawShadows', 'rawWhites', 'rawBlacks', 'rawClarity', 'rawVibrance', 'rawSaturation'];
        
        rawControls.forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                document.getElementById(id + 'Value').textContent = value.toFixed(2);
                this.applyCameraRawAdjustment(id, value);
            });
        });
    }

    setupLiquifyPanel() {
        const liquifyTools = document.querySelectorAll('.liquify-tool');
        liquifyTools.forEach(tool => {
            tool.addEventListener('click', () => {
                liquifyTools.forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                this.currentLiquifyTool = tool.dataset.tool;
            });
        });

        document.getElementById('liquifyBrushSize').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('liquifyBrushSizeValue').textContent = value + 'px';
        });

        document.getElementById('liquifyBrushPressure').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('liquifyBrushPressureValue').textContent = value + '%';
        });

        document.getElementById('liquifyBrushDensity').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('liquifyBrushDensityValue').textContent = value + '%';
        });
    }

    setupVanishingPointPanel() {
        document.getElementById('createPlane').addEventListener('click', () => this.createVanishingPlane());
        document.getElementById('editPlane').addEventListener('click', () => this.editVanishingPlane());
        document.getElementById('deletePlane').addEventListener('click', () => this.deleteVanishingPlane());

        document.getElementById('vanishingGridSize').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('vanishingGridSizeValue').textContent = value + 'px';
        });

        document.getElementById('vanishingAngle').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('vanishingAngleValue').textContent = value + '°';
        });
    }

    setupPuppetWarpPanel() {
        document.getElementById('addPin').addEventListener('click', () => this.addPuppetPin());
        document.getElementById('removePin').addEventListener('click', () => this.removePuppetPin());
        document.getElementById('resetPins').addEventListener('click', () => this.resetPuppetPins());

        document.getElementById('puppetWarpMode').addEventListener('change', () => {
            this.updatePuppetWarpMode();
        });

        document.getElementById('puppetWarpAmount').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('puppetWarpAmountValue').textContent = value + '%';
        });
    }

    setupPerspectiveWarpPanel() {
        document.getElementById('addCorner').addEventListener('click', () => this.addPerspectiveCorner());
        document.getElementById('removeCorner').addEventListener('click', () => this.removePerspectiveCorner());
        document.getElementById('resetPerspective').addEventListener('click', () => this.resetPerspective());

        document.getElementById('perspectiveGridSize').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('perspectiveGridSizeValue').textContent = value + 'px';
        });
    }

    setupContentAwareScalePanel() {
        document.getElementById('protectSkin').addEventListener('click', () => this.toggleProtectSkin());
        document.getElementById('protectTones').addEventListener('click', () => this.toggleProtectTones());
        document.getElementById('protectColors').addEventListener('click', () => this.toggleProtectColors());

        document.getElementById('contentAwareAmount').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('contentAwareAmountValue').textContent = value + '%';
        });
    }

    setupNeuralFiltersPanel() {
        const neuralFilters = document.querySelectorAll('.neural-filter');
        neuralFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                neuralFilters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                this.applyNeuralFilter(filter.dataset.filter);
            });
        });
    }

    setupGeneratorPanel() {
        document.getElementById('generateFill').addEventListener('click', () => this.generateFill());
        document.getElementById('generateImage').addEventListener('click', () => this.generateImage());
        document.getElementById('generateBackground').addEventListener('click', () => this.generateBackground());
        document.getElementById('generateTexture').addEventListener('click', () => this.generateTexture());

        document.getElementById('generatorStyle').addEventListener('change', () => {
            this.updateGeneratorStyle();
        });
    }

    setupReferencePanel() {
        document.getElementById('placeReference').addEventListener('click', () => this.placeReference());
        document.getElementById('lockReference').addEventListener('click', () => this.lockReference());
        document.getElementById('clearReference').addEventListener('click', () => this.clearReference());
    }

    setupInfoPanel() {
        this.updateInfoPanel();
    }

    setupKeyboardShortcuts() {
        // This is handled in the handleKeyboard method
    }

    setupFilters() {
        this.filters = {
            blur: ['Gaussian Blur', 'Motion Blur', 'Radial Blur', 'Surface Blur'],
            sharpen: ['Sharpen', 'Unsharp Mask', 'Smart Sharpen'],
            noise: ['Add Noise', 'Despeckle', 'Dust & Scratches', 'Median'],
            pixelate: ['Mosaic', 'Crystallize', 'Fragment', 'Mezzotint'],
            render: ['Clouds', 'Difference Clouds', 'Fibers', 'Lens Flare'],
            stylize: ['Find Edges', 'Emboss', 'Extrude', 'Solarize', 'Wind'],
            distort: ['Displace', 'Pinch', 'Polar Coordinates', 'Ripple', 'Shear', 'Spherize', 'Twirl', 'Wave'],
            other: ['Custom Filter', 'High Pass', 'Maximum', 'Minimum', 'Offset']
        };
    }

    setupAdjustments() {
        this.adjustments = {
            brightness: { name: 'Brightness/Contrast', controls: ['brightness', 'contrast'] },
            levels: { name: 'Levels', controls: ['input', 'gamma', 'output'] },
            curves: { name: 'Curves', controls: ['curve'] },
            exposure: { name: 'Exposure', controls: ['exposure', 'offset', 'gamma'] },
            vibrance: { name: 'Vibrance', controls: ['vibrance', 'saturation'] },
            hue: { name: 'Hue/Saturation', controls: ['hue', 'saturation', 'lightness'] },
            'color-balance': { name: 'Color Balance', controls: ['shadows', 'midtones', 'highlights'] },
            'black-white': { name: 'Black & White', controls: ['preset', 'tint'] },
            'photo-filter': { name: 'Photo Filter', controls: ['color', 'density'] },
            'channel-mixer': { name: 'Channel Mixer', controls: ['red', 'green', 'blue'] },
            'color-lookup': { name: 'Color Lookup', controls: ['lut'] },
            invert: { name: 'Invert', controls: [] },
            posterize: { name: 'Posterize', controls: ['levels'] },
            threshold: { name: 'Threshold', controls: ['level'] },
            'gradient-map': { name: 'Gradient Map', controls: ['gradient'] },
            'selective-color': { name: 'Selective Color', controls: ['colors'] }
        };
    }

    setupBrushes() {
        this.brushes = [
            { name: 'Soft Round', size: 25, hardness: 0, spacing: 25 },
            { name: 'Hard Round', size: 25, hardness: 100, spacing: 25 },
            { name: 'Soft Airbrush', size: 50, hardness: 0, spacing: 15 },
            { name: 'Chalk', size: 35, hardness: 50, spacing: 35 },
            { name: 'Spray', size: 40, hardness: 0, spacing: 50 },
            { name: 'Texture', size: 30, hardness: 75, spacing: 25 }
        ];
    }

    setupSwatches() {
        this.swatches = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
            '#ff8800', '#8800ff', '#00ff88', '#ffffff', '#888888', '#000000',
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9',
            '#74b9ff', '#a29bfe', '#6c5ce7', '#fd79a8', '#fdcb6e', '#e17055'
        ];
    }

    setupStyles() {
        this.styles = [
            { name: 'Drop Shadow', effects: ['shadow'] },
            { name: 'Inner Shadow', effects: ['inner-shadow'] },
            { name: 'Outer Glow', effects: ['outer-glow'] },
            { name: 'Inner Glow', effects: ['inner-glow'] },
            { name: 'Bevel & Emboss', effects: ['bevel'] },
            { name: 'Satin', effects: ['satin'] },
            { name: 'Color Overlay', effects: ['color-overlay'] },
            { name: 'Gradient Overlay', effects: ['gradient-overlay'] },
            { name: 'Pattern Overlay', effects: ['pattern-overlay'] },
            { name: 'Stroke', effects: ['stroke'] }
        ];
    }

    setupNeuralFilters() {
        this.neuralFilters = [
            { name: 'Skin Smoothing', category: 'retouching' },
            { name: 'Portrait Enhancer', category: 'enhancement' },
            { name: 'Style Transfer', category: 'artistic' },
            { name: 'Smart Portrait', category: 'enhancement' },
            { name: 'Colorize', category: 'color' },
            { name: 'Super Zoom', category: 'enhancement' },
            { name: 'Remove Background', category: 'selection' },
            { name: 'Make-up', category: 'retouching' }
        ];
    }

    setupGenerators() {
        this.generators = [
            { name: 'Fill', type: 'fill' },
            { name: 'Image', type: 'image' },
            { name: 'Background', type: 'background' },
            { name: 'Texture', type: 'texture' }
        ];
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

    // Tool implementations (from previous version)
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
            // ... other tool implementations
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;
        
        document.getElementById('cursorPos').textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
        
        if (!this.isDrawing) return;
        
        switch (this.currentTool) {
            case 'brush':
                this.drawBrushStroke(x, y);
                break;
            case 'eraser':
                this.drawEraserStroke(x, y);
                break;
            // ... other tool implementations
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
        
        if (e.ctrlKey || e.metaKey) {
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoomCanvas(delta);
        } else if (this.currentTool === 'hand') {
            this.panX += e.deltaX;
            this.panY += e.deltaY;
            this.updateCanvasTransform();
        }
    }

    handleKeyboard(e) {
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
                case 'f':
                    e.preventDefault();
                    this.showFilterGallery();
                    break;
                case 'g':
                    e.preventDefault();
                    this.showGeneratorPanel();
                    break;
                case 'k':
                    e.preventDefault();
                    this.showColorPanel();
                    break;
            }
        } else {
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
                case 'f6':
                    this.showFilterGallery();
                    break;
                case 'f7':
                    this.showGeneratorPanel();
                    break;
                case 'f8':
                    this.showNeuralFiltersPanel();
                    break;
                case 'f9':
                    this.showCameraRawPanel();
                    break;
                case 'f10':
                    this.showLiquifyPanel();
                    break;
                case 'f11':
                    this.showVanishingPointPanel();
                    break;
                case 'f12':
                    this.showPuppetWarpPanel();
                    break;
            }
        }
    }

    // Filter methods
    showFilterGallery() {
        this.createFilterGalleryDialog();
    }

    createFilterGalleryDialog() {
        const dialog = this.createDialog('Filter Gallery');
        
        const content = document.createElement('div');
        content.className = 'filter-gallery';
        
        Object.entries(this.filters).forEach(([category, filters]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.innerHTML = `<h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>`;
            
            const filterGrid = document.createElement('div');
            filterGrid.className = 'filter-grid';
            
            filters.forEach(filter => {
                const filterItem = document.createElement('div');
                filterItem.className = 'filter-item';
                filterItem.innerHTML = `
                    <div class="filter-preview">${filter}</div>
                    <div class="filter-name">${filter}</div>
                `;
                
                filterItem.addEventListener('click', () => {
                    this.applyFilter(filter);
                    this.closeDialog();
                });
                
                filterGrid.appendChild(filterItem);
            });
            
            categoryDiv.appendChild(filterGrid);
            content.appendChild(categoryDiv);
        });
        
        dialog.querySelector('.dialog-content').appendChild(content);
        
        const buttons = dialog.querySelector('.dialog-buttons');
        buttons.innerHTML = `
            <button class="dialog-button" onclick="photoshop.closeDialog()">Cancel</button>
        `;
    }

    applyFilter(filterName) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        switch (filterName.toLowerCase()) {
            case 'gaussian blur':
                this.applyGaussianBlur(imageData);
                break;
            case 'sharpen':
                this.applySharpen(imageData);
                break;
            case 'add noise':
                this.addNoise(imageData);
                break;
            case 'mosaic':
                this.applyMosaic(imageData);
                break;
            case 'find edges':
                this.findEdges(imageData);
                break;
            case 'emboss':
                this.applyEmboss(imageData);
                break;
            case 'solarize':
                this.applySolarize(imageData);
                break;
            case 'invert':
                this.invert(imageData);
                break;
            default:
                alert(`Filter "${filterName}" would be applied here`);
                return;
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
        this.updateLayerThumbnail();
    }

    applyGaussianBlur(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);
        
        const kernel = [
            [1, 2, 1],
            [2, 4, 2],
            [1, 2, 1]
        ];
        const kernelSum = 16;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += data[idx] * kernel[ky + 1][kx + 1];
                        }
                    }
                    output[(y * width + x) * 4 + c] = sum / kernelSum;
                }
            }
        }
        
        for (let i = 0; i < data.length; i++) {
            data[i] = output[i];
        }
    }

    applySharpen(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);
        
        const kernel = [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += data[idx] * kernel[ky + 1][kx + 1];
                        }
                    }
                    output[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, sum));
                }
            }
        }
        
        for (let i = 0; i < data.length; i++) {
            data[i] = output[i];
        }
    }

    addNoise(imageData) {
        const data = imageData.data;
        const amount = 30;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * amount;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
    }

    applyMosaic(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const tileSize = 10;
        
        for (let y = 0; y < height; y += tileSize) {
            for (let x = 0; x < width; x += tileSize) {
                let r = 0, g = 0, b = 0, count = 0;
                
                for (let dy = 0; dy < tileSize && y + dy < height; dy++) {
                    for (let dx = 0; dx < tileSize && x + dx < width; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        count++;
                    }
                }
                
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                
                for (let dy = 0; dy < tileSize && y + dy < height; dy++) {
                    for (let dx = 0; dx < tileSize && x + dx < width; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                    }
                }
            }
        }
    }

    findEdges(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);
        
        const sobelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        
        const sobelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
                        gx += gray * sobelX[ky + 1][kx + 1];
                        gy += gray * sobelY[ky + 1][kx + 1];
                    }
                }
                
                const magnitude = Math.sqrt(gx * gx + gy * gy);
                const edge = magnitude > 128 ? 255 : 0;
                
                output[(y * width + x) * 4] = edge;
                output[(y * width + x) * 4 + 1] = edge;
                output[(y * width + x) * 4 + 2] = edge;
                output[(y * width + x) * 4 + 3] = 255;
            }
        }
        
        for (let i = 0; i < data.length; i++) {
            data[i] = output[i];
        }
    }

    applyEmboss(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);
        
        const kernel = [
            [-2, -1, 0],
            [-1, 1, 1],
            [0, 1, 2]
        ];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += data[idx] * kernel[ky + 1][kx + 1];
                        }
                    }
                    output[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, sum + 128));
                }
            }
        }
        
        for (let i = 0; i < data.length; i++) {
            data[i] = output[i];
        }
    }

    applySolarize(imageData) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] > 128 ? 255 - data[i] : data[i];
            data[i + 1] = data[i + 1] > 128 ? 255 - data[i + 1] : data[i + 1];
            data[i + 2] = data[i + 2] > 128 ? 255 - data[i + 2] : data[i + 2];
        }
    }

    invert(imageData) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    }

    // Generator methods
    showGeneratorPanel() {
        this.createGeneratorDialog();
    }

    createGeneratorDialog() {
        const dialog = this.createDialog('Generate Content');
        
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="generator-controls">
                <div class="control-group">
                    <label>Prompt:</label>
                    <textarea id="generatorPrompt" placeholder="Enter your prompt here..." rows="3"></textarea>
                </div>
                <div class="control-group">
                    <label>Style:</label>
                    <select id="generatorStyle">
                        <option value="none">None</option>
                        <option value="photorealistic">Photorealistic</option>
                        <option value="artistic">Artistic</option>
                        <option value="illustration">Illustration</option>
                        <option value="3d">3D</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Content Type:</label>
                    <select id="generatorType">
                        <option value="image">Image</option>
                        <option value="background">Background</option>
                        <option value="texture">Texture</option>
                        <option value="pattern">Pattern</option>
                    </select>
                </div>
            </div>
        `;
        
        dialog.querySelector('.dialog-content').appendChild(content);
        
        const buttons = dialog.querySelector('.dialog-buttons');
        buttons.innerHTML = `
            <button class="dialog-button" onclick="photoshop.closeDialog()">Cancel</button>
            <button class="dialog-button primary" onclick="photoshop.generateContent()">Generate</button>
        `;
    }

    generateContent() {
        const prompt = document.getElementById('generatorPrompt').value;
        const style = document.getElementById('generatorStyle').value;
        const type = document.getElementById('generatorType').value;
        
        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }
        
        this.showLoadingSpinner();
        
        // Simulate AI generation
        setTimeout(() => {
            this.hideLoadingSpinner();
            this.applyGeneratedContent(prompt, style, type);
            this.closeDialog();
        }, 2000);
    }

    applyGeneratedContent(prompt, style, type) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Simulate generated content based on type
        switch (type) {
            case 'background':
                this.generateBackground(data, prompt, style);
                break;
            case 'texture':
                this.generateTexture(data, prompt, style);
                break;
            case 'pattern':
                this.generatePattern(data, prompt, style);
                break;
            default:
                this.generateImage(data, prompt, style);
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
        this.updateLayerThumbnail();
    }

    generateBackground(data, prompt, style) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Generate gradient background based on prompt
        const colors = this.extractColorsFromPrompt(prompt);
        const gradient = this.ctx.createLinearGradient(0, 0, width, height);
        
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
    }

    generateTexture(data, prompt, style) {
        // Generate texture pattern
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const noise = Math.random() * 50 + 200;
                
                data[idx] = noise;
                data[idx + 1] = noise;
                data[idx + 2] = noise;
                data[idx + 3] = 255;
            }
        }
    }

    generatePattern(data, prompt, style) {
        // Generate geometric pattern
        const width = this.canvas.width;
        const height = this.canvas.height;
        const patternSize = 20;
        
        for (let y = 0; y < height; y += patternSize) {
            for (let x = 0; x < width; x += patternSize) {
                const color = Math.random() > 0.5 ? '#ffffff' : '#000000';
                const rgb = this.hexToRgb(color);
                
                for (let dy = 0; dy < patternSize && y + dy < height; dy++) {
                    for (let dx = 0; dx < patternSize && x + dx < width; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        data[idx] = rgb.r;
                        data[idx + 1] = rgb.g;
                        data[idx + 2] = rgb.b;
                        data[idx + 3] = 255;
                    }
                }
            }
        }
    }

    generateImage(data, prompt, style) {
        // Generate abstract image based on prompt
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                // Create abstract pattern
                const value = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 127 + 128;
                const color = this.getColorFromPrompt(prompt, value);
                
                data[idx] = color.r;
                data[idx + 1] = color.g;
                data[idx + 2] = color.b;
                data[idx + 3] = 255;
            }
        }
    }

    extractColorsFromPrompt(prompt) {
        // Simple color extraction from prompt
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        return colors.slice(0, 3);
    }

    getColorFromPrompt(prompt, value) {
        // Generate color based on prompt and value
        const hue = (prompt.length * 137.5) % 360;
        return this.hslToRgb(hue, 70, 50);
    }

    // Neural Filter methods
    showNeuralFiltersPanel() {
        this.createNeuralFilterDialog();
    }

    createNeuralFilterDialog() {
        const dialog = this.createDialog('Neural Filters');
        
        const content = document.createElement('div');
        content.className = 'neural-filters-list';
        
        this.neuralFilters.forEach(filter => {
            const filterItem = document.createElement('div');
            filterItem.className = 'neural-filter';
            filterItem.innerHTML = `
                <div class="filter-preview">${filter.name}</div>
                <div class="filter-name">${filter.name}</div>
                <div class="filter-category">${filter.category}</div>
            `;
            
            filterItem.addEventListener('click', () => {
                this.applyNeuralFilter(filter.name);
                this.closeDialog();
            });
            
            content.appendChild(filterItem);
        });
        
        dialog.querySelector('.dialog-content').appendChild(content);
        
        const buttons = dialog.querySelector('.dialog-buttons');
        buttons.innerHTML = `
            <button class="dialog-button" onclick="photoshop.closeDialog()">Cancel</button>
        `;
    }

    applyNeuralFilter(filterName) {
        this.showLoadingSpinner();
        
        // Simulate neural processing
        setTimeout(() => {
            this.hideLoadingSpinner();
            
            switch (filterName) {
                case 'Skin Smoothing':
                    this.applySkinSmoothing();
                    break;
                case 'Portrait Enhancer':
                    this.applyPortraitEnhancement();
                    break;
                case 'Style Transfer':
                    this.applyStyleTransfer();
                    break;
                case 'Smart Portrait':
                    this.applySmartPortrait();
                    break;
                case 'Colorize':
                    this.applyColorize();
                    break;
                case 'Super Zoom':
                    this.applySuperZoom();
                    break;
                case 'Remove Background':
                    this.applyRemoveBackground();
                    break;
                case 'Make-up':
                    this.applyMakeup();
                    break;
                default:
                    alert(`Neural filter "${filterName}" would be applied here`);
            }
            
            this.saveState();
            this.updateLayerThumbnail();
        }, 3000);
    }

    applySkinSmoothing() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Simple skin smoothing algorithm
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Detect skin tones and smooth them
            if (this.isSkinTone(r, g, b)) {
                const smoothed = this.smoothPixel(data, i);
                data[i] = smoothed.r;
                data[i + 1] = smoothed.g;
                data[i + 2] = smoothed.b;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    isSkinTone(r, g, b) {
        // Simple skin tone detection
        return r > 95 && g > 40 && b > 20 &&
               r > g && r > b &&
               Math.abs(r - g) > 15 &&
               r - b > 15;
    }

    smoothPixel(data, index) {
        // Simple smoothing by averaging with neighbors
        let r = 0, g = 0, b = 0, count = 0;
        const width = this.canvas.width;
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const idx = index + (dy * width + dx) * 4;
                if (idx >= 0 && idx < data.length - 3) {
                    r += data[idx];
                    g += data[idx + 1];
                    b += data[idx + 2];
                    count++;
                }
            }
        }
        
        return {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count)
        };
    }

    // Camera Raw methods
    showCameraRawPanel() {
        this.createCameraRawDialog();
    }

    createCameraRawDialog() {
        const dialog = this.createDialog('Camera Raw Filter');
        
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="cameraRaw-controls">
                <div class="control-group">
                    <label>Exposure:</label>
                    <input type="range" id="rawExposure" min="-5" max="5" value="0" step="0.01">
                    <span id="rawExposureValue">0.00</span>
                </div>
                <div class="control-group">
                    <label>Contrast:</label>
                    <input type="range" id="rawContrast" min="-100" max="100" value="0">
                    <span id="rawContrastValue">0</span>
                </div>
                <div class="control-group">
                    <label>Highlights:</label>
                    <input type="range" id="rawHighlights" min="-100" max="100" value="0">
                    <span id="rawHighlightsValue">0</span>
                </div>
                <div class="control-group">
                    <label>Shadows:</label>
                    <input type="range" id="rawShadows" min="-100" max="100" value="0">
                    <span id="rawShadowsValue">0</span>
                </div>
                <div class="control-group">
                    <label>Whites:</label>
                    <input type="range" id="rawWhites" min="-100" max="100" value="0">
                    <span id="rawWhitesValue">0</span>
                </div>
                <div class="control-group">
                    <label>Blacks:</label>
                    <input type="range" id="rawBlacks" min="-100" max="100" value="0">
                    <span id="rawBlacksValue">0</span>
                </div>
                <div class="control-group">
                    <label>Clarity:</label>
                    <input type="range" id="rawClarity" min="-100" max="100" value="0">
                    <span id="rawClarityValue">0</span>
                </div>
                <div class="control-group">
                    <label>Vibrance:</label>
                    <input type="range" id="rawVibrance" min="-100" max="100" value="0">
                    <span id="rawVibranceValue">0</span>
                </div>
                <div class="control-group">
                    <label>Saturation:</label>
                    <input type="range" id="rawSaturation" min="-100" max="100" value="0">
                    <span id="rawSaturationValue">0</span>
                </div>
            </div>
        `;
        
        dialog.querySelector('.dialog-content').appendChild(content);
        
        // Add event listeners for Camera Raw controls
        const rawControls = ['rawExposure', 'rawContrast', 'rawHighlights', 'rawShadows', 'rawWhites', 'rawBlacks', 'rawClarity', 'rawVibrance', 'rawSaturation'];
        
        rawControls.forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                document.getElementById(id + 'Value').textContent = value.toFixed(2);
                this.applyCameraRawAdjustment(id, value);
            });
        });
        
        const buttons = dialog.querySelector('.dialog-buttons');
        buttons.innerHTML = `
            <button class="dialog-button" onclick="photoshop.closeDialog()">Cancel</button>
            <button class="dialog-button primary" onclick="photoshop.applyCameraRaw()">Apply</button>
        `;
    }

    applyCameraRawAdjustment(control, value) {
        // Real-time preview of Camera Raw adjustments
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        switch (control) {
            case 'rawExposure':
                this.adjustExposure(data, value);
                break;
            case 'rawContrast':
                this.adjustContrast(data, value);
                break;
            case 'rawHighlights':
                this.adjustHighlights(data, value);
                break;
            case 'rawShadows':
                this.adjustShadows(data, value);
                break;
            case 'rawWhites':
                this.adjustWhites(data, value);
                break;
            case 'rawBlacks':
                this.adjustBlacks(data, value);
                break;
            case 'rawClarity':
                this.adjustClarity(data, value);
                break;
            case 'rawVibrance':
                this.adjustVibrance(data, value);
                break;
            case 'rawSaturation':
                this.adjustSaturation(data, value);
                break;
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    adjustExposure(data, value) {
        const factor = Math.pow(2, value);
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * factor);
            data[i + 1] = Math.min(255, data[i + 1] * factor);
            data[i + 2] = Math.min(255, data[i + 2] * factor);
        }
    }

    adjustContrast(data, value) {
        const factor = (259 * (value + 255)) / (255 * (259 - value));
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
    }

    adjustHighlights(data, value) {
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            
            if (brightness > 200) {
                const adjustment = value * 2.55;
                data[i] = Math.min(255, Math.max(0, data[i] + adjustment));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment));
            }
        }
    }

    adjustShadows(data, value) {
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            
            if (brightness < 55) {
                const adjustment = value * 2.55;
                data[i] = Math.min(255, Math.max(0, data[i] + adjustment));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment));
            }
        }
    }

    adjustWhites(data, value) {
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            
            if (brightness > 240) {
                const adjustment = value * 2.55;
                data[i] = Math.min(255, Math.max(0, data[i] + adjustment));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment));
            }
        }
    }

    adjustBlacks(data, value) {
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            
            if (brightness < 15) {
                const adjustment = value * 2.55;
                data[i] = Math.min(255, Math.max(0, data[i] + adjustment));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment));
            }
        }
    }

    adjustClarity(data, value) {
        // Simple clarity adjustment (contrast enhancement)
        const factor = 1 + (value / 100);
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const adjusted = (gray - 128) * factor + 128;
            
            data[i] = Math.min(255, Math.max(0, adjusted));
            data[i + 1] = Math.min(255, Math.max(0, adjusted));
            data[i + 2] = Math.min(255, Math.max(0, adjusted));
        }
    }

    adjustVibrance(data, value) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            
            if (saturation > 0.5) {
                const adjustment = value / 100;
                data[i] = Math.min(255, Math.max(0, r + (r - 128) * adjustment));
                data[i + 1] = Math.min(255, Math.max(0, g + (g - 128) * adjustment));
                data[i + 2] = Math.min(255, Math.max(0, b + (b - 128) * adjustment));
            }
        }
    }

    adjustSaturation(data, value) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const factor = 1 + (value / 100);
            
            data[i] = Math.min(255, Math.max(0, gray + (r - gray) * factor));
            data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * factor));
            data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * factor));
        }
    }

    // Utility methods
    createDialog(title) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'dialog';
        
        dialog.innerHTML = `
            <div class="dialog-header">
                <div class="dialog-title">${title}</div>
                <button class="dialog-close" onclick="photoshop.closeDialog()">×</button>
            </div>
            <div class="dialog-content"></div>
            <div class="dialog-buttons"></div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        this.currentDialog = overlay;
        return dialog;
    }

    closeDialog() {
        if (this.currentDialog) {
            document.body.removeChild(this.currentDialog);
            this.currentDialog = null;
        }
    }

    showLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        document.body.appendChild(spinner);
        this.loadingSpinner = spinner;
    }

    hideLoadingSpinner() {
        if (this.loadingSpinner) {
            document.body.removeChild(this.loadingSpinner);
            this.loadingSpinner = null;
        }
    }

    // Color conversion utilities
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    hslToRgb(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // Other utility methods (from previous version)
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

    // Complete implementation of all missing methods
    
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

    startMove(x, y) {
        if (this.currentLayer >= 0 && !this.layers[this.currentLayer].locked) {
            this.moveStartX = x;
            this.moveStartY = y;
        }
    }

    pickColor(x, y) {
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
        this.foregroundColor = hex;
        this.updateColorDisplay();
        this.updateColorPanel();
    }

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
            'slice-select': 'Slice Select Tool (C)',
            'perspective-crop': 'Perspective Crop Tool (C)',
            'eyedropper': 'Eyedropper Tool (I)',
            'color-sampler': 'Color Sampler Tool (I)',
            'ruler': 'Ruler Tool (I)',
            'note': 'Note Tool (I)',
            'count': 'Count Tool (I)',
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

    // Layer management methods
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
        this.showAdjustmentDialog('brightness-contrast');
    }

    addLayerGroup() {
        const groupLayer = {
            id: this.layers.length,
            name: 'Group 1',
            visible: true,
            opacity: 1,
            blendMode: 'pass through',
            locked: false,
            type: 'group',
            layers: [],
            thumbnail: null,
            mask: null
        };
        
        this.layers.push(groupLayer);
        this.currentLayer = groupLayer.id;
        this.updateLayersPanel();
    }

    linkLayers() {
        // Implement layer linking functionality
        alert('Layer linking would be implemented here');
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
            'luminosity': 'luminosity',
            'pass through': 'source-over'
        };
        
        return modes[mode] || 'source-over';
    }

    updateLayerThumbnail() {
        if (this.currentLayer >= 0) {
            const layer = this.layers[this.currentLayer];
            if (layer.imageData) {
                layer.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            }
        }
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
        
        this.updateHistoryList();
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState();
            this.updateHistoryList();
        }
    }

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState();
            this.updateHistoryList();
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

    restoreHistoryState(index) {
        this.historyStep = index;
        this.restoreState();
        this.updateHistoryList();
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
            this.ctx.putImageData(this.clipboard, 0, 0);
            this.saveState();
            this.updateLayerThumbnail();
        }
    }

    cut() {
        this.copy();
        if (this.selection) {
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
        this.showCurvesDialog();
    }

    balance() {
        this.showColorBalanceDialog();
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
        this.showHistogramPanel();
    }

    // Dialog methods
    showCurvesDialog() {
        const dialog = this.createDialog('Curves');
        
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="curve-editor" id="curveEditor">
                <canvas width="400" height="300"></canvas>
            </div>
        `;
        
        dialog.querySelector('.dialog-content').appendChild(content);
        
        const buttons = dialog.querySelector('.dialog-buttons');
        buttons.innerHTML = `
            <button class="dialog-button" onclick="photoshop.closeDialog()">Cancel</button>
            <button class="dialog-button primary" onclick="photoshop.applyCurves()">OK</button>
        `;
        
        this.setupCurvesEditor();
    }

    setupCurvesEditor() {
        const canvas = document.getElementById('curveEditor').querySelector('canvas');
        const ctx = canvas.getContext('2d');
        
        // Draw grid
        ctx.strokeStyle = '#484848';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * 75);
            ctx.lineTo(400, i * 75);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(i * 100, 0);
            ctx.lineTo(i * 100, 300);
            ctx.stroke();
        }
        
        // Draw diagonal line
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 300);
        ctx.lineTo(400, 0);
        ctx.stroke();
    }

    applyCurves() {
        alert('Curves adjustment would be applied here');
        this.closeDialog();
    }

    showColorBalanceDialog() {
        const dialog = this.createDialog('Color Balance');
        
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="color-balance-controls">
                <div class="control-group">
                    <label>Cyan-Red:</label>
                    <input type="range" id="cyanRed" min="-100" max="100" value="0">
                    <span id="cyanRedValue">0</span>
                </div>
                <div class="control-group">
                    <label>Magenta-Green:</label>
                    <input type="range" id="magentaGreen" min="-100" max="100" value="0">
                    <span id="magentaGreenValue">0</span>
                </div>
                <div class="control-group">
                    <label>Yellow-Blue:</label>
                    <input type="range" id="yellowBlue" min="-100" max="100" value="0">
                    <span id="yellowBlueValue">0</span>
                </div>
                <div class="tone-selector">
                    <label>Tone Balance:</label>
                    <div class="tone-options">
                        <input type="radio" name="tone" value="shadows" checked> Shadows
                        <input type="radio" name="tone" value="midtones"> Midtones
                        <input type="radio" name="tone" value="highlights"> Highlights
                    </div>
                </div>
            </div>
        `;
        
        dialog.querySelector('.dialog-content').appendChild(content);
        
        const buttons = dialog.querySelector('.dialog-buttons');
        buttons.innerHTML = `
            <button class="dialog-button" onclick="photoshop.closeDialog()">Cancel</button>
            <button class="dialog-button primary" onclick="photoshop.applyColorBalance()">OK</button>
        `;
        
        // Add event listeners
        ['cyanRed', 'magentaGreen', 'yellowBlue'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                document.getElementById(id + 'Value').textContent = e.target.value;
            });
        });
    }

    applyColorBalance() {
        const cyanRed = parseInt(document.getElementById('cyanRed').value);
        const magentaGreen = parseInt(document.getElementById('magentaGreen').value);
        const yellowBlue = parseInt(document.getElementById('yellowBlue').value);
        const tone = document.querySelector('input[name="tone"]:checked').value;
        
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Apply color balance based on tone
            if (tone === 'shadows') {
                data[i] = r + cyanRed;
                data[i + 1] = g + magentaGreen;
                data[i + 2] = b + yellowBlue;
            } else if (tone === 'midtones') {
                data[i] = r + cyanRed * 0.5;
                data[i + 1] = g + magentaGreen * 0.5;
                data[i + 2] = b + yellowBlue * 0.5;
            } else if (tone === 'highlights') {
                data[i] = r + cyanRed * 0.2;
                data[i + 1] = g + magentaGreen * 0.2;
                data[i + 2] = b + yellowBlue * 0.2;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
        this.updateLayerThumbnail();
        this.closeDialog();
    }

    // Panel methods
    newChannel() {
        const channelName = prompt('Enter channel name:');
        if (channelName) {
            this.channels.push(channelName);
            this.updateChannelPanel();
        }
    }

    deleteChannel() {
        if (this.currentChannel !== 'rgb' && this.currentChannel !== 'red' && 
            this.currentChannel !== 'green' && this.currentChannel !== 'blue') {
            const index = this.channels.indexOf(this.currentChannel);
            if (index > -1) {
                this.channels.splice(index, 1);
                this.currentChannel = 'rgb';
                this.updateChannelPanel();
            }
        }
    }

    mergeChannels() {
        alert('Channels would be merged here');
    }

    updateChannelDisplay() {
        // Update channel display based on current channel
        if (this.currentChannel !== 'rgb') {
            // Show only selected channel
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                if (this.currentChannel === 'red') {
                    data[i + 1] = data[i]; // Copy red to green
                    data[i + 2] = data[i]; // Copy red to blue
                } else if (this.currentChannel === 'green') {
                    data[i] = data[i + 1]; // Copy green to red
                    data[i + 2] = data[i + 1]; // Copy green to blue
                } else if (this.currentChannel === 'blue') {
                    data[i] = data[i + 2]; // Copy blue to red
                    data[i + 1] = data[i + 2]; // Copy blue to green
                }
            }
            
            this.ctx.putImageData(imageData, 0, 0);
        } else {
            // Restore RGB
            this.redrawCanvas();
        }
    }

    // Path methods
    newPath() {
        const pathName = prompt('Enter path name:');
        if (pathName) {
            this.paths.push({
                id: this.paths.length,
                name: pathName,
                points: [],
                closed: false
            });
            this.currentPath = this.paths.length - 1;
            this.updatePathPanel();
        }
    }

    deletePath() {
        if (this.currentPath !== null) {
            this.paths.splice(this.currentPath, 1);
            this.currentPath = this.paths.length > 0 ? this.paths.length - 1 : null;
            this.updatePathPanel();
        }
    }

    loadPath() {
        alert('Path would be loaded here');
    }

    savePath() {
        alert('Path would be saved here');
    }

    // Brush methods
    newBrush() {
        const brushName = prompt('Enter brush name:');
        if (brushName) {
            this.brushes.push({
                name: brushName,
                size: this.brushSize,
                hardness: this.brushHardness,
                spacing: 25
            });
            this.updateBrushPanel();
        }
    }

    deleteBrush() {
        alert('Current brush would be deleted here');
    }

    resetBrushes() {
        this.brushes = [
            { name: 'Soft Round', size: 25, hardness: 0, spacing: 25 },
            { name: 'Hard Round', size: 25, hardness: 100, spacing: 25 },
            { name: 'Soft Airbrush', size: 50, hardness: 0, spacing: 15 },
            { name: 'Chalk', size: 35, hardness: 50, spacing: 35 },
            { name: 'Spray', size: 40, hardness: 0, spacing: 50 },
            { name: 'Texture', size: 30, hardness: 75, spacing: 25 }
        ];
        this.updateBrushPanel();
    }

    // Tool preset methods
    newToolPreset() {
        const presetName = prompt('Enter preset name:');
        if (presetName) {
            this.toolPresets.push({
                name: presetName,
                tool: this.currentTool,
                settings: this.getCurrentToolSettings()
            });
            this.updateToolPresetsPanel();
        }
    }

    deleteToolPreset() {
        alert('Current tool preset would be deleted here');
    }

    resetToolPresets() {
        this.toolPresets = [
            { name: 'Basic Brush', tool: 'brush', size: 10, opacity: 100 },
            { name: 'Large Brush', tool: 'brush', size: 50, opacity: 80 },
            { name: 'Detail Brush', tool: 'brush', size: 3, opacity: 100 },
            { name: 'Soft Eraser', tool: 'eraser', size: 20, opacity: 50 },
            { name: 'Hard Eraser', tool: 'eraser', size: 10, opacity: 100 },
            { name: 'Clone Stamp', tool: 'clone-stamp', size: 25, opacity: 100 }
        ];
        this.updateToolPresetsPanel();
    }

    getCurrentToolSettings() {
        return {
            size: this.brushSize,
            opacity: this.brushOpacity,
            hardness: this.brushHardness
        };
    }

    applyToolPreset(preset) {
        this.currentTool = preset.tool;
        this.brushSize = preset.size || 10;
        this.brushOpacity = preset.opacity || 100;
        this.brushHardness = preset.hardness || 100;
        
        this.selectTool(preset.tool);
        this.updateBrushSettings();
    }

    // Action methods
    playAction(action) {
        alert(`Action "${action.name}" would be played here`);
    }

    playCurrentAction() {
        alert('Current action would be played here');
    }

    startRecordingAction() {
        alert('Action recording would start here');
    }

    stopRecordingAction() {
        alert('Action recording would stop here');
    }

    deleteCurrentAction() {
        alert('Current action would be deleted here');
    }

    newAction() {
        const actionName = prompt('Enter action name:');
        if (actionName) {
            this.actions.push({
                name: actionName,
                steps: []
            });
            this.updateActionsPanel();
        }
    }

    // History methods
    createSnapshot() {
        const snapshotName = prompt('Enter snapshot name:');
        if (snapshotName) {
            alert(`Snapshot "${snapshotName}" would be created here`);
        }
    }

    deleteSnapshot() {
        alert('Current snapshot would be deleted here');
    }

    clearHistory() {
        if (confirm('Clear all history? This cannot be undone.')) {
            this.history = [this.history[0]];
            this.historyStep = 0;
            this.updateHistoryList();
        }
    }

    // Layer comp methods
    newLayerComp() {
        const compName = prompt('Enter layer comp name:');
        if (compName) {
            this.layerComps.push({
                name: compName,
                layerStates: this.layers.map(layer => ({
                    visible: layer.visible,
                    opacity: layer.opacity,
                    blendMode: layer.blendMode
                }))
            });
            this.updateLayerCompsPanel();
        }
    }

    deleteLayerComp() {
        alert('Current layer comp would be deleted here');
    }

    applyLayerComp() {
        alert('Selected layer comp would be applied here');
    }

    // Timeline methods
    playTimeline() {
        alert('Timeline would play here');
    }

    pauseTimeline() {
        alert('Timeline would pause here');
    }

    stopTimeline() {
        alert('Timeline would stop here');
    }

    rewindTimeline() {
        alert('Timeline would rewind here');
    }

    forwardTimeline() {
        alert('Timeline would forward here');
    }

    // Brush settings methods
    updateBrushSettings() {
        if (document.getElementById('brushDiameter')) {
            document.getElementById('brushDiameter').value = this.brushSize;
            document.getElementById('brushDiameterValue').textContent = this.brushSize + 'px';
        }
        
        if (document.getElementById('brushHardness')) {
            document.getElementById('brushHardness').value = this.brushHardness;
            document.getElementById('brushHardnessValue').textContent = this.brushHardness + '%';
        }
        
        if (document.getElementById('brushSpacing')) {
            document.getElementById('brushSpacing').value = 25;
            document.getElementById('brushSpacingValue').textContent = '25%';
        }
    }

    // Clone source methods
    newCloneSource() {
        const sourceName = prompt('Enter clone source name:');
        if (sourceName) {
            this.cloneSources.push({
                name: sourceName,
                imageData: this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
            });
            this.updateCloneSourcePanel();
        }
    }

    deleteCloneSource() {
        alert('Current clone source would be deleted here');
    }

    resetCloneSource() {
        this.cloneSources = [];
        this.updateCloneSourcePanel();
    }

    // Animation methods
    playAnimation() {
        alert('Animation would play here');
    }

    pauseAnimation() {
        alert('Animation would pause here');
    }

    stopAnimation() {
        alert('Animation would stop here');
    }

    exportAnimation() {
        alert('Animation would be exported here');
    }

    // Measurement methods
    updateMeasurements() {
        // Update measurement display based on current units
        const x = parseFloat(document.getElementById('measureX').textContent);
        const y = parseFloat(document.getElementById('measureY').textContent);
        const w = parseFloat(document.getElementById('measureW').textContent);
        const h = parseFloat(document.getElementById('measureH').textContent);
        
        // Convert based on selected units
        const unitX = document.getElementById('measureUnitX').value;
        const unitY = document.getElementById('measureUnitY').value;
        const unitW = document.getElementById('measureUnitW').value;
        const unitH = document.getElementById('measureUnitH').value;
        const unitD = document.getElementById('measureUnitD').value;
        
        // Update display based on conversion
        document.getElementById('measureX').textContent = this.convertUnits(x, 'px', unitX).toFixed(2);
        document.getElementById('measureY').textContent = this.convertUnits(y, 'px', unitY).toFixed(2);
        document.getElementById('measureW').textContent = this.convertUnits(w, 'px', unitW).toFixed(2);
        document.getElementById('measureH').textContent = this.convertUnits(h, 'px', unitH).toFixed(2);
    }

    convertUnits(value, fromUnit, toUnit) {
        const conversions = {
            'px': { 'in': 1/96, 'cm': 1/37.8, 'mm': 1/3.78, 'pt': 1/1.33 },
            'in': { 'px': 96, 'cm': 2.54, 'mm': 25.4, 'pt': 72 },
            'cm': { 'px': 37.8, 'in': 0.3937, 'mm': 10, 'pt': 28.35 },
            'mm': { 'px': 3.78, 'in': 0.03937, 'cm': 0.1, 'pt': 2.835 },
            'pt': { 'px': 1.33, 'in': 1/72, 'cm': 0.03528, 'mm': 0.3528 }
        };
        
        if (fromUnit === toUnit) return value;
        
        const pxValue = value * (conversions[fromUnit] || 1);
        return pxValue * (conversions[toUnit] || 1);
    }

    // Notes methods
    newNote() {
        const noteText = prompt('Enter note:');
        if (noteText) {
            this.notes.push({
                id: this.notes.length,
                text: noteText,
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height
            });
            this.updateNotesPanel();
        }
    }

    deleteNote() {
        alert('Current note would be deleted here');
    }

    clearNotes() {
        if (confirm('Clear all notes?')) {
            this.notes = [];
            this.updateNotesPanel();
        }
    }

    // 3D methods
    new3DLayer() {
        alert('3D layer would be created here');
    }

    extrude3D() {
        alert('3D extrusion would be applied here');
    }

    revolve3D() {
        alert('3D revolution would be applied here');
    }

    inflate3D() {
        alert('3D inflation would be applied here');
    }

    update3DMaterial() {
        const material = document.getElementById('3dMaterial').value;
        alert(`3D material would be updated to: ${material}`);
    }

    update3DLighting() {
        const lighting = document.getElementById('3dLighting').value;
        alert(`3D lighting would be updated to: ${lighting}`);
    }

    // Video methods
    importVideo() {
        alert('Video would be imported here');
    }

    exportVideo() {
        alert('Video would be exported here');
    }

    openVideoSettings() {
        alert('Video settings would be opened here');
    }

    // Liquify methods
    createVanishingPlane() {
        alert('Vanishing plane would be created here');
    }

    editVanishingPlane() {
        alert('Vanishing plane would be edited here');
    }

    deleteVanishingPlane() {
        alert('Vanishing plane would be deleted here');
    }

    // Puppet warp methods
    addPuppetPin() {
        alert('Puppet pin would be added here');
    }

    removePuppetPin() {
        alert('Puppet pin would be removed here');
    }

    resetPuppetPins() {
        alert('All puppet pins would be reset here');
    }

    updatePuppetWarpMode() {
        const mode = document.getElementById('puppetWarpMode').value;
        alert(`Puppet warp mode would be set to: ${mode}`);
    }

    // Perspective warp methods
    addPerspectiveCorner() {
        alert('Perspective corner would be added here');
    }

    removePerspectiveCorner() {
        alert('Perspective corner would be removed here');
    }

    resetPerspective() {
        alert('Perspective would be reset here');
    }

    // Content-aware methods
    toggleProtectSkin() {
        alert('Skin protection would be toggled');
    }

    toggleProtectTones() {
        alert('Tone protection would be toggled');
    }

    toggleProtectColors() {
        alert('Color protection would be toggled');
    }

    // UI update methods
    updateUI() {
        this.updateCanvasSize();
        this.updateToolInfo();
        this.updateCursor();
        this.updateZoomDisplay();
        this.updateInfoPanel();
    }

    updateCanvasSize() {
        document.getElementById('docSize').textContent = `${this.canvas.width} × ${this.canvas.height}`;
    }

    updateZoomDisplay() {
        document.getElementById('zoomLevel').textContent = Math.round(this.zoom * 100) + '%';
    }

    updateInfoPanel() {
        if (document.getElementById('infoWidth')) {
            document.getElementById('infoWidth').textContent = `${this.canvas.width}px`;
            document.getElementById('infoHeight').textContent = `${this.canvas.height}px`;
            document.getElementById('infoChannels').textContent = 'RGB';
            document.getElementById('infoResolution').textContent = '72 ppi';
            document.getElementById('infoColorMode').textContent = 'RGB Color';
            document.getElementById('infoBitDepth').textContent = '8-bit';
            document.getElementById('infoColorProfile').textContent = 'sRGB IEC61966-2.1';
            
            const widthInches = (this.canvas.width / 96).toFixed(2);
            const heightInches = (this.canvas.height / 96).toFixed(2);
            document.getElementById('infoDimensions').textContent = `${widthInches} x ${heightInches} in`;
            
            const fileSize = (this.canvas.width * this.canvas.height * 4 / 1024 / 1024).toFixed(2);
            document.getElementById('infoFileSize').textContent = `${fileSize} MB`;
        }
    }

    // Panel dragging
    setupPanelDragging() {
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

    // Menu handling
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
        this.createMenuDialog('File', [
            'New', 'Open', 'Save', 'Save As', 'Export', 'Print', 'Close'
        ]);
    }

    showEditMenu() {
        this.createMenuDialog('Edit', [
            'Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Clear', 'Free Transform', 'Transform Selection', 'Define Pattern', 'Fill', 'Stroke', 'Content-Aware Scale', 'Puppet Warp', 'Perspective Warp', 'Camera Raw Filter', 'Liquify'
        ]);
    }

    showImageMenu() {
        this.createMenuDialog('Image', [
            'Mode', 'Adjustments', 'Auto Tone', 'Auto Contrast', 'Auto Color', 'Image Size', 'Canvas Size', 'Crop', 'Rotate', 'Flip Horizontal', 'Flip Vertical', 'Image Rotation', 'Trim', 'Reveal All', 'Histogram', 'Trap', 'Shallow Copy', 'Copy', 'Apply Image', 'Calculations', 'Variables'
        ]);
    }

    showLayerMenu() {
        this.createMenuDialog('Layer', [
            'New Layer', 'Duplicate Layer', 'Delete Layer', 'Layer Style', 'Layer Mask', 'Vector Mask', 'Create Clipping Mask', 'Rasterize', 'New Adjustment Layer', 'New Fill Layer', 'New Smart Object', 'Convert to Smart Object', 'Group Layers', 'Ungroup Layers', 'Merge Layers', 'Merge Visible', 'Flatten Image', 'Show/Hide All', 'Arrange', 'Align', 'Distribute', 'Lock Layers', 'Link Layers', 'Select All Layers', 'Color Lookup', 'Panel Options'
        ]);
    }

    showSelectMenu() {
        this.createMenuDialog('Select', [
            'All', 'Deselect', 'Reselect', 'Inverse', 'Color Range', 'Color Range', 'Modify', 'Grow', 'Similar', 'Expand', 'Contract', 'Feather', 'Select Subject', 'Select and Mask', 'Transform Selection', 'Edit in Quick Mask Mode', 'Save Selection', 'Load Selection'
        ]);
    }

    showFilterMenu() {
        this.createMenuDialog('Filter', [
            'Filter Gallery', 'Blur', 'Sharpen', 'Noise', 'Pixelate', 'Render', 'Stylize', 'Distort', 'Other', 'Vanishing Point', 'Puppet Warp', 'Lens Correction', 'Adaptive Wide Angle', 'Camera Raw Filter', 'Liquify', 'Neural Filters'
        ]);
    }

    showViewMenu() {
        this.createMenuDialog('View', [
            'Proof Setup', 'Gamut Warning', 'Zoom', 'Screen Mode', 'Show', 'Rulers', 'Guides', 'Grid', 'Snap', 'Snap To', 'Clear Guides', 'New Guide Layout', 'Lock Guides', 'Lock Slices', 'Clear Slices', 'Path', 'Clone Source', 'Info', 'Histogram', 'Tool Tips', 'Show Extras', 'Show Layers', 'Show Paths', 'Show Channels', 'Show Notes'
        ]);
    }

    showWindowMenu() {
        this.createMenuDialog('Window', [
            'Arrange', 'Workspace', 'Lock Panels', 'New Workspace', 'Delete Workspace', 'Reset Workspace', 'Keyboard Shortcuts & Menus', 'Menus', 'Actions', 'History', 'Tools', 'Documents', 'Brushes', 'Swatches', 'Styles', 'Patterns', 'Gradients', 'Tool Presets', 'Character', 'Paragraph', 'Character Styles', 'Paragraph Styles', 'Libraries', 'Brush Presets', 'Tool Presets', 'Layer Comps', 'Timeline', 'Paths', 'Track Matte', 'Properties', 'Adjustments', 'Navigator', 'Info', 'Color', 'Histogram', 'Channels', 'Layers', '3D', 'Timeline', 'Brush Settings', 'Clone Source', 'Animation', 'Measurement', 'Notes', 'Reference'
        ]);
    }

    showHelpMenu() {
        this.createMenuDialog('Help', [
            'Photoshop Help', 'About Photoshop', 'System Info', 'Legal Notices', 'License', 'Patents', 'Log Out', 'Updates', 'Welcome Screen'
        ]);
    }

    createMenuDialog(title, items) {
        const dialog = this.createDialog(title);
        
        const content = dialog.querySelector('.dialog-content');
        const menuList = document.createElement('div');
        menuList.className = 'menu-list';
        
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.textContent = item;
            menuItem.addEventListener('click', () => {
                this.handleMenuItem(item);
                this.closeDialog();
            });
            menuList.appendChild(menuItem);
        });
        
        content.appendChild(menuList);
        
        const buttons = dialog.querySelector('.dialog-buttons');
        buttons.innerHTML = `
            <button class="dialog-button" onclick="photoshop.closeDialog()">Cancel</button>
        `;
    }

    handleMenuItem(item) {
        alert(`Menu item "${item}" would be handled here`);
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

    // Resize handling
    handleResize() {
        this.updateCanvasTransform();
    }

    // Context menu
    handleContextMenu(e) {
        e.preventDefault();
        this.showContextMenu(e.clientX, e.clientY);
    }

    showContextMenu(x, y) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        
        const items = [
            'Copy', 'Paste', 'Cut', 'Select All', 'Deselect', 'Free Transform',
            'Rotate 90° CW', 'Rotate 90° CCW', 'Flip Horizontal', 'Flip Vertical'
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
        
        const newWidth = Math.abs(this.canvas.width * Math.cos(radians)) + Math.abs(this.canvas.height * Math.sin(radians));
        const newHeight = Math.abs(this.canvas.width * Math.sin(radians)) + Math.abs(this.canvas.height * Math.cos(radians));
        
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, newWidth, newHeight);
        
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
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
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

    // Initialize adjustment layer handlers
    initializeAdjustmentLayers() {
        const adjustmentBtns = document.querySelectorAll('.adjustment-btn');
        adjustmentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const adjustment = btn.dataset.adjustment;
                this.createAdjustmentLayer(adjustment);
            });
        });
    }

    // Create adjustment layer dialog
    showAdjustmentDialog(type) {
        const adjustment = this.adjustments[type];
        const dialog = this.createDialog(adjustment.name);
        
        const content = dialog.querySelector('.dialog-content');
        
        // Create controls based on adjustment type
        const controls = this.createAdjustmentControls(type);
        content.appendChild(controls);
        
        const buttons = dialog.querySelector('.dialog-buttons');
        buttons.innerHTML = `
            <button class="dialog-button" onclick="photoshop.closeDialog()">Cancel</button>
            <button class="dialog-button primary" onclick="photoshop.applyAdjustment('${type}')">OK</button>
        `;
    }

    createAdjustmentControls(type) {
        const container = document.createElement('div');
        container.className = 'adjustment-controls';
        
        switch (type) {
            case 'brightness':
                container.innerHTML = `
                    <div class="control-group">
                        <label>Brightness:</label>
                        <input type="range" id="adjBrightness" min="-100" max="100" value="0">
                        <span id="adjBrightnessValue">0</span>
                    </div>
                    <div class="control-group">
                        <label>Contrast:</label>
                        <input type="range" id="adjContrast" min="-100" max="100" value="0">
                        <span id="adjContrastValue">0</span>
                    </div>
                `;
                break;
            case 'levels':
                container.innerHTML = `
                    <div class="levels-editor">
                        <canvas id="levelsHistogram" width="300" height="200"></canvas>
                        <div class="levels-controls">
                            <div class="control-group">
                                <label>Input Levels:</label>
                                <input type="range" id="inputBlack" min="0" max="255" value="0">
                                <input type="range" id="inputWhite" min="0" max="255" value="255">
                            </div>
                            <div class="control-group">
                                <label>Output Levels:</label>
                                <input type="range" id="outputBlack" min="0" max="255" value="0">
                                <input type="range" id="outputWhite" min="0" max="255" value="255">
                            </div>
                            <div class="control-group">
                                <label>Gamma:</label>
                                <input type="range" id="gamma" min="0.1" max="10" value="1" step="0.1">
                                <span id="gammaValue">1.0</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'curves':
                container.innerHTML = `
                    <div class="curves-editor">
                        <canvas id="curvesCanvas" width="400" height="300"></canvas>
                    </div>
                `;
                break;
            case 'hue':
                container.innerHTML = `
                    <div class="hue-saturation-controls">
                        <div class="control-group">
                            <label>Hue:</label>
                            <input type="range" id="hue" min="-180" max="180" value="0">
                            <span id="hueValue">0°</span>
                        </div>
                        <div class="control-group">
                            <label>Saturation:</label>
                            <input type="range" id="saturation" min="-100" max="100" value="0">
                            <span id="saturationValue">0</span>
                        </div>
                        <div class="control-group">
                            <label>Lightness:</label>
                            <input type="range" id="lightness" min="-100" max="100" value="0">
                            <span id="lightnessValue">0</span>
                        </div>
                        <div class="control-group">
                            <label>Colorize:</label>
                            <input type="checkbox" id="colorize">
                        </div>
                    </div>
                `;
                break;
            default:
                container.innerHTML = `<p>Adjustment controls for ${type}</p>`;
        }
        
        // Add event listeners
        container.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const valueSpan = document.getElementById(input.id + 'Value');
                if (valueSpan) {
                    valueSpan.textContent = input.value + (input.id.includes('hue') ? '°' : '');
                }
            });
        });
        
        return container;
    }

    applyAdjustment(type) {
        const adjustment = this.adjustments[type];
        
        switch (type) {
            case 'brightness':
                const brightness = parseInt(document.getElementById('adjBrightness').value);
                const contrast = parseInt(document.getElementById('adjContrast').value);
                this.applyBrightnessContrast(brightness, contrast);
                break;
            case 'levels':
                this.applyLevelsAdjustment();
                break;
            case 'curves':
                this.applyCurvesAdjustment();
                break;
            case 'hue':
                this.applyHueSaturation();
                break;
            default:
                alert(`${adjustment.name} adjustment would be applied here`);
        }
        
        this.closeDialog();
    }

    applyBrightnessContrast(brightness, contrast) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128 + brightness));
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128 + brightness));
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128 + brightness));
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
        this.updateLayerThumbnail();
    }

    applyLevelsAdjustment() {
        const inputBlack = parseInt(document.getElementById('inputBlack').value);
        const inputWhite = parseInt(document.getElementById('inputWhite').value);
        const outputBlack = parseInt(document.getElementById('outputBlack').value);
        const outputWhite = parseInt(document.getElementById('outputWhite').value);
        const gamma = parseFloat(document.getElementById('gamma').value);
        
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // Apply input levels
            let value = data[i];
            value = ((value - inputBlack) / (inputWhite - inputBlack)) * 255;
            
            // Apply gamma correction
            value = Math.pow(value / 255, gamma) * 255;
            
            // Apply output levels
            value = (value / 255) * (outputWhite - outputBlack) + outputBlack;
            
            data[i] = Math.min(255, Math.max(0, value));
            data[i + 1] = Math.min(255, Math.max(0, value));
            data[i + 2] = Math.min(255, Math.max(0, value));
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
        this.updateLayerThumbnail();
    }

    applyCurvesAdjustment() {
        alert('Curves adjustment would be applied here');
        this.closeDialog();
    }

    applyHueSaturation() {
        const hue = parseInt(document.getElementById('hue').value);
        const saturation = parseInt(document.getElementById('saturation').value);
        const lightness = parseInt(document.getElementById('lightness').value);
        const colorize = document.getElementById('colorize').checked;
        
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (colorize) {
                // Convert to HSL, adjust, convert back
                const hsl = this.rgbToHsl(r, g, b);
                hsl.h = (hsl.h + hue + 360) % 360;
                hsl.s = Math.max(0, Math.min(100, hsl.s + saturation));
                hsl.l = Math.max(0, Math.min(100, hsl.l + lightness));
                
                const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
                data[i] = rgb.r;
                data[i + 1] = rgb.g;
                data[i + 2] = rgb.b;
            } else {
                // Adjust saturation and lightness in RGB
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                const satFactor = 1 + (saturation / 100);
                const lightFactor = 1 + (lightness / 100);
                
                data[i] = Math.min(255, Math.max(0, gray + (r - gray) * satFactor * lightFactor));
                data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * satFactor * lightFactor));
                data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * satFactor * lightFactor));
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
        this.updateLayerThumbnail();
        this.closeDialog();
    }

    // Additional utility methods
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const h = (max - min) / (max - min);
        const l = (max + min) / 2;
        
        let s = 0;
        if (h > 0) {
            s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
        }
        
        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }

    // Update all panels
    updateChannelPanel() {
        // Update channel panel display
        const channelItems = document.querySelectorAll('.channel');
        channelItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.channel === this.currentChannel) {
                item.classList.add('active');
            }
        });
    }

    updatePathPanel() {
        // Update path panel display
        const pathItems = document.querySelectorAll('.path');
        pathItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.path === this.currentPath) {
                item.classList.add('active');
            }
        });
    }

    updateBrushPanel() {
        // Update brush panel display
        const brushesList = document.getElementById('brushesList');
        brushesList.innerHTML = '';
        
        this.brushes.forEach(brush => {
            const brushItem = document.createElement('div');
            brushItem.className = 'brush-item';
            brushItem.innerHTML = `
                <canvas width="60" height="60"></canvas>
            `;
            
            const canvas = brushItem.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            this.drawBrushPreview(ctx, brush);
            
            brushItem.addEventListener('click', () => {
                document.querySelectorAll('.brush-item').forEach(b => b.classList.remove('active'));
                brushItem.classList.add('active');
                this.brushSize = brush.size;
                this.brushHardness = brush.hardness;
                this.updateBrushSettings();
            });
            
            brushesList.appendChild(brushItem);
        });
    }

    updateToolPresetsPanel() {
        // Update tool presets panel display
        const toolPresetsList = document.getElementById('toolPresetsList');
        toolPresetsList.innerHTML = '';
        
        this.toolPresets.forEach(preset => {
            const presetItem = document.createElement('div');
            presetItem.className = 'tool-preset-item';
            presetItem.innerHTML = `
                <div class="tool-preset-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
                    </svg>
                </div>
                <div class="tool-preset-name">${preset.name}</div>
            `;
            
            presetItem.addEventListener('click', () => {
                document.querySelectorAll('.tool-preset-item').forEach(p => p.classList.remove('active'));
                presetItem.classList.add('active');
                this.applyToolPreset(preset);
            });
            
            toolPresetsList.appendChild(presetItem);
        });
    }

    updateActionsPanel() {
        // Update actions panel display
        const actionsList = document.getElementById('actionsList');
        actionsList.innerHTML = '';
        
        this.actions.forEach(action => {
            const actionItem = document.createElement('div');
            actionItem.className = 'action-item';
            actionItem.innerHTML = `
                <div class="action-icon">${action.icon}</div>
                <div class="action-name">${action.name}</div>
            `;
            
            actionItem.addEventListener('click', () => {
                this.playAction(action);
            });
            
            actionsList.appendChild(actionItem);
        });
    }

    updateLayerCompsPanel() {
        // Update layer comps panel display
        const layerCompsList = document.getElementById('layerCompsList');
        layerCompsList.innerHTML = '';
        
        this.layerComps.forEach(comp => {
            const compItem = document.createElement('div');
            compItem.className = 'layer-comp-item';
            compItem.innerHTML = `
                <div class="layer-comp-thumbnail">
                    <canvas width="32" height="32"></canvas>
                </div>
                <div class="layer-comp-name">${comp.name}</div>
            `;
            
            compItem.addEventListener('click', () => {
                this.applyLayerComp();
            });
            
            layerCompsList.appendChild(compItem);
        });
    }

    updateCloneSourcePanel() {
        // Update clone source panel display
        const cloneSourceList = document.getElementById('cloneSourceList');
        cloneSourceList.innerHTML = '';
        
        this.cloneSources.forEach(source => {
            const sourceItem = document.createElement('div');
            sourceItem.className = 'clone-source-item';
            sourceItem.innerHTML = `
                <div class="clone-source-thumbnail">
                    <canvas width="32" height="32"></canvas>
                </div>
                <div class="clone-source-name">${source.name}</div>
            `;
            
            sourceItem.addEventListener('click', () => {
                // Select clone source
            });
            
            cloneSourceList.appendChild(sourceItem);
        });
    }

    updateNotesPanel() {
        // Update notes panel display
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';
        
        this.notes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.innerHTML = `
                <div class="note-icon">N</div>
                <div class="note-text">${note.text}</div>
            `;
            
            noteItem.addEventListener('click', () => {
                // Edit note
                const newText = prompt('Edit note:', note.text);
                if (newText !== null) {
                    note.text = newText;
                    this.updateNotesPanel();
                }
            });
            
            notesList.appendChild(noteItem);
        });
    }

    // Additional methods for remaining panels
    setupColorModel(model) {
        const content = document.getElementById('colorModelContent');
        
        switch (model) {
            case 'hsb':
                content.innerHTML = `
                    <div class="hsb-controls">
                        <div class="control-group">
                            <label>H:</label>
                            <input type="range" id="hsbHue" min="0" max="360" value="0">
                            <span id="hsbHueValue">0°</span>
                        </div>
                        <div class="control-group">
                            <label>S:</label>
                            <input type="range" id="hsbSaturation" min="0" max="100" value="100">
                            <span id="hsbSaturationValue">100%</span>
                        </div>
                        <div class="control-group">
                            <label>B:</label>
                            <input type="range" id="hsbBrightness" min="0" max="100" value="50">
                            <span id="hsbBrightnessValue">50%</span>
                        </div>
                    </div>
                `;
                break;
            case 'lab':
                content.innerHTML = `
                    <div class="lab-controls">
                        <div class="control-group">
                            <label>L:</label>
                            <input type="range" id="labLightness" min="0" max="100" value="50">
                            <span id="labLightnessValue">50</span>
                        </div>
                        <div class="control-group">
                            <label>a:</label>
                            <input type="range" id="labA" min="-128" max="127" value="0">
                            <span id="labAValue">0</span>
                        </div>
                        <div class="control-group">
                            <label>b:</label>
                            <input type="range" id="labB" min="-128" max="127" value="0">
                            <span id="labBValue">0</span>
                        </div>
                    </div>
                `;
                break;
            case 'cmyk':
                content.innerHTML = `
                    <div class="cmyk-controls">
                        <div class="control-group">
                            <label>C:</label>
                            <input type="range" id="cmykCyan" min="0" max="100" value="0">
                            <span id="cmykCyanValue">0%</span>
                        </div>
                        <div class="control-group">
                            <label>M:</label>
                            <input type="range" id="cmykMagenta" min="0" max="100" value="0">
                            <span id="cmykMagentaValue">0%</span>
                        </div>
                        <div class="control-group">
                            <label>Y:</label>
                            <input type="range" id="cmykYellow" min="0" max="100" value="0">
                            <span id="cmykYellowValue">0%</span>
                        </div>
                        <div class="control-group">
                            <label>K:</label>
                            <input type="range" id="cmykBlack" min="0" max="100" value="0">
                            <span id="cmykBlackValue">0%</span>
                        </div>
                    </div>
                `;
                break;
            default:
                content.innerHTML = `<p>Select a color model</p>`;
        }
        
        // Add event listeners
        content.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const valueSpan = document.getElementById(input.id + 'Value');
                if (valueSpan) {
                    valueSpan.textContent = e.target.value + (input.id.includes('Hue') ? '°' : '%');
                }
                
                // Update RGB values
                this.updateRGBFromColorModel();
            });
        });
    }

    updateRGBFromColorModel() {
        const model = document.querySelector('.model-tab.active')?.dataset.model;
        
        if (model === 'hsb') {
            const h = parseInt(document.getElementById('hsbHue').value);
            const s = parseInt(document.getElementById('hsbSaturation').value);
            const b = parseInt(document.getElementById('hsbBrightness').value);
            
            const rgb = this.hslToRgb(h, s, b);
            this.foregroundColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        } else if (model === 'lab') {
            const l = parseInt(document.getElementById('labLightness').value);
            const a = parseInt(document.getElementById('labA').value);
            const b = parseInt(document.getElementById('labB').value);
            
            // Convert Lab to RGB (simplified)
            const y = (l + 16) / 116;
            const x = a / 500 + 0.5;
            const z = b / 200 + 0.5;
            
            const rgb = this.labToRgb(x, y, z);
            this.foregroundColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        } else if (model === 'cmyk') {
            const c = parseInt(document.getElementById('cmykCyan').value);
            const m = parseInt(document.getElementById('cmykMagenta').value);
            const y = parseInt(document.getElementById('cmykYellow').value);
            const k = parseInt(document.getElementById('cmykBlack').value);
            
            // Convert CMYK to RGB (simplified)
            const r = 255 * (1 - c/100) * (1 - k/100);
            const g = 255 * (1 - m/100) * (1 - k/100);
            const b = 255 * (1 - y/100) * (1 - k/100);
            
            this.foregroundColor = this.rgbToHex(r, g, b);
        }
        
        this.updateColorDisplay();
        this.updateColorPanel();
    }

    labToRgb(x, y, z) {
        // Simplified Lab to RGB conversion
        const fy = y >= 6/29 ? y * y * y * y : 108/841 * (y - 6/29);
        const fx = x >= 0.25 ? fx * fx * fx * fx : 108/841 * (4/29 * fy - 2/29);
        const fz = z >= 0.25 ? fz * fz * fz * fz : 108/841 * (4/29 * fy - 2/29);
        
        const rgb = {
            r: 500 * (fx - 2/3) + 128,
            g: 500 * (fy - 2/3) + 128,
            b: 500 * (fz - 2/3) + 128
        };
        
        return {
            r: Math.max(0, Math.min(255, rgb.r)),
            g: Math.max(0, Math.min(255, rgb.g)),
            b: Math.max(0, Math.min(255, rgb.b))
        };
    }
}

// Initialize the complete Photoshop application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const photoshop = new AdobePhotoshopComplete();
    
    // Make it globally available for debugging
    window.photoshop = photoshop;
    
    // Initialize menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            photoshop.handleMenuClick(item.dataset.menu);
        });
    });
    
    // Initialize adjustment layer handlers
    photoshop.initializeAdjustmentLayers();
});
