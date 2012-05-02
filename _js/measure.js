var socket = io.connect();
var iosData = {};

int bot = document.getElementById('sources').offsetHeight;
int top = document.getElementById('header').offsetHeight;
int cnvW = window.innerWidth;
int cnvH = window.innerHeight - bot - top;

document.getElementById('printData').style.top = top;

socket.on('desktop', function(data) {
    $.each(data, function(key, value){
            iosData[key] = parseFloat(value);
            nX = iosData['x'];
            nY = iosData['y'];
            nZ = iosData['z'];
            //r = abs(nZ)*10;  // possibly for 3D effect?
            
            gA = iosData['a'];
            gB = iosData['b'];
            gG = iosData['g'];
            
            arA = iosData['ar'] / 100;
            arB = iosData['br'] / 100;
            arG = iosData['gr'] / 100;
            
            s = int(iosData['s']);
    });            
});

Mover m;
float r = 5.0;  //radius of blob
float edge = r;

int X, Y; // for initial positioning
int s; // stabilization

int midY = cnvH / 2;
int quartY = midY / 2;
int thquartY = midY+quartY;

float nX, nY, nZ, gA, gB, gG, arA, arB, arG;

float gGm = midY;

int s;


void setup() {
    size(cnvW, cnvH);
	background(10);
	//strokeWeight(strokeW);
	frameRate(15);
	X = 0;
	Y = cnvH / 2;
	smooth();
	m = new Mover(X, Y);
	m.display(r, midY);
}

void draw() { 
    strokeWeight(1);
	
	stroke(60);
  	line(0, quartY, cnvW, quartY);
   	line(0, thquartY, cnvW, thquartY);
   	
   	stroke(200);	
	line(0, midY, cnvW, midY);

	/*
	noStroke();
	fill(10, 40);
	rect(0, 0, width, height);
	*/
	
	strokeWeight(strokeW);
	iphoneControl();
}

void iphoneControl() {
	
printData(nX, nY, nZ, gA, gB, gG, arA, arB, arG, s);
    	
	if (s == 1) {
		background(10,0.5);
	}
  	
	PVector moved = new PVector(nX,0);
	PVector accel = new PVector(0,0);
	
	m.move(moved);
	m.update();
	m.display(r, gGm);
	m.checkEdges();
}

class Mover {
	
	PVector loc;
	PVector vel;
	PVector acc;
	float mass;
	
	Mover(float x, float y) {
		loc = new PVector(x, y);
		vel = new PVector(0, 0);
		acc = new PVector(0, 0);
		mass = 10;
	}
	
	void applyForce(PVector force) {
		PVector f = PVector.div(force, mass);
		acc.add(f);
	}
	
	void move(PVector move) {
		loc.add(move);
	}
	
	void update() {
		vel.add(acc);
		loc.add(vel);
		acc.mult(0);
	}
	
	void display(float r) {
		fill(121, 0, 184);
		stroke(255);
		ellipse(loc.x, loc.y, r, r);
	}
	
	void checkEdges() {
		if (loc.x > width-edge) {
			vel.x *= -1;
			loc.x = width-edge;
		} else if (loc.x < edge) {
			vel.x *= -1;
			loc.x = edge;
		}
		if (loc.y > height-edge) {
			vel.y *= -1;
			loc.y = height-edge;
		} else if (loc.y < edge) {
			vel.y *= -1;
			loc.y = edge;
		}
	}
}

void printData(float x, float y, float z, float a, float b, float g, float alph, float bet, float gam, int stab) {
	divTxt  = "<p>X : " + x + "</p>";
	divTxt += "<p>Y : " + y + "</p>";
	divTxt += "<p>Z : " + z + "</p>";
	divTxt += "<p>A : " + a + "</p>";
	divTxt += "<p>B : " + b + "</p>";
	divTxt += "<p>G : " + g + "</p>";
	divTxt += "<p>arA : " + alph + "</p>";
	divTxt += "<p>arB : " + bet + "</p>";
	divTxt += "<p>arG : " + gam + "</p>";
	if (stab == 1) { divTxt += "<p>Stabilized!</p>"; }
	document.getElementById("printData").innerHTML = divTxt;
} 

/* notes for later, gator: 
	http://ditio.net/2008/11/04/php-string-to-hex-and-hex-to-string-functions/
	http://www.html5rocks.com/en/mobile/touch/
*/