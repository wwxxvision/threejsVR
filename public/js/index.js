import './three.min.js';

(function () {
  var camera, scene, renderer;

  var isUserInteracting = false,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
    lon = 0, onMouseDownLon = 0,
    lat = 0, onMouseDownLat = 0,
    phi = 0, theta = 0;

  init();
  animate();

  function init() {

    var container, mesh;

    container = document.querySelector('.container');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);

    scene = new THREE.Scene();



    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    document.addEventListener('mousedown', onPointerStart, false);
    document.addEventListener('mousemove', onPointerMove, false);
    document.addEventListener('mouseup', onPointerUp, false);

    document.addEventListener('wheel', onDocumentMouseWheel, false);

    document.addEventListener('touchstart', onPointerStart, false);
    document.addEventListener('touchmove', onPointerMove, false);
    document.addEventListener('touchend', onPointerUp, false);

    window.addEventListener('resize', onWindowResize, false);

    const _createGrid = () => {
      var size = 10, divisions = 10, gridHelper = new THREE.GridHelper(size, divisions);

      gridHelper.position.y = - 5;
      gridHelper.position.z = - 5;

      scene.add(gridHelper);
    }
    const appLogic = () => {

      let UIStates = {
        rationSize: 1,
        userPosition: {
          default: new THREE.Vector3(0, -5, 0)
        },
        sceneKeyframe: 0
      }
      //Building  skelet of roads in scene 
      _createGrid();

      const initViewer = () => {
        const { userPosition } = UIStates;

        let geometry = new THREE.BoxGeometry(1 * rationSize, 1 * rationSize, 1 * rationSize),
          material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }),
          cube = new THREE.Mesh(geometry, material);

        cube.position.x = userPosition.default.x;
        cube.position.y = userPosition.default.y;
        cube.position.z = userPosition.default.z;


        scene.add(cube);

        return cube;
      }
      const { rationSize } = UIStates;

      const routes = [
        {
          start: new THREE.Vector3(0 * rationSize, -5 * rationSize, 0 * rationSize),
          end: new THREE.Vector3(0 * rationSize, -5 * rationSize, -10 * rationSize)
        },
        // {
        //   start: new THREE.Vector3(0 * rationSize, -5 * rationSize, 0 * rationSize),
        //   end: new THREE.Vector3(5 * rationSize, -5 * rationSize, -10 * rationSize)
        // },
        // {
        //   start: new THREE.Vector3(0 * rationSize, -5 * rationSize, 0 * rationSize),
        //   end: new THREE.Vector3(5 * rationSize, -5 * rationSize, -5 * rationSize)
        // },
        // {
        //   start: new THREE.Vector3(0 * rationSize, -5 * rationSize, 0 * rationSize),
        //   end: new THREE.Vector3(0, -5, -10)
        // },
        // {
        //   start: new THREE.Vector3(0 * rationSize, -5 * rationSize, 0 * rationSize),
        //   end: new THREE.Vector3(-5 * rationSize, -5 * rationSize, -2.5 * rationSize)
        // },
        // {
        //   start: new THREE.Vector3(0 * rationSize, -5 * rationSize, 0 * rationSize),
        //   end: new THREE.Vector3(5 * rationSize, -5 * rationSize, -5 * rationSize)
        // },
        // {
        //   start: new THREE.Vector3(0 * rationSize, -5 * rationSize, 0 * rationSize),
        //   end: new THREE.Vector3(-5 * rationSize, -5 * rationSize, -10 * rationSize)
        // },
        // {
        //   start: new THREE.Vector3(0 * rationSize, -5 * rationSize, 0 * rationSize),
        //   end: new THREE.Vector3(-5 * rationSize, -5 * rationSize, -5 * rationSize)
        // },

      ],
        material = new THREE.LineBasicMaterial({
          color: 0x0000ff
        });

      let me = initViewer();

        // me.geometry.computeBoundingBox();

        // const box3 = new THREE.Box3();

        // box3.copy(me.geometry.boundingBox).applyMatrix4(me.matrixWorld)

        routes.forEach((route, ind) => {
          let geometry = new THREE.Geometry();

          geometry.vertices.push(route.start, route.end);

          scene.add(new THREE.Line(geometry, material));

        });

     

    }
    appLogic();
  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function onPointerStart(event) {

    isUserInteracting = true;

    var clientX = event.clientX || event.touches[0].clientX;
    var clientY = event.clientY || event.touches[0].clientY;

    onMouseDownMouseX = clientX;
    onMouseDownMouseY = clientY;

    onMouseDownLon = lon;
    onMouseDownLat = lat;

  }

  function onPointerMove(event) {

    if (isUserInteracting === true) {

      var clientX = event.clientX || event.touches[0].clientX;
      var clientY = event.clientY || event.touches[0].clientY;

      lon = (onMouseDownMouseX - clientX) * 0.1 + onMouseDownLon;
      lat = (clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat;

    }

  }

  function onPointerUp() {

    isUserInteracting = false;

  }

  function onDocumentMouseWheel(event) {

    var fov = camera.fov + event.deltaY * 0.05;

    camera.fov = THREE.MathUtils.clamp(fov, 10, 75);

    camera.updateProjectionMatrix();

  }

  function animate() {

    requestAnimationFrame(animate);
    update();

  }

  function update() {


    lat = Math.max(- 85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    camera.target.x = Math.sin(phi) * Math.cos(theta);
    camera.target.y = Math.cos(phi);
    camera.target.z = Math.sin(phi) * Math.sin(theta);

    camera.lookAt(camera.target);

    /*
    // distortion
    camera.position.copy( camera.target ).negate();
    */

    renderer.render(scene, camera);

  }

})()