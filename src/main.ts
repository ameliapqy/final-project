import { vec3, vec4 } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';

import LSystem from './lsystem/LSystem';
import { readTextFile } from './globals';
import Mesh from './geometry/Mesh';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  iterations: 6,
  angle: 25,
  flower_color: [255, 90, 100],
  flower_scale: 8,
  speed: 3,
};

let square: Square;
let screenQuad: ScreenQuad;
let cylinder: Mesh;
let flower: Mesh;
let base: Mesh;
let rock: Mesh;
let rock_front: Mesh;
let canoe: Mesh;
let bird: Mesh;

let time: number = 0;
let changed: boolean = true;

let sceneTexture: WebGLTexture;
let scenefb: WebGLFramebuffer;
let scenerb: WebGLRenderbuffer;

let paperTexture: WebGLTexture;
let paperfb: WebGLFramebuffer;
let paperrb: WebGLRenderbuffer;

let blurredTexture: WebGLTexture;
let blurfb: WebGLFramebuffer;
let blurrb: WebGLRenderbuffer;

function backgroundSetup() {
  let colorsArray = [0.5, 0.55, 0.6, 1.0];

  let col1sArray = [50, 0, 0, 0];
  let col2sArray = [0, 50, 0, 0];
  let col3sArray = [0, 0, 50, 0];
  let col4sArray = [0, -40, 0, 1];

  let colors: Float32Array = new Float32Array(colorsArray);
  let col1s: Float32Array = new Float32Array(col1sArray);
  let col2s: Float32Array = new Float32Array(col2sArray);
  let col3s: Float32Array = new Float32Array(col3sArray);
  let col4s: Float32Array = new Float32Array(col4sArray);

  base.setInstanceVBOsTransform(colors, col1s, col2s, col3s, col4s);
  base.setNumInstances(1);
}

function mountainSetUp() {
  let colorsArray = [0.2, 0.35, 0.25, 1.0];

  let col1sArray = [3, 0, 0, 0];
  let col2sArray = [0, 3, 0, 0];
  let col3sArray = [0, 0, 3, 0];
  let col4sArray = [50, -5, -70, 1];

  let colors: Float32Array = new Float32Array(colorsArray);
  let col1s: Float32Array = new Float32Array(col1sArray);
  let col2s: Float32Array = new Float32Array(col2sArray);
  let col3s: Float32Array = new Float32Array(col3sArray);
  let col4s: Float32Array = new Float32Array(col4sArray);

  rock.setInstanceVBOsTransform(colors, col1s, col2s, col3s, col4s);
  rock.setNumInstances(1);
}

function rockSetUp() {
  let colorsArray = [0.2, 0.25, 0.25, 1.0];

  let col1sArray = [2, 0, 0, 0];
  let col2sArray = [0, 2, 0, 0];
  let col3sArray = [0, 0, 2, 0];
  let col4sArray = [-10, -45, 0, 1];

  let colors: Float32Array = new Float32Array(colorsArray);
  let col1s: Float32Array = new Float32Array(col1sArray);
  let col2s: Float32Array = new Float32Array(col2sArray);
  let col3s: Float32Array = new Float32Array(col3sArray);
  let col4s: Float32Array = new Float32Array(col4sArray);

  rock_front.setInstanceVBOsTransform(colors, col1s, col2s, col3s, col4s);
  rock_front.setNumInstances(1);
}

function canoeSetUp() {
  let colorsArray = [0.28, 0.24, 0.2, 1.0];

  let col1sArray = [8, 0, 0, 0];
  let col2sArray = [0, 8, 0, 0];
  let col3sArray = [0, 0, 8, 0];
  let col4sArray = [-110, -60, -50, 1];

  let colors: Float32Array = new Float32Array(colorsArray);
  let col1s: Float32Array = new Float32Array(col1sArray);
  let col2s: Float32Array = new Float32Array(col2sArray);
  let col3s: Float32Array = new Float32Array(col3sArray);
  let col4s: Float32Array = new Float32Array(col4sArray);

  canoe.setInstanceVBOsTransform(colors, col1s, col2s, col3s, col4s);
  canoe.setNumInstances(1);
}

function birdSetUp() {
  let colorsArray = [0.1, 0.1, 0.1, 1.0, 0.1, 0.1, 0.1, 1.0];

  let col1sArray = [8, 0, 0, 0, 15, 0, 0, 0];
  let col2sArray = [0, 8, 0, 0, 0, 15, 0, 0];
  let col3sArray = [0, 0, 8, 0, 0, 0, 15, 0];
  let col4sArray = [30, 80, -50, 1, 20, 70, -40, 1];

  let colors: Float32Array = new Float32Array(colorsArray);
  let col1s: Float32Array = new Float32Array(col1sArray);
  let col2s: Float32Array = new Float32Array(col2sArray);
  let col3s: Float32Array = new Float32Array(col3sArray);
  let col4s: Float32Array = new Float32Array(col4sArray);

  bird.setInstanceVBOsTransform(colors, col1s, col2s, col3s, col4s);
  bird.setNumInstances(2);
}

function lsystermSetup() {
  if (changed) {
    changed = false;
  } else {
    return;
  }
  // Init LSystem
  let lsystem: LSystem = new LSystem(controls); //new ExpansionRule(controls));
  let data = lsystem.draw();
  let colors: Float32Array = new Float32Array(data['trunks'].color);
  let col1s: Float32Array = new Float32Array(data['trunks'].col1);
  let col2s: Float32Array = new Float32Array(data['trunks'].col2);
  let col3s: Float32Array = new Float32Array(data['trunks'].col3);
  let col4s: Float32Array = new Float32Array(data['trunks'].col4);

  cylinder.setInstanceVBOsTransform(colors, col1s, col2s, col3s, col4s);
  cylinder.setNumInstances(data['trunks'].color.length / 4);

  flower.setInstanceVBOsTransform(
    new Float32Array(data['flowers'].color),
    new Float32Array(data['flowers'].col1),
    new Float32Array(data['flowers'].col2),
    new Float32Array(data['flowers'].col3),
    new Float32Array(data['flowers'].col4)
  );
  flower.setNumInstances(data['flowers'].color.length / 4);
}

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  //load from obj
  let pass = 'https://raw.githubusercontent.com/ameliapqy/final-project/main/';
  let cylinderObj: string = readTextFile('https://raw.githubusercontent.com/ameliapqy/final-project/main/src/obj/cylinder.obj');
  cylinder = new Mesh(cylinderObj, vec3.fromValues(0, 0, 0));
  cylinder.create();

  let baseObj: string = readTextFile('https://raw.githubusercontent.com/ameliapqy/hw04-l-systems/master/src/obj/base.obj');
  base = new Mesh(baseObj, vec3.fromValues(0, 0, 0));
  base.create();

  let flowerObj: string = readTextFile(pass + '/src/obj/flower.obj');
  flower = new Mesh(flowerObj, vec3.fromValues(0, 0, 0));
  flower.create();

  let canoeObj: string = readTextFile(pass + '/src/obj/canoe.obj');
  canoe = new Mesh(canoeObj, vec3.fromValues(0, 0, 0));
  canoe.create();

  let rockObj: string = readTextFile(pass + '/src/obj/rock.obj');
  rock = new Mesh(rockObj, vec3.fromValues(0, 0, 0));
  rock.create();

  let rock_frontObj: string = readTextFile(pass + '/src/obj/rock_front.obj');
  rock_front = new Mesh(rock_frontObj, vec3.fromValues(0, 0, 0));
  rock_front.create();

  let bird_Obj: string = readTextFile(pass + '/src/obj/eagle.obj');
  bird = new Mesh(bird_Obj, vec3.fromValues(0, 0, 0));
  bird.create();

  backgroundSetup();
  mountainSetUp();
  rockSetUp();
  canoeSetUp();
  birdSetUp();
  //lsystem
  lsystermSetup();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui
    .add(controls, 'iterations', 1, 10)
    .step(1)
    .onChange(
      function () {
        changed = true;
      }.bind(this)
    );
  gui
    .add(controls, 'angle', 20, 30)
    .step(1)
    .onChange(
      function () {
        changed = true;
      }.bind(this)
    );
  gui.addColor(controls, 'flower_color').onChange(
    function () {
      changed = true;
    }.bind(this)
  );
  gui
    .add(controls, 'flower_scale', 1, 10)
    .step(0.5)
    .onChange(
      function () {
        changed = true;
      }.bind(this)
    );
  gui
    .add(controls, 'speed', 0, 10)
    .step(1)
    .onChange(
      function () {
        changed = true;
      }.bind(this)
    );
  // gui
  //   .add(controls, 'time', 0, 10)
  //   .step(1)
  //   .onChange(
  //     function () {
  //       changed = true;
  //     }.bind(this)
  //   );

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);
  initTextures();

  function initTextures() {
    sceneTexture = gl.createTexture();
    scenefb = gl.createFramebuffer();
    scenerb = gl.createRenderbuffer();

    paperTexture = gl.createTexture();
    paperfb = gl.createFramebuffer();
    paperrb = gl.createRenderbuffer();

    blurredTexture = gl.createTexture();
    blurfb = gl.createFramebuffer();
    blurrb = gl.createRenderbuffer();
  }

  function bindTextures(texture: WebGLTexture, fb: WebGLFramebuffer, rb: WebGLRenderbuffer) {
    //frame buffer
    // gl.bindFramebuffer(gl.FRAMEBUFFER, fb); //this caused the scene to be all black

    //texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, window.innerWidth, window.innerHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.bindTexture(gl.TEXTURE_2D, null);
    //attach texture to frame buffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    //render buffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    //creating a depth and stencil renderbuffer object
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, window.innerWidth, window.innerHeight);
    // gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    //attach renderbuffer ibject
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      console.log('frame buffer not complete');
    }
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 10, 110), vec3.fromValues(0, 10, 0));

  const renderer = new OpenGLRenderer(canvas);

  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  // adding transparency
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const passthrough = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/passthrough-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert-old.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const paper = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/paper-frag.glsl')),
  ]);

  const mountainShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/mountain-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/mountain-frag.glsl')),
  ]);

  const boatShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/boat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/rock-frag.glsl')),
  ]);

  const rockShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/rock-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/rock-frag.glsl')),
  ]);

  const birdShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/bird-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const blurShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/blurred-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    lsystermSetup();
    time++;
    camera.update();
    // console.log(camera.position);
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    //scenes set up

    // //1. Paper Pass
    // bindTextures(paperTexture, paperfb, paperrb);
    // renderer.render(camera, paper, [screenQuad]);

    // //2. Scene Pass
    // bindTextures(sceneTexture, scenefb, scenerb); //make the scene disappear...?
    // gl.activeTexture(gl.TEXTURE1);
    // gl.bindTexture(gl.TEXTURE_2D, paperTexture);
    // flat.setTex1();
    // renderer.render(camera, instancedShader, [cylinder, flower]);

    // //3. Blur Pass
    // bindTextures(blurredTexture, blurfb, blurrb);
    // gl.activeTexture(gl.TEXTURE1);
    // gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    // blurShader.setTex1();
    // renderer.render(camera, blurShader, [screenQuad]);

    // uncomment to see before effect
    // renderer.render(camera, flat, [cylinder, flower, rock, canoe, rock_front, bird]);

    renderer.render(camera, paper, [screenQuad], time * controls.speed);
    renderer.render(camera, instancedShader, [cylinder, flower]);
    renderer.render(camera, mountainShader, [rock], time * controls.speed);
    renderer.render(camera, boatShader, [canoe], time * controls.speed);
    renderer.render(camera, rockShader, [rock_front], time * controls.speed);
    renderer.render(camera, birdShader, [bird], time * controls.speed);

    stats.end();
    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener(
    'resize',
    function () {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.setAspectRatio(window.innerWidth / window.innerHeight);
      camera.updateProjectionMatrix();
      flat.setDimensions(window.innerWidth, window.innerHeight);
      paper.setDimensions(window.innerWidth, window.innerHeight);
    },
    false
  );

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);
  paper.setDimensions(window.innerWidth, window.innerHeight);

  // flowert the render loop
  tick();
}

main();
