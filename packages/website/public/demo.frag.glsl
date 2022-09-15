#include <common>

uniform float iTime;
uniform vec2 iResolution;
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
	float mask = (p.y < fft) ? 1.0 : 0.1;

	// led shape
	vec2 d = fract((uv - p) *vec2(bands, segs)) - 0.5;
	float led = smoothstep(0.5, 0.35, abs(d.x)) *
		smoothstep(0.5, 0.35, abs(d.y));
	return vec4(led*color*mask, 1.0);
}

vec4 GetHitPointColor(vec3 hitPoint, vec3 background) {
	float fx = abs(fract(hitPoint.x * 5. + 0.5) - 0.5);
	float fz = abs(fract(hitPoint.z * 5. + 0.5) - 0.5);
	float lo = abs(hitPoint.z - ro.z) + 0.3;
	return vec4(mix(vec3(.8,.8,.8),  background / lo, smoothstep(min(fx, fz), 0., 0.02)), 1.0);
}

Surface makeGround(vec3 p) {
	float realHeight= texture(iGround, vec2(p.xz / 72.)).x;
	float s = abs(p.x-ro.x);
	s = mix(.0, .8, clamp(s * s / iResolution.x, 0., 1.));
	realHeight *= s;
	return Surface(p.y - realHeight, GetHitPointColor(p, vec3(.3, .1, .6)));
}

Surface sdScene(vec3 p) {
	return makeGround(p);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
	vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;

	vec4 bg = makeFFT(vec2(fragCoord.x, fragCoord.y * 2.));
	vec3 lp = vec3(0, 0, -dTime);
	vec3 rd = camera(lp - ro) * normalize(vec3(uv, -1));
	Surface co = rayMarch(ro, rd, 0.0, 10.0, bg);
	vec4 col = co.col;
	//col = diffuse(ro, rd, co.sd, vec3(0.,4.,10.-dTime), bg, col, 10.0);
	col = noise(fragCoord, iResolution, iTime, 10., vec2(0.05, 0.15), col);
	fragColor = col;
}
