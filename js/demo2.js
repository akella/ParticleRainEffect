import Sketch from "./module.js";
import myimage from "../img/2.jpg";
new Sketch({
  dom: document.getElementById("container"),
  config: false,
  url: myimage,
  mouseover: "#mouseover",
});
