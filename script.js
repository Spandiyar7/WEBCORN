const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));

      if (!target) {
        return;
      }

      event.preventDefault();

      if (window.gsap && window.ScrollToPlugin && !prefersReducedMotion) {
        gsap.registerPlugin(ScrollToPlugin);
        gsap.to(window, {
          duration: 0.9,
          ease: "power3.out",
          scrollTo: { y: target, offsetY: 24 },
        });
        return;
      }

      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });
};

const initRevealAnimations = () => {
  const items = Array.from(document.querySelectorAll("[data-reveal]"));

  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion) {
    items.forEach((item) => {
      item.style.opacity = 1;
      item.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  items.forEach((item) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 84%",
          once: true,
        },
      }
    );
  });
};

const initScene = () => {
  const canvas = document.getElementById("scene");

  if (!canvas || !window.THREE || prefersReducedMotion) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 8;

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.BufferGeometry();
  const count = 180;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const angle = i * 2.399963;
    const layer = (i % 18) / 18;
    const radius = 2.4 + layer * 6.4;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = ((i % 13) - 6) * 0.42;
    positions[i * 3 + 2] = Math.sin(angle) * radius - 3;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xf2c57c,
    size: 0.022,
    transparent: true,
    opacity: 0.48,
  });

  const particles = new THREE.Points(geometry, material);
  group.add(particles);

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x9fb4ff,
      transparent: true,
      opacity: 0.06,
      wireframe: true,
    })
  );
  orb.position.set(3.4, 0.4, -1.2);
  group.add(orb);

  let frameId;

  const render = () => {
    const scroll = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);

    group.rotation.y += 0.0009;
    group.rotation.x = scroll * 0.22;
    orb.rotation.y += 0.003;
    orb.rotation.x += 0.001;

    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(render);
  };

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener("resize", resize);
  render();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frameId);
      return;
    }

    render();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initRevealAnimations();
  initScene();
});
