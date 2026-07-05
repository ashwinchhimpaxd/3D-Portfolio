import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TextSpliting from './TextSpliting.js';


gsap.registerPlugin(ScrollTrigger);

// 1. Setup LoadingManager for Three.js assets
const loadingManager = new THREE.LoadingManager();
let loadedPercent = 0;

// 2. Update loader text
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    loadedPercent = Math.round((itemsLoaded / itemsTotal) * 100); // 80% for 3D assets
    document.getElementById('loader-text').textContent = `Loading ${loadedPercent}%`;
};

// 3. When Three.js assets are loaded, wait for window.onload for full 100%
let threeReady = false;
let htmlReady = false;

const main = document.querySelector('.main');
main.classList.add('overflow-hidden');
function tryHideLoader() {
    if (threeReady && htmlReady) {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            positionAnimtion();
            introTextanimation();
            gsap.to(loader, {
                duration: 1.3,
                clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                onComplete: () => {
                    loader.style.display = 'none';
                    main.style.overflow = 'scroll';
                }
            });
        }, 1000);
    }
}

loadingManager.onLoad = function () {
    loadedPercent = 100;
    document.getElementById('loader-text').textContent = `Loading ${loadedPercent}%`;
    threeReady = true;
    tryHideLoader();
};

loadingManager.onError = function (url) {
    console.warn('Three.js LoadingManager error loading asset:', url);
    // Proceed anyway to avoid locking the loader screen
    loadedPercent = 100;
    document.getElementById('loader-text').textContent = `Loading 100%`;
    threeReady = true;
    tryHideLoader();
};

// 4. Listen for window load (all images, scripts, etc.)
function handleWindowLoad() {
    document.getElementById('loader-text').innerText = `Loading 100%`;
    htmlReady = true;
    tryHideLoader();
    TextSpliting("spliting_text", ["gradient-text", "uni-span", "inline-block", "bor", "leading-[1.1em]"]);
}

if (document.readyState === 'complete') {
    handleWindowLoad();
} else {
    window.addEventListener('load', handleWindowLoad);
}
let positionAnimtion = null; // Declare outside
let introTextanimation = null;
function first_section_canvas_scene() {

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    const canvas = document.querySelector('#as_a_canvas');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    /**controls of orbit of the model  */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;

    /**plane mesh for background */
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: new THREE.Color("black"), side: THREE.FrontSide })
    )
    plane.position.set(0, 0, -10);
    scene.add(plane);
    const LightCtrlObj = {
        ambientLight: { color: "#c20000", intensity: 0.84 },
        pointLight: { color: "#ffffff", intensity: 9.34, x: 18, y: 6.3, z: 3, distance: 32, decay: 0.1 },
        spotLight: { color: "#ffde05", intensity: 10, x: 20.5, y: -2.3, z: 30, tarX: 28.1, tarY: 9, tarZ: 10.5, angle: 0.67, penumbra: .3, distance: 93, decay: 0, },
    };

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(LightCtrlObj.ambientLight.color, LightCtrlObj.ambientLight.intensity);
    scene.add(ambientLight);

    // Point Light
    const pointLight = new THREE.PointLight(LightCtrlObj.pointLight.color, LightCtrlObj.pointLight.intensity, LightCtrlObj.pointLight.distance, LightCtrlObj.pointLight.decay);

    pointLight.position.set(LightCtrlObj.pointLight.x, LightCtrlObj.pointLight.y, LightCtrlObj.pointLight.z);
    scene.add(pointLight);

    // Spot Light
    const spotLight = new THREE.SpotLight(LightCtrlObj.spotLight.color, LightCtrlObj.spotLight.intensity, LightCtrlObj.spotLight.distance, LightCtrlObj.spotLight.angle, LightCtrlObj.spotLight.penumbra, LightCtrlObj.spotLight.decay);

    spotLight.position.set(LightCtrlObj.spotLight.x, LightCtrlObj.spotLight.y, LightCtrlObj.spotLight.z);

    spotLight.target.position.set(LightCtrlObj.spotLight.tarX, LightCtrlObj.spotLight.tarY, LightCtrlObj.spotLight.tarZ);



    /**environment load for background environment  */
    const hrdiloader = new RGBELoader(loadingManager);
    hrdiloader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/little_paris_eiffel_tower_1k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        load3dModel();
    }, undefined, function (error) {
        load3dModel();
        console.error('An error happened.' + error);
    });

    /** 3d model load */

    const modelloader = new GLTFLoader(loadingManager);

    let model = null;
    const meshs = [];
    let sphereobj = null
    const startedtl = gsap.timeline();
    function load3dModel() {
        modelloader.load(
            'statics/3d-stuffs/radial_pattern.gltf',
            function (gltf) {
                model = gltf.scene;
                // console.log(sphereobj);
                if (model) {
                    model.scale.set(4, 4, 4);
                    model.rotation.set(0, Math.PI * -0.5, 0);
                    model.position.set(Math.PI * 0, Math.PI * 0, -6.6);
                    scene.add(model);
                    animate3dModel();
                    // const gui = new GUI();
                    // const modelFolder = gui.addFolder('Model Transform');
                    // // Scale controls
                    // modelFolder.add(model.scale, 'x', 0.1, 10, 0.01).name('Scale X');
                    // modelFolder.add(model.scale, 'y', 0.1, 10, 0.01).name('Scale Y');
                    // modelFolder.add(model.scale, 'z', 0.1, 10, 0.01).name('Scale Z');
                    // // Position controls
                    // modelFolder.add(model.position, 'x', -50, 50, 0.01).name('Position X');
                    // modelFolder.add(model.position, 'y', -50, 50, 0.01).name('Position Y');
                    // modelFolder.add(model.position, 'z', -50, 50, 0.01).name('Position Z');
                    // // Rotation controls (in radians)
                    // modelFolder.add(model.rotation, 'x', -Math.PI, Math.PI, 0.01).name('Rotation X');
                    // modelFolder.add(model.rotation, 'y', -Math.PI, Math.PI, 0.01).name('Rotation Y');
                    // modelFolder.add(model.rotation, 'z', -Math.PI, Math.PI, 0.01).name('Rotation Z');
                    // modelFolder.open();
                }
            }
        )
    }
    function animate3dModel() {
        // model.getObjectByName("Sphere").position.set(50, 0, 0);
        model.getObjectByName("Sphere").scale.set(1, 1, 1);
        sphereobj = model.getObjectByName("Sphere").getObjectByName("Ellipse");
        sphereobj.material = new THREE.MeshStandardMaterial({ color: "red" });
        const lengthOfClones = model.getObjectByName("Group_Clones").children.length;
        for (let i = 0; i < lengthOfClones; i++) {
            if (i == 0) {
                const rect = model.getObjectByName(`Clone_${i}`).getObjectByName('Rectangle');
                rect.material = new THREE.MeshStandardMaterial({ color: "red", metalness: 0.5, roughness: 0.5 });
                meshs.push(rect);
            } else {
                model.getObjectByName(`Clone_${i}`).getObjectByName(`Rectangle_${i}`).material =
                    new THREE.MeshStandardMaterial({ color: "#1f2937", metalness: 0.3, roughness: 0.3 });
                meshs.push(model.getObjectByName(`Clone_${i}`).getObjectByName(`Rectangle_${i}`));
            }
        }
    }
    introTextanimation = function () {
        const first_heading = document.querySelectorAll('#first_heading_span_text>span ,#second_heading_span_text>span');
        // console.log(first_hading)
        const first_para = document.querySelectorAll('#first_para_span_text>span');
        gsap.from(Array.from(first_heading), {
            yPercent: "100",
            delay: 0.2,
            duration: 1.2,
            opacity: 0.3,     // adjust as needed
            ease: "power3.out",
            stagger: {
                from: 'start',
                amount: 0.1
            },
        });
        gsap.from(Array.from(first_para), {
            yPercent: "100",
            delay: 0.2,
            duration: 1.2,
            opacity: 0.3,     // adjust as needed
            ease: "power3.out",
            stagger: {
                from: 'start',
                amount: 0.1
            },
        });
    }
    positionAnimtion = function () {
        // const material = model.getObjectByName(`Clone_0`).getObjectByName('Rectangle');
        const material = meshs[2].getObjectByName(`Rectangle_2`);
        material.geometry.translate(0, -50, 0);
        // GSAP animation for all meshs with stagger
        /**for model whole position animation  */
        gsap.from(model.position, {
            x: Math.PI * -10,
            y: Math.PI * 0,
            z: -6.6,
            duration: 3.5,
            ease: "expo.out",
        })
        gsap.from(model.scale, {
            x: 6,
            y: 6,
            z: 6,
            // z: -6.6,
            duration: 10.5,
            delay: 1,
            ease: "expo.out",
        })
    }

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    function onMouseMove(event) {
        if (model == null) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        gsap.to(pointLight.position, {
            x: mouse.x * 30,
            y: mouse.y * 15,
            duration: 1
        })
        gsap.to(sphereobj.position, {
            x: mouse.x * 50,
            y: mouse.y * 50,
            duration: 0
        })
    }
    document.addEventListener('mousemove', (event) => onMouseMove(event));

    const params = {
        text: " FRONTEND DEVELOPER",
        radius: 2.74,
        fontSize: 0.6688,
        color: '#b46b18',
        verticalOffset: 0,
        rotateLetters: false
    };
    // const textGroupParams = {
    //     position: { x: 0, y: 0, z: 6 },
    //     scale: { x: 2, y: 2, z: 2 },
    //     rotation: { x: -0.26, y: Math.PI * 4, z: 0 }
    // };



    function animate() {

        window.requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
    // Resize
    function resizeCanvas() {
        const section = document.getElementById('first-sec');
        const width = section.clientWidth;
        const height = section.clientHeight;

        // Update camera
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        // Update renderer and composer
        renderer.setSize(width, height);;
    }
    // Add event listener
    window.addEventListener('resize', resizeCanvas);
    // Call once on init
    resizeCanvas();


    //animate object each mesh in the scene
    let lastHoveredMesh = [];
    canvas.addEventListener('mousemove', (event) => {
        // Convert mouse to normalized device coordinates (-1 to +1)
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(meshs, false);

        // startedtl.reverse();
        if (intersects.length > 0) {
            startedtl.pause();
            const hoveredMesh = intersects;
            // intersects.map(m => console.log(m.object.name));
            if (lastHoveredMesh.length > 0) {
                gsap.to(lastHoveredMesh.map(m => m.rotation), {
                    z: 0,
                    duration: 0.6,
                    overwrite: true,
                    ease: "expo.out"
                });
                gsap.to(lastHoveredMesh.map(m => m.scale), {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.6,
                    overwrite: true,
                    ease: "expo.out"
                });

            }
            // Animate new hovered mesh
            gsap.to(intersects.map(m => m.object.rotation), {
                z: 0.4,
                duration: 1.2,
                overwrite: true,
                ease: "expo.out"
            });
            gsap.to(intersects.map(m => m.object.scale), {
                x: 1.09,
                y: 1.09,
                z: 1.09,
                duration: 1.2,
                overwrite: true,
                ease: "expo.out"
            });
            lastHoveredMesh = hoveredMesh.map(m => m.object);

        } else {
            // No mesh hovered, reset last hovered mesh if any

            gsap.to(meshs.map(m => m.rotation), {
                z: 0,
                duration: 1.2,
                overwrite: true,
                ease: "expo.out"
            });
            gsap.to(meshs.map(m => m.scale), {
                x: 1,
                y: 1,
                z: 1,
                duration: 1.2,
                overwrite: true,
                ease: "expo.out"
            });
            lastHoveredMesh = [];
        }
    });
}

if (document.querySelector('#as_a_canvas')) {
    first_section_canvas_scene();
}

function second_section_canvas_scene() {
    document.fonts.ready.then(() => TextSpliting("skills"));
    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    const canvas = document.querySelector('#as_a_canvas_two');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    const hrdiloader = new RGBELoader(loadingManager);
    hrdiloader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_dusk_2_1k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
    })
    const LightCtrlObj = {
        ambientLight: { color: "#ffffff", intensity: 3 },
        pointLight: { color: "#debff3", intensity: 20, x: 0, y: 0, z: -3, distance: 11, decay: 1.87 },
        directlight: { color: "#5c5c5c", intensity: 9.18, x: -34.6, y: 3.3, z: 2, tarX: -23.8, tarY: -27.4, tarZ: -10.2, }
    };
    const ambientlight = new THREE.AmbientLight(LightCtrlObj.ambientLight.color, LightCtrlObj.ambientLight.intensity);
    scene.add(ambientlight);

    const pointlight = new THREE.PointLight(
        LightCtrlObj.pointLight.color,
        LightCtrlObj.pointLight.intensity,
        LightCtrlObj.pointLight.distance,
        LightCtrlObj.pointLight.decay
    );
    pointlight.position.set(LightCtrlObj.pointLight.x, LightCtrlObj.pointLight.y, LightCtrlObj.pointLight.z);
    scene.add(pointlight);

    const directlight = new THREE.DirectionalLight(
        LightCtrlObj.directlight.color,
        LightCtrlObj.directlight.intensity,
        LightCtrlObj.directlight.tarX,
        LightCtrlObj.directlight.tarY,
        LightCtrlObj.directlight.tarZ
    )

    directlight.position.set(LightCtrlObj.directlight.x, LightCtrlObj.directlight.y, LightCtrlObj.directlight.z);
    scene.add(directlight);
    // --- Add GUI for Point Light here (at line 631) ---
    // const gui = new GUI();
    // gui.close()
    // {
    //     const pointFolder = gui.addFolder('Point Light');
    //     pointFolder.addColor(LightCtrlObj.pointLight, 'color').name('Color').onChange(val => {
    //         pointlight.color.set(val);
    //     });
    //     pointFolder.add(LightCtrlObj.pointLight, 'intensity', 0, 20, 0.01).name('Intensity').onChange(val => {
    //         pointlight.intensity = val;
    //     });
    //     pointFolder.add(LightCtrlObj.pointLight, 'x', -50, 50, 0.1).name('Position X').onChange(val => {
    //         pointlight.position.x = val;
    //     });
    //     pointFolder.add(LightCtrlObj.pointLight, 'y', -50, 50, 0.1).name('Position Y').onChange(val => {
    //         pointlight.position.y = val;
    //     });
    //     pointFolder.add(LightCtrlObj.pointLight, 'z', -50, 50, 0.1).name('Position Z').onChange(val => {
    //         pointlight.position.z = val;
    //     });
    //     pointFolder.add(LightCtrlObj.pointLight, 'distance', 0, 200, 1).name('Distance').onChange(val => {
    //         pointlight.distance = val;
    //     });
    //     pointFolder.add(LightCtrlObj.pointLight, 'decay', 0, 5, 0.01).name('Decay').onChange(val => {
    //         pointlight.decay = val;
    //     });
    //     pointFolder.close();

    //     const directlightfolder = gui.addFolder('Directional Light');
    //     directlightfolder.close();
    //     directlightfolder.addColor(LightCtrlObj.directlight, 'color').name('Color').onChange(val => {
    //         directlight.color.set(val);
    //     });
    //     directlightfolder.add(LightCtrlObj.directlight, 'intensity', 0, 20, 0.01).name('Intensity').onChange(val => {
    //         directlight.intensity = val;
    //     });
    //     directlightfolder.add(LightCtrlObj.directlight, 'x', -50, 50, 0.1).name('Position X').onChange(val => {
    //         directlight.position.x = val;
    //     });
    //     directlightfolder.add(LightCtrlObj.directlight, 'y', -50, 50, 0.1).name('Position Y').onChange(val => {
    //         directlight.position.y = val;
    //     });
    //     directlightfolder.add(LightCtrlObj.directlight, 'z', -50, 50, 0.1).name('Position Z').onChange(val => {
    //         directlight.position.z = val;
    //     });

    //     directlightfolder.add(LightCtrlObj.directlight, 'tarX', -50, 50, 0.1).name('Target X').onChange(val => {
    //         directlight.target.position.x = val;

    //     })
    //     directlightfolder.add(LightCtrlObj.directlight, 'tarY', -50, 50, 0.1).name('Target Y').onChange(val => {
    //         directlight.target.position.y = val;
    //     })
    //     directlightfolder.add(LightCtrlObj.directlight, 'tarZ', -50, 50, 0.1).name('Target Z').onChange(val => {
    //         directlight.target.position.z = val;
    //     })

    // }

    function getVisibleBoundsAtZ(z, camera) {
        // Calculate visible width/height at a given Z in world units
        const distance = Math.abs(camera.position.z - z);
        const vFOV = THREE.MathUtils.degToRad(camera.fov); // vertical fov in radians
        const height = 2 * Math.tan(vFOV / 2) * distance;
        const width = height * camera.aspect;
        return { width, height };
    }

    canvas.addEventListener('mousemove', (event) => {
        // Normalized device coordinates (-1 to +1)
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Get visible bounds at the point light's Z
        const bounds = getVisibleBoundsAtZ(pointlight.position.z, camera);

        // Map mouse to world coordinates within the visible area
        const worldX = mouseX * bounds.width / 2;
        const worldY = mouseY * bounds.height / 2;

        gsap.to(pointlight.position, {
            x: worldX,
            y: worldY,
            duration: 0.3,
            overwrite: true
        });
    });

    /**loading the model  */
    const loader = new GLTFLoader(loadingManager);
    let model = null;
    loader.load('statics/3d-stuffs/cubes_bg_2.glb', function (gltf) {
        model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        center.z = 3;
        model.position.sub(center); // Move model so its center is at (0,0,0)
        scene.add(model);
    });

    /**plane geomtry  */

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: new THREE.Color("rgb(23 ,23 ,23)"), side: THREE.FrontSide })
    )
    plane.position.set(0, 0, -4);
    scene.add(plane);

    // --- Create 6 planes in a circle, each with its own material, grouped ---
    const planeGroupData = {
        planeCount: 6,
        radius: 3.37,
        planeSize: 3.9,
        positionX: 4.4,
        positionY: -0.199,
        positionZ: 4,
        rotationX: 0.16,
        rotationY: 0,
        rotationZ: 0,
        textureoffset_one: 0.333,
        textureoffset_two: 0.333,
        texturerepeat_one: 0.33,
        texturerepeat_two: 0.5
    };
    const textureCrop = [
        {
            textureoffset_one: 0.014,
            textureoffset_two: 0,
            texturerepeat_one: 1,
            texturerepeat_two: 1
        },
        {
            textureoffset_one: 0,
            textureoffset_two: 0,
            texturerepeat_one: 1,
            texturerepeat_two: 1
        },
        {
            textureoffset_one: 0,
            textureoffset_two: 0,
            texturerepeat_one: 1,
            texturerepeat_two: 1
        },
        {
            textureoffset_one: 0,
            textureoffset_two: 0,
            texturerepeat_one: 1,
            texturerepeat_two: 1
        },
        {
            textureoffset_one: 0.274,
            textureoffset_two: 0.08,
            texturerepeat_one: 0.46,
            texturerepeat_two: 0.88
        },
        {
            textureoffset_one: 0.16,
            textureoffset_two: 0.26,
            texturerepeat_one: 0.66,
            texturerepeat_two: 0.58
        },
    ]

    const textureloder = new THREE.TextureLoader(loadingManager);

    const planeGroup = new THREE.Group();
    const planeMeshes = [];

    let texture = [];
    {
        for (let i = 0; i < planeGroupData.planeCount; i++) {
            let txt = null;
            txt = textureloder.load(`statics/images/${i}.jpg`);
            txt.offset.set(textureCrop[i].textureoffset_one, textureCrop[i].textureoffset_two);
            txt.repeat.set(textureCrop[i].texturerepeat_one, textureCrop[i].texturerepeat_two);
            txt.colorSpace = THREE.SRGBColorSpace;
            txt.minFilter = THREE.NearestFilter;
            txt.magFilter = THREE.NearestFilter;
            txt.generateMipmaps = false;
            texture.push(txt);
        }

    }

    for (let i = 0; i < planeGroupData.planeCount; i++) {

        const angle = (i / planeGroupData.planeCount) * Math.PI * 2;
        const x = Math.cos(angle) * planeGroupData.radius;
        const z = Math.sin(angle) * planeGroupData.radius;
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeGroupData.planeSize, planeGroupData.planeSize),
            new THREE.MeshStandardMaterial({ map: texture[i], side: THREE.DoubleSide })
        );
        plane.position.set(x, 0, z);
        const outward = new THREE.Vector3(x, 0, z).clone().multiplyScalar(2);
        plane.lookAt(outward);
        plane.name = `skill_${i}`;
        planeGroup.add(plane);
        planeMeshes.push(plane);
    }

    planeGroup.rotation.set(planeGroupData.rotationX, planeGroupData.rotationY, planeGroupData.rotationZ);
    planeGroup.position.set(planeGroupData.positionX, planeGroupData.positionY, planeGroupData.positionZ);
    scene.add(planeGroup);
    // {

    //     gui.add(planeGroupData, 'radius', 0, 10).name('Radius').onChange((value) => {
    //         // Update the position of each plane based on new radius
    //         for (let i = 0; i < planeGroupData.planeCount; i++) {
    //             const angle = (i / planeGroupData.planeCount) * Math.PI * 2;
    //             const x = Math.cos(angle) * value;
    //             const z = Math.sin(angle) * value;
    //             planeMeshes[i].position.set(x, 0, z);
    //             // planeMeshes[i].lookAt(0, 0, 0);
    //         }
    //     });

    //     //offset 
    //     for (let i = 0; i < planeGroupData.planeCount; i++) {

    //         const texFolder = gui.addFolder(`Plane ${i + 1} Texture`);
    //         texFolder.add(textureCrop[i], 'textureoffset_one', -1, 1).name('Texture Offset One').onChange((value) => {
    //             texture[i].offset.set(value, textureCrop[i].textureoffset_two);
    //         });
    //         texFolder.add(textureCrop[i], 'textureoffset_two', -1, 1).name('Texture Offset Two').onChange((value) => {
    //             texture[i].offset.set(textureCrop[i].textureoffset_one, value);
    //         });
    //         texFolder.add(textureCrop[i], 'texturerepeat_one', -1, 1).name('Texture Repeat One').onChange((value) => {
    //             texture[i].repeat.set(value, textureCrop[i].texturerepeat_two);
    //         });
    //         texFolder.add(textureCrop[i], 'texturerepeat_two', -1, 1).name('Texture Repeat Two').onChange((value) => {
    //             texture[i].repeat.set(textureCrop[i].texturerepeat_one, value);
    //         });
    //         texFolder.close();
    //     }

    //     // Position X
    //     gui.add(planeGroupData, 'positionX', -10, 10).name('Group X').onChange((value) => {
    //         planeGroup.position.x = value;
    //     });

    //     // Position Y
    //     gui.add(planeGroupData, 'positionY', -10, 10).name('Group Y').onChange((value) => {
    //         planeGroup.position.y = value;
    //     });

    //     // Position Z
    //     gui.add(planeGroupData, 'positionZ', -10, 10).name('Group Z').onChange((value) => {
    //         planeGroup.position.z = value;
    //     });

    //     gui.add(planeGroupData, 'rotationX', -10, Math.PI * 2).name('Rotation X').onChange((value) => {
    //         planeGroup.rotation.x = value;
    //     });

    //     // Rotation Y
    //     gui.add(planeGroupData, 'rotationY', -10, Math.PI * 2).name('Rotation Y').onChange((value) => {
    //         planeGroup.rotation.y = value;
    //     });

    //     // Rotation Z
    //     gui.add(planeGroupData, 'rotationZ', -10, Math.PI * 2).name('Rotation Z').onChange((value) => {
    //         planeGroup.rotation.z = value;
    //     });
    // }

    /**raycater for plane interaction */
    const allArticles = document.querySelectorAll('article');
    let stoprotation = false;
    let dragging = false;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let dragStartX = 0;
    let dragStartRotationY = 0;

    /** this raycaster for plane interaction and what happen after plane interaction */
    let previousIntersectedName = null;

    function raycaterMousemove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planeMeshes, false);


        if (intersects.length > 0) {
            stoprotation = true;
            const intersectedName = intersects[0].object.name;

            // Only animate if hovered plane changed
            if (previousIntersectedName !== intersectedName) {
                allArticles.forEach(article => {
                    const headings = article.querySelectorAll('.skills-heading');
                    const para = article.querySelectorAll('.skills span');

                    if (article.dataset.skill === intersectedName) {
                        gsap.to(para, { y: 0, opacity: 1, duration: 0.5, overwrite: true, stagger: 0.1, ease: "power3.out" });
                        gsap.to(headings, { y: 0, opacity: 1, duration: 1.5, overwrite: true, ease: "power3.out" });
                    } else {
                        gsap.to([headings, para], {
                            y: 20,
                            opacity: 0,
                            duration: 0.01,
                            overwrite: true,
                            ease: "linear",
                        });
                    }
                });
                previousIntersectedName = intersectedName;
            }

        }
        else {
            stoprotation = false;
            if (previousIntersectedName !== null) {
                allArticles.forEach((article) => {
                    const headings = article.querySelectorAll('.skills-heading');
                    const para = article.querySelectorAll('.skills span');
                    gsap.to([headings, para], {
                        y: 20,
                        opacity: 0,
                        duration: 0.1,
                        overwrite: true,
                        ease: "linear",
                        stagger: {
                            from: 'end',
                            amount: 0.1
                        }
                    });
                });
                previousIntersectedName = null;
            }
        }
    }
    /** this mouse move call raycasterMousemove function */
    let mouseMoveQueued = false;
    canvas.addEventListener('mousemove', (event) => {
        if (!mouseMoveQueued) {
            mouseMoveQueued = true;
            requestAnimationFrame(() => {
                if (dragging) {
                    const deltaX = event.clientX - dragStartX;
                    planeGroup.rotation.y = dragStartRotationY + deltaX * 0.01;
                } else {
                    raycaterMousemove(event);
                }
                mouseMoveQueued = false;
            });
        }
    });
    /** this mouse down call use for dragging the plane together  */
    canvas.addEventListener("mousedown", (event) => {
        dragging = true;
        dragStartX = event.clientX;
        dragStartRotationY = planeGroup.rotation.y;
    });

    canvas.addEventListener("mouseup", () => {
        dragging = false;
    });

    /** seprating html text */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enableRotate = false;
    function animation() {
        if (!stoprotation) planeGroup.rotation.y += 0.01 * 0.6;

        controls.update();
        window.requestAnimationFrame(animation);
        renderer.render(scene, camera);
    }
    animation();
    function resizeCanvas() {

        const section = document.getElementById('skills');
        const width = section.clientWidth;
        const height = section.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

if (document.querySelector('#as_a_canvas_two')) {
    second_section_canvas_scene();
}