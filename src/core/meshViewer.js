import { Shader } from "./shader.js"
import { VertexArrayObject } from "./vertexArrayObject.js"
import { VERT_SOURCE, FRAG_SOURCE } from "../shaders/mesh_render.js"

export class MeshViewer {
    constructor(_mesh, _window) {
        this.mesh = _mesh;
        this.window = _window;
        this.gl = _window.gl;
        this.lightPower = 1.0;
        this.aabbMaxSize = 1.0;
        this.normal_shader = new Shader(this.gl, VERT_SOURCE, FRAG_SOURCE);
        this.vao = new VertexArrayObject(this.gl, [this.mesh.vertices, this.mesh.vertexNormals], this.mesh.indices)
        this.initialize();
    }

    initialize() {
        let minPointAABB = glMatrix.vec3.create();
        let maxPointAABB = glMatrix.vec3.create();
        this.mesh.computeAABB(minPointAABB, maxPointAABB);
        let centerPointAABB = glMatrix.vec3.fromValues(
            (minPointAABB[0] + maxPointAABB[0]) / 2,
            (minPointAABB[1] + maxPointAABB[1]) / 2,
            (minPointAABB[2] + maxPointAABB[2]) / 2)
        this.window.gravity = centerPointAABB;
        let cameraPos = glMatrix.vec3.fromValues((maxPointAABB[0] - minPointAABB[0]) * 2.0, 0.0, 0.0);
        let cameraTarget = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
        let upVector = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);
        this.window.viewMat = glMatrix.mat4.lookAt(this.window.viewMat,
            cameraPos,    // 視点の位置
            cameraTarget, // 見ている先
            upVector);    // 視界の上方向
        this.window.modelMat = glMatrix.mat4.fromTranslation(this.window.modelMat, glMatrix.vec3.fromValues(-centerPointAABB[0], -centerPointAABB[1], -centerPointAABB[2]));
        this.aabbMaxSize = Math.max(maxPointAABB[0] - minPointAABB[0], Math.max(maxPointAABB[1] - minPointAABB[1], maxPointAABB[2] - minPointAABB[2]));
        let K = this.aabbMaxSize / 10.0;
        this.lightPower = 100.0 * K * K / 2.0;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.viewport(0, 0, this.window.width, this.window.height);
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.draw();
        this.gl.flush();
    }

    draw() {
        this.normal_shader.bind();
        this.normal_shader.setUniformMatrix4fv(this.window.mvpMat(), "u_mvpMat");
        this.normal_shader.setUniformMatrix4fv(this.window.modelMat, "u_modelMat");
        this.normal_shader.setUniformMatrix4fv(this.window.viewMat, "u_viewMat");
        this.normal_shader.setUniform1fv(this.aabbMaxSize, "u_aabbMaxSize");
        this.normal_shader.setUniform1fv(this.lightPower, "u_lightPower");
        this.normal_shader.setUniform3fv(glMatrix.vec3.fromValues(1.0, 1.0, 0.0), "u_materialColor");
        this.vao.draw(this.gl.TRIANGLES);
    }
}