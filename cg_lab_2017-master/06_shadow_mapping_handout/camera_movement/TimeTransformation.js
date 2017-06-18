class TimeTransformation {
    constructor(startTimes, durations, origin, target, lastMatrix, additionalObject) {
        this.startTimeInMilliseconds = 0;
        this.duration = 0;
        this.origin = origin
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
        this.obj = additionalObject;
        this.target = {
          X: target.X-origin.X,
          Y: target.Y-origin.Y,
          Z: target.Z-origin.Z,
        };
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
                this.obj.start = true;
            }
            this.lastMatrix[12]=this.origin.X + this.target.X*diff/this.duration;
            this.lastMatrix[13]=this.origin.Y + this.target.Y*diff/this.duration;
            this.lastMatrix[14]=this.origin.Z + this.target.Z*diff/this.duration;
            this.lastTranslationCoords.X = this.lastMatrix[12];
            this.lastTranslationCoords.Y = this.lastMatrix[13];
            this.lastTranslationCoords.Z = this.lastMatrix[14];
        } else {
          this.obj.start = false;
        }
        return this.lastMatrix;
    }

    transformOpponent(timeInMilliseconds){
      var diff = timeInMilliseconds - this.startTimeInMilliseconds;
      if(diff > 0 && diff < this.duration) {
          // alreadyTransformed flag is there because once an animation has started, it shouldn't stop anymore
          if(!this.alreadyTransformed){
              this.alreadyTransformed = true;
              this.timeHasSet = true;
          }
          var rotateX = glm.rotateX(this.origin.X + this.target.X*diff/this.duration);
          var rotateY = glm.rotateY(this.origin.Y + this.target.Y*diff/this.duration);
          var rotateZ = glm.rotateZ(this.origin.Z + this.target.Z*diff/this.duration);
          var rotate = mat4.multiply(mat4.create(), rotateX, rotateY);
          rotate = mat4.multiply(mat4.create(), rotate, rotateZ);
          rotate = mat4.multiply(mat4.create(), rotate, glm.scale(0.7,0.7,0.7));
          this.lastMatrix[0]=rotate[0];
          this.lastMatrix[1]=rotate[1];
          this.lastMatrix[5]=rotate[5];
          this.lastMatrix[6]=rotate[6];
          this.lastMatrix[9]=rotate[9];
          this.lastMatrix[10]=rotate[10];
          this.lastMatrix[13]=this.obj - 2*diff/this.duration;
          this.lastTranslationCoords.X = this.lastMatrix[12];
          this.lastTranslationCoords.Y = this.lastMatrix[13];
          this.lastTranslationCoords.Z = this.lastMatrix[14];
      } else {
      }
      return this.lastMatrix;
    }

    transformBullet(timeInMilliseconds){
        var diff = timeInMilliseconds - this.startTimeInMilliseconds;
        if(diff >= 0 && diff < this.duration) {
            if(!this.alreadyTransformed){
                this.alreadyTransformed = true;
                this.timeHasSet = true;
                this.lastMatrix[12] = this.origin.X;
                this.lastMatrix[13] = this.origin.Y;
                this.lastMatrix[14] = this.origin.Z;
                //this.obj.enable = true;
            }
            if(this.curAnimation == 1){
              this.lastMatrix[12]=this.origin.X + this.target.X*diff/this.duration;
              this.lastMatrix[13]=this.origin.Y + this.target.Y*diff/this.duration;
              this.lastMatrix[14]=this.origin.Z + this.target.Z*diff/this.duration;
            }
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
        } else {
          this.lastMatrix[13] = -100;
        }
        return this.lastMatrix;
    }

    transformSoldierGroup(timeInMilliseconds) {
      var diff = timeInMilliseconds - this.startTimeInMilliseconds;
      if(diff > 0 && diff < this.duration) {
          // alreadyTransformed flag is there because once an animation has started, it shouldn't stop anymore
          if(!this.alreadyTransformed){
              this.alreadyTransformed = true;
              this.timeHasSet = true;
              for(var i = 0; i < this.obj.length; i++){
                this.obj[i].children[0].start = true;
              }
          }
          this.lastMatrix[12]=this.origin.X + this.target.X*diff/this.duration;
          this.lastMatrix[13]=this.origin.Y + this.target.Y*diff/this.duration;
          this.lastMatrix[14]=this.origin.Z + this.target.Z*diff/this.duration;
          this.lastTranslationCoords.X = this.lastMatrix[12];
          this.lastTranslationCoords.Y = this.lastMatrix[13];
          this.lastTranslationCoords.Z = this.lastMatrix[14];
      } else {
        for(var i = 0; i < this.obj.length; i++){
          this.obj[i].children[0].start = false;
        }
      }
      return this.lastMatrix;
    }
}
