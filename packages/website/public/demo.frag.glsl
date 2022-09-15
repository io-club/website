#include <common>

uniform float iTime;
uniform vec2 iResolution;
uniform float iFreq;
uniform sampler2D iFreqAll;
uniform sampler2D iGround;

varying vec2 vUV;

#define dTime (iTime * 1.5)
#define eTime (iTime * 3.)
#define ro (vec3(0., .3, 10.-dTime))

void mainImage(out vec4 fragColor, in vec2 fragCoord);
void main(void) {
	mainImage(gl_FragColor, vUV * iResolution.xy);
}

vec4 makeFFT(vec2 fragCoord) {
	vec2 uv = fragCoord / iResolution.xy; // - 0.5;

	// quantize coordinates
	const float bands = 30.0;
	const float segs = 40.0;
	vec2 p;
	p.x = floor(uv.x*bands)/bands;
	p.y = floor(uv.y*segs)/segs;

	// read frequency data from first row of texture
	float fft  = texture(iFreqAll, vec2(p.x,0.0) ).x;

	// led color
	vec3 color = mix(vec3(0.0, 2.0, 0.0), vec3(2.0, 0.0, 0.0), sqrt(uv.y));

	// mask for bar graph
	float mask = (p.y > fft) ? 1.0 : 0.1;

	// led shape
	vec2 d = fract((uv - p) *vec2(bands, segs)) - 0.5;
	float led = smoothstep(0.5, 0.35, abs(d.x)) *
		smoothstep(0.5, 0.35, abs(d.y));
	return vec4(led*color*mask, 1.0);
}

vec4 makeBackground(vec2 uv) {
	float aspect = iResolution.y/iResolution.x;
	float value;
	//float rot = radians(45.0 * tan(iFreq - 0.5)); // radians(45.0*sin(dTime));
	//mat2 m = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
	uv  = inverse(rotate(4. * tan(iFreq - 0.5))) *  uv;
	uv += vec2(0.5, 0.5*aspect);
	uv.y+=0.5*(1.0-aspect);
	vec2 pos = 10.0*uv;
	vec2 rep = fract(pos);
	float dist = 2.0*min(min(rep.x, 1.0-rep.x), min(rep.y, 1.0-rep.y));
	float squareDist = length((floor(pos)+vec2(0.5)) - vec2(5.0) );
	float edge = sin(dTime-squareDist*0.5)*0.5+0.5;

	edge = (dTime-squareDist*0.5)*0.5;
	edge = 2.0*fract(edge*0.5);
	//value = 2.0*abs(dist-0.5);
	//value = pow(dist, 2.0);
	value = fract (dist*2.0);
	value = mix(value, 1.0-value, step(1.0, edge));
	//value *= 1.0-0.5*edge;
	edge = pow(abs(1.0-edge), 2.0);

	//edge = abs(1.0-edge);
	value = smoothstep( edge-0.05, edge, 0.95*value);


	value += squareDist*.1;
	return mix(vec4(1.0,1.0,1.0,1.0),vec4(0.5,0.75,1.0,1.0), value);
}

vec4 GetHitPointColor(vec3 hitPoint, vec3 background) {
#define GRID_COUNT 5.
	float fx = abs(fract(hitPoint.x * GRID_COUNT + 0.5) - 0.5);
	float fz = abs(fract(hitPoint.z * GRID_COUNT + 0.5) - 0.5);

	vec3 b = vec3(1.0, 0.2, 0.8);
	vec3 r = background;
	r.x = pow(r.x, 3.3);
	r.y = pow(r.y, 0.7);
	r.z = pow(r.z, 0.5);
	float d = length(hitPoint.xz - ro.xz) * 0.15;
	d = clamp(d, 0., 1.);

	vec3 col = r * d + b * (1. - d);
	float li = texture(iGround, hitPoint.xz / 64. + vec2(0, -dTime * 0.005)).x * 0.5 + 0.5;
	float lo = abs(hitPoint.z - ro.z) + 0.3;
	col /= min(li, lo);
	d = min(fx, fz);
	d = smoothstep(d, 0., 0.02);
	return vec4(r * d + col * (1. - d), 1.0);
}

Surface makeGround(vec3 p) {
	float realHeight= texture(iGround, vec2(p.xz / 72.)).x;
	float s = abs(p.x-ro.x);
	s = mix(.0, .8, clamp(s * s / iResolution.x, 0., 1.));
	realHeight *= s;
	return Surface(p.y - realHeight, GetHitPointColor(p, vec3(.6, .1, .3)));
}

Surface makeRotation(vec3 p) {
	float ra = mix(.4, .9, iFreq);
	vec3 np = inverse(rotateZ(dTime) * rotateY(iTime) * rotateX(eTime)) * (p + vec3(0.,-.8,-6.+dTime));
	return opUnion(
		Surface(
			sdBoxFrame(
				np,
				vec3(1.0, 1.0, 1.0) * ra,
				.05
			),
			vec4(0.5,0.75,1.0, 1.0)
		),
		Surface(
			sdOctahedron(
				np,
				1. * ra
			),
			vec4(0.5,0.75,1.0, 1.0)
		)
	);
}

Surface make2(vec3 p, vec4 col, float s) {
	p.y += 0.23;
	return opUnion(opUnion(
			Surface(
				sdVerticalCapsule(
					inverse(rotateZ(PI / 4.2)) * vec3(p.x + .3, p.y, p.z),
					.33,
					.03
				), col
			),
			Surface(
				sdVerticalCapsule(
					inverse(rotateZ(PI / 2.)) * vec3(p.x + .3, p.yz),
					.3,
					.03
				), col
			)),
		Surface(
			sdCappedTorus(
				vec3(p.x + .16, p.y - .34, p.z),
				vec2(0.5, -.5),
				.13,
				.03
			), col
		)
	);
}

Surface make0(vec3 p, vec4 col, float s) {
	return Surface(
		sdLink(
			p,
			.1, .14, .03
		), col
	);
}

Surface make2022(vec3 p) {
	float s = clamp(abs(sin(iTime)), .1, 1.);
	float c = clamp(abs(cos(iTime)), .1, 1.);
	float t = clamp(abs(tan(iTime)), .1, 1.);
	vec4 col1 = vec4(s,c,t,1.0);
	vec4 col2 = vec4(col1.rbga);
	vec4 col3 = vec4(col1.bgra);
	vec4 col4 = vec4(col1.brga);

	float g = 1.0;
	if (iResolution.x < iResolution.y) {
		g = iResolution.x / iResolution.y;
	}
	p.xy /= g;

	vec3 p1 = vec3(p.x + .4, p.yz);
	p1.y += mix(.0, .1, abs(sin(eTime)));
	p1.z += mix(.0, .1, abs(cos(iTime)));
	vec3 p2 = vec3(p.x + .2, p.yz);
	p2.y += mix(.0, .1, abs(sin(eTime + 3.)));
	p2.z += mix(.0, .1, abs(cos(eTime + .8)));
	vec3 p3 = vec3(p.x - .32, p.yz);
	p3.y += mix(.0, .1, abs(cos(eTime + 2.)));
	p3.z += mix(.0, .1, abs(sin(eTime + .3)));
	vec3 p4 = vec3(p.x - .7, p.yz);
	p4.y += mix(.0, .1, abs(sin(eTime + 4.)));
	p4.z += mix(.0, .1, abs(cos(eTime + .5)));

	return opUnion(opUnion(opUnion(make2(p1, col1, g), make0(p2, col2, g)), make2(p3, col3, g)), make2(p4, col4, g));
}

Surface makeIO(vec3 p) {
	vec3 np = (p + vec3(0,-.4,-8.+dTime));
	return make2022(np);
}

Surface sdScene(vec3 p) {
	return opUnion(opUnion(makeGround(p), makeRotation(p)), makeIO(p));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
	vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;

	vec4 bg = makeBackground(uv);
	vec3 lp = vec3(0, 0, -dTime);
	vec3 rd = camera(lp - ro) * normalize(vec3(uv, -1));
	Surface co = rayMarch(ro, rd, MIN_DIST, MAX_DIST, bg);
	vec4 col = CRT(fragCoord, iResolution, 0.75, 0.25, diffuse(ro, rd, co.sd, vec3(0.,4.,10.-dTime), bg, co.col));
	col = noise(fragCoord, iResolution, iTime, 10., vec2(0.05, 0.15), col);
	fragColor = col;
}
