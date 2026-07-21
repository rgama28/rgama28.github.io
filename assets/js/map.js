/* Robert Gama — world map ("Where I've Been"): equirectangular country render + visited markers */

(function () {
  const svg = document.getElementById("worldMap");
  if (!svg) return;

  const WIDTH = 1000;
  const HEIGHT = 500;
  const VISITED = new Set(["US", "MX", "SG", "ID", "JP", "CN"]);
  const MARKERS = [
    { name: "United States", lon: -98, lat: 39 },
    { name: "Mexico", lon: -102, lat: 23 },
    { name: "Japan", lon: 138, lat: 36 },
    { name: "China", lon: 104, lat: 35 },
    { name: "Singapore", lon: 103.8, lat: 1.35 },
    { name: "Indonesia", lon: 120, lat: -4 }
  ];

  const NS = "http://www.w3.org/2000/svg";

  function project(lon, lat) {
    const x = ((lon + 180) / 360) * WIDTH;
    const y = ((90 - lat) / 180) * HEIGHT;
    return [x, y];
  }

  function ringToPath(ring) {
    return (
      ring
        .map((pt, i) => {
          const [x, y] = project(pt[0], pt[1]);
          return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
        })
        .join(" ") + " Z"
    );
  }

  function geometryToPath(geometry) {
    if (geometry.type === "Polygon") {
      return geometry.coordinates.map(ringToPath).join(" ");
    }
    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates.map((poly) => poly.map(ringToPath).join(" ")).join(" ");
    }
    return "";
  }

  function addMarkers(group) {
    MARKERS.forEach((m) => {
      const [cx, cy] = project(m.lon, m.lat);
      const g = document.createElementNS(NS, "g");

      const ring = document.createElementNS(NS, "circle");
      ring.setAttribute("class", "world-marker-ring");
      ring.setAttribute("cx", cx.toFixed(1));
      ring.setAttribute("cy", cy.toFixed(1));
      ring.setAttribute("r", "9");

      const dot = document.createElementNS(NS, "circle");
      dot.setAttribute("class", "world-marker-dot");
      dot.setAttribute("cx", cx.toFixed(1));
      dot.setAttribute("cy", cy.toFixed(1));
      dot.setAttribute("r", "4.5");

      const label = document.createElementNS(NS, "text");
      label.setAttribute("class", "world-label");
      label.setAttribute("x", (cx + 13).toFixed(1));
      label.setAttribute("y", (cy + 4).toFixed(1));
      label.textContent = m.name;

      g.appendChild(ring);
      g.appendChild(dot);
      g.appendChild(label);
      group.appendChild(g);
    });
  }

  async function init() {
    const countryGroup = svg.querySelector("#worldCountries");
    const markerGroup = svg.querySelector("#worldMarkers");
    try {
      const res = await fetch("assets/data/world-countries.json", { cache: "force-cache" });
      if (!res.ok) throw new Error("world-countries.json not found");
      const data = await res.json();

      const frag = document.createDocumentFragment();
      data.features.forEach((f) => {
        const iso2 = f.properties.iso2;
        const d = geometryToPath(f.geometry);
        if (!d) return;
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", d);
        path.setAttribute(
          "class",
          "world-country" + (VISITED.has(iso2) ? " is-visited" : "")
        );
        const title = document.createElementNS(NS, "title");
        title.textContent = f.properties.name;
        path.appendChild(title);
        frag.appendChild(path);
      });
      countryGroup.appendChild(frag);
      addMarkers(markerGroup);
    } catch (err) {
      console.error(err);
    }
  }

  init();
})();
