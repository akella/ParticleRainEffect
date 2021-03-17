import Sketch from "./module.js";
import myimage from "../img/2.jpg";
new Sketch({
  dom: document.getElementById("container"),
  config: false,
  url: myimage,
  mouseover: "#mouseover",
  settings:{
    number: 5000,
    trails: 0.1,
    size: 0.9,
    gravity:0.3,
    gravityDifference:0.04,
    randomness: 0.9,
    sideScale: 10,
    speedScale: 10
  }
});
