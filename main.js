(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#nav");
  const year = document.querySelector("#year");
  const glow = document.querySelector(".cursor-glow");
  const parallaxRoot = document.querySelector("[data-parallax]");

  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    header?.classList.toggle("scrolled", window.scrollY > 16);
    const cue = document.querySelector(".scroll-cue");
    if (cue) cue.style.opacity = window.scrollY > 80 ? "0" : "";
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Active nav section tracking
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const sectionIds = navLinks
    .map((a) => a.getAttribute("href")?.slice(1))
    .filter(Boolean);
  const sectionEls = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActiveNav = () => {
    const marker = window.scrollY + window.innerHeight * 0.28;
    let current = sectionEls[0]?.id;
    for (const section of sectionEls) {
      if (section.offsetTop <= marker) current = section.id;
    }
    navLinks.forEach((link) => {
      const id = link.getAttribute("href")?.slice(1);
      link.classList.toggle("is-active", id === current);
    });
  };
  setActiveNav();
  window.addEventListener("scroll", setActiveNav, { passive: true });

  // Rotating specialty line
  const roleHost = document.querySelector(".role-rotator");
  const roleEl = document.querySelector("[data-roles]");
  const roles = [
    "React Native Apps",
    "Native Android / iOS",
    "MERN Stack",
    "Product Engineering",
    "API Architecture",
  ];
  if (roleHost && roleEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let idx = 0;
    roleEl.textContent = roles[0];
    setInterval(() => {
      roleHost.classList.add("is-swap");
      window.setTimeout(() => {
        idx = (idx + 1) % roles.length;
        roleEl.textContent = roles[idx];
        roleHost.classList.remove("is-swap");
      }, 280);
    }, 2800);
  }

  // Float-chip depth parallax
  const chips = [...document.querySelectorAll(".float-chip[data-depth]")];
  if (chips.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener(
      "pointermove",
      (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        chips.forEach((chip) => {
          const depth = Number(chip.getAttribute("data-depth") || 0.4);
          chip.style.translate = `${nx * depth * 36}px ${ny * depth * 28}px`;
        });
      },
      { passive: true }
    );
  }

  // Cursor glow
  window.addEventListener(
    "pointermove",
    (e) => {
      if (!glow) return;
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    },
    { passive: true }
  );

  // Soft parallax on hero background
  window.addEventListener(
    "pointermove",
    (e) => {
      if (!parallaxRoot) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 18;
      parallaxRoot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    },
    { passive: true }
  );

  // Scroll reveals
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  // Counters
  const animateCount = (el, target, duration = 1500) => {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const stats = document.querySelector("#stats");
  if (stats) {
    let done = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || done) return;
        done = true;
        stats.querySelectorAll("[data-count]").forEach((el) => {
          animateCount(el, Number(el.getAttribute("data-count") || 0));
        });
        obs.disconnect();
      },
      { threshold: 0.4 }
    );
    obs.observe(stats);
  }

  // 3D tilt engine
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;

  if (!reduceMotion && !isTouch) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const max = Number(el.getAttribute("data-tilt-max") || 12);
      let raf = 0;
      let currentX = 0;
      let currentY = 0;
      let targetX = 0;
      let targetY = 0;

      const render = () => {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        el.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
        raf = requestAnimationFrame(render);
      };

      el.addEventListener("pointerenter", () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(render);
      });

      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        targetY = (px - 0.5) * max * 2;
        targetX = (0.5 - py) * max * 2;
      });

      el.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
        const settle = () => {
          currentX += (0 - currentX) * 0.15;
          currentY += (0 - currentY) * 0.15;
          el.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
          if (Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
            requestAnimationFrame(settle);
          } else {
            el.style.transform = "";
            cancelAnimationFrame(raf);
          }
        };
        cancelAnimationFrame(raf);
        requestAnimationFrame(settle);
      });
    });
  }

  // Living breath — services section only, runs while that section is in view
  const initBreath = () => {
    const services = document.querySelector("#services");
    const canvas = services?.querySelector("[data-breath-field]");
    if (!services || !canvas || reduceMotion) {
      document.querySelector(".breath-world")?.remove();
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const restBreath = 0.35;
    const pointer = { x: 0, y: 0 };
    let energy = 0;
    let lastScroll = window.scrollY;
    let lastTs = performance.now();
    let phase = 0;
    let lastBreath = restBreath;
    let dpr = 1;
    let particles = [];
    let width = 0;
    let height = 0;
    let inFocus = false;
    let running = false;

    const count = matchMedia("(max-width: 700px)").matches ? 90 : 160;

    const size = () => {
      width = Math.max(1, services.offsetWidth);
      height = Math.max(1, services.offsetHeight);
    };

    const resize = () => {
      const prevW = width;
      const prevH = height;
      size();
      if (width === prevW && height === prevH && canvas.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const spawn = () => {
      size();
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.25 + Math.random() * 1.35,
        a: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.012,
        size: 0.6 + Math.random() * 2.2,
        hue: Math.random() > 0.82 ? 340 : 220 + Math.random() * 28,
      }));
    };

    const waveform = (p) => {
      if (p < 0.38) {
        const x = p / 0.38;
        return 1 - Math.pow(1 - x, 2.35);
      }
      if (p < 0.48) return 1;
      if (p < 0.88) {
        const x = (p - 0.48) / 0.4;
        return 1 - x * x * (3 - 2 * x);
      }
      return 0;
    };

    const stop = () => {
      running = false;
      services.classList.remove("is-focused");
      services.style.setProperty("--breath", String(restBreath));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTs = performance.now();
      services.classList.add("is-focused");
      requestAnimationFrame(tick);
    };

    const setFocus = (focused) => {
      inFocus = focused;
      if (focused && !document.hidden) start();
      else stop();
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        if (!inFocus) return;
        const rect = services.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        energy = Math.min(1, energy + 0.045);
      },
      { passive: true }
    );

    window.addEventListener(
      "scroll",
      () => {
        if (!inFocus) return;
        energy = Math.min(1, energy + Math.min(0.08, Math.abs(window.scrollY - lastScroll) * 0.002));
        lastScroll = window.scrollY;
      },
      { passive: true }
    );

    window.addEventListener(
      "resize",
      resize,
      { passive: true }
    );

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(resize).observe(services);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (inFocus) start();
    });

    const tick = (now) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      energy += (0 - energy) * (1 - Math.exp(-dt * 0.55));

      const period = 6.4 - energy * 3.4;
      phase = (phase + dt / period) % 1;
      const breath = waveform(phase);
      const delta = breath - lastBreath;
      lastBreath = breath;

      services.style.setProperty("--breath", breath.toFixed(4));

      const fx = width * 0.5;
      const fy = height * 0.42;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        const dx = p.x - fx;
        const dy = p.y - fy;
        const dist = Math.hypot(dx, dy) + 8;
        const nx = dx / dist;
        const ny = dy / dist;
        const radial = -delta * 260 * p.z;
        p.a += p.spin;
        p.x += nx * radial * dt + Math.cos(p.a) * (6 + energy * 16) * dt;
        p.y += ny * radial * dt + Math.sin(p.a) * (6 + energy * 16) * dt;

        const pdx = p.x - pointer.x;
        const pdy = p.y - pointer.y;
        const pd = pdx * pdx + pdy * pdy;
        if (pd < 22000) {
          const force = (1 - pd / 22000) * 36 * dt;
          p.x += (pdx / Math.sqrt(pd + 1)) * force;
          p.y += (pdy / Math.sqrt(pd + 1)) * force;
        }

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 75%, 70%, ${0.14 * Math.min(1, p.z)})`;
        ctx.arc(p.x, p.y, p.size * p.z, 0, Math.PI * 2);
        ctx.fill();
      }

      if (running) requestAnimationFrame(tick);
    };

    resize();
    spawn();
    pointer.x = width * 0.5;
    pointer.y = height * 0.42;

    const focusObserver = new IntersectionObserver(
      (entries) => {
        setFocus(Boolean(entries[0]?.isIntersecting));
      },
      { root: null, rootMargin: "-22% 0px -38% 0px", threshold: 0 }
    );
    focusObserver.observe(services);
  };

  try {
    initBreath();
  } catch (err) {
    console.warn("Breath atmosphere failed to start", err);
  }

  // 3D wire globe — wrapping mesh around the full sphere
  const initGlobe = () => {
    const canvas = document.querySelector("[data-globe]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 560;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.38;
    const tilt = 0.32;

    const hubs = [
      { name: "US", lat: 38, lon: -97 },
      { name: "UK", lat: 54, lon: -2 },
      { name: "NL", lat: 52, lon: 5 },
      { name: "DE", lat: 51, lon: 10 },
      { name: "SA", lat: 24, lon: 45 },
      { name: "AL", lat: 41, lon: 20 },
      { name: "CR", lat: 10, lon: -84 },
      { name: "PK", lat: 30, lon: 69 },
      { name: "IN", lat: 20, lon: 78 },
      { name: "SG", lat: 1, lon: 104 },
      { name: "JP", lat: 36, lon: 138 },
      { name: "AU", lat: -25, lon: 134 },
      { name: "BR", lat: -14, lon: -51 },
      { name: "ZA", lat: -29, lon: 24 },
      { name: "NG", lat: 9, lon: 8 },
      { name: "CA", lat: 56, lon: -106 },
    ];

    const home = 7;
    const links = [
      [home, 0], [home, 1], [home, 2], [home, 3], [home, 4], [home, 5],
      [home, 6], [home, 8], [home, 9], [home, 10], [home, 11], [home, 12],
      [home, 13], [home, 14], [home, 15],
      [0, 1], [0, 6], [0, 12], [0, 15],
      [1, 2], [2, 3], [3, 5], [4, 13], [4, 8],
      [9, 10], [10, 11], [11, 12], [6, 12], [13, 14], [14, 1],
      [8, 9], [15, 1], [12, 13],
    ];
    const wrapLinks = new Set(["0-7", "7-10", "7-11", "0-11", "11-12"]);

    const orbits = [
      { inc: 0.12, raan: 0, lift: 0.02 },
      { inc: 0.48, raan: 0.7, lift: 0.045 },
      { inc: 0.72, raan: 1.9, lift: 0.035 },
      { inc: 1.05, raan: 2.8, lift: 0.055 },
      { inc: 0.35, raan: 4.1, lift: 0.028 },
    ];

    let rot = 0.55;
    let pulse = 0;
    let running = false;
    let raf = 0;

    const latLon = (lat, lon) => {
      const la = (lat * Math.PI) / 180;
      const lo = (lon * Math.PI) / 180;
      return {
        x: Math.cos(la) * Math.sin(lo),
        y: Math.sin(la),
        z: Math.cos(la) * Math.cos(lo),
      };
    };

    const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
    const cross = (a, b) => ({
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    });
    const mag = (v) => Math.hypot(v.x, v.y, v.z) || 1;
    const norm = (v) => {
      const m = mag(v);
      return { x: v.x / m, y: v.y / m, z: v.z / m };
    };
    const scale = (v, s) => ({ x: v.x * s, y: v.y * s, z: v.z * s });
    const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });

    const spin = (v, yaw) => {
      const y1 = v.y * Math.cos(tilt) - v.z * Math.sin(tilt);
      const z1 = v.y * Math.sin(tilt) + v.z * Math.cos(tilt);
      return {
        x: v.x * Math.cos(yaw) - z1 * Math.sin(yaw),
        y: y1,
        z: v.x * Math.sin(yaw) + z1 * Math.cos(yaw),
      };
    };

    const project = (v) => ({
      x: cx + v.x * R,
      y: cy - v.y * R,
      z: v.z,
      front: v.z >= -0.04,
    });

    const rotateAxis = (v, axis, ang) => {
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const d = dot(axis, v);
      const cr = cross(axis, v);
      return add(add(scale(v, c), scale(cr, s)), scale(axis, d * (1 - c)));
    };

    const pathGC = (a, b, steps, longWay) => {
      let axis = cross(a, b);
      if (mag(axis) < 1e-4) axis = cross(a, { x: 0, y: 1, z: 0 });
      let omega = Math.acos(Math.min(1, Math.max(-1, dot(a, b))));
      if (longWay) {
        axis = scale(axis, -1);
        omega = Math.PI * 2 - omega;
      }
      axis = norm(axis);
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const loft = Math.sin(t * Math.PI) * (longWay ? 0.07 : 0.045);
        pts.push(scale(rotateAxis(a, axis, omega * t), 1 + loft));
      }
      return pts;
    };

    const orbitPath = (inc, raan, lift, steps = 160) => {
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        let v = { x: Math.cos(a), y: 0, z: Math.sin(a) };
        v = {
          x: v.x,
          y: v.y * Math.cos(inc) - v.z * Math.sin(inc),
          z: v.y * Math.sin(inc) + v.z * Math.cos(inc),
        };
        const c = Math.cos(raan);
        const s = Math.sin(raan);
        v = { x: v.x * c - v.z * s, y: v.y, z: v.x * s + v.z * c };
        pts.push(scale(v, 1 + lift));
      }
      return pts;
    };

    const strokePath = (worldPts, yaw, style, pass) => {
      const front = pass === "front";
      ctx.beginPath();
      let started = false;
      for (const w of worldPts) {
        const p = project(spin(w, yaw));
        if (p.front !== front) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.width;
      ctx.stroke();
    };

    const along = (worldPts, t, yaw) => {
      const n = worldPts.length - 1;
      const f = ((t % 1) + 1) % 1 * n;
      const i = Math.floor(f);
      const u = f - i;
      const a = worldPts[i];
      const b = worldPts[Math.min(i + 1, n)];
      return project(spin({
        x: a.x + (b.x - a.x) * u,
        y: a.y + (b.y - a.y) * u,
        z: a.z + (b.z - a.z) * u,
      }, yaw));
    };

    const hubVecs = hubs.map((h) => latLon(h.lat, h.lon));
    const routes = links.map(([i, j]) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      return pathGC(hubVecs[i], hubVecs[j], wrapLinks.has(key) ? 56 : 36, wrapLinks.has(key));
    });
    const belts = orbits.map((o) => orbitPath(o.inc, o.raan, o.lift));

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const halo = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R * 1.28);
      halo.addColorStop(0, "rgba(59,108,255,0.2)");
      halo.addColorStop(0.55, "rgba(59,108,255,0.05)");
      halo.addColorStop(1, "rgba(59,108,255,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, size, size);

      const drawMesh = (pass) => {
        const back = pass === "back";
        const a = back ? 0.08 : 0.28;
        ctx.lineJoin = "round";

        for (let lat = -75; lat <= 75; lat += 15) {
          const ring = [];
          for (let lon = -180; lon <= 180; lon += 4) ring.push(latLon(lat, lon));
          strokePath(ring, rot, { color: `rgba(90,130,220,${a})`, width: lat === 0 ? 1.25 : 0.8 }, pass);
        }
        for (let lon = -180; lon < 180; lon += 15) {
          const mer = [];
          for (let lat = -90; lat <= 90; lat += 3) mer.push(latLon(lat, lon));
          strokePath(mer, rot, { color: `rgba(90,130,220,${a * 0.85})`, width: 0.75 }, pass);
        }

        belts.forEach((belt, i) => {
          strokePath(belt, rot, {
            color: back ? `rgba(90,150,255,0.12)` : `rgba(130,175,255,${0.42 + (i % 3) * 0.08})`,
            width: back ? 1 : 1.45,
          }, pass);
        });

        routes.forEach((route, i) => {
          strokePath(route, rot, {
            color: back ? "rgba(80,140,255,0.1)" : `rgba(150,185,255,${0.32 + (i % 4) * 0.08})`,
            width: back ? 0.9 : 1.25,
          }, pass);
        });
      };

      drawMesh("back");

      const sphere = ctx.createRadialGradient(cx - R * 0.32, cy - R * 0.38, R * 0.08, cx, cy, R);
      sphere.addColorStop(0, "rgba(32, 58, 130, 0.72)");
      sphere.addColorStop(0.45, "rgba(12, 22, 58, 0.88)");
      sphere.addColorStop(1, "rgba(5, 10, 28, 0.94)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sphere;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(120, 160, 255, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      drawMesh("front");

      hubs.forEach((h, hi) => {
        const p = project(spin(latLon(h.lat, h.lon), rot));
        const depth = (p.z + 1) * 0.5;
        const home = hi === 7;
        const alpha = p.front ? 0.4 + 0.6 * depth : 0.12;
        const r = (p.front ? 3.4 + depth * 1.5 : 2.1) * (home ? 1.35 : 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = home
          ? `rgba(190, 215, 255, ${alpha})`
          : `rgba(170, 200, 255, ${alpha})`;
        ctx.fill();
        if (p.front) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + (home ? 7 : 5), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(59, 108, 255, ${0.28 * depth})`;
          ctx.lineWidth = home ? 1.8 : 1.4;
          ctx.stroke();
        }
      });

      const packets = [
        ...belts.map((belt, i) => ({ path: belt, t: pulse * (0.35 + (i % 3) * 0.12) + i * 0.17, r: 2.3 })),
        ...routes.map((route, i) => ({ path: route, t: pulse * 0.55 + i * 0.09, r: 2.1 })),
      ];
      packets.forEach(({ path, t, r }) => {
        const p = along(path, t, rot);
        if (!p.front) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(220, 235, 255, 0.95)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(90, 140, 255, 0.18)";
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(cx, cy, R, -1.25, 0.35);
      ctx.strokeStyle = "rgba(190, 215, 255, 0.38)";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    if (reduceMotion) {
      render();
      return;
    }

    const tick = () => {
      if (!running) return;
      rot = (rot + 0.0048) % (Math.PI * 2);
      pulse = (pulse + 0.0045) % 1;
      render();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const stage = canvas.closest(".globe-stage") || canvas;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) start();
        else stop();
      },
      { threshold: 0.12 }
    );
    io.observe(stage);
    render();
  };

  try {
    initGlobe();
  } catch (err) {
    console.warn("Globe failed to start", err);
  }

  // Testimonials — show every client in clients.json
  const initReviews = (clients) => {
    const grid = document.querySelector("[data-review-grid]");
    const lead = document.querySelector(".review-lead");
    const textEl = lead?.querySelector(".review-text");
    const nameEl = lead?.querySelector(".review-name");
    const locEl = lead?.querySelector(".review-loc");
    const dotsEl = document.querySelector("[data-review-dots]");
    const prevBtn = document.querySelector("[data-review-prev]");
    const nextBtn = document.querySelector("[data-review-next]");

    if (grid && clients.length) {
      grid.replaceChildren();
      clients.forEach((c, i) => {
        const card = document.createElement("article");
        card.className = "review-card reveal visible";
        card.style.setProperty("--i", String(i));
        card.innerHTML = `
          <div class="stars" aria-label="5 stars">★★★★★</div>
          <p></p>
          <footer class="review-person">
            <div>
              <cite></cite>
              <span class="review-loc"></span>
            </div>
          </footer>`;
        card.querySelector("p").textContent = c.comment;
        card.querySelector("cite").textContent = c.name;
        card.querySelector(".review-loc").textContent = c.country;
        grid.appendChild(card);
      });
    }

    if (!(lead && textEl && nameEl && locEl && dotsEl) || !clients.length) return;

    let index = 0;
    let timer;
    dotsEl.replaceChildren();
    clients.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show review ${i + 1}`);
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => show(i, true));
      dotsEl.appendChild(dot);
    });

    const show = (i, manual = false) => {
      index = (i + clients.length) % clients.length;
      const item = clients[index];
      lead.classList.add("is-fading");
      window.setTimeout(() => {
        textEl.textContent = item.comment;
        nameEl.textContent = item.name;
        locEl.textContent = item.country;
        dotsEl.querySelectorAll("button").forEach((d, di) => {
          d.classList.toggle("active", di === index);
        });
        lead.classList.remove("is-fading");
      }, 180);
      if (manual) restart();
    };

    const restart = () => {
      window.clearInterval(timer);
      if (!reduceMotion) {
        timer = window.setInterval(() => show(index + 1), 6500);
      }
    };

    prevBtn?.addEventListener("click", () => show(index - 1, true));
    nextBtn?.addEventListener("click", () => show(index + 1, true));
    show(0);
    restart();
  };

  const clientsFromGrid = () =>
    [...document.querySelectorAll("[data-review-grid] .review-card")].map((card) => ({
      name: card.querySelector("cite")?.textContent?.trim() || "",
      country: card.querySelector(".review-loc")?.textContent?.trim() || "",
      comment: card.querySelector("p")?.textContent?.trim() || "",
    })).filter((c) => c.comment);

  fetch("assets/reviewers/clients.json")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((clients) => {
      if (!Array.isArray(clients) || !clients.length) throw new Error("empty");
      initReviews(clients);
    })
    .catch(() => {
      const fromDom = clientsFromGrid();
      if (fromDom.length) initReviews(fromDom);
    });
})();
