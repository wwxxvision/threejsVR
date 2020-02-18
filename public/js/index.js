import './three.min.js';
import structuring from './structuring.js';
import TWEEN from './tween.esm.js';

(function () {

  //GLobal store
  let camera, scene, renderer,
    raycaster = new THREE.Raycaster(),
    mouse = new THREE.Vector2(),
    isUserInteracting = false,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
    lon = 0, onMouseDownLon = 0,
    lat = 0, onMouseDownLat = 0,
    phi = 0, theta = 0;

  async function fetchStore() {
    let response = await fetch('../store.json').then(res => res.json());
    return response;
  }


  fetchStore().then(res => {
    const loader = new THREE.TextureLoader();
    let collectionTextures = [];

    const loadingTexture = () => {
      collectionTextures = res.store.textures.rooms.map((room) => ({ texture: loader.load(room.src), name: room.name }))

      if (collectionTextures.length < res.store.textures.rooms.length) throw new Error('Missing texture');

      return collectionTextures;
    }

    init(res, loadingTexture(res));
    animate();
  })

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }
  let trigger = false;
  function onPointerStart(event) {

    isUserInteracting = true;

    var clientX = event.clientX || event.touches[0].clientX;
    var clientY = event.clientY || event.touches[0].clientY;

    onMouseDownMouseX = clientX;
    onMouseDownMouseY = clientY;

    onMouseDownLon = lon;
    onMouseDownLat = lat;

    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach((item) => {
      if (item.object.name === 'controller') {

        trigger = item;

      }
    });

  }

  function onPointerMove(event) {
    var clientX = event.clientX || event.touches[0].clientX,
      clientY = event.clientY || event.touches[0].clientY;

    if (isUserInteracting === true) {

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
    TWEEN.update();
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


    // camera.position.copy(camera.target).negate();

    renderer.render(scene, camera);

  }


  function init(store, textures) {

    var container;

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

      gridHelper.position.y = -5;
      gridHelper.position.z = 0;


      scene.add(gridHelper);
    }
    const appLogic = () => {
      const needRotating = (nextRoom) => {
        let radians = 0;
        switch (nextRoom) {
          case 'a':
            return radians = Math.PI + Math.PI / 4;
          case 'b':
            return radians = Math.PI - (Math.PI / 4)
          case 'c':
            return radians = Math.PI / 2;
          case 'd':
            return radians = Math.PI / 4;
          case 'a1':
            return radians = Math.PI / 2;
        }
      }

      let UIStates = {
        rationSize: 1,
        userPosition: {
          default: camera.position
        },
        currentRoom: 'a',
        countSpehres: [1, 2],
        selectDirection: 'right_cross_forward',
        controllers: []
      }

      //Building  skelet of roads in scene 
      _createGrid();

      const renderingSphere = (name) => {
        let geometry = new THREE.SphereBufferGeometry(500, 60, 40);
        geometry.scale(- 1, 1, 1);

        let material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
        let spehere = new THREE.Mesh(geometry, material);


        spehere.name = name;

        scene.add(spehere);

        return spehere;
      }

      //spehre repositioner
      const rotationSphere = (sphere, radians) => (sphere.rotation.y = radians);

      const repositionSpheres = (hiddenSpere) => {
        const {  currentRoom } = UIStates;

        const { next: next } = structuring(
          store, 'hiddenPos', currentRoom)

        hiddenSpere.userData = next;
        hiddenSpere.position.x = -1000;
        hiddenSpere.position.z = 0;
      }

      let hiddenSphere = renderingSphere('hidden'), activeSphere = renderingSphere('active');

      const setTextureForSphere = (activeSphere) => {
        let texture = textures.find((textureObj) => textureObj.name === UIStates.currentRoom);
        activeSphere.material.map = texture.texture;
      }

      const initViewer = () => {
        const { userPosition } = UIStates;

        let geometry = new THREE.BoxGeometry(1, 1, 1),
          material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, transparent: true }),
          cube = new THREE.Mesh(geometry, material);

        return cube;
      }

      let me = initViewer();

      function initControllers(controls) {
        const updateRoutes = () => {
          let routes = structuring(store, 'controls', UIStates.currentRoom);

          return [
            {
              start: new THREE.Vector3(me.position.x, me.position.y, me.position.z),
              end: new THREE.Vector3(me.position.x + 5, me.position.y, me.position.z),
              type: 'forward',
              active: routes['forward'] === true ? true : false
            },
            {
              start: new THREE.Vector3(me.position.x, me.position.y, me.position.z),
              end: new THREE.Vector3(me.position.x - 5, me.position.y, me.position.z),
              type: 'back',
              active: routes['back'] ? true : false
            },
            {
              start: new THREE.Vector3(me.position.x, me.position.y, me.position.z),
              end: new THREE.Vector3(5 + me.position.x, me.position.y, me.position.z + 5),
              type: 'right_cross_back',
              active: routes['right_cross_back'] ? true : false
            },
            {
              start: new THREE.Vector3(me.position.x, me.position.y, me.position.z),
              end: new THREE.Vector3(me.position.x - 5, me.position.y, me.position.z - 5),
              type: 'left_cross_back',
              active: routes['left_cross_back'] ? true : false
            },
            {
              start: new THREE.Vector3(me.position.x, me.position.y, me.position.z),
              end: new THREE.Vector3(me.position.x, me.position.y, me.position.z - 5),
              type: 'left',
              active: routes['left'] ? true : false
            },
            {
              start: new THREE.Vector3(me.position.x, me.position.y, me.position.z),
              end: new THREE.Vector3(me.position.x, me.position.y, me.position.z + 5),
              type: 'right',
              active: routes['right'] ? true : false
            },
            {
              start: new THREE.Vector3(me.position.x, me.position.y, me.position.z),
              end: new THREE.Vector3(5 - me.position.x, me.position.y, me.position.z + 5),
              type: 'right_cross_forward',
              active: routes['right_cross_forward'] ? true : false
            },
            {
              start: new THREE.Vector3(me.position.x, me.position.y, me.position.z),
              end: new THREE.Vector3(me.position.x + 5, me.position.y, me.position.z - 5),
              type: 'left_cross_forward',
              active: routes['left_cross_forward'] ? true : false
            },
          ]
        }
        let routes = updateRoutes().filter((route) => {

          if (controls) {
            return route;
          }

          return;
        });

        const THREEinitControllers = (route) => {
          let geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3),
            material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, transparent: true }),
            cube = new THREE.Mesh(geometry, material);

          cube.name = 'controller';

            cube.userData = {
              data: route
            }
  
          cube.position.x = route.end.x;
          cube.position.y = -5;
          cube.position.z = route.end.z;

          scene.add(cube);
        }

        UIStates.controllers = routes;

        routes.forEach((route) => {
          if (route.active) {
            THREEinitControllers(route);
          }
        });
      }

      initControllers(structuring(store, 'controls', UIStates.currentRoom));
      setTextureForSphere(activeSphere);
      repositionSpheres(hiddenSphere);
      rotationSphere(activeSphere, Math.PI + Math.PI / 4)
      const clear = () => {


        if (scene.children.length) {
          scene.children.forEach((item) => {

            if (item.name === 'controller') {
              scene.children = scene.children.filter((it) => it !== item)

              scene.remove(item);
              item.material.dispose();
              item.geometry.dispose();

            }

          });
        }
      }

      UIStates.animate = (hiddenRoom, activeRoom, currentRoom) => {

        switch (UIStates.selectDirection) {
          case 'right_cross_forward':
            hiddenRoom.position.set(50, 0, 0);
            break;
          case 'left_cross_forward':
            hiddenRoom.position.set(50, 0, 0);
            break;
          case 'left_cross_back':
            hiddenRoom.position.set(-50, 0, 0);
            break;
            
          default:

        }

        hiddenRoom.material.opacity = 0;

        let animateConfig = {
          activeOpacity: activeRoom.material.opacity,
          hiddenOpacity: hiddenRoom.material.opacity,
          x0: hiddenRoom.position.x,
          y0: hiddenRoom.position.y,
          z0: hiddenRoom.position.z,
          x: activeRoom.position.x,
          y: activeRoom.position.y,
          z: activeRoom.position.z
        }

      
        // activeRoom.material.opacity = 0;
        new TWEEN.Tween(animateConfig)
          .to(
            {
              x0: animateConfig.x,
              y0: animateConfig.y,
              z0: animateConfig.z,
              hiddenOpacity: 1,
              activeOpacity: 0
            }, 1000)
          .onUpdate((object) => {
            hiddenRoom.position.set(object.x0, object.y0, object.z0);

            activeRoom.material.opacity = object.activeOpacity;
            hiddenRoom.material.opacity = object.hiddenOpacity;

          })
          .onComplete(() => {
            hiddenRoom.position.set(1000, 0, 0);

            [activeRoom, hiddenRoom] = [hiddenRoom, activeRoom];
            activeSphere = activeRoom;
            hiddenSphere = hiddenRoom;

            initControllers(structuring(store, 'controls', currentRoom));

            //Example не работает
            camera.lookAt(new THREE.Vector3(200, 0, 200))
          })
          .start();



      }
      UIStates.update = (currentRoom, activeSphere, radians) => {
        
        clear();

        setTextureForSphere(hiddenSphere);

        UIStates.animate(hiddenSphere, activeSphere, currentRoom);

        rotationSphere(hiddenSphere, radians);
      }



      document.addEventListener('click', (e) => {
        if (trigger) {
          let { data } = trigger.object.userData;

          UIStates.selectDirection = data.type;

          let nextRoom = store.store.hidden.rooms.find((item) => item.room === UIStates.currentRoom)[`${UIStates.selectDirection}`].next;
          UIStates.currentRoom = nextRoom;

          UIStates.update(UIStates.currentRoom, activeSphere, needRotating(nextRoom));
        }
        trigger = false;
        e.preventDefault();
      });

    }
    appLogic();
  }

})()