// OrbitControls is now loaded globally from CDN
// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Initialize renderer with alpha and proper color management
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    logarithmicDepthBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x87CEEB, 1);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Enable shadows
renderer.shadowMap.enabled = true;

// Setup camera
const camera = new THREE.PerspectiveCamera(
    45,                                     // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1,                                    // Near plane
    1000                                    // Far plane
);

// Setup lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 20, 10);
directionalLight.castShadow = true;

// Configure shadow properties
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;

scene.add(directionalLight);

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create basketball court
function createBasketballCourt() {
  // Court floor - wooden surface
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);

  // Court lines material (white)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  
  // Center line
  const centerLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.11, -7.5),
    new THREE.Vector3(0, 0.11, 7.5)
  ]);
  const centerLine = new THREE.Line(centerLineGeometry, lineMaterial);
  scene.add(centerLine);
  
  // Center circle
  const circlePoints = [];
  const circleRadius = 2;
  for (let i = 0; i <= 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(
      Math.cos(angle) * circleRadius,
      0.11,
      Math.sin(angle) * circleRadius
    ));
  }
  const centerCircleGeometry = new THREE.BufferGeometry().setFromPoints(circlePoints);
  const centerCircle = new THREE.Line(centerCircleGeometry, lineMaterial);
  scene.add(centerCircle);

  // Create court markings for each half
  function createCourtHalf(isLeft) {
    const points = [];
    const startX = isLeft ? -15 : 15;  // Baseline position
    const ftLineX = isLeft ? -10.4 : 10.4;  // Free throw line position (4.6 units from baseline)
    const direction = isLeft ? 1 : -1;
    
    // The Key (free throw lane)
    const keyWidth = 4;  // Width of the free throw lane
    
    // Free throw line and key rectangle
    const keyRect = [
      new THREE.Vector3(startX, 0.11, -keyWidth/2),
      new THREE.Vector3(ftLineX, 0.11, -keyWidth/2),
      new THREE.Vector3(ftLineX, 0.11, keyWidth/2),
      new THREE.Vector3(startX, 0.11, keyWidth/2),
      new THREE.Vector3(startX, 0.11, -keyWidth/2)
    ];
    
    // Free throw circle
    const ftRadius = 1.8;  // Correct free throw circle radius
    const ftCenter = new THREE.Vector3(ftLineX, 0.11, 0);  // Center at the free throw line
    const ftPoints = [];
      // Create half circle facing court center
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const angle = isLeft ?
        (Math.PI / 2 - t * Math.PI) :  // Same sweep as right side
        (Math.PI / 2 + t * Math.PI);
      
      ftPoints.push(new THREE.Vector3(
        ftCenter.x + Math.cos(angle) * ftRadius,
        0.11,
        ftCenter.z - Math.sin(angle) * ftRadius   // <-- Note the minus here
      ));
}

    // Three-point line
    const threePointRadius = 6.0;
    const threePointLine = [];
    
    // Calculate where the arc intersects with the sideline
    const sidelineZ = 7.5;  // Half court width
    const arcCenter = new THREE.Vector3(startX, 0.11, 0);
    
    // Create three-point arc
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;      const angle = isLeft ?
        (Math.PI/2 - t * Math.PI) :  // Left side: 90° to -90° (facing into court)
        (Math.PI/2 + t * Math.PI);   // Right side: 90° to -90°
      
      const pointX = arcCenter.x + Math.cos(angle) * threePointRadius;
      const pointZ = Math.sin(angle) * threePointRadius;
      
      // Only add points that are within the court width
      if (Math.abs(pointZ) <= sidelineZ) {
        threePointLine.push(new THREE.Vector3(pointX, 0.11, pointZ));
      }
    }
    
    // Add all lines to scene
    const keyGeometry = new THREE.BufferGeometry().setFromPoints(keyRect);
    const keyLine = new THREE.Line(keyGeometry, lineMaterial);
    scene.add(keyLine);
    
    const ftGeometry = new THREE.BufferGeometry().setFromPoints(ftPoints);
    const ftLine = new THREE.Line(ftGeometry, lineMaterial);
    scene.add(ftLine);
    
    const threePointGeometry = new THREE.BufferGeometry().setFromPoints(threePointLine);
    const threePointArc = new THREE.Line(threePointGeometry, lineMaterial);
    scene.add(threePointArc);
  }

  // Create both halves of the court
  createCourtHalf(true);   // Left side
  createCourtHalf(false);  // Right side
}


// Create basketball hoop
function createBasketballHoop(isLeft) {
  const group = new THREE.Group();
  const xPosition = isLeft ? -13.5 : 13.5;
  
  // Support pole
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 7.5, 8);
  const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(xPosition + (isLeft ? -1.5 : 1.5), 3.75, 0);
  pole.castShadow = true;
  group.add(pole);
  
  // Support arm
  const armGeometry = new THREE.BoxGeometry(2, 0.1, 0.1);
  const arm = new THREE.Mesh(armGeometry, poleMaterial);
  arm.position.set(xPosition + (isLeft ? -0.75 : 0.75), 6, 0);
  arm.castShadow = true;
  group.add(arm);
  
  // Backboard
  const backboardGeometry = new THREE.BoxGeometry(0.1, 2, 3);
  const backboardMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7
  });
  const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
  backboard.position.set(xPosition, 6, 0);
  backboard.castShadow = true;
  group.add(backboard);
    // Rim
  const rimGeometry = new THREE.TorusGeometry(0.45, 0.02, 8, 24);
  const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.position.set(xPosition + (isLeft ? 0.45 : -0.45), 5.3, 0);
  rim.rotation.x = Math.PI / 2;  // Rotate around X axis to lay flat
  rim.castShadow = true;
  group.add(rim);
  
  // Net (using line segments)
  const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const netHeight = 0.6;
  const segments = 12;
  
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const nextAngle = ((i + 1) / segments) * Math.PI * 2;
    
    // Vertical lines
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(
        xPosition + (isLeft ? 0.45 : -0.45) + Math.cos(angle) * 0.45,
        5.3,
        Math.sin(angle) * 0.45
      ),
      new THREE.Vector3(
        xPosition + (isLeft ? 0.45 : -0.45) + Math.cos(angle) * 0.2,
        5.3 - netHeight,
        Math.sin(angle) * 0.2
      )
    ]);
    const line = new THREE.Line(lineGeometry, netMaterial);
    group.add(line);
    
    // Horizontal lines (3 levels)
    for (let j = 1; j <= 3; j++) {
      const heightRatio = j / 4;
      const radiusRatio = 1 - (heightRatio * 0.6);
      const horizontalGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(
          xPosition + (isLeft ? 0.45 : -0.45) + Math.cos(angle) * (0.45 * radiusRatio),
          5.3 - (netHeight * heightRatio),
          Math.sin(angle) * (0.45 * radiusRatio)
        ),
        new THREE.Vector3(
          xPosition + (isLeft ? 0.45 : -0.45) + Math.cos(nextAngle) * (0.45 * radiusRatio),
          5.3 - (netHeight * heightRatio),
          Math.sin(nextAngle) * (0.45 * radiusRatio)
        )
      ]);
      const horizontalLine = new THREE.Line(horizontalGeometry, netMaterial);
      group.add(horizontalLine);
    }
  }
  
  scene.add(group);
}

function createStaticBasketball() {
  // Create basketball with better material properties
  const ballGeometry = new THREE.SphereGeometry(0.6, 64, 64); // Higher resolution
  const ballMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xd2691e,  // More realistic basketball orange
    shininess: 20,    // Less shiny, more matte
    specular: 0x222222 // Darker specular highlights
  });  const basketball = new THREE.Mesh(ballGeometry, ballMaterial);
  basketball.position.set(0, 0.7, 0);  // Place ball at center court, slightly elevated
  basketball.castShadow = true;
  basketball.receiveShadow = true;
  scene.add(basketball);
  
  // Create realistic basketball seam lines
  const seamMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000,
    linewidth: 2
  });

  // Create the main seams of the basketball
  const seams = new THREE.Group();

  // Create horizontal seam (equator)
  const equatorPoints = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    equatorPoints.push(new THREE.Vector3(
      Math.cos(angle) * 0.61,
      0,
      Math.sin(angle) * 0.61
    ));
  }
  const equatorSeam = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(equatorPoints),
    seamMaterial
  );
  seams.add(equatorSeam);

  // Create three perpendicular sets of curved seams
  // Each set rotated by 90 degrees from the others
  for (let j = 0; j < 3; j++) {  // Now creating three perpendicular sets
    const rotationAngle = j * Math.PI / 2;  // 0, 90, and 180 degrees rotation
    
    // Create complete circular seams
    for (let i = -1; i <= 1; i += 2) {  // Create left and right curves
      const points = [];
      // Create full circle of points
      for (let t = 0; t <= 64; t++) {
        const angle = (t / 64) * Math.PI * 2;
        
        let x, y, z;
        if (j === 0) {
          // First set (around X axis)
          x = 0.61 * Math.cos(angle);
          y = 0.61 * i * Math.sin(angle);
          z = 0;
        } else if (j === 1) {
          // Second set (around Y axis)
          x = 0;
          y = 0.61 * Math.cos(angle);
          z = 0.61 * i * Math.sin(angle);
        } else {
          // Third set (around Z axis)
          x = 0.61 * i * Math.sin(angle);
          y = 0;
          z = 0.61 * Math.cos(angle);
        }
        
        points.push(new THREE.Vector3(x, y, z));
      }
      const curvedSeam = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        seamMaterial
      );
      seams.add(curvedSeam);
    }
  }

  // Position all seams
  seams.position.copy(basketball.position);
  scene.add(seams);
}

// Setup orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2;
controls.minDistance = 15;
controls.maxDistance = 50;
let isOrbitEnabled = true;

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// All UI elements are now handled in index.html

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (controls.enabled) {
        controls.update();
    }
    
    // Ensure we're rendering
    if (scene && camera) {
        renderer.render(scene, camera);
    }
    
    // Log first frame render
    if (!animate.hasLogged) {
        console.log('First frame rendered');
        animate.hasLogged = true;
    }
}

// Initialize the scene
function init() {
    // Position camera for best view of court
    camera.position.set(0, 20, 30);
    camera.lookAt(0, 0, 0);

    // Create scene elements
    createBasketballCourt();
    createBasketballHoop(true);   // Left hoop
    createBasketballHoop(false);  // Right hoop
    createStaticBasketball();
    
    // Set initial control properties
    controls.target.set(0, 0, 0);
    controls.update();
    
    // Start the animation loop
    animate();
}

// Start everything
init();

// Log to verify scene is initialized
console.log('%c Scene Initialization Status:', 'background: #222; color: #bada55; font-size: 16px');
console.log('%c Number of objects in scene:', 'color: #0066FF', scene.children.length);
console.log('%c Camera position:', 'color: #0066FF', {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
});
console.log('%c Controls status:', 'color: #0066FF', {
    enabled: controls.enabled,
    target: controls.target
});