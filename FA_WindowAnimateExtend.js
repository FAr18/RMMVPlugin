var Imported = Imported || {};
Imported.FA_WAE = true;

var FA = FA || {};
FA.WAE = FA.WAE || {};
FA.WAE.version = 1.0;

/*:
* @plugindesc
* v1.0 視窗動畫功能
* @author FA
* @help
* WindowObject.setAnimate: 立即執行指定的單一動畫效果
* ex. commandWindow.setAnimate("x", 200, 60, 0);
* 即以60幀的時間將 commandWindow 的 x 座標移動到 200
*
* WindowOjbect.setAnimates: 同時執行複數類型的動畫效果
* ex. 
* commandWindow.setAnimates([
*   {type: "x", target: 200, frame: 60, delay: 0},
*   {type: "y", target: 200, frame: 60, delay: 0},
*   {type: "width", target: 400, frame: 60, delay: 0},
*   {type: "height", target: 400, frame: 60, delay: 0},
*   {type: "opacity", target: 122, frame: 60, delay: 0},
* ], true)
*/


//-----------------------------------------------------------------------------
// Window Extend
// 
Window.prototype.setLocation = function(x, y) {
  this.x = x;
  this.y = y;
};

Window.prototype.setSize = function(width, height) {
  if (this._width !== width || this._height !== height) {
    this._width = width;
    this._height = height;
    this._refreshAllParts();
  }
};

//-----------------------------------------------------------------------------
// Window_Base Extend
// 

FA.WAE.Window_Base_initialize = Window_Base.prototype.initialize;
Window_Base.prototype.initialize = function(x, y, width, height, opacity) {
  FA.WAE.Window_Base_initialize.call(this, x, y, width, height);
  this._animateFrame = 0;
  this._animatePlay = false;
  this._animateData = [];
  let _opacity = opacity || 255;
  this.setContentOpacity(_opacity);
  this.updateOriginParams();
};

Window_Base.prototype.updateOriginParams = function() {
  this._originX = this.x;
  this._originY = this.y;
  this._originWidth = this._width;
  this._originHeight = this._height;
  this._originOpacity = this.opacity;
};

/**
 * setup animate data
 * @param {Array} animateData {type, target, frame, dealy}
 * @param {Boolean} direct play animate.
 */
Window_Base.prototype.setAnimates = function(animateData, play) {
  this._animateData = animateData;
  let playAnimate = true;
  if (typeof play == "boolean") playAnimate = play;
  this.updateOriginParams();
  this._animateData.forEach(animate => {
    let delay = animate.delay || 0;
    animate.maxFrame = animate.frame + delay; 
    switch(animate.type) {
      case "x":
        animate.variation = (animate.target - this._originX) / animate.frame;
        break;
      case "y":
        animate.variation = (animate.target - this._originY) / animate.frame;
        break;
      case "width":
        animate.variation = (animate.target - this._originWidth) / animate.frame;
        break;
      case "height":
        animate.variation = (animate.target - this._originHeight) / animate.frame;
        break;
      case "opacity":
        let target = animate.target.clamp(0, 255);
        animate.variation = (target - this._originOpacity) / animate.frame;
        break;
      default:
        animate.variation = 0;
    }
  });
  this._animateFrame = 0;
  this._animatePlay = playAnimate;
};

Window_Base.prototype.setAnimate = function(type, target, frame, delay) {
  delay = delay || 0;
  let obj = {type, target, frame, delay};
  this.setAnimates([obj], true);
}

Window_Base.prototype.setAnimatePlay = function(play) {
  this._animatePlay = play;
};

FA.WAE.Window_Base_update = Window_Base.prototype.update;
Window_Base.prototype.update = function() {
  FA.WAE.Window_Base_update.call(this);
  if (this.isAnimatePlaying()) {
    this.processAnimate();
    if (!this.isAnimateFinished()) this._animateFrame++;
  }
};

Window_Base.prototype.isAnimatePlaying = function() {
  return this._animatePlay;
};

Window_Base.prototype.isAnimateFinished = function() {
  let currentFrame = this._animateFrame;
  return this._animateData.every(animate => {
          return animate.maxFrame <= currentFrame;
      });
};

Window_Base.prototype.processAnimate = function() {
  let newLocation = {x: this._originX, y: this._originY};
  let newSize = {width: this._originWidth, height: this._originHeight};
  let newOpacity = this._originOpacity;
  this._animateData.forEach(animate => {
    if (!animate.type) return;
    let delay = animate.delay || 0;
    let total_variation = animate.variation * Math.max((Math.min(this._animateFrame, animate.maxFrame) - delay), 0);
    switch(animate.type) {
      case "x": newLocation.x = this._originX + total_variation; break;
      case "y": newLocation.y = this._originY + total_variation; break;
      case "width": newSize.width = this._originWidth + total_variation; break;
      case "height": newSize.height = this._originHeight + total_variation; break;
      case "opacity": newOpacity = this._originOpacity + total_variation; break;
    }
  });
  this.move(newLocation.x, newLocation.y, newSize.width, newSize.height);
  this.setContentOpacity(newOpacity);
};

Window_Base.prototype.setContentOpacity = function(opacity) {
  this._windowContentsSprite.opacity = opacity;
  this.opacity = opacity;
};
