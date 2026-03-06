const body = document.body;
const canvas = document.querySelector(".lightfield");
const sculptureCanvas = document.querySelector(".webgl-sculpture");
const stages = document.querySelectorAll(".stage");
const scenePanels = document.querySelectorAll(".panel[data-scene]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let pointerX = window.innerWidth * 0.5;
let pointerY = window.innerHeight * 0.35;

body.classList.add("is-ready");

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  });

  const updateStages = () => {
    const scrollY = window.scrollY;

    stages.forEach((stage, index) => {
      const depth = index + 1;
      const rotateY = ((pointerX / window.innerWidth) - 0.5) * (8 + depth * 2);
      const rotateX = (((pointerY / window.innerHeight) - 0.5) * -1) * (6 + depth);
      const drift = scrollY * 0.04 * depth;

      stage.style.transform = `translateY(${drift}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    window.requestAnimationFrame(updateStages);
  };

  updateStages();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        body.dataset.scene = entry.target.dataset.scene;
      }
    });
  },
  {
    threshold: 0.55,
  },
);

scenePanels.forEach((panel) => observer.observe(panel));

const createMatrix = () => new Float32Array(16);

const identityMatrix = () => {
  const matrix = createMatrix();
  matrix[0] = 1;
  matrix[5] = 1;
  matrix[10] = 1;
  matrix[15] = 1;
  return matrix;
};

const multiplyMatrix = (left, right) => {
  const out = createMatrix();

  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      out[(column * 4) + row] =
        (left[row] * right[column * 4]) +
        (left[row + 4] * right[(column * 4) + 1]) +
        (left[row + 8] * right[(column * 4) + 2]) +
        (left[row + 12] * right[(column * 4) + 3]);
    }
  }

  return out;
};

const perspectiveMatrix = (fieldOfView, aspect, near, far) => {
  const f = 1 / Math.tan(fieldOfView / 2);
  const range = 1 / (near - far);
  const matrix = createMatrix();

  matrix[0] = f / aspect;
  matrix[5] = f;
  matrix[10] = (far + near) * range;
  matrix[11] = -1;
  matrix[14] = 2 * far * near * range;

  return matrix;
};

const translateMatrix = (x, y, z) => {
  const matrix = identityMatrix();
  matrix[12] = x;
  matrix[13] = y;
  matrix[14] = z;
  return matrix;
};

const rotateXMatrix = (angle) => {
  const matrix = identityMatrix();
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  matrix[5] = c;
  matrix[6] = s;
  matrix[9] = -s;
  matrix[10] = c;
  return matrix;
};

const rotateYMatrix = (angle) => {
  const matrix = identityMatrix();
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  matrix[0] = c;
  matrix[2] = -s;
  matrix[8] = s;
  matrix[10] = c;
  return matrix;
};

const rotateZMatrix = (angle) => {
  const matrix = identityMatrix();
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  matrix[0] = c;
  matrix[1] = s;
  matrix[4] = -s;
  matrix[5] = c;
  return matrix;
};

const scaleMatrix = (x, y, z) => {
  const matrix = identityMatrix();
  matrix[0] = x;
  matrix[5] = y;
  matrix[10] = z;
  return matrix;
};

const createProgram = (gl, vertexSource, fragmentSource) => {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message || "Shader compile failed.");
    }

    return shader;
  };

  const program = gl.createProgram();
  const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(message || "Program link failed.");
  }

  return program;
};

const createSpherePoints = (count) => {
  const points = [];

  for (let index = 0; index < count; index += 1) {
    const offset = index + 0.5;
    const phi = Math.acos(1 - (2 * offset) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * offset;
    points.push(
      Math.cos(theta) * Math.sin(phi),
      Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
    );
  }

  return new Float32Array(points);
};

const createRingPoints = (count, radius, flatten) => {
  const points = [];

  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius * flatten, 0);
  }

  return new Float32Array(points);
};

const createLineStrip = (points) => new Float32Array(points.flat());

if (sculptureCanvas && !prefersReducedMotion) {
  const gl = sculptureCanvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });

  if (gl) {
    const vertexSource = `
      attribute vec3 aPosition;
      uniform mat4 uProjection;
      uniform mat4 uView;
      uniform mat4 uModel;
      uniform float uPointSize;

      void main() {
        vec4 world = uModel * vec4(aPosition, 1.0);
        gl_Position = uProjection * uView * world;
        gl_PointSize = uPointSize;
      }
    `;

    const fragmentSource = `
      precision mediump float;
      uniform vec4 uColor;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = dot(coord, coord);
        float alpha = smoothstep(0.25, 0.0, dist);
        gl_FragColor = vec4(uColor.rgb, uColor.a * alpha);
      }
    `;

    const lineFragmentSource = `
      precision mediump float;
      uniform vec4 uColor;

      void main() {
        gl_FragColor = uColor;
      }
    `;

    const pointProgram = createProgram(gl, vertexSource, fragmentSource);
    const lineProgram = createProgram(gl, vertexSource, lineFragmentSource);

    const pointUniforms = {
      projection: gl.getUniformLocation(pointProgram, "uProjection"),
      view: gl.getUniformLocation(pointProgram, "uView"),
      model: gl.getUniformLocation(pointProgram, "uModel"),
      pointSize: gl.getUniformLocation(pointProgram, "uPointSize"),
      color: gl.getUniformLocation(pointProgram, "uColor"),
      position: gl.getAttribLocation(pointProgram, "aPosition"),
    };

    const lineUniforms = {
      projection: gl.getUniformLocation(lineProgram, "uProjection"),
      view: gl.getUniformLocation(lineProgram, "uView"),
      model: gl.getUniformLocation(lineProgram, "uModel"),
      pointSize: gl.getUniformLocation(lineProgram, "uPointSize"),
      color: gl.getUniformLocation(lineProgram, "uColor"),
      position: gl.getAttribLocation(lineProgram, "aPosition"),
    };

    const buffers = {
      sphere: gl.createBuffer(),
      ringWide: gl.createBuffer(),
      ringTight: gl.createBuffer(),
      monolith: gl.createBuffer(),
      shard: gl.createBuffer(),
    };

    const sphereData = createSpherePoints(1500);
    const ringWideData = createRingPoints(240, 1.9, 0.48);
    const ringTightData = createRingPoints(180, 1.1, 0.32);
    const monolithData = createLineStrip([
      [-0.18, -1.4, 0],
      [-0.18, 1.45, 0],
      [0.18, 1.45, 0],
      [0.18, -1.4, 0],
      [-0.18, -1.4, 0],
    ]);
    const shardData = createLineStrip([
      [0, -0.42, 0],
      [0.42, 0, 0],
      [0, 0.42, 0],
      [-0.42, 0, 0],
      [0, -0.42, 0],
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.sphere);
    gl.bufferData(gl.ARRAY_BUFFER, sphereData, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.ringWide);
    gl.bufferData(gl.ARRAY_BUFFER, ringWideData, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.ringTight);
    gl.bufferData(gl.ARRAY_BUFFER, ringTightData, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.monolith);
    gl.bufferData(gl.ARRAY_BUFFER, monolithData, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.shard);
    gl.bufferData(gl.ARRAY_BUFFER, shardData, gl.STATIC_DRAW);

    let projection = identityMatrix();

    const resizeSculpture = () => {
      const rect = sculptureCanvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
      const height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));

      sculptureCanvas.width = width;
      sculptureCanvas.height = height;
      gl.viewport(0, 0, width, height);
      projection = perspectiveMatrix(Math.PI / 4, rect.width / rect.height, 0.1, 20);
    };

    const bindAttribute = (buffer, location) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
    };

    const drawPoints = (buffer, count, model, size, color) => {
      gl.useProgram(pointProgram);
      bindAttribute(buffer, pointUniforms.position);
      gl.uniformMatrix4fv(pointUniforms.projection, false, projection);
      gl.uniformMatrix4fv(pointUniforms.view, false, translateMatrix(0, 0, -6.2));
      gl.uniformMatrix4fv(pointUniforms.model, false, model);
      gl.uniform1f(pointUniforms.pointSize, size * window.devicePixelRatio);
      gl.uniform4fv(pointUniforms.color, color);
      gl.drawArrays(gl.POINTS, 0, count);
    };

    const drawLine = (buffer, count, model, color, mode = gl.LINE_STRIP) => {
      gl.useProgram(lineProgram);
      bindAttribute(buffer, lineUniforms.position);
      gl.uniformMatrix4fv(lineUniforms.projection, false, projection);
      gl.uniformMatrix4fv(lineUniforms.view, false, translateMatrix(0, 0, -6.2));
      gl.uniformMatrix4fv(lineUniforms.model, false, model);
      gl.uniform1f(lineUniforms.pointSize, 1);
      gl.uniform4fv(lineUniforms.color, color);
      gl.drawArrays(mode, 0, count);
    };

    const renderSculpture = () => {
      const time = performance.now() * 0.001;
      const scrollDepth = Math.min(window.scrollY / window.innerHeight, 1.5);
      const orbitX = (((pointerY / window.innerHeight) - 0.5) * -1) * 0.45;
      const orbitY = ((pointerX / window.innerWidth) - 0.5) * 0.55;

      gl.clearColor(0.01, 0.015, 0.028, 0.16);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.enable(gl.DEPTH_TEST);

      const baseRotation = multiplyMatrix(rotateYMatrix(time * 0.35 + orbitY), rotateXMatrix(-0.6 + orbitX));

      const sphereModel = multiplyMatrix(
        translateMatrix(-0.45, 0.35 - (scrollDepth * 0.06), 0),
        multiplyMatrix(baseRotation, scaleMatrix(1.35, 1.35, 1.35)),
      );

      const ringWideModel = multiplyMatrix(
        translateMatrix(-0.15, 0.05, 0),
        multiplyMatrix(rotateYMatrix(time * 0.22 + orbitY), rotateXMatrix(1.25 + orbitX)),
      );

      const ringTightModel = multiplyMatrix(
        translateMatrix(0.42, -1.1, 0.12),
        multiplyMatrix(rotateYMatrix((time * -0.3) + orbitY), rotateXMatrix(1.32)),
      );

      const bloomModel = multiplyMatrix(
        translateMatrix(-0.42, 0.28 - (scrollDepth * 0.04), -0.3),
        multiplyMatrix(
          multiplyMatrix(rotateYMatrix((time * 0.16) + orbitY * 0.7), rotateXMatrix(-0.45 + orbitX * 0.8)),
          scaleMatrix(1.95, 1.95, 1.95),
        ),
      );

      const monolithModel = multiplyMatrix(
        translateMatrix(0.52, -0.9, 0),
        multiplyMatrix(rotateYMatrix(time * 0.18 + orbitY * 0.5), scaleMatrix(1.0, 1.55, 1.0)),
      );

      const echoModel = multiplyMatrix(
        translateMatrix(1.1, -0.55, -0.25),
        multiplyMatrix(rotateYMatrix(-0.2 + orbitY * 0.35), scaleMatrix(0.48, 0.72, 0.48)),
      );

      const shardModel = multiplyMatrix(
        translateMatrix(1.68, -1.18, 0.3),
        multiplyMatrix(rotateZMatrix(time * 0.8), scaleMatrix(1, 1, 1)),
      );

      const companionModel = multiplyMatrix(
        translateMatrix(
          1.1 + (Math.cos(time * 0.7) * 0.22),
          -0.18 + (Math.sin(time * 0.9) * 0.28),
          0.2 + (Math.sin(time * 0.5) * 0.18),
        ),
        multiplyMatrix(
          multiplyMatrix(rotateYMatrix(-time * 0.48 + orbitY * 0.8), rotateXMatrix(0.8 + orbitX * 0.6)),
          scaleMatrix(0.42, 0.42, 0.42),
        ),
      );

      const companionRingModel = multiplyMatrix(
        translateMatrix(1.1 + (Math.cos(time * 0.7) * 0.22), -0.18 + (Math.sin(time * 0.9) * 0.28), 0.2),
        multiplyMatrix(
          multiplyMatrix(rotateYMatrix(time * 0.62 + orbitY), rotateXMatrix(1.18)),
          scaleMatrix(0.74, 0.74, 0.74),
        ),
      );

      const warmPulse = 0.55 + (Math.sin(time * 0.9) * 0.2);
      const coolPulse = 0.5 + (Math.cos(time * 1.1) * 0.2);
      const rosePulse = 0.45 + (Math.sin(time * 1.3 + 0.8) * 0.18);

      drawPoints(
        buffers.sphere,
        sphereData.length / 3,
        bloomModel,
        8.6,
        new Float32Array([0.58, 0.86, 1.0, 0.06 + (coolPulse * 0.08)]),
      );
      drawPoints(
        buffers.sphere,
        sphereData.length / 3,
        sphereModel,
        3.8,
        new Float32Array([0.92, 0.97, 1.0, 0.52 + (coolPulse * 0.18)]),
      );
      drawPoints(
        buffers.sphere,
        sphereData.length / 3,
        companionModel,
        4.6,
        new Float32Array([1.0, 0.72, 0.9, 0.34 + (rosePulse * 0.16)]),
      );
      drawLine(
        buffers.ringWide,
        ringWideData.length / 3,
        ringWideModel,
        new Float32Array([1.0, 0.74, 0.5, 0.18 + (warmPulse * 0.2)]),
        gl.LINE_LOOP,
      );
      drawLine(
        buffers.ringTight,
        ringTightData.length / 3,
        ringTightModel,
        new Float32Array([0.54, 0.85, 1.0, 0.18 + (coolPulse * 0.18)]),
        gl.LINE_LOOP,
      );
      drawLine(
        buffers.ringTight,
        ringTightData.length / 3,
        companionRingModel,
        new Float32Array([1.0, 0.68, 0.88, 0.14 + (rosePulse * 0.18)]),
        gl.LINE_LOOP,
      );
      drawLine(
        buffers.monolith,
        monolithData.length / 3,
        monolithModel,
        new Float32Array([0.98, 0.9, 0.82, 0.34 + (warmPulse * 0.18)]),
      );
      drawLine(
        buffers.monolith,
        monolithData.length / 3,
        echoModel,
        new Float32Array([1.0, 0.56, 0.78, 0.24 + (rosePulse * 0.16)]),
      );
      drawLine(
        buffers.shard,
        shardData.length / 3,
        shardModel,
        new Float32Array([0.72, 0.91, 1.0, 0.24 + (coolPulse * 0.14)]),
        gl.LINE_LOOP,
      );

      window.requestAnimationFrame(renderSculpture);
    };

    window.addEventListener("resize", resizeSculpture);
    resizeSculpture();
    renderSculpture();
  }
}

if (canvas && !prefersReducedMotion) {
  const context = canvas.getContext("2d");
  if (context) {
    const stars = [];
    const starCount = 72;
    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const buildStars = () => {
      stars.length = 0;

      for (let index = 0; index < starCount; index += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.7 + Math.random() * 2.4,
          speed: 0.15 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = () => {
      frame += 0.008;
      context.clearRect(0, 0, width, height);

      const glowX = pointerX || width * 0.5;
      const glowY = (pointerY || height * 0.35) + window.scrollY * 0.1;
      const gradient = context.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * 0.45);
      gradient.addColorStop(0, "rgba(255, 208, 138, 0.12)");
      gradient.addColorStop(0.22, "rgba(255, 141, 199, 0.08)");
      gradient.addColorStop(0.45, "rgba(120, 217, 255, 0.06)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      stars.forEach((star, index) => {
        const offsetY = Math.sin(frame * 3 + star.phase) * 12;
        const x = star.x + Math.cos(frame + star.phase) * star.speed * 10;
        const y = (star.y + offsetY + window.scrollY * star.speed * 0.25) % (height + 40);
        const alpha = 0.14 + ((Math.sin(frame * 2 + index) + 1) * 0.16);
        const colorShift = index % 3;

        context.beginPath();
        context.fillStyle =
          colorShift === 0
            ? `rgba(255, 219, 171, ${alpha})`
            : colorShift === 1
              ? `rgba(255, 163, 213, ${alpha * 0.9})`
              : `rgba(166, 231, 255, ${alpha})`;
        context.arc(x, y, star.radius, 0, Math.PI * 2);
        context.fill();
      });

      for (let index = 0; index < stars.length - 1; index += 8) {
        const current = stars[index];
        const next = stars[index + 1];

        context.beginPath();
        context.strokeStyle =
          index % 2 === 0
            ? "rgba(166, 231, 255, 0.05)"
            : "rgba(255, 163, 213, 0.04)";
        context.moveTo(current.x, (current.y + window.scrollY * current.speed * 0.25) % (height + 40));
        context.lineTo(next.x, (next.y + window.scrollY * next.speed * 0.25) % (height + 40));
        context.stroke();
      }

      window.requestAnimationFrame(draw);
    };

    window.addEventListener("resize", () => {
      resize();
      buildStars();
    });

    resize();
    buildStars();
    draw();
  }
}
