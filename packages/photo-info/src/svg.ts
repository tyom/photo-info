type MarkerOptions = {
  angleOfView?: number | null;
  bearing?: number | null;
  viewBoxSize?: number;
  circleSize?: number;
  circleColor?: string;
  circleStroke?: string;
  circleStrokeWidth?: number;
  fovColor?: string;
  fovStroke?: string;
};

export function createFovMarkerSvg({
  angleOfView,
  bearing,
  viewBoxSize = 200,
  circleSize = 5,
  circleColor = 'orange',
  circleStroke = 'white',
  circleStrokeWidth = 1,
  fovColor = 'lightblue',
  fovStroke = 'white',
}: MarkerOptions) {
  const circle = `<circle cx="0" cy="0" r="${circleSize}" fill="${circleColor}"
    stroke="${circleStroke}" stroke-width="${circleStrokeWidth}"/>`;

  function buildAngledPolygon() {
    if (!angleOfView || !bearing) {
      return '';
    }
    // Calculate the base of the triangle using the FOV and distance
    const halfFovRadians = (angleOfView / 2) * (Math.PI / 180); // Convert half of the FOV to radians
    const baseHalfLength = Math.tan(halfFovRadians) * viewBoxSize;
    return `
      <defs>
        <radialGradient id="fade-gradient" cx="50%" cy="50%" r="90%">
          <stop offset="0%" stop-color="white" stop-opacity="0.5"/>
          <stop offset="50%" stop-color="white" stop-opacity="0"/>
        </radialGradient>

        <mask id="circle-mask">
          <rect x="-${viewBoxSize / 2}" y="-${viewBoxSize / 2}" width="${viewBoxSize}"
                height="${viewBoxSize}" fill="url(#fade-gradient)"/>
        </mask>
      </defs>
      <g transform="rotate(${bearing} 0 0)">
        <polygon
          points="0,0 ${-baseHalfLength / 2},${-viewBoxSize / 2} ${baseHalfLength / 2},${-viewBoxSize / 2}"
          fill="${fovColor}"
          stroke="${fovStroke}"
          stroke-width="1"
          mask="url(#circle-mask)"
        />
      </g>
    `.trim();
  }

  return `
    <svg width="${viewBoxSize}" height="${viewBoxSize}"
      viewBox="-${viewBoxSize / 2} -${viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}">
      ${buildAngledPolygon()}
      ${circle}
    </svg>
  `;
}
