// Constants
const int MAX_MARCHING_STEPS = 255;
const float EPSILON = 0.0005;
const float PI = 3.14159265359;

float dot2(vec2 v) { return dot(v,v); }
float dot2(vec3 v) { return dot(v,v); }
float ndot(vec2 a, vec2 b) { return a.x*b.x - a.y*b.y; }

// transform
mat2 rotate(float theta) {
	float s = sin(theta), c = cos(theta);
	return mat2(c, -s, s, c);
}

mat3 rotateX(float theta) {
	float c = cos(theta);
	float s = sin(theta);
	return mat3(
		vec3(1, 0, 0),
		vec3(0, c, -s),
		vec3(0, s, c)
	);
}

mat3 rotateY(float theta) {
	float c = cos(theta);
	float s = sin(theta);
	return mat3(
		vec3(c, 0, s),
		vec3(0, 1, 0),
		vec3(-s, 0, c)
	);
}

mat3 rotateZ(float theta) {
	float c = cos(theta);
	float s = sin(theta);
	return mat3(
		vec3(c, -s, 0),
		vec3(s, c, 0),
		vec3(0, 0, 1)
	);
}

mat3 camera(vec3 cameraDirection) {
	cameraDirection = normalize(cameraDirection);
	vec3 cr = normalize(cross(vec3(0, -1, 0), cameraDirection));
	vec3 cu = normalize(cross(cameraDirection, cr));
	return mat3(-cr, cu, -cameraDirection);
}

// parametric
vec3 sphere(float lat, float lon, float r) {
	return vec3(r*cos(lat)*cos(lon), r*cos(lat)*sin(lon), r*sin(lat));
}

// signed distance
struct Surface {
	float sd; // signed distance value
	vec4 col; // color
};

Surface sdScene(vec3 p);
Surface rayMarch(vec3 ro, vec3 rd, float start, float end, vec4 bg) {
	float depth;
	vec4 color;
	for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
		vec3 p = ro + depth * rd;
		Surface co = sdScene(p);
		color = co.col;
		depth += co.sd;
		if (co.sd < EPSILON) break;
		if (depth > end) {
			color = bg;
			break;
		}
	}
	return Surface(depth, color);
}

vec3 calcNormal(vec3 p) {
	vec2 e = vec2(1.0, -1.0) * 0.0005;
	return normalize(
		e.xyy * sdScene(p + e.xyy).sd +
		e.yyx * sdScene(p + e.yyx).sd +
		e.yxy * sdScene(p + e.yxy).sd +
		e.xxx * sdScene(p + e.xxx).sd);
}

vec4 diffuse(vec3 ro, vec3 rd, float d, vec3 lp, vec4 bgcol, vec4 col, float max_dist) {
  if (d > max_dist) {
    return bgcol;
	} else {
		vec3 p = ro + rd * d;
		vec3 normal = calcNormal(p);
		vec3 ld = normalize(lp - p);
		float diffuse = clamp(dot(ld, normal), 0., 1.);
		return vec4(diffuse * col.rgb, col.a);
	}
}

float sdSphere(vec3 p, float s) {
	return length(p)-s;
}

float sdCircle(vec3 p, vec3 norm, float r) {
	float a = length(p * norm);
	float d = length(p) - r;
	return max(a,d);
}

float sdBox(vec3 p, vec3 b) {
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
	return sdBox(p, b) - r;
}

float sdBoxFrame(vec3 p, vec3 b, float e) {
	p = abs(p)-b;
	vec3 q = abs(p+e)-e;
	return min(min(
			length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
			length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
		length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}

float sdTorus(vec3 p, vec2 t) {
	vec2 q = vec2(length(p.xz)-t.x,p.y);
	return length(q)-t.y;
}

float sdCappedTorus(in vec3 p, in vec2 sc, in float ra, in float rb) {
	p.x = abs(p.x);
	float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
	return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;
}

float sdLink(vec3 p, float le, float r1, float r2) {
  vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );
  return length(vec2(length(q.xy)-r1,q.z)) - r2;
}

float sdCylinder(vec3 p, vec3 c) {
	return length(p.xz-c.xy)-c.z;
}

float sdCone(vec3 p, vec2 c, float h) {
	float q = length(p.xz);
	return max(dot(c.xy,vec2(q,p.y)),-h-p.y);
}

float sdConeInf(vec3 p, vec2 c) {
	// c is the sin/cos of the angle
	vec2 q = vec2( length(p.xz), -p.y );
	float d = length(q-c*max(dot(q,c), 0.0));
	return d * ((q.x*c.y-q.y*c.x<0.0)?-1.0:1.0);
}

float sdPlane(vec3 p, vec3 n, float h) {
	// n must be normalized
	return dot(p,n) + h;
}

float sdTriPrism(vec3 p, vec2 h) {
  vec3 q = abs(p);
  return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa - ba*h ) - r;
}

float sdVerticalCapsule(vec3 p, float h, float r) {
  p.y -= clamp( p.y, 0.0, h );
  return length( p ) - r;
}

float sdCappedCylinder(vec3 p, float h, float r) {
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(h,r);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdRoundedCylinder(vec3 p, float ra, float rb, float h) {
	vec2 d = vec2( length(p.xz)-2.0*ra+rb, abs(p.y) - h );
	return min(max(d.x,d.y),0.0) + length(max(d,0.0)) - rb;
}

float sdCappedCone(vec3 p, float h, float r1, float r2) {
	vec2 q = vec2( length(p.xz), p.y );
	vec2 k1 = vec2(r2,h);
	vec2 k2 = vec2(r2-r1,2.0*h);
	vec2 ca = vec2(q.x-min(q.x,(q.y<0.0)?r1:r2), abs(q.y)-h);
	vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot2(k2), 0.0, 1.0 );
	float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
	return s*sqrt( min(dot2(ca),dot2(cb)) );
}

float sdSolidAngle(vec3 p, vec2 c, float ra) {
  // c is the sin/cos of the angle
  vec2 q = vec2( length(p.xz), p.y );
  float l = length(q) - ra;
  float m = length(q - c*clamp(dot(q,c),0.0,ra) );
  return max(l,m*sign(c.y*q.x-c.x*q.y));
}

float sdCutSphere(vec3 p, float r, float h) {
  // sampling independent computations (only depend on shape)
  float w = sqrt(r*r-h*h);

  // sampling dependant computations
  vec2 q = vec2( length(p.xz), p.y );
  float s = max( (h-r)*q.x*q.x+w*w*(h+r-2.0*q.y), h*q.x-w*q.y );
  return (s<0.0) ? length(q)-r :
         (q.x<w) ? h - q.y     :
                   length(q-vec2(w,h));
}

float sdDeathStar(vec3 p2, float ra, float rb, float d) {
  // sampling independent computations (only depend on shape)
  float a = (ra*ra - rb*rb + d*d)/(2.0*d);
  float b = sqrt(max(ra*ra-a*a,0.0));
	
  // sampling dependant computations
  vec2 p = vec2( p2.x, length(p2.yz) );
  if( p.x*b-p.y*a > d*max(b-p.y,0.0) )
    return length(p-vec2(a,b));
  else
    return max( (length(p          )-ra),
               -(length(p-vec2(d,0))-rb));
}

float sdRoundCone(vec3 p, float r1, float r2, float h) {
	// sampling independent computations (only depend on shape)
	float b = (r1-r2)/h;
	float a = sqrt(1.0-b*b);

	// sampling dependant computations
	vec2 q = vec2( length(p.xz), p.y );
	float k = dot(q,vec2(-b,a));
	if( k<0.0 ) return length(q) - r1;
	if( k>a*h ) return length(q-vec2(0.0,h)) - r2;
	return dot(q, vec2(a,b) ) - r1;
}

float sdEllipsoid(vec3 p, vec3 r) {
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/k1;
}

float sdRhombus(vec3 p, float la, float lb, float h, float ra) {
  p = abs(p);
  vec2 b = vec2(la,lb);
  float f = clamp( (ndot(b,b-2.0*p.xz))/dot(b,b), -1.0, 1.0 );
  vec2 q = vec2(length(p.xz-0.5*b*vec2(1.0-f,1.0+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra, p.y-h);
  return min(max(q.x,q.y),0.0) + length(max(q,0.0));
}

float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  return (p.x+p.y+p.z-s)*0.57735027;
}

float sdPyramid(vec3 p, float h) {
  float m2 = h*h + 0.25;
    
  p.xz = abs(p.xz);
  p.xz = (p.z>p.x) ? p.zx : p.xz;
  p.xz -= 0.5;

  vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);
   
  float s = max(-q.x,0.0);
  float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );
    
  float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
  float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
    
  float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);
    
  return sqrt( (d2+q.z*q.z)/m2 ) * sign(max(q.z,-p.y));
}

float sdTriangle(vec3 p, vec3 a, vec3 b, vec3 c) {
  vec3 ba = b - a; vec3 pa = p - a;
  vec3 cb = c - b; vec3 pb = p - b;
  vec3 ac = a - c; vec3 pc = p - c;
  vec3 nor = cross( ba, ac );

  return sqrt(
    (sign(dot(cross(ba,nor),pa)) +
     sign(dot(cross(cb,nor),pb)) +
     sign(dot(cross(ac,nor),pc))<2.0)
     ?
     min( min(
     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
     dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )
     :
     dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}

float sdQuad(vec3 p, vec3 a, vec3 b, vec3 c, vec3 d) {
  vec3 ba = b - a; vec3 pa = p - a;
  vec3 cb = c - b; vec3 pb = p - b;
  vec3 dc = d - c; vec3 pc = p - c;
  vec3 ad = a - d; vec3 pd = p - d;
  vec3 nor = cross( ba, ad );

  return sqrt(
    (sign(dot(cross(ba,nor),pa)) +
     sign(dot(cross(cb,nor),pb)) +
     sign(dot(cross(dc,nor),pc)) +
     sign(dot(cross(ad,nor),pd))<3.0)
     ?
     min( min( min(
     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
     dot2(dc*clamp(dot(dc,pc)/dot2(dc),0.0,1.0)-pc) ),
     dot2(ad*clamp(dot(ad,pd)/dot2(ad),0.0,1.0)-pd) )
     :
     dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}

// operations
Surface opUnion(Surface d1, Surface d2) {
	if (d1.sd < d2.sd) return d1;
	else return d2;
}
Surface opSubtraction(Surface d1, Surface d2) {
	if (-d1.sd > d2.sd) return d1;
	else return d2;
}
Surface opIntersection(Surface d1, Surface d2) {
	if (d1.sd > d2.sd) return d1;
	else return d2;
}
float opSmoothUnion(float d1, float d2, float k) {
	float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) - k*h*(1.0-h);
}
float opSmoothSubtraction(float d1, float d2, float k) {
	float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
	return mix( d2, -d1, h ) + k*h*(1.0-h);
}
float opSmoothIntersection(float d1, float d2, float k) {
	float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) + k*h*(1.0-h);
}

// on position
vec3 opElongate1D(vec3 p, vec3 h) {
		return p - clamp(p, -h, h);
}
vec3 opRep(vec3 p, vec3 c) {
    return mod(p+0.5*c,c)-0.5*c;
}
vec3 opRepLim(vec3 p, float c, vec3 l) {
    return p-c*clamp(round(p/c),-l,l);
}

// on result
float opRound(float p, float rad) {
    return p - rad;
}
float opOnion(float sdf, float thickness ) {
    return abs(sdf)-thickness;
}

// effect
vec4 CRT(in vec2 fragCoord, in vec2 iResolution, in float warp, in float scan, in vec4 col) {
    // squared distance from center
    vec2 uv = fragCoord/iResolution.xy;
    vec2 dc = abs(0.5-uv);
    dc *= dc;
    
    // warp the fragment coordinates
    uv.x -= 0.5; uv.x *= 1.0+(dc.y*(0.3*warp)); uv.x += 0.5;
    uv.y -= 0.5; uv.y *= 1.0+(dc.x*(0.4*warp)); uv.y += 0.5;

    // sample inside boundaries, otherwise set to black
    if (uv.y > 1.0 || uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0) {
        return vec4(0.0,0.0,0.0,1.0);
		} else {
			// determine if we are drawing in a scanline
			float apply = abs(sin(fragCoord.y)*0.5*scan);
			// sample the texture
			return vec4(mix(col.rgb,vec3(0.0),apply),col.a);
		}
}

float random (vec2 noise)
{
    //--- Noise: Low Static (X axis) ---
    //return fract(sin(dot(noise.yx,vec2(0.000128,0.233)))*804818480.159265359);
    
    //--- Noise: Low Static (Y axis) ---
    //return fract(sin(dot(noise.xy,vec2(0.000128,0.233)))*804818480.159265359);
    
  	//--- Noise: Low Static Scanlines (X axis) ---
    //return fract(sin(dot(noise.xy,vec2(98.233,0.0001)))*925895933.14159265359);
    
   	//--- Noise: Low Static Scanlines (Y axis) ---
    //return fract(sin(dot(noise.xy,vec2(0.0001,98.233)))*925895933.14159265359);
    
    //--- Noise: High Static Scanlines (X axis) ---
    //return fract(sin(dot(noise.xy,vec2(0.0001,98.233)))*12073103.285);
    
    //--- Noise: High Static Scanlines (Y axis) ---
    //return fract(sin(dot(noise.xy,vec2(98.233,0.0001)))*12073103.285);
    
    //--- Noise: Full Static ---
    return fract(sin(dot(noise.xy,vec2(10.998,98.233)))*12433.14159265359);
}
vec4 noise(in vec2 fragCoord, in vec2 iResolution, in float iTime, in float speed, in vec2 strength, in vec4 col) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 uv2 = fract(fragCoord.xy/iResolution.xy*fract(sin(iTime*speed)));
    float maxStrength = clamp(sin(iTime/2.0),strength.x,strength.y);
    vec3 colour = vec3(random(uv2.xy))*maxStrength;
    return vec4(col.rgb-colour,col.a);
}
