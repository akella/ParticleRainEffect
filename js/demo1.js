import Sketch from "./module.js";
import myimage from "../img/1.jpg";
new Sketch({
  dom: document.getElementById("container"),
  config: false,
  url: myimage,
  mouseover: "#mouseover",
  settings:{
    number: 5000,
    trails: 0.1,
    size: 0.7,
    gravity:0.24,
    gravityDifference:0.08,
    randomness: 0.5,
    sideScale: 4,
    speedScale: 8
  }
});
