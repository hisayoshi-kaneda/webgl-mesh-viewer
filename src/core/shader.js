export class Shader {
  constructor(glContext, vertFile, fragFile) {
    this.gl = glContext;
    this.programId = this.buildShaderProgram(this.gl, vertFile, fragFile);
  }

  buildShaderProgram(gl, vertFile, fragFile) {
    const vertShaderId = this.compileShader(gl, gl.VERTEX_SHADER, vertFile);
    const fragShaderId = this.compileShader(gl, gl.FRAGMENT_SHADER, fragFile);

    const shaderProgramId = gl.createProgram();
    gl.attachShader(shaderProgramId, vertShaderId);
    gl.attachShader(shaderProgramId, fragShaderId);
    gl.linkProgram(shaderProgramId);
    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgramId, gl.LINK_STATUS)) {
      alert(
        "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgramId)
      );
      return null;
    }

    return shaderProgramId;
  }

  compileShader(gl, type, source) {
    const shaderId = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shaderId, source);

    // Compile the shader program

    gl.compileShader(shaderId);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shaderId, gl.COMPILE_STATUS)) {
      alert(
        "An error occurred compiling the shaders: " +
        gl.getShaderInfoLog(shaderId)
      );
      gl.deleteShader(shaderId);
      return null;
    }

    return shaderId;
  }

  bind() {
    this.gl.useProgram(this.programId);
  }

  release() {
    this.gl.useProgram(null);
  }

  setUniformMatrix4fv(matrix, name) {
    const tmp = this.gl.getUniformLocation(this.programId, name);
    this.gl.uniformMatrix4fv(tmp, false, matrix);
  }

  setUniform1fv(value, name) {
    const tmp = this.gl.getUniformLocation(this.programId, name);
    this.gl.uniform1fv(tmp, [value]);
  }
  setUniform1iv(value, name) {
    const tmp = this.gl.getUniformLocation(this.programId, name);
    this.gl.uniform1iv(tmp, value);
  }
  setUniform2fv(value, name) {
    const tmp = this.gl.getUniformLocation(this.programId, name);
    this.gl.uniform2fv(tmp, value);
  }
  setUniform2iv(value, name) {
    const tmp = this.gl.getUniformLocation(this.programId, name);
    this.gl.uniform2iv(tmp, value);
  }
  setUniform3fv(value, name) {
    const tmp = this.gl.getUniformLocation(this.programId, name);
    this.gl.uniform3fv(tmp, value);
  }
  setUniform3iv(value, name) {
    const tmp = this.gl.getUniformLocation(this.programId, name);
    this.gl.uniform3iv(tmp, value);
  }
}
