export const tileLayers = [
  // {
  //   name: "Carto",
  //   urlTemplate:
  //     "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  //   layerOptions: {
  //     attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
  //       &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
  //     subdomains: "abcd",
  //     maxZoom: 14,
  //   },
  // },
  // {
  //   name: "OpenStreetMap",
  //   urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  //   layerOptions: {
  //     attribution: `&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors`,
  //     maxZoom: 19,
  //   },
  // },
  {
    name: "Esri Satellite",
    urlTemplate:
      "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    layerOptions: {
      attribution:
        '&copy; <a href="http://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19,
    },
  },
];
