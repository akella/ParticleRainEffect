import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertexParticles.glsl";
import * as dat from "dat.gui";
import gsap from "gsap";
import Particle from "./particle.js";

const load = require("load-asset");

var colors = require("nice-color-palettes");

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.customSettings = options.settings || {};
    this.imageFirst = options.imageFirst
    this.url = options.url;
    this.mouseoverDOM = document.querySelector(options.mouseover);

    this.config = options.config;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      alpha: true,
    });
    this.over = document.querySelector(".over");
    this.renderer.autoClear = false;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x112233, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.palette = colors[0];
    this.palette = this.palette.map((c) => new THREE.Color(c));
    console.log(this.palette);

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 150);
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.urls = [this.url];
    this.pres = 200;
    
    this.num = 10;
    

    load.all(this.urls).then((images) => {
      let img = images[0];

      document.querySelector('.over').style.backgroundImage = `url(${this.url})`
      this.imageWidth = img.naturalWidth
      this.imageHeight = img.naturalHeight
      this.iWidth = img.naturalWidth;
      this.iHeight = img.naturalHeight;
      this.setCameraFov()
      
      
      console.log(this);
      this.updateImage(img);

      this.isPlaying = true;
      this.settingsGUI();

      this.addObjects();
      if (!this.config) this.mouseEvents();
      this.resize();
      this.render();
      this.setupResize();
    });
  }

  setCameraFov(){
    if(this.imageWidth/this.imageHeight < this.width/this.height){
      this.camera.fov =
      (Math.atan(this.iWidth / 300 / this.camera.aspect) * 2 * 180) / Math.PI;
    } else{
      this.camera.fov =
      (Math.atan(this.iHeight / 300 ) * 2 * 180) / Math.PI;
      // this.camera.fov =
      // (Math.atan(this.iHeight / 300 / this.camera.aspect) * 2 * 180) / Math.PI;
    }
  }

  updateImage(img,size) {
    console.log(img,img.naturalWidth);
    

    this.image = Array.from(Array(this.imageWidth), () => new Array(this.imageHeight));
    let canv = document.createElement("canvas");
    let ctx = canv.getContext("2d");
    document.body.appendChild(canv);
    canv.width = this.imageWidth;
    canv.height = this.imageHeight;
    ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
    ctx.drawImage(img, 0, 0, this.imageWidth, this.imageHeight);
    var imageData = ctx.getImageData(0, 0, this.imageWidth, this.imageHeight);
    for (let i = 0; i < imageData.data.length; i = i + 4) {
      var x = (i / 4) % this.imageWidth;
      var y = Math.floor(i / 4 / this.imageWidth);
      this.image[x][y] = imageData.data[i] / 255;
      // this.image[x][y] = [imageData.data[i],imageData.data[i+1],imageData.data[i+2]] ;
    }
    console.log(this.image)
  }

  updateParticles() {
    this.particles.forEach((p) => {
      p.gravity =
        -this.settings.gravity - Math.random() * this.settings.randomness;
      p.slowGravity = p.gravity * this.settings.gravityDifference;
      // p.gravity*=this.settings.speedScale;
      // p.slowGravity*=this.settings.speedScale;
    });
    this.material.uniforms.size.value = this.settings.size;
  }

  mouseEvents() {
    let initialOp = 0.1;
    let initialProg = 0;
    let finalOp = 1;
    let finalProg = 1;
    // if(this.imageFirst){
    //   initialOp = 1;
    //   initialProg = 1;
    //   finalOp = 0.1;
    //   finalProg = 0;
    //   document.querySelector('.over').style.opacity = 1;
    // }
    this.mouseoverDOM.addEventListener("mouseover", () => {
      gsap.killTweensOf(".over");
      gsap.to(".over", {
        duration: 0.5,
        ease: 'quad',
        opacity: initialOp,
        onStart: () => gsap.set(this.settings, {progress: initialProg})
      });
    });
    this.mouseoverDOM.addEventListener("mouseout", () => {
      gsap.to(".over", {
        duration: 0.5,
        opacity: finalOp,
        onComplete: () => gsap.set(this.settings, {progress: finalProg})
      });
    });
  }

  settingsGUI() {
    let that = this;

    this.settingsDefault = {
      progress: 0.3,
      number: 5000,
      trails: 0.03,
      size: 0.7,
      sideScale: 1,
      speedScale: 1,
      gravity: 0.9,
      gravityDifference: 0.02,
      randomness: 1.6,
      randomPalette: () => {
        let rand = Math.floor(100 * Math.random());
        let palette = colors[rand];
        console.log(rand);
        palette = palette.map((c) => new THREE.Color(c));
        this.material.uniforms.palette.value = palette;
      },
      allWhite: () => {
        let palette = ["#fff", "#fff", "#fff", "#fff", "#fff"];
        palette = palette.map((c) => new THREE.Color(c));
        this.material.uniforms.palette.value = palette;
      },
    };
    this.settings = {...this.settingsDefault,...this.customSettings}
    // console.log(this.settingsnew);



    if (this.config) {
      this.gui = new dat.GUI();
      this.gui.add(this.settings, "progress", 0, 1, 0.01);

      this.gui.add(this.settings, "trails", 0, 0.2, 0.01).onFinishChange(() => {
        this.clearPlane.material.opacity = this.settings.trails;
      });

      this.gui.add(this.settings, "gravity", 0, 1, 0.01).onFinishChange(() => {
        this.updateParticles();
      });

      this.gui
        .add(this.settings, "number", 2000, 20000, 100)
        .onFinishChange(() => {
          this.populateParticles();
        });

      this.gui
        .add(this.settings, "gravityDifference", 0, 1, 0.01)
        .onFinishChange(() => {
          this.updateParticles();
        });
      this.gui.add(this.settings, "size", 0, 3, 0.01).onFinishChange(() => {
        this.updateParticles();
      });

      this.gui
        .add(this.settings, "randomness", 0, 2, 0.01)
        .onFinishChange(() => {
          this.updateParticles();
        });

      this.gui.add(this.settings, "randomPalette");
      this.gui.add(this.settings, "allWhite");
    }
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    this.camera.updateProjectionMatrix();
    this.setCameraFov()
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        palette: { value: this.palette },
        size: { value: 0.5 },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      blending: THREE.AdditiveBlending,
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: false,
      depthWrite: false,
    });

    this.geometry = new THREE.BufferGeometry();

    // this.plane = new THREE.Mesh(this.geometry, this.material);
    // this.scene.add(this.plane);

    this.populateParticles();

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    this.clearPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2700, 2700),
      new THREE.MeshBasicMaterial({
        transparent: true,
        color: 0x000000,
        opacity: this.settings.trails,
      })
    );

    this.scene.add(this.clearPlane);
    this.updateParticles();

    // this.scene.add(this.clearPlane);
  }

  populateParticles() {
    this.positions = new Float32Array(this.settings.number * 3);
    this.rands = new Float32Array(this.settings.number);
    this.particles = [];

    for (let i = 0; i < this.settings.number; i++) {
      let x = this.iWidth * (Math.random() - 0.5);
      let y = this.iHeight * (Math.random() - 0.5);
      this.positions.set([x, y, 0], i * 3);
      this.rands.set([Math.random()], i);
      this.particles.push(
        new Particle({
          x,
          y,
          iWidth: this.iWidth,
          iHeight: this.iHeight,
          pres: {w: this.imageWidth,h: this.imageHeight}
        })
      );
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3)
    );
    this.geometry.setAttribute(
      "rands",
      new THREE.BufferAttribute(this.rands, 1)
    );
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.01 * (1 - this.settings.progress);
    this.particles.forEach((p, i) => {
      p.update(this.image, this.time, this.settings.progress,this.settings.sideScale,this.settings.speedScale);
      
      this.positions.set([p.pos.x, p.pos.y, 0], i * 3);
    });
    this.geometry.attributes.position.needsUpdate = true;
    console.log(this.particles[0].vel.y);
    if (this.config) this.over.style.opacity = this.settings.progress;

    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
