var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var scene = new THREE.Scene();
var clientInfo = new Object();
var packetInfo = new Object();

var cpoint = new Array();
var spoint = new Array();
var router = new Array();
var client = new Array();
var server = new Array();
//point is client pipe
//point -> router -> global
//point -> router -> server
//server -> router -> client

class Packet {
    constructor() {
        this.count = 0;
        for (let i=0; i<100; i++) {
            router[i] = new Object();
            client[i] = new Object();
            server[i] = new Object();
            client[i].router = 7000 + ((0 - 7000) / 100) *  (i+1);
            server[i].router = 7000 + ((0 - 7000) / 100) *  (i+1);
            router[i].client = 0 + ((7000 - 0) / 100) * (i+1);
            router[i].server = 0 + ((7000 - 0) / 100) * (i+1);
            router[i].global = 0 + ((-7000 - 0) / 100) * (i+1);
        }
        
    }
    create(id, dst, color) {
        let sphereGeometry = new THREE.SphereGeometry(80, 15, 15);
        let sphereMaterial = new THREE.MeshLambertMaterial({
            color: color,
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
            cpoint: cpoint[id],
            spoint: spoint[dst-1],
            router: router,
            server: server,
            client: client,
            smoothcount1: 0,
            smoothcount2: 0,
            smoothcount3: 0,
            smoothcount4: 0,
            count: 0,
            hop: 0,
        };
        this.count++;
    }
    move() {
        let packetKey = Object.keys(packetInfo);
        if (packetKey.length > 0) {
            for (let j in packetKey) {
                let id = packetKey[j];
                let packet = scene.getObjectByName("packet" + id);
                
                
                if (packetInfo[id].dstip == 0) {
                    //client -> router -> global
                    packetInfo[id].hop = 3
                    if (packetInfo[id].count == 0) {
                        this.clienttoPoint(id, packet, packetInfo[id].smoothcount1++);
                    } else if (packetInfo[id].count == 1) {
                        this.clienttoRouter(id, packet, packetInfo[id].smoothcount2++);
                    } else if (packetInfo[id].count == 2) {
                        this.routertoGlobal(id, packet, packetInfo[id].smoothcount3++);
                    }
                }else if (packetInfo[id].dstip == 1 || packetInfo[id].dstip == 2) {
                    //client -> router -> server
                    packetInfo[id].hop = 4
                    if (packetInfo[id].count == 0) {
                        this.clienttoPoint(id, packet, packetInfo[id].smoothcount1++);
                    } else if (packetInfo[id].count == 1) {
                        this.clienttoRouter(id, packet, packetInfo[id].smoothcount2++);
                    } else if (packetInfo[id].count == 2) {
                        this.routertoSpoint(id, packet, packetInfo[id].smoothcount3++);
                    } else if (packetInfo[id].count == 3) {
                        this.pointtoServer(id, packet, packetInfo[id].smoothcount4++);
                    }
                /*
                } else {
                    //server -> router -> client(id)
                    if (packetInfo[id].count == 0) {

                    } else if (packetInfo[id].count == 1) {
                        this.servertoRouter(id, packet, packetInfo[id].smoothcount1++);
                    } else if (packetInfo[id].count == 2) {
                        this.routertoPoint(id, packet), packetInfo[id].smoothcount2++;
                    } else if (packetInfo[id].count == 3) {
                        this.pointtoClient(id, packet, packetInfo[id].smoothcount3++);
                    }
                */
                }
                //animation counter
                if (packetInfo[id].smoothcount1 >= 100) {
                    packetInfo[id].count = 1;
                    if (packetInfo[id].smoothcount2 >= 100) {
                        packetInfo[id].count = 2;
                        if (packetInfo[id].smoothcount3 >= 100) {
                            packetInfo[id].count = 3;
                            if (packetInfo[id].smoothcount4 >= 100 || packetInfo[id].hop == 3) {
                                this.remove(id);
                            }
                        }
                    }
                }
            }
        }
    }
    clienttoPoint(id, packet, smooth) {
        packet.position.x = packetInfo[id]["cpoint"][smooth].x;
        packet.position.y = packetInfo[id]["cpoint"][smooth].y;
        packet.position.z = packetInfo[id]["cpoint"][smooth].z;
    }
    pointtoClient(id, packet, smooth) {
        packet.position.x = packetInfo[id]["cpoint"][smooth].rx;
        packet.position.y = packetInfo[id]["cpoint"][smooth].ry;
        packet.position.z = packetInfo[id]["cpoint"][smooth].rz;
    }
    servertoPoint(id, packet, smooth) {
        packet.position.x = packetInfo[id]["spoint"][smooth].x;
        packet.position.y = packetInfo[id]["spoint"][smooth].y;
        packet.position.z = packetInfo[id]["spoint"][smooth].z;
    }
    pointtoServer(id, packet, smooth) {
        packet.position.x = packetInfo[id]["spoint"][smooth].rx;
        packet.position.y = packetInfo[id]["spoint"][smooth].ry;
        packet.position.z = packetInfo[id]["spoint"][smooth].rz;
    }
    clienttoRouter(id, packet, smooth) {
        packet.position.z = packetInfo[id]["client"][smooth].router;
    }
    routertoGlobal(id, packet, smooth) {
        packet.position.x = packetInfo[id]["router"][smooth].global;
    }
    routertoCpoint(id, packet, smooth) {
        packet.position.z = packetInfo[id]["router"][smooth].client;
    }
    routertoSpoint(id, packet, smooth) {
        packet.position.x = packetInfo[id]["router"][smooth].server;
    }
    servertoRouter(id, packet, smooth) {
        packet.position.x = packetInfo[id]["server"][smooth].router;
        packet.position.z = 0;
    }
    remove(id) {
        delete packetInfo[id];
        scene.remove(scene.getObjectByName("packet" + id));
    }
}

class Global {
    create() {
        let sphereGeometry = new THREE.SphereGeometry(1000, 15, 15);
        let sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0x303066,
            transparent: true,
            opacity: 0.6,
        });
        let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        let sphereEdge = new THREE.EdgesHelper(sphere, 0x00ff00);
        sphere.position.set(-7000, 900, 0);
        sphere.name = "global"
        scene.add(sphere, sphereEdge);
    }
}

class Server {
    create() {
        this.cubeGeometry = new THREE.CubeGeometry(800, 1000, 500);
        this.cubeMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8,
        });
        for (let i = 0; i < 2; i++) {
            let cube = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial);
            let cubeEdge = new THREE.EdgesHelper(cube, 0xffffff);
            cube.name = "server" + i;
            cube.position.set(8000, 400, -600 + 1200 * i);
            scene.add(cube, cubeEdge);
            spoint[i] = new Array();
            let dx = (7000 - cube.position.x)/100
            let dz = (0 - cube.position.z)/100
            for (let j=0; j<100; j++) {
                spoint[i][j] = new Object();
                spoint[i][j].x = cube.position.x + dx * (j+1);
                spoint[i][j].y = 800;
                spoint[i][j].z = cube.position.z + dx * (j+1);
                spoint[i][j].rx = 7000 - dx * (j+1);
                spoint[i][j].ry = 800;
                spoint[i][j].rz = 0 - dz * (j+1);
            }

        }
    }
}

class Client {
    constructor() {
        this.clientNum = 20;
        this.cubeWidth = 600;
        this.cubeHeight = 600;
        this.cubeDepth = 600;
        this.count = 0;
        this.smoothcount = 100;
    }

    create() {
        this.cubeGeometry = new THREE.CubeGeometry(this.cubeWidth, this.cubeHeight, this.cubeDepth);
        this.cubeMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.4,
        });
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 4; j++) {
                let cube = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial);
                let cubeEdge = new THREE.EdgesHelper(cube, 0xffffff);
                cube.name = "client" + this.count;
                cube.position.set(3000 * i - 6000, 200, 2000 * j + 8000);
                scene.add(cube, cubeEdge);
                
                //set client data
                clientInfo[this.count] = {
                    x: cube.position.x,
                    y: cube.position.y,
                    z: cube.position.z,
                }
                let dx = (0 - cube.position.x)/this.smoothcount;
                let dy = (600 - cube.position.y)/this.smoothcount;
                let dz = (7000 - cube.position.z)/this.smoothcount;
                cpoint[this.count] = new Array();
                for (let i=0; i<100; i++) {
                    cpoint[this.count][i] = new Object();
                    cpoint[this.count][i].x = cube.position.x + dx * (i+1);
                    cpoint[this.count][i].y = 400 + dy * (i+1);
                    cpoint[this.count][i].z = cube.position.z + dz * (i+1);
                    cpoint[this.count][i].rx = 0 - dx * (i+1);
                    cpoint[this.count][i].ry = 800 - dy * (i+1);
                    cpoint[this.count][i].rz = 7000 - dz * (i+1);
                }
                this.count++;
            }
        }
    }
    changeColor(id, color) {
        let cube = scene.getObjectByName("client" + id);
        cube.material = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
        });
    }
}

class Router {
    create() {
        this.cylinderGeometry = new THREE.CylinderGeometry(1000, 1000, 600, 72);
        this.cylinderMaterial = new THREE.MeshLambertMaterial({
            color: 0x9DCCE0,
            transparent: true,
            opacity: 0.5,
        });
        let router = new THREE.Mesh(this.cylinderGeometry, this.cylinderMaterial);
        //let routerEdge = new THREE.EdgesHelper(router, 0x000000, 1);
        router.position.set(0, 300, 0);
        scene.add(router);
    }
}

class Main {
    constructor() {
        this.width = 100;
        this.height = 0.1;
        this.camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 200000);
        scene.add(this.camera);
        this.camera.position.set(0, 15000, 30000);
        this.camera.lookAt(scene.position);

        //add light
        let ambient = new THREE.AmbientLight(0xeeeeee);
        ambient.castShadow = true;
        scene.add(ambient);

        //add grid
        let grid = new THREE.GridHelper(20000, 3000);
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

        this.packet = new Packet();
        this.server = new Server();
        this.server.create();
        this.client = new Client();
        this.client.create();
        this.router = new Router();
        this.router.create();
        this.global = new Global();
        this.global.create();
    }
    
    controlCamera() {
        this.controls = new THREE.OrbitControls(this.camera);
        //this.controls.autoRotate = true;
        //this.controls.autoRotateSpeed = 0.5;
    }
    createPacket(id, dst) {
        if(dst == 0) {
            this.packet.create(id, dst, 0x00ff00);
        } else if(dst == 1 || dst == 2) {
            this.packet.create(id, dst, 0xff0000);
        }
    }
    changeClientcolor(id, num) {
        if(num == 0) {
            this.client.changeColor(id, 0x00ff00);
        } else if(num == 1) {
            this.client.changeColor(id, 0xffff00);
        } else if(num == 2) {
            this.client.changeColor(id, 0xff0000);
        }
    }
 }
 class WebSocketConnector {
    constructor() {
        this.socket = new WebSocket("ws://"+document.location.search.substring(1).split("=")[1] ,['echo-protocol','soap', 'xmpp']);
        this.socket.onopen = this.onOpen;
        this.socket.onmessage = this.onMessage;
    }

    onOpen(event) {
        // console.log(event.data);
    }
    onMessage(event) {
        let data = JSON.parse(event.data);
        if (data.mode == "createPacket") {
            //secip = 0~19 dstip = 0 global ,1 c2, 2 c2 
            main.createPacket(data.srcip, data.dstip);
        } else if (data.mode == "createAlert" || visualizer.client.info[data.srcip].alert < 6) {
            main.changeClientcolor(data.srcip, visualizer.client.info[data.srcip].alert);
        } else if (data.mode == "removeAlert") {
            main.changeClientcolor(data.srcip, visualizer.client.info[data.srcip].alert);
        }
    }
}

var socket = new WebSocketConnector();
var main = new Main();
main.controlCamera();
function loop() {
    requestAnimationFrame(loop);
    main.renderer.render(scene, main.camera);
    main.controls.update();
    main.renderer.setSize(WIDTH, HEIGHT);
    main.packet.move();
    document.onkeydown = function(e) {
        if ( e.keyCode == 13) { 
            main.circleHelper.octaEdge.visible = false;
        } else if (e.keyCode == 32) {
            location.reload();
        } else if (e.keyCode == 49) {
            main.createPacket(1, 0);
        } else if (e.keyCode == 50) {
            main.createPacket(1, 1);
        } else if (e.keyCode == 51) {
            main.createPacket(1, 2);
        }
    }
}
loop();