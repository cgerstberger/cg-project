class TimeTransformation {
    constructor(startTimes, durations, originX, originY, originZ, lastMatrix) {
        this.startTimeInMilliseconds = 0;
        this.duration = 0;
        this.origin = {
            X: originX,
            Y: originY,
            Z: originZ
        };
        this.lastTranslationCoords = {
            X: 0,
            Y: 0,
            Z: 0
        };
        this.lastMatrix = lastMatrix;
        this.timeHasSet = false;
        this.alreadyTransformed = false;
        this.startTimes = startTimes;
        this.durations = durations;
        this.curAnimation = 0;
        this.getNextTime();
    }

    getNextTime(){
        if(this.startTimes.length > 0) {
            this.startTimeInMilliseconds = this.startTimes[this.curAnimation];
            this.duration = this.durations[this.curAnimation];
            this.curAnimation += 1;
        }
    }

    setStartTimeInMilliseconds(startTimeInMilliseconds){
        this.startTimeInMilliseconds = startTimeInMilliseconds;
        this.timeHasSet = true;
        if(this.startTimes.length > 0){
            this.startTimes[0] = startTimeInMilliseconds;
            for(var i = 1; i < this.startTimes.length; i ++){
                this.startTimes[i] = this.startTimes[i-1] + this.durations[i-1];
            }
        }
    }

    transformSniper(timeInMilliseconds){
        var diff = timeInMilliseconds - this.startTimeInMilliseconds;
        if(diff > 0 && diff < this.duration) {
            // alreadyTransformed flag is there because once an animation has started, it shouldn't stop anymore
            if(!this.alreadyTransformed){
                this.alreadyTransformed = true;
                this.timeHasSet = true;
            }
            this.lastMatrix = glm.translate(diff * 0.0035, 0, 0);
            this.lastTranslationCoords.X = this.lastMatrix[12];
            this.lastTranslationCoords.Y = this.lastMatrix[13];
            this.lastTranslationCoords.Z = this.lastMatrix[14];
        }
        return this.lastMatrix;
    }

    transformBullet(timeInMilliseconds){
        var diff = timeInMilliseconds - this.startTimeInMilliseconds;
        /*console.log("wwwwwwwwwwwwwwwwwwwww       " + this.curAnimation)
        console.log("   this.origin.X = " + this.origin.X);
        console.log("   this.origin.Y = " + this.origin.Y);
        console.log("   this.origin.Z = " + this.origin.Z);
        console.log("   this.startTimeInMilliseconds = " + this.startTimeInMilliseconds);
        console.log("   this.duration = " + this.duration);
        console.log("   diff = " + diff);
        console.log("   this.startTimeInMilliseconds = " + this.startTimeInMilliseconds);
        console.log("   this.startTimes[0] = " + this.startTimes[0]);
        console.log("   this.startTimes[1] = " + this.startTimes[1]);
        console.log("   this.durations[0] = " + this.durations[0]);
        console.log("   this.durations[1] = " + this.durations[1]);*/
        if(diff >= 0 && diff < this.duration) {
            if(!this.alreadyTransformed){
                this.alreadyTransformed = true;
                this.timeHasSet = true;
            }
            if(this.curAnimation == 1)
                this.lastMatrix = glm.translate(diff * 0.0035, 0, 0);
            if(this.curAnimation == 2)
                this.lastMatrix = glm.translate(this.lastTranslationCoords.X + diff * 0.025, this.lastTranslationCoords.Y + diff * (-0.009), this.lastTranslationCoords.Z + diff * 0.025);
        } else if(diff > this.duration && this.startTimes.length > 0){
            this.getNextTime();
            this.lastTranslationCoords.X = this.lastMatrix[12];
            this.lastTranslationCoords.Y = this.lastMatrix[13];
            this.lastTranslationCoords.Z = this.lastMatrix[14];
            this.origin.X += this.lastTranslationCoords.X;
            this.origin.Y += this.lastTranslationCoords.Y;
            this.origin.Z += this.lastTranslationCoords.Z;
        }
        return this.lastMatrix;
    }
}
