/**
 * OFF SCRIPT - Camera Controls Module (Apple-style Refined)
 * Handles user interaction with 3D scene
 */

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraDistance = 30;

function setupControls(canvas) {
    // Mouse controls
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    
    // Touch controls for mobile
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    
    // Set cursor style
    canvas.style.cursor = 'grab';
}

function onMouseDown(e) {
    isDragging = true;
    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
    e.target.style.cursor = 'grabbing';
}

function onMouseMove(e) {
    if (!isDragging) return;
    
    const deltaX = e.offsetX - previousMousePosition.x;
    const deltaY = e.offsetY - previousMousePosition.y;
    
    rotateCameraAround(deltaX * 0.008, deltaY * 0.008);
    
    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
}

function onMouseUp(e) {
    isDragging = false;
    if (e.target.tagName === 'CANVAS') {
        e.target.style.cursor = 'grab';
    }
}

function onWheel(e) {
    e.preventDefault();
    
    const delta = e.deltaY * 0.008;
    cameraDistance += delta;
    cameraDistance = Math.max(12, Math.min(60, cameraDistance));
    
    updateCameraPosition();
}

function onTouchStart(e) {
    if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        e.preventDefault();
    } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        previousMousePosition.pinchDistance = Math.sqrt(dx * dx + dy * dy);
        e.preventDefault();
    }
}

function onTouchMove(e) {
    if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        
        rotateCameraAround(deltaX * 0.008, deltaY * 0.008);
        
        previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    } else if (e.touches.length === 2) {
        e.preventDefault();
        
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (previousMousePosition.pinchDistance) {
            const delta = previousMousePosition.pinchDistance - distance;
            cameraDistance += delta * 0.05;
            cameraDistance = Math.max(12, Math.min(60, cameraDistance));
            updateCameraPosition();
        }
        
        previousMousePosition.pinchDistance = distance;
    }
}

function onTouchEnd() {
    isDragging = false;
    delete previousMousePosition.pinchDistance;
}

function rotateCameraAround(deltaX, deltaY) {
    if (!camera) return;
    
    const position = camera.position;
    
    const radius = Math.sqrt(
        position.x * position.x + 
        position.y * position.y + 
        position.z * position.z
    );
    
    let theta = Math.atan2(position.x, position.z);
    let phi = Math.acos(position.y / radius);
    
    theta -= deltaX;
    phi -= deltaY;
    
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
    
    position.x = radius * Math.sin(phi) * Math.sin(theta);
    position.y = radius * Math.cos(phi);
    position.z = radius * Math.sin(phi) * Math.cos(theta);
    
    camera.lookAt(0, 0, 0);
}

function updateCameraPosition() {
    if (!camera) return;
    
    const position = camera.position;
    const currentRadius = Math.sqrt(
        position.x * position.x + 
        position.y * position.y + 
        position.z * position.z
    );
    
    const scale = cameraDistance / currentRadius;
    
    position.x *= scale;
    position.y *= scale;
    position.z *= scale;
}
