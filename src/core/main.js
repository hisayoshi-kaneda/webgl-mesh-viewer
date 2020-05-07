"use strict";
import { Window } from "./window.js";
import { MeshViewer } from "./meshViewer.js";

class hoge {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.height = 1000;
  }
}

function main(meshes) {
  // GL コンテキストを初期化する
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl2");
  canvas.width = 500;
  canvas.height = 500;
  // WebGL が使用可能で動作している場合にのみ続行します
  if (gl === null) {
    alert(
      "WebGL を初期化できません。ブラウザまたはマシンがサポートしていない可能性があります。"
    );
    return;
  }
  let mesh = meshes["bunny"];
  let window = new Window(gl, canvas);
  let viewer = new MeshViewer(mesh, window);
  //viewer.render();
  (function loop() {
    viewer.render();
    requestAnimationFrame(loop);
  })();
  viewer.render();
}

window.onload = function () {
  OBJ.downloadMeshes(
    {
      bunny: "https://cdn.glitch.com/7dbbf676-1e92-4b14-8e2a-594124bc8c2a%2Fbunny.obj?v=1588670306471"
      //'bunny2': 'https://cdn.glitch.com/7dbbf676-1e92-4b14-8e2a-594124bc8c2a%2Fbunny2.obj?v=1588784689415',
    },
    main
  );
};
