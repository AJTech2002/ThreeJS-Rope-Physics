import { Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector3 } from "three";
import * as THREE from 'three';

/// https://owlree.blog/posts/simulating-a-rope.html

export class Point {

    isAttached: boolean = false;
    position: Vector3 = new Vector3(0, 0, 0);
    previousPos: Vector3 = new Vector3(0, 0, 0);
    acceleration: Vector3 = new Vector3(0, -9.81 * 100, 0);

    constructor(_isAttached: boolean, _position: Vector3) {
        this.isAttached = _isAttached;
        this.position = _position;
        this.previousPos = _position;
    }

    // point.velocity = Vector2.sub(point.pos, point.oldPos);
    // point.oldPos = { ...point.pos };

    // //drastically improves stability
    // let timeCorrection = previousFrameDt != 0.0 ? dt / previousFrameDt : 0.0;

    // let accel = Vector2.add(gravity, { x: 0, y: point.mass });

    // const velCoef = timeCorrection * point.damping;
    // const accelCoef = Math.pow(dt, 2);

    // point.pos.x += point.velocity.x * velCoef + accel.x * accelCoef;
    // point.pos.y += point.velocity.y * velCoef + accel.y * accelCoef;

    simulateMovement(delta: number, previousFrameDt: number) {
        if (this.isAttached) return;
        let timeCorrection = previousFrameDt != 0.0 ? delta / previousFrameDt : 0.0;



        var vel: Vector3 = this.position.clone().sub(this.previousPos).multiplyScalar(1 * timeCorrection);


        this.previousPos = (this.position.clone());


        var newPos = (this.position.clone().add(vel));
        newPos.add(new Vector3(0, -100 * delta * delta, 0));

        this.position = newPos;
    }

}

export class Line {
    pointA: Point;
    pointB: Point;
    length: number;

    constructor(_pointA: Point, _pointB: Point) {
        this.pointA = _pointA;
        this.pointB = _pointB;
        this.length = _pointA.position.distanceTo(_pointB.position);
    }

    //     function relaxConstraint(particle1, particle2, desiredDistance)
    // 2	direction ← normalize(particle2.position − particle1.position)
    // 3	Δ𝑑 ← distance(particle1, particle2) − desiredDistance
    // 4	particle1.position.add(Δ𝑑direction / 2)
    // 5	particle2.position.subtract(Δ𝑑direction / 2)

    simulateJacobsen() {


        var currentDistance = (this.pointA.position.clone().sub(this.pointB.position.clone())).length();
        var dif = Math.abs(currentDistance - this.length);

        if (dif < 0.005) {
            dif = 0;
        }

        var dir = this.pointB.position.clone().sub(this.pointA.position.clone()).normalize();

        if (currentDistance > this.length) {
            dir = this.pointA.position.clone().sub(this.pointB.position.clone()).normalize();
        }
        else if (currentDistance < this.length) {
            dir = this.pointB.position.clone().sub(this.pointA.position.clone()).normalize();
        }

        var move = dir.clone().multiplyScalar(dif);

        if (!this.pointA.isAttached)
            this.pointA.position = this.pointA.position.clone().sub(move.clone().multiplyScalar(this.pointB.isAttached ? 1 : 0.25));

        if (!this.pointB.isAttached)
            this.pointB.position = this.pointB.position.clone().add(move.clone().multiplyScalar(this.pointA.isAttached ? 1 : 0.25));

    }
}

export class LineGeometry {

    testLine: Line;
    meshPointA: Mesh;
    meshPointB: Mesh;
    lineGeometry: THREE.Line;


    constructor(pointA: Point, pointB: Point) {

        var _testLine: Line = new Line(pointA, pointB);

        this.testLine = _testLine;

        const geometry = new SphereGeometry(0.1);
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        const attached = new MeshBasicMaterial({ color: 0xffffff });

        this.meshPointA = new Mesh(geometry, pointA.isAttached ? attached : material);
        this.meshPointA.position.x = this.testLine.pointA.position.x;
        this.meshPointA.position.y = this.testLine.pointA.position.y;
        this.meshPointA.position.z = this.testLine.pointA.position.z;

        this.meshPointB = new Mesh(geometry, pointB.isAttached ? attached : material);
        this.meshPointB.position.x = this.testLine.pointB.position.x;
        this.meshPointB.position.y = this.testLine.pointB.position.y;
        this.meshPointB.position.z = this.testLine.pointB.position.z;

        const points = [];
        points.push(pointA.position);
        points.push(pointB.position);

        const materialLine = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const geometryLine = new THREE.BufferGeometry().setFromPoints(points);

        this.lineGeometry = new THREE.Line(geometryLine, materialLine);
    }

    addToScene(scene: Scene) {
        scene.add(this.meshPointA);
        scene.add(this.meshPointB);
        scene.add(this.lineGeometry);
    }

    update() {
        this.meshPointA.position.x = this.testLine.pointA.position.x;
        this.meshPointA.position.y = this.testLine.pointA.position.y;
        this.meshPointA.position.z = this.testLine.pointA.position.z;

        this.meshPointB.position.x = this.testLine.pointB.position.x;
        this.meshPointB.position.y = this.testLine.pointB.position.y;
        this.meshPointB.position.z = this.testLine.pointB.position.z;

        const points = [];
        points.push(this.testLine.pointA.position);
        points.push(this.testLine.pointB.position);

        this.lineGeometry.geometry.setFromPoints(points);
    }

}