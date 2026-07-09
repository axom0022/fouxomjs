class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    normalize() {
        let l = Math.hypot(this.x, this.y, this.z) || 1;
        this.x /= l;
        this.y /= l;
        this.z /= l;
        return this;
    }
    cross(v) {
        let x = this.y * v.z - this.z * v.y;
        let y = this.z * v.x - this.x * v.z;
        let z = this.x * v.y - this.y * v.x;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
}

class Mat4 {
    constructor() {
        this.m = new Float32Array(16);
        this.identity();
    }
    identity() {
        this.m.fill(0);
        this.m[0] = this.m[5] = this.m[10] = this.m[15] = 1;
        return this;
    }
    perspective(fov, aspect, near, far) {
        let f = 1.0 / Math.tan(fov / 2);
        let nf = 1 / (near - far);
        let m = this.m;
        m.fill(0);
        m[0] = f / aspect;
        m[5] = f;
        m[10] = (far + near) * nf;
        m[11] = -1;
        m[14] = 2 * far * near * nf;
        return this;
    }
    lookAt(eye, center, up) {
        let z = eye.clone().sub(center).normalize();
        let x = up.clone().cross(z).normalize();
        let y = z.clone().cross(x).normalize();
        let m = this.m;
        m[0] = x.x; m[4] = x.y; m[8] = x.z; m[12] = -x.dot(eye);
        m[1] = y.x; m[5] = y.y; m[9] = y.z; m[13] = -y.dot(eye);
        m[2] = z.x; m[6] = z.y; m[10] = z.z; m[14] = -z.dot(eye);
        m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;
        return this;
    }
    multiply(b) {
        let a = this.m;
        let bm = b.m;
        let out = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out[i * 4 + j] = a[i * 4] * bm[j] + a[i * 4 + 1] * bm[4 + j] + a[i * 4 + 2] * bm[8 + j] + a[i * 4 + 3] * bm[12 + j];
            }
        }
        this.m = out;
        return this;
    }
    translate(x, y, z) {
        let m = this.m;
        m[12] += m[0] * x + m[4] * y + m[8] * z;
        m[13] += m[1] * x + m[5] * y + m[9] * z;
        m[14] += m[2] * x + m[6] * y + m[10] * z;
        return this;
    }
    scale(x, y, z) {
        let m = this.m;
        m[0] *= x; m[1] *= x; m[2] *= x;
        m[4] *= y; m[5] *= y; m[6] *= y;
        m[8] *= z; m[9] *= z; m[10] *= z;
        return this;
    }
    rotateY(rad) {
        let s = Math.sin(rad);
        let c = Math.cos(rad);
        let m = this.m;
        let a0 = m[0], a1 = m[1], a2 = m[2], a3 = m[3];
        let b0 = m[8], b1 = m[9], b2 = m[10], b3 = m[11];
        m[0] = a0 * c + b0 * s; m[1] = a1 * c + b1 * s; m[2] = a2 * c + b2 * s; m[3] = a3 * c + b3 * s;
        m[8] = b0 * c - a0 * s; m[9] = b1 * c - a1 * s; m[10] = b2 * c - a2 * s; m[11] = b3 * c - a3 * s;
        return this;
    }
    rotateX(rad) {
        let s = Math.sin(rad);
        let c = Math.cos(rad);
        let m = this.m;
        let a0 = m[4], a1 = m[5], a2 = m[6], a3 = m[7];
        let b0 = m[8], b1 = m[9], b2 = m[10], b3 = m[11];
        m[4] = a0 * c + b0 * s; m[5] = a1 * c + b1 * s; m[6] = a2 * c + b2 * s; m[7] = a3 * c + b3 * s;
        m[8] = b0 * c - a0 * s; m[9] = b1 * c - a1 * s; m[10] = b2 * c - a2 * s; m[11] = b3 * c - a3 * s;
        return this;
    }
    rotateZ(rad) {
        let s = Math.sin(rad);
        let c = Math.cos(rad);
        let m = this.m;
        let a0 = m[0], a1 = m[1], a2 = m[2], a3 = m[3];
        let b0 = m[4], b1 = m[5], b2 = m[6], b3 = m[7];
        m[0] = a0 * c + b0 * s; m[1] = a1 * c + b1 * s; m[2] = a2 * c + b2 * s; m[3] = a3 * c + b3 * s;
        m[4] = b0 * c - a0 * s; m[5] = b1 * c - a1 * s; m[6] = b2 * c - a2 * s; m[7] = b3 * c - a3 * s;
        return this;
    }
}

function normalFromMat4(m) {
    let a00 = m[0], a01 = m[1], a02 = m[2];
    let a10 = m[4], a11 = m[5], a12 = m[6];
    let a20 = m[8], a21 = m[9], a22 = m[10];
    let b01 = a22 * a11 - a12 * a21;
    let b11 = -a22 * a10 + a12 * a20;
    let b21 = a21 * a10 - a11 * a20;
    let det = a00 * b01 + a01 * b11 + a02 * b21;
    if (!det) return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    det = 1.0 / det;
    return new Float32Array([
        b01 * det, (-a22 * a01 + a02 * a21) * det, (a12 * a01 - a02 * a11) * det,
        b11 * det, (a22 * a00 - a02 * a20) * det, (-a12 * a00 + a02 * a10) * det,
        b21 * det, (-a21 * a00 + a01 * a20) * det, (a11 * a00 - a01 * a10) * det
    ]);
}

class Object3D {
    constructor() {
        this.position = new Vec3();
        this.rotation = new Vec3();
        this.scale = new Vec3(1, 1, 1);
        this.children = [];
        this.parent = null;
        this.matrix = new Mat4();
        this.worldMatrix = new Mat4();
    }
    add(child) {
        if (child.parent) child.parent.remove(child);
        child.parent = this;
        this.children.push(child);
        return this;
    }
    remove(child) {
        let i = this.children.indexOf(child);
        if (i !== -1) {
            this.children.splice(i, 1);
            child.parent = null;
        }
        return this;
    }
    updateMatrix() {
        this.matrix.identity()
            .translate(this.position.x, this.position.y, this.position.z)
            .rotateY(this.rotation.y)
            .rotateX(this.rotation.x)
            .rotateZ(this.rotation.z)
            .scale(this.scale.x, this.scale.y, this.scale.z);
    }
    updateWorldMatrix(parentMatrix) {
        this.updateMatrix();
        if (parentMatrix) {
            this.worldMatrix.m = new Float32Array(parentMatrix.m);
            this.worldMatrix.multiply(this.matrix);
        } else {
            this.worldMatrix.m = new Float32Array(this.matrix.m);
        }
        for (let child of this.children) {
            child.updateWorldMatrix(this.worldMatrix);
        }
    }
}

class Scene extends Object3D {
    constructor() {
        super();
        this.background = [0.05, 0.05, 0.08];
    }
}

class PerspectiveCamera extends Object3D {
    constructor(fov, aspect, near, far) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.projectionMatrix = new Mat4();
        this.viewMatrix = new Mat4();
        this.target = new Vec3(0, 0, -1);
        this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
        this.projectionMatrix.perspective(this.fov, this.aspect, this.near, this.far);
    }
    updateViewMatrix() {
        let eye = this.position;
        let up = new Vec3(0, 1, 0);
        let dir = this.target.clone().normalize();
        let targetPos = new Vec3(eye.x + dir.x, eye.y + dir.y, eye.z + dir.z);
        this.viewMatrix.lookAt(eye, targetPos, up);
    }
}

class BufferGeometry {
    constructor() {
        this.attributes = {};
        this.index = null;
        this.glBuffers = {};
    }
    setAttribute(name, data, size) {
        this.attributes[name] = { data: new Float32Array(data), size };
        return this;
    }
    setIndex(data) {
        this.index = data.length > 65535 ? new Uint32Array(data) : new Uint16Array(data);
        return this;
    }
    dispose(gl) {
        for (let k in this.glBuffers) gl.deleteBuffer(this.glBuffers[k]);
    }
}

class BoxGeometry extends BufferGeometry {
    constructor(w = 1, h = 1, d = 1) {
        super();
        let hw = w / 2, hh = h / 2, hd = d / 2;
        let positions = [
            -hw, -hh, hd, hw, -hh, hd, hw, hh, hd, -hw, hh, hd,
            -hw, -hh, -hd, -hw, hh, -hd, hw, hh, -hd, hw, -hh, -hd,
            -hw, hh, -hd, -hw, hh, hd, hw, hh, hd, hw, hh, -hd,
            -hw, -hh, -hd, hw, -hh, -hd, hw, -hh, hd, -hw, -hh, hd,
            hw, -hh, -hd, hw, hh, -hd, hw, hh, hd, hw, -hh, hd,
            -hw, -hh, -hd, -hw, -hh, hd, -hw, hh, hd, -hw, hh, -hd
        ];
        let normals = [
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
        ];
        let indices = [];
        for (let i = 0; i < 6; i++) {
            let o = i * 4;
            indices.push(o, o + 1, o + 2, o, o + 2, o + 3);
        }
        this.setAttribute('position', positions, 3);
        this.setAttribute('normal', normals, 3);
        this.setIndex(indices);
    }
}

class SphereGeometry extends BufferGeometry {
    constructor(radius = 1, widthSeg = 32, heightSeg = 16) {
        super();
        let pos = [], norm = [], idx = [];
        for (let y = 0; y <= heightSeg; y++) {
            let v = y / heightSeg;
            let phi = v * Math.PI;
            for (let x = 0; x <= widthSeg; x++) {
                let u = x / widthSeg;
                let theta = u * Math.PI * 2;
                let px = -radius * Math.cos(theta) * Math.sin(phi);
                let py = radius * Math.cos(phi);
                let pz = radius * Math.sin(theta) * Math.sin(phi);
                pos.push(px, py, pz);
                let n = new Vec3(px, py, pz).normalize();
                norm.push(n.x, n.y, n.z);
            }
        }
        for (let y = 0; y < heightSeg; y++) {
            for (let x = 0; x < widthSeg; x++) {
                let a = y * (widthSeg + 1) + x;
                let b = a + widthSeg + 1;
                idx.push(a, b, a + 1, b, b + 1, a + 1);
            }
        }
        this.setAttribute('position', pos, 3);
        this.setAttribute('normal', norm, 3);
        this.setIndex(idx);
    }
}

class Material {
    constructor(params = {}) {
        this.color = params.color || [1, 1, 1];
        this.emissive = params.emissive || [0, 0, 0];
        this.shininess = params.shininess || 32.0;
        this.program = null;
        this.uniforms = {};
    }
}

class MeshPhongMaterial extends Material {
    constructor(params) {
        super(params);
        this.type = 'phong';
    }
}

class Mesh extends Object3D {
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

class Light extends Object3D {
    constructor(color = [1, 1, 1]) {
        super();
        this.color = color;
    }
}

class DirectionalLight extends Light {
    constructor(color, intensity = 1.0) {
        super(color);
        this.intensity = intensity;
        this.type = 'directional';
    }
}

class PointLight extends Light {
    constructor(color, intensity = 1.0, distance = 0.0) {
        super(color);
        this.intensity = intensity;
        this.distance = distance;
        this.type = 'point';
    }
}

class WebGLRenderer {
    constructor(params = {}) {
        this.canvas = params.canvas || document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        this.gl = this.canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
        if (!this.gl) throw new Error('WebGL2 not supported');
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.programs = {};
        this.initShaders();
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.handleResize();
    }
    attachTo(element) {
        element.appendChild(this.canvas);
        this.resizeObserver.observe(element);
        this.handleResize();
        return this;
    }
    handleResize() {
        let parent = this.canvas.parentElement || document.body;
        let w = parent.clientWidth;
        let h = parent.clientHeight;
        let dpr = window.devicePixelRatio || 1;
        let rw = Math.floor(w * dpr);
        let rh = Math.floor(h * dpr);
        if (this.canvas.width !== rw || this.canvas.height !== rh) {
            this.canvas.width = rw;
            this.canvas.height = rh;
            this.gl.viewport(0, 0, rw, rh);
            if (this.onResize) this.onResize(w, h);
        }
    }
    initShaders() {
        let gl = this.gl;
        let vs = `#version 300 es
        in vec3 position;
        in vec3 normal;
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat3 normalMatrix;
        out vec3 vNormal;
        out vec3 vWorldPos;
        void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }`;
        let fs = `#version 300 es
        precision highp float;
        in vec3 vNormal;
        in vec3 vWorldPos;
        uniform vec3 uColor;
        uniform vec3 uEmissive;
        uniform float uShininess;
        uniform vec3 uViewPos;
        uniform vec3 uLightDirs[8];
        uniform vec3 uLightColors[8];
        uniform int uLightCount;
        uniform int uLightTypes[8];
        out vec4 fragColor;
        void main() {
            vec3 norm = normalize(vNormal);
            vec3 viewDir = normalize(uViewPos - vWorldPos);
            vec3 result = uEmissive;
            for(int i=0; i<8; i++) {
                if(i >= uLightCount) break;
                vec3 lightDir;
                float attenuation = 1.0;
                if(uLightTypes[i] == 1) {
                    vec3 diff = uLightDirs[i] - vWorldPos;
                    float dist = length(diff);
                    lightDir = normalize(diff);
                    attenuation = 1.0 / (1.0 + 0.09 * dist + 0.032 * dist * dist);
                } else {
                    lightDir = normalize(-uLightDirs[i]);
                }
                float diff = max(dot(norm, lightDir), 0.0);
                vec3 reflectDir = reflect(-lightDir, norm);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
                result += (diff * uColor + spec * 0.5) * uLightColors[i] * attenuation;
            }
            fragColor = vec4(result, 1.0);
        }`;
        let program = this.createProgram(vs, fs);
        this.programs.phong = {
            program,
            attribs: {
                position: gl.getAttribLocation(program, 'position'),
                normal: gl.getAttribLocation(program, 'normal')
            },
            uniforms: {
                modelMatrix: gl.getUniformLocation(program, 'modelMatrix'),
                viewMatrix: gl.getUniformLocation(program, 'viewMatrix'),
                projectionMatrix: gl.getUniformLocation(program, 'projectionMatrix'),
                normalMatrix: gl.getUniformLocation(program, 'normalMatrix'),
                uColor: gl.getUniformLocation(program, 'uColor'),
                uEmissive: gl.getUniformLocation(program, 'uEmissive'),
                uShininess: gl.getUniformLocation(program, 'uShininess'),
                uViewPos: gl.getUniformLocation(program, 'uViewPos'),
                uLightDirs: gl.getUniformLocation(program, 'uLightDirs'),
                uLightColors: gl.getUniformLocation(program, 'uLightColors'),
                uLightCount: gl.getUniformLocation(program, 'uLightCount'),
                uLightTypes: gl.getUniformLocation(program, 'uLightTypes')
            }
        };
    }
    createProgram(vsSrc, fsSrc) {
        let gl = this.gl;
        let vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vsSrc);
        gl.compileShader(vs);
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(vs));
        let fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fsSrc);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(fs));
        let p = gl.createProgram();
        gl.attachShader(p, vs);
        gl.attachShader(p, fs);
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        return p;
    }
    setupGeometry(geom) {
        let gl = this.gl;
        for (let name in geom.attributes) {
            let attr = geom.attributes[name];
            let buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, attr.data, gl.STATIC_DRAW);
            geom.glBuffers[name] = buf;
        }
        if (geom.index) {
            let buf = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geom.index, gl.STATIC_DRAW);
            geom.glBuffers.index = buf;
        }
    }
    traverse(obj, callback) {
        callback(obj);
        for (let child of obj.children) this.traverse(child, callback);
    }
    render(scene, camera) {
        let gl = this.gl;
        gl.clearColor(scene.background[0], scene.background[1], scene.background[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        scene.updateWorldMatrix();
        camera.updateWorldMatrix();
        camera.updateViewMatrix();
        if (camera.aspect !== (this.canvas.width / this.canvas.height)) {
            camera.aspect = this.canvas.width / this.canvas.height;
            camera.updateProjectionMatrix();
        }
        let lights = [];
        this.traverse(scene, (obj) => {
            if (obj.type === 'directional' || obj.type === 'point') lights.push(obj);
        });
        let p = this.programs.phong;
        gl.useProgram(p.program);
        gl.uniformMatrix4fv(p.uniforms.projectionMatrix, false, camera.projectionMatrix.m);
        gl.uniformMatrix4fv(p.uniforms.viewMatrix, false, camera.viewMatrix.m);
        gl.uniform3fv(p.uniforms.uViewPos, [camera.position.x, camera.position.y, camera.position.z]);
        let lightDirs = new Float32Array(24);
        let lightColors = new Float32Array(24);
        let lightTypes = new Int32Array(8);
        for (let i = 0; i < Math.min(lights.length, 8); i++) {
            let l = lights[i];
            lightDirs[i * 3] = l.position.x;
            lightDirs[i * 3 + 1] = l.position.y;
            lightDirs[i * 3 + 2] = l.position.z;
            lightColors[i * 3] = l.color[0] * l.intensity;
            lightColors[i * 3 + 1] = l.color[1] * l.intensity;
            lightColors[i * 3 + 2] = l.color[2] * l.intensity;
            lightTypes[i] = l.type === 'point' ? 1 : 0;
        }
        gl.uniform3fv(p.uniforms.uLightDirs, lightDirs);
        gl.uniform3fv(p.uniforms.uLightColors, lightColors);
        gl.uniform1iv(p.uniforms.uLightTypes, lightTypes);
        gl.uniform1i(p.uniforms.uLightCount, Math.min(lights.length, 8));
        this.traverse(scene, (obj) => {
            if (obj instanceof Mesh) {
                if (!obj.geometry.glBuffers.position) this.setupGeometry(obj.geometry);
                let geom = obj.geometry;
                let mat = obj.material;
                gl.uniformMatrix4fv(p.uniforms.modelMatrix, false, obj.worldMatrix.m);
                gl.uniformMatrix3fv(p.uniforms.normalMatrix, false, normalFromMat4(obj.worldMatrix.m));
                gl.uniform3fv(p.uniforms.uColor, mat.color);
                gl.uniform3fv(p.uniforms.uEmissive, mat.emissive);
                gl.uniform1f(p.uniforms.uShininess, mat.shininess);
                gl.bindBuffer(gl.ARRAY_BUFFER, geom.glBuffers.position);
                gl.enableVertexAttribArray(p.attribs.position);
                gl.vertexAttribPointer(p.attribs.position, 3, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, geom.glBuffers.normal);
                gl.enableVertexAttribArray(p.attribs.normal);
                gl.vertexAttribPointer(p.attribs.normal, 3, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geom.glBuffers.index);
                let type = geom.index instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
                if (type === gl.UNSIGNED_INT) gl.getExtension('OES_element_index_uint');
                gl.drawElements(gl.TRIANGLES, geom.index.length, type, 0);
            }
        });
    }
    start(scene, camera) {
        let loop = () => {
            this.render(scene, camera);
            requestAnimationFrame(loop);
        };
        loop();
        return this;
    }
}

window.Fouxom = {
    Vec3,
    Mat4,
    Object3D,
    Scene,
    PerspectiveCamera,
    BufferGeometry,
    BoxGeometry,
    SphereGeometry,
    Material,
    MeshPhongMaterial,
    Mesh,
    Light,
    DirectionalLight,
    PointLight,
    WebGLRenderer
};
