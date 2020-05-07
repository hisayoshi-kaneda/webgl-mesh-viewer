Mesh.prototype.computeAABB = function (minPointAABB, maxPointAABB) {
    minPointAABB[0] = Infinity;
    minPointAABB[1] = Infinity;
    minPointAABB[2] = Infinity;
    maxPointAABB[0] = -Infinity;
    maxPointAABB[1] = -Infinity;
    maxPointAABB[2] = -Infinity;
    for (let i = 0; i < this.vertices.length / 3; i++) {
        for (let j = 0; j < 3; j++) {
            minPointAABB[j] = Math.min(this.vertices[3 * i + j], minPointAABB[j]);
            maxPointAABB[j] = Math.max(this.vertices[3 * i + j], maxPointAABB[j]);
        }
    }
};