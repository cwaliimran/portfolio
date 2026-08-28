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

  // 3D wire globe with connecting arcs (client regions)
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

    const hubs = [
      { name: "US", lat: 38, lon: -97 },
      { name: "UK", lat: 54, lon: -2 },
      { name: "NL", lat: 52, lon: 5 },
      { name: "DE", lat: 51, lon: 10 },
      { name: "SA", lat: 24, lon: 45 },
      { name: "AL", lat: 41, lon: 20 },
      { name: "CR", lat: 10, lon: -84 },
      { name: "PK", lat: 30, lon: 69 },
    ];

    const links = [
      [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7],
      [0, 1], [1, 2], [0, 6], [4, 5],
    ];

    let rot = 20;
    let pulse = 0;

    const project = (lat, lon, rotation) => {
      const latR = (lat * Math.PI) / 180;
      const lonR = ((lon + rotation) * Math.PI) / 180;
      const x = R * Math.cos(latR) * Math.sin(lonR);
      const y = -R * Math.sin(latR);
      const z = R * Math.cos(latR) * Math.cos(lonR);
      return { x: cx + x, y: cy + y, z, visible: z > -R * 0.12 };
    };

    const drawArc = (a, b, t) => {
      if (!a.visible && !b.visible) return;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 - 36 - Math.abs(a.x - b.x) * 0.08;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, `rgba(59,108,255,${0.12 + 0.3 * t})`);
      grad.addColorStop(0.5, `rgba(147,180,255,${0.5 + 0.35 * t})`);
      grad.addColorStop(1, `rgba(59,108,255,${0.12 + 0.3 * t})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      const u = (pulse + t * 0.37) % 1;
      const px = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mx + u * u * b.x;
      const py = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * my + u * u * b.y;
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200, 220, 255, 0.95)";
      ctx.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.25);
      glow.addColorStop(0, "rgba(59,108,255,0.18)");
      glow.addColorStop(0.55, "rgba(59,108,255,0.05)");
      glow.addColorStop(1, "rgba(59,108,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);

      const sphere = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      sphere.addColorStop(0, "#1a2f6b");
      sphere.addColorStop(0.55, "#0d1840");
      sphere.addColorStop(1, "#070d22");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sphere;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(120, 160, 255, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 3) {
          const p = project(i * 22, lon, rot);
          if (p.z <= 0) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(90, 130, 220, 0.22)";
        ctx.stroke();
      }
      for (let lon = -150; lon <= 150; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -80; lat <= 80; lat += 3) {
          const p = project(lat, lon, rot);
          if (p.z <= 0) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(90, 130, 220, 0.18)";
        ctx.stroke();
      }

      const pts = hubs.map((h) => ({ ...h, ...project(h.lat, h.lon, rot) }));

      links.forEach((pair, i) => {
        const a = pts[pair[0]];
        const b = pts[pair[1]];
        if (a.z > -20 || b.z > -20) drawArc(a, b, (i % 5) / 5);
      });

      pts.forEach((p) => {
        if (!p.visible) return;
        const alpha = 0.35 + 0.65 * Math.max(0, p.z / R);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 180, 255, ${alpha})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59, 108, 255, ${0.25 * alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.arc(cx, cy, R, -1.2, 0.4);
      ctx.strokeStyle = "rgba(180, 205, 255, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    if (reduceMotion) {
      render();
      return;
    }

    const frame = () => {
      rot = (rot + 0.18) % 360;
      pulse = (pulse + 0.006) % 1;
      render();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
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
