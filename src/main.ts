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
  iterations: 5,
  angle: 25,
  flower_color: [240, 90, 100],
  flower_scale: 2,
  speed: 1,
  time: 0,
};

let square: Square;
let screenQuad: ScreenQuad;
let cylinder: Mesh;
let flower: Mesh;
let base: Mesh;

let time: number = 0.0;
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
  let col2sArray = [0, 10, 0, 0];
  let col3sArray = [0, 0, 50, 0];
  let col4sArray = [0, -35, 0, 1];

  let colors: Float32Array = new Float32Array(colorsArray);
  let col1s: Float32Array = new Float32Array(col1sArray);
  let col2s: Float32Array = new Float32Array(col2sArray);
  let col3s: Float32Array = new Float32Array(col3sArray);
  let col4s: Float32Array = new Float32Array(col4sArray);

  base.setInstanceVBOsTransform(colors, col1s, col2s, col3s, col4s);
  base.setNumInstances(1);
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
  let cylinderObj: string = readTextFile('https://raw.githubusercontent.com/ameliapqy/hw04-l-systems/master/src/obj/cylinder.obj');
  cylinder = new Mesh(cylinderObj, vec3.fromValues(0, 0, 0));
  cylinder.create();

  let baseObj: string = readTextFile('https://raw.githubusercontent.com/ameliapqy/hw04-l-systems/master/src/obj/base.obj');
  base = new Mesh(baseObj, vec3.fromValues(0, 0, 0));
  base.create();

  let flowerObj: string = readTextFile('https://raw.githubusercontent.com/ameliapqy/hw04-l-systems/master/src/obj/flower.obj');
  flower = new Mesh(flowerObj, vec3.fromValues(0, 0, 0));
  flower.create();

  backgroundSetup();

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
    .add(controls, 'iterations', 1, 6)
    .step(1)
    .onChange(
      function () {
        changed = true;
      }.bind(this)
    );
  gui
    .add(controls, 'angle', 15, 100)
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
  // gui
  //   .add(controls, 'speed', 0, 10)
  //   .step(1)
  //   .onChange(
  //     function () {
  //       changed = true;
  //     }.bind(this)
  //   );
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
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, window.innerWidth, window.innerHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, window.innerWidth, window.innerHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
    // Set m_renderedTexture as the color output of our frame buffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      console.log('frame buffer not complete');
    }

    // gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(100, 10, 50), vec3.fromValues(0, 10, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const paper = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/paper-frag.glsl')),
  ]);

  const blurred = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/blurred-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    // console.log(camera.position);
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    controls.time = time;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    //set LSystem Up
    lsystermSetup();

    //scenes set up

    // //Paper Pass
    // bindTextures(paperTexture, paperfb, paperrb);
    renderer.render(camera, paper, [screenQuad]);

    //Scene Pass
    bindTextures(sceneTexture, scenefb, scenerb); //make the scene disappear...?
    gl.activeTexture(gl.TEXTURE1);
    flat.setTex1();
    renderer.render(camera, instancedShader, [cylinder, flower, base]);

    //Blur Pass
    bindTextures(blurredTexture, blurfb, blurrb);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    blurred.setTex1();
    renderer.render(camera, blurred, [screenQuad]);

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
    },
    false
  );

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // flowert the render loop
  tick();
}

main();
