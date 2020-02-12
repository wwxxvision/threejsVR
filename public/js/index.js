import { text } from "express";

(function () {
  let app = {
    store: {
      scene: {},
      camera: {},
      renderer: {},
      loader: THREE.TextureLoader(),
      routes: [new THREE.Vector3(10, 0, 0)],
      texturesBeforeLoading: [
        {
          
        }
      ],
      textures: [],
      spehere: {
        geometry: new THREE.SphereGeometry(5, 32, 32),
        material: new THREE.MeshBasicMaterial({ color: 0xffff00, side:  THREE.DoubleSide })
      },
      activeGeometry: {}
    },
    renderError: (textError) => {
      throw new Error(textError)
    },
    loadTextrue: function(textures) {
      const { loader } = this.store;
      
      texturesBeforeLoading.forEach((texture) => {
        loader.load(texture.img, (textureLoading) => {
            this.store.textures.push({
              name: texture.name,
              id: ind,
              texture: textureLoading
            });
        }, (err) => this.renderError(`Can't loading texture`));
      })
    },
    renderSphere: function (scene, sphereObj, spehereMesh) {
      spehereMesh = new THREE.Mesh(sphereObj.geometry, sphereObj.material);
      spehereMesh.position.z = -20;
      scene.add(spehereMesh);
      return spehereMesh.position;
    },
    render: function () {
      let scene, camera, renderer;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
      camera.target = new THREE.Vector3( 0, 0, 0 );
      
      
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);
      renderer.setPixelRatio( window.devicePixelRatio );

      this.store = Object.assign(this.store, (
        {
          camera: camera,
          scene: scene, 
          renderer: renderer
        }
      ));
      this.renderSphere(scene,  this.store.spehere,  this.store.activeGeometry);
      this.animate();
    },
    animate: function () {
      let {
        scene,
        camera,
        renderer } = this.store;

      requestAnimationFrame(this.animate.bind(this));
      renderer.render(scene, camera);
    }
  }
  app.render();

})()