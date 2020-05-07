export class VertexArrayObject {
  constructor(gl, vboDataArray, indices) {
    this.gl = gl;
    this.iboId = null;
    this.initialize(gl, vboDataArray, indices);
  }
  initialize(gl, vboDataArray, indices) {
    this.vaoId = gl.createVertexArray();
    gl.bindVertexArray(this.vaoId);

    for (let i = 0; i < vboDataArray.length; i++) {
      const vboId = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vboId);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vboDataArray[i]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 0, 0);
      this.arraySize = vboDataArray[i].length / 3;
    }
    console.log(this.arraySize);
    if (indices) {
      this.iboId = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iboId);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      this.arraySize = indices.length;
    }
    console.log(this.arraySize);
    gl.bindVertexArray(null);
  }
  draw(mode) {
    this.gl.bindVertexArray(this.vaoId);
    this.gl.drawElements(mode, this.arraySize, this.gl.UNSIGNED_SHORT, 0);
    this.gl.bindVertexArray(null);
  }
}
