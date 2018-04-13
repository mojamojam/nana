var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var scene = new THREE.Scene();
var clientInfo = new Object();
var serverInfo = new Object();
var globalInfo = new Object();
var packetInfo = new Object();

class Packet {
    constructor() {
        this.count = 0;
    }
    create(id, dst) {
        let sphereGeometry = new THREE.SphereGeometry(30, 15, 15);
        let sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.6,    
        });
        let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.name = "packet" + this.count;
        sphere.position.set(clientInfo[id].x, 400, clientInfo[id].z);
        scene.add(sphere);
        packetInfo[this.count] = {
            dstip: dst,
            x: sphere.position.x,
            y: sphere.position.y,
            z: sphere.position.z,
            dx: clientInfo[id]["point"].dx,
            dy: clientInfo[id]["point"].dy,
            dz: clientInfo[id]["point"].dz,
            smoothcount: 0,
            count: 0,
            smooth: 50,
        };
        this.count++;
    }
    /*
    move() {
        let packetKey = Object.keys(packetInfo);
        if (packetKey.length > 0) {
            for (let i in packetKey) {
                let id = packetKey[i];
                let packet = scene.getObjectByName("packet" + id);
                packet.position.x = packetInfo[id].x + clientInfo[id]["point"].dx * packetInfo[id].smoothcount;
                packet.position.y = packetInfo[id].y + clientInfo[id]["point"].dy * packetInfo[id].smoothcount;
                packet.position.z = packetInfo[id].z + clientInfo[id]["point"].dz * packetInfo[id].smoothcount;
                packetInfo[id].smoothcount++;
                console.log(packet.position.x);
                if (packetInfo[id].smoothcount > packetInfo[id].smooth) {
                    this.remove(id);
                }
            };    
        };
    } */
    move() {
        let packetKey = Object.keys(packetInfo);
        if (packetKey.length > 0) {
            for (let j in packetKey) {
                let id = packetKey[j];
                let packet = scene.getObjectByName("packet" + id);
                if (packetInfo[id].count == 0) {
                    this.movetoPoint(id, packet);
                } else if (packetInfo[id].count == 1) {
                    //this.movetoRouter(id, packet);
                }
                packetInfo[id].smoothcount++;
                if (packetInfo[id].smoothcount > packetInfo[id].smooth) {
                    packetInfo[id].count++;
                    packetInfo[id].smoothcount = 0;
                    if (packetInfo[id].count == 2) {
                        this.remove(id);
                    }
                }
            }
        }
    }
    
    
    movetoPoint(id, packet) {
        packet.position.x = packetInfo[id].x + packetInfo[id].dx * packetInfo[id].smoothcount;
        packet.position.y = packetInfo[id].y + packetInfo[id].dy * packetInfo[id].smoothcount;
        packet.position.z = packetInfo[id].z + packetInfo[id].dz * packetInfo[id].smoothcount;
    }
    movetoRouter(id, packet) {
        console.log(packet.position.z);
        packet.position.z = packet.position.z + -5.49 * packetInfo[id].smoothcount;
        //console.log(packet.position.z);
    }
    remove(id) {
        delete packetInfo[id];
        scene.remove(scene.getObjectByName("packet" + id));
    }

}


class Client {
    constructor() {
        this.clientNum = 20;
        this.cubeWidth = 400;
        this.cubeHeight = 400;
        this.cubeDepth = 400;
        this.count = 0;

        for (let i=0; i<20; i++) {
            clientInfo[i] = new Object();
        }
    }

    create() {
        this.cubeGeometry = new THREE.CubeGeometry(this.cubeWidth, this.cubeHeight, this.cubeDepth);
        this.cubeMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.2,
        });
        for (let i=0; i<5; i++) {
            for (let j=0; j<4; j++) {
                let cube = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial);
                let cubeEdge = new THREE.EdgesHelper(cube, 0xffffff);
                cube.name = "client" + this.count;
                cube.position.set(1500 * i - 3000, 200, 1500 * j + 8000);
                scene.add(cube, cubeEdge);
                clientInfo[this.count] = {
                    x: cube.position.x,
                    y: cube.position.y,
                    z: cube.position.z,
                }
                this.count++;
            }
        }
        for (let i=0; i<20; i++) {
            clientInfo[i]["point"] = new Object();
            clientInfo[i]["point"].dx = (0 - clientInfo[i].x)/50;
            clientInfo[i]["point"].dy = (600 - clientInfo[i].y)/50;
            clientInfo[i]["point"].dz = (7000 - clientInfo[i].z)/50;
        }
    }
}

class Main {
    constructor() {
        this.width = 100;
        this.height = 0.1;
        this.camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 200000);
        scene.add(this.camera);
        this.camera.position.set(0, 10000, 5000);
        this.camera.lookAt(scene.position);

        //add light
        let ambient = new THREE.AmbientLight(0xeeeeee);
        ambient.castShadow = true;
        scene.add(ambient);

        //add grid
        let grid = new THREE.GridHelper(50000, 1000);
        scene.add(grid);

        //add axis
        let axis = new THREE.AxisHelper(100);
        scene.add(axis);

        //add fps monitor
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '95%';
        this.stats.domElement.style.left = '0%';
        document.body.appendChild(this.stats.domElement);

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(WIDTH, HEIGHT);
        this.renderer.setClearColor(new THREE.Color(0x000000));
        document.getElementById('stage').appendChild(this.renderer.domElement);
        this.renderer.render(scene, this.camera);
    }

    controlCamera() {
        this.controls = new THREE.OrbitControls(this.camera);
        //this.controls.autoRotate = true;
        //this.controls.autoRotateSpeed = 0.5;
    }

    client() {
        this.client = new Client();
        this.client.create();
    }
    packet() {
        this.packet = new Packet();
    }
    packetCreate(id, dst) {
        for (let i=0; i<20; i++)
            this.packet.create(i, 1);
    }
    movePacket() {
        this.packet.move();
    }
}

var main = new Main();

main.client();
main.controlCamera();
main.packet();
main.packetCreate();
function loop() {

    requestAnimationFrame(loop);
    main.renderer.render(scene, main.camera);
    //main.controls.update();
    main.stats.update();
    main.movePacket();
    main.renderer.setSize(WIDTH, HEIGHT);
    document.onkeydown = function(e) {
        if ( e.keyCode == 13) { 
            main.circleHelper.octaEdge.visible = false;
        } else if (e.keyCode == 32) {
            main.packetCreate();
        }
    }
}
loop();