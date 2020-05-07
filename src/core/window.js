
const ARCBALL_MODE_ROTATE = 0;
const ARCBALL_MODE_SCALE = 1;
const ARCBALL_MODE_TRANSLATE = 2;
const ARCBALL_MODE_NONE = 3;

export class Window {
    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.modelMat = glMatrix.mat4.create();
        this.viewMat = glMatrix.mat4.create();
        this.projMat = glMatrix.mat4.create();

        this.oldPos = glMatrix.vec2.create();
        this.newPos = glMatrix.vec2.create();
        this.gravity = glMatrix.vec3.create();
        this.arcballMode = ARCBALL_MODE_NONE;
        this.isDragging = false;
        this.acRotMat = glMatrix.mat4.create();
        this.acScaleMat = glMatrix.mat4.create();
        this.acTransMat = glMatrix.mat4.create();
        this.acScale = 1.0;

        this.initialize();
    }

    initialize() {
        this.registerMouseEvent();
        this.projMat = glMatrix.mat4.perspective(this.projMat, Math.PI / 4.0, this.width / this.height, 0.1, 1000.0);
        this.viewMat = glMatrix.mat4.lookAt(this.viewMat,
            glMatrix.vec3.fromValues(3.0, 4.0, 5.0),  // 視点の位置
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),  // 見ている先
            glMatrix.vec3.fromValues(0.0, 1.0, 0.0)); // 視界の上方向
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
        // 指定されたクリアカラーでカラーバッファをクリアします
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    arcMat() {
        let res = glMatrix.mat4.create();
        return glMatrix.mat4.multiply(res, this.acTransMat, glMatrix.mat4.multiply(res, this.acScaleMat, this.acRotMat));
    }

    mvMat() {
        let res = glMatrix.mat4.create();
        return glMatrix.mat4.multiply(res, this.viewMat, glMatrix.mat4.multiply(res, this.arcMat(), this.modelMat));
    }

    mvpMat() {
        let res = glMatrix.mat4.create();
        return glMatrix.mat4.multiply(res, this.projMat, this.mvMat());
    }

    registerMouseEvent() {
        let that = this;
        this.canvas.addEventListener("mousedown", function (e) { that.mouseEvent(e); }, false);
        this.canvas.addEventListener("mouseup", function (e) { that.mouseEvent(e); }, false);
        this.canvas.addEventListener("mousemove", function (e) { that.mouseMoveEvent(e); }, false);
        this.canvas.addEventListener("wheel", function (e) { that.wheelEvent(e); }, false);
        this.canvas.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        }, false);
    }

    // マウスムーブイベントに登録する処理
    getCursorPos(event) {
        console.log("click");
        var x = event.clientX - this.canvas.offsetLeft;
        var y = event.clientY - this.canvas.offsetTop;
        console.log("x:", x, "y:", y);
        return glMatrix.vec2.fromValues(x, y);
    }

    mouseEvent(event) {
        switch (event.button) {
            case 0:
                this.arcballMode = ARCBALL_MODE_ROTATE;
                break;
            case 1:
                this.arcballMode = ARCBALL_MODE_SCALE;
                break;
            case 2:
                this.arcballMode = ARCBALL_MODE_TRANSLATE;
                break;
        }

        // クリックされた位置を取得
        let cursorPos = this.getCursorPos(event);

        if (event.type == "mousedown") {
            if (this.isDragging == false) {
                this.isDragging = true;
                this.oldPos = cursorPos;
                this.newPos = cursorPos;
            }
        }
        else {
            this.isDragging = false;
            this.oldPos = glMatrix.vec2.fromValues(0, 0);
            this.newPos = glMatrix.vec2.fromValues(0, 0);
            this.arcballMode = ARCBALL_MODE_NONE;
        }
    }


    // スクリーン上の位置をアークボール球上の位置に変換する関数
    getVector(x, y) {
        let pt = glMatrix.vec3.fromValues(2.0 * x / this.width - 1.0, - 2.0 * y / this.height + 1.0, 0.0);

        const xySquared = pt[0] * pt[0] + pt[1] * pt[1];
        if (xySquared <= 1.0) {
            // 単位円の内側ならz座標を計算
            pt[2] = Math.sqrt(1.0 - xySquared);
        }
        else {
            // 外側なら球の外枠上にあると考える
            pt = glMatrix.vec3.normalize(pt, pt);
        }
        return pt;
    }

    updateRotate() {
        // スクリーン座標をアークボール球上の座標に変換
        let u = glMatrix.vec3.create()
        let v = glMatrix.vec3.create()
        u = glMatrix.vec3.normalize(u, this.getVector(this.newPos[0], this.newPos[1]));
        v = glMatrix.vec3.normalize(v, this.getVector(this.oldPos[0], this.oldPos[1]));

        // カメラ座標における回転量 (=オブジェクト座標における回転量)
        const angle = Math.acos(Math.max(-1.0, Math.min(glMatrix.vec3.dot(u, v), 1.0)));

        // カメラ空間における回転軸
        let rotAxis = glMatrix.vec3.create();
        rotAxis = glMatrix.vec3.cross(rotAxis, v, u);

        // カメラ座標の情報をワールド座標に変換する行列
        let c2oMat = glMatrix.mat4.create();
        c2oMat = glMatrix.mat4.invert(c2oMat, glMatrix.mat4.multiply(c2oMat, this.viewMat, this.modelMat));

        // オブジェクト座標における回転軸
        let rotAxisObjSpace = glMatrix.vec4.create();
        rotAxisObjSpace = glMatrix.vec4.transformMat4(rotAxisObjSpace, glMatrix.vec4.fromValues(rotAxis[0], rotAxis[1], rotAxis[2], 0.0), c2oMat);
        console.log(rotAxisObjSpace, angle, rotAxis, u, v);
        // 回転行列の更新
        //this.acRotMat = glMatrix.mat4.rotate(this.acRotMat, this.acRotMat, 4.0 * angle, rotAxisObjSpace);
        let tmp = glMatrix.mat4.create();
        tmp = glMatrix.mat4.fromRotation(tmp, 4.0 * angle, rotAxisObjSpace);
        this.acRotMat = glMatrix.mat4.multiply(this.acRotMat, tmp, this.acRotMat);
    }

    updateTranslate() {
        let mvpMat = glMatrix.mat4.create();
        glMatrix.mat4.multiply(mvpMat, glMatrix.mat4.multiply(mvpMat, this.projMat, this.viewMat), this.modelMat)
        // オブジェクト重心のスクリーン座標を求める
        let gravityScreenSpace = glMatrix.vec4.create();
        gravityScreenSpace = glMatrix.vec4.transformMat4(gravityScreenSpace, glMatrix.vec4.fromValues(this.gravity[0], this.gravity[1], this.gravity[2], 1.0), mvpMat);
        gravityScreenSpace[0] /= gravityScreenSpace[3];
        gravityScreenSpace[1] /= gravityScreenSpace[3];
        gravityScreenSpace[2] /= gravityScreenSpace[3];
        gravityScreenSpace[3] = 1.0;

        // スクリーン座標系における移動量
        let newPosScreenSpace = glMatrix.vec4.fromValues(2.0 * this.newPos[0] / this.width, -2.0 * this.newPos[1] / this.height, gravityScreenSpace[2], 1.0);
        let oldPosScreenSpace = glMatrix.vec4.fromValues(2.0 * this.oldPos[0] / this.width, -2.0 * this.oldPos[1] / this.height, gravityScreenSpace[2], 1.0);

        // スクリーン座標の情報をオブジェクト座標に変換する行列
        let s2oMat = glMatrix.mat4.create();
        s2oMat = glMatrix.mat4.invert(s2oMat, mvpMat);

        // スクリーン空間の座標をオブジェクト空間に変換
        let newPosObjSpace = glMatrix.vec4.create();
        newPosObjSpace = glMatrix.vec4.transformMat4(newPosObjSpace, newPosScreenSpace, s2oMat);
        let oldPosObjSpace = glMatrix.vec4.create();
        oldPosObjSpace = glMatrix.vec4.transformMat4(oldPosObjSpace, oldPosScreenSpace, s2oMat);
        newPosObjSpace[0] /= newPosObjSpace[3];
        newPosObjSpace[1] /= newPosObjSpace[3];
        newPosObjSpace[2] /= newPosObjSpace[3];
        newPosObjSpace[3] /= newPosObjSpace[3];
        oldPosObjSpace[0] /= oldPosObjSpace[3];
        oldPosObjSpace[1] /= oldPosObjSpace[3];
        oldPosObjSpace[2] /= oldPosObjSpace[3];
        oldPosObjSpace[3] /= oldPosObjSpace[3];

        // オブジェクト座標系での移動量
        let transObjSpace = glMatrix.vec3.create();
        transObjSpace[0] = newPosObjSpace[0] - oldPosObjSpace[0];
        transObjSpace[1] = newPosObjSpace[1] - oldPosObjSpace[1];
        transObjSpace[2] = newPosObjSpace[2] - oldPosObjSpace[2];
        console.log(newPosObjSpace);

        // オブジェクト空間での平行移動
        this.acTransMat = glMatrix.mat4.translate(this.acTransMat, this.acTransMat, transObjSpace);
    }

    updateScale() {
        this.acScaleMat = glMatrix.mat4.fromScaling(this.acScaleMat, glMatrix.vec3.fromValues(this.acScale, this.acScale, this.acScale));
    }

    updateMouse() {
        switch (this.arcballMode) {
            case ARCBALL_MODE_ROTATE:
                this.updateRotate();
                break;

            case ARCBALL_MODE_TRANSLATE:
                this.updateTranslate();
                break;

            case ARCBALL_MODE_SCALE:
                this.acScale += (this.oldPos[1] - this.newPos[1]) / this.height;
                this.updateScale();
                break;
        }
    }

    mouseMoveEvent(event) {
        if (this.isDragging) {
            // マウスの現在位置を更新
            let cursorPos = this.getCursorPos(event);
            this.newPos = cursorPos;

            // マウスがあまり動いていない時は処理をしない
            const dx = this.newPos[0] - this.oldPos[0];
            const dy = this.newPos[1] - this.oldPos[1];
            const length = dx * dx + dy * dy;
            if (length < 2.0 * 2.0) {
                return;
            }
            else {
                this.updateMouse();
                this.oldPos = cursorPos;
            }
        }
    }

    wheelEvent(event) {
        this.acScale += event.wheelDelta / this.height;
        this.updateScale();
    }
}

