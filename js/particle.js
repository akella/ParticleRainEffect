import Vec2 from 'vec2';
function lerp(a,b,t){
    return a*(1-t) + b*t;
}
export default class particle{
    constructor(args){
        this.pos = new Vec2();
        this.pres = args.pres
        this.iWidth = args.iWidth;
        this.iHeight = args.iHeight;
        
        this.pos.x = args.x||0;
        this.pos.y = args.y||0;
        this.gravity = -0.1 - Math.random()/4
        this.slowGravity = -0.02 - Math.random()/10
        this.vel = new Vec2(0,this.gravity);
        this.target = this.gravity;

        this.friction = 0.9;
        this.phase = Math.random() * 2 * Math.PI
    }

    update(image,time, progress,sideScale,speedScale){
        this.nPosX = Math.floor( 
            this.pres.w*(this.pos.x + 3*this.iWidth/2)/this.iWidth 
        )  % this.pres.w
        this.nPosY = Math.floor( 
            this.pres.h*(this.pos.y + 3*this.iHeight/2)/this.iHeight 
        ) % this.pres.h
        // console.log(image,'im',this.nPosX,this.nPosY);
        // console.log(this.nPosX,this.nPosY);
        let img = image[this.nPosX][this.pres.h - 1 -this.nPosY]
        this.target = -0.1-img
        // this.vel.y += 0.6*(this.target - this.vel.y)
        // this.vel.y = lerp(this.slowGravity,this.gravity,img);

        this.vel.x = sideScale*Math.sin(time + this.phase) * (.1 - img * .075)*(1-progress)
        this.vel.y = speedScale*lerp(this.slowGravity, this.gravity, img*(1-progress));
        // console.log(this.vel.y);
        this.pos = this.pos.add(this.vel, true);
        if(this.pos.y<-this.iHeight/2){
            this.pos.y = this.iHeight/2;
            this.pos.x = (Math.random() - 0.5)*this.iWidth;
        }
        // this.pos.x = Math.min(this.pos.x, 200)
    }
}