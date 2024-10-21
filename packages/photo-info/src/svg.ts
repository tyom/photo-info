export function createFovMarkerSvg(
  fovDegrees: number,
  bearingAngle: number,
  size = 200,
) {
  // Calculate the base of the triangle using the FOV and distance
  const halfFovRadians = (fovDegrees / 2) * (Math.PI / 180); // Convert half of the FOV to radians
  const baseHalfLength = Math.tan(halfFovRadians) * size; // Half of the base of the triangle

  return `
    <svg width="${size}" height="${size}"
         viewBox="-${size / 2} -${size / 2} ${size} ${size}">
      <defs>
        <radialGradient id="fade-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="white" stop-opacity="1"/>
          <stop offset="80%" stop-color="white" stop-opacity="0"/>
        </radialGradient>

        <mask id="circle-mask">
          <rect x="-${size / 2}" y="-${size / 2}" width="${size}"
                height="${size}" fill="url(#fade-gradient)"/>
        </mask>
      </defs>

      <g transform="rotate(${bearingAngle} 0 0)">
        <polygon
            points="0,0 ${-baseHalfLength / 2},${-size / 2} ${baseHalfLength / 2},${-size / 2}"
            fill="lightblue"
            stroke="white"
            stroke-width="1"
            mask="url(#circle-mask)"/>
      </g>

      <circle cx="0" cy="0" r="5" fill="blue" stroke="white" stroke-width="2"/>
    </svg>
    `;
}

export function createSimpleMarkerSvg(size = 10) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="0" cy="0" r="${size / 2}" fill="blue" stroke="white" stroke-width="2"/>
    </svg>
  `;
}
