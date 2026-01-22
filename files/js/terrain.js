/**
 * OFF SCRIPT - 3D Terrain Generation (Apple-style Refined)
 * High diversity = tall peaks (blue), Low diversity = flat valleys (red)
 */

let scene, camera, renderer, terrain, gridHelper;

function initTerrain(terrainData) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f8f8);
    
    const container = document.getElementById('terrain-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(18, 18, 18);
    camera.lookAt(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Improved lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);
    
    terrain = createTerrainMesh(terrainData);
    scene.add(terrain);
    
    gridHelper = new THREE.GridHelper(20, 20, 0xe0e0e0, 0xf0f0f0);
    scene.add(gridHelper);
    
    setupControls(renderer.domElement);
    window.addEventListener('resize', onWindowResize);
    
    animate();
}

function generateTerrainData(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    return sentences.map((sentence, index) => {
        const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
        const uniqueWords = new Set(words);
        const localDiversity = uniqueWords.size / (words.length || 1);
        
        const avgWordLength = words.reduce((sum, w) => 
            sum + w.length, 0) / (words.length || 1);
        
        // Check for AI markers - ONLY truly AI-specific patterns
        const aiMarkers = [
            /\bit'?s important to note\b/i,
            /\bit'?s worth mentioning\b/i,
            /\bin today'?s (rapidly evolving|digital|modern)\b/i,
            /\bleverage\b.*\b(synerg|opportunit)/i,
            /\bstakeholder(s)?\b.*\b(engag|align|priorit)/i,
            /\bcomprehensive (understanding|approach|strategy|framework)\b/i,
            /\boptimize\b.*\b(workflow|process|performance|operational)\b/i,
            /\b(moreover|furthermore|additionally),\b.*\b(facilitate|enable|enhance)\b/i,
            /\bdata-driven decision(s|-making)?\b/i,
            /\bevidence-based approach(es)?\b/i,
            /\bcompetitive advantage\b/i,
            /\bdigital transformation (initiative|effort|journey)\b/i,
            /\bcross-functional (team|collaboration)\b/i,
            /\bkey performance indicator(s)?\b/i,
            /\bemerging trend(s)?\b.*\b(capitalize|identify)\b/i,
            /\borganizational culture\b.*\b(change management|transformation)\b/i,
            /\bcontinuous learning\b.*\b(innovation|environment)\b/i,
            /\bsubsequently,\b.*\b(foster|enable|facilitate)\b/i,
            /\bparamount\b.*\b(organizational success|achievement)\b/i,
            /\bsynerg(y|ies)\b/i,
            /\bparadigm shift\b/i,
            /\bdelve into\b/i
        ];
        
        let aiPenalty = 0;
        aiMarkers.forEach(marker => {
            if (marker.test(sentence)) aiPenalty += 8; // Strong penalty only for true AI phrases
        });
        
        // STRUCTURAL AI DETECTION
        
        // 1. Excessive sentence length
        if (words.length > 100) {
            aiPenalty += 30; // Very long = very AI-like
        } else if (words.length > 60) {
            aiPenalty += 20;
        } else if (words.length > 40) {
            aiPenalty += 12;
        }
        
        // 2. Hedging/qualifier overuse
        const hedgingWords = sentence.match(/\b(increasingly|arguably|essentially|fundamentally|notably|particularly|specifically|generally|typically|largely|primarily|ultimately|ostensibly|curiously|strategically|cautiously|broadly|perpetually|endlessly|continuously|remarkably)\b/gi);
        if (hedgingWords && hedgingWords.length > 5) {
            aiPenalty += 25;
        } else if (hedgingWords && hedgingWords.length > 3) {
            aiPenalty += 15;
        }
        
        // 3. Comma overuse (subordinate clauses)
        const commaCount = (sentence.match(/,/g) || []).length;
        if (commaCount > 12) {
            aiPenalty += 25;
        } else if (commaCount > 8) {
            aiPenalty += 15;
        } else if (commaCount > 5) {
            aiPenalty += 8;
        }
        
        // 4. Abstract noun density
        const abstractPatterns = sentence.match(/\b(optimization|synthesis|abstraction|coherence|equilibrium|causality|variance|specificity|familiarity|consistency|capability|efficiency|probability|prediction|recognition|computation)\b/gi);
        if (abstractPatterns && abstractPatterns.length > 4) {
            aiPenalty += 20;
        } else if (abstractPatterns && abstractPatterns.length > 2) {
            aiPenalty += 12;
        }
        
        // 5. Recursive/self-referential patterns
        const recursiveCount = (sentence.match(/\b(itself|themselves|self-referential|meta-)\b/gi) || []).length;
        if (recursiveCount > 2) {
            aiPenalty += 15;
        }
        
        // 6. Gerund overuse
        const gerunds = sentence.match(/\b\w+ing\b/g) || [];
        const gerundRatio = gerunds.length / (words.length || 1);
        if (gerundRatio > 0.15) {
            aiPenalty += 15;
        } else if (gerundRatio > 0.1) {
            aiPenalty += 8;
        }
        
        // Check for human markers
        const humanMarkers = [
            /\b(?:I|my|me|you|really|just|actually|literally|honestly|basically|yeah|kinda|sorta)\b/i,
            /[!?]{1,}/,
            /n't|'ll|'re|'ve|'d|'m/
        ];
        
        let humanBonus = 0;
        humanMarkers.forEach(marker => {
            if (marker.test(sentence)) humanBonus += 3; // Increased from 2 to 3
        });
        
        // Calculate height - higher = more human-like (blue/green peaks)
        // Lower = more AI-like (red/orange valleys)
        // Increased diversity weight for better baseline scoring
        let height = (localDiversity * 14) + ((avgWordLength - 4) * 1.2) + humanBonus - (aiPenalty * 0.8);
        
        const gridSize = Math.ceil(Math.sqrt(sentences.length));
        const x = (index % gridSize) - gridSize / 2;
        const z = Math.floor(index / gridSize) - gridSize / 2;
        
        return {
            x: x,
            y: Math.max(1, Math.min(height, 14)), // Raised minimum to 1, max to 14
            z: z,
            text: sentence.trim(),
            diversity: localDiversity,
            index: index
        };
    });
}

function createTerrainMesh(data) {
    const geometry = new THREE.BufferGeometry();
    
    const vertices = [];
    const colors = [];
    const indices = [];
    
    const colorMap = {
        high: new THREE.Color(0xff3b30),    // Red - Very flat (matches --color-high)
        midHigh: new THREE.Color(0xff9500), // Orange - Flat (matches --color-mid-high)
        mid: new THREE.Color(0xffcc00),     // Yellow - Neutral (matches --color-mid)
        midLow: new THREE.Color(0x34c759),  // Green - Diverse (matches --color-mid-low)
        low: new THREE.Color(0x007aff)      // Blue - Very diverse (matches --color-low)
    };
    
    data.forEach(point => {
        vertices.push(point.x, point.y, point.z);
        
        const normalizedHeight = Math.min(point.y / 14, 1); // Updated to match new max
        let color;
        
        // Match the text highlighting colors
        // Higher diversity (taller peaks) = Blue/Green
        // Lower diversity (valleys) = Red/Orange
        if (normalizedHeight > 0.7) {
            color = colorMap.low; // Blue - Very diverse
        } else if (normalizedHeight > 0.5) {
            color = colorMap.midLow; // Green - Diverse
        } else if (normalizedHeight > 0.35) {
            color = colorMap.mid; // Yellow - Neutral
        } else if (normalizedHeight > 0.2) {
            color = colorMap.midHigh; // Orange - Flat
        } else {
            color = colorMap.high; // Red - Very flat
        }
        
        colors.push(color.r, color.g, color.b);
    });
    
    const gridSize = Math.ceil(Math.sqrt(data.length));
    for (let i = 0; i < gridSize - 1; i++) {
        for (let j = 0; j < gridSize - 1; j++) {
            const a = i * gridSize + j;
            const b = i * gridSize + (j + 1);
            const c = (i + 1) * gridSize + j;
            const d = (i + 1) * gridSize + (j + 1);
            
            if (a < data.length && b < data.length && c < data.length) {
                indices.push(a, b, c);
            }
            if (b < data.length && c < data.length && d < data.length) {
                indices.push(b, d, c);
            }
        }
    }
    
    geometry.setAttribute('position', 
        new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', 
        new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: false,
        side: THREE.DoubleSide,
        metalness: 0.05,
        roughness: 0.8
    });
    
    return new THREE.Mesh(geometry, material);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (terrain) {
        terrain.rotation.y += 0.0015;
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('terrain-container');
    if (!container) return;
    
    // Check if in fullscreen mode
    const isFullscreen = document.querySelector('.panel-terrain.fullscreen') !== null;
    
    let width, height;
    
    if (isFullscreen) {
        // In fullscreen, use full viewport dimensions
        width = window.innerWidth;
        height = window.innerHeight;
    } else {
        // Normal mode, use container dimensions
        width = container.clientWidth;
        height = container.clientHeight;
    }
    
    if (camera && renderer) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false); // false to avoid setting style, better performance
    }
}