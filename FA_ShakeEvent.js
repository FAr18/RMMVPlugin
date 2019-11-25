var Imported = Imported || {};
Imported.FA_ShakeEvent = true;

var FA = FA || {};
FA.ShakeEvent = FA.ShakeEvent || {};
FA.ShakeEvent.version = 1.0;

//=============================================================================
 /*:
 * @plugindesc 
 * v1.0 搖晃人物
 * @author FA
 * @help
 * 對character物件使用shake(寬度, 高度, 持續時間)方法即可
 * 寬度:左右搖動的距離
 * 高度:上下搖動的距離
 * 持續時間: 持續的時間(幀數)
 * 搖晃速度依據該物件的移動速度(moveSpeed)
 *
 * Examples:
 * $gamePlayer.shake(4, 0, 60);
 * $gameMap.events()[0].shake(0, 10, 12);
 * $gameMap.event(1).shake(5, 0, 35);
 *
 */
//=============================================================================

FA.ShakeEvent.Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function() {
	FA.ShakeEvent.Game_CharacterBase_initMembers.call(this);
	this._shakeCount = 0;
	this._shakeXShift = 0;
	this._shakeXShiftDirection = 1;
	this._shakeYShift = 0;
	this._shakeYShiftDirection = 1;
	this._shakeWidth = 0;
	this._shakeHeight = 0;
}


Game_CharacterBase.prototype.shake = function(width, height, time) {
	this._shakeWidth = width;
	this._shakeHeight = height;
	this._shakeCount = time;
	this._shakeXShiftDirection = this._moveSpeed;
	this._shakeYShiftDirection = this._moveSpeed;
	
	this.resetStopCount();
	this.straighten();

}

Game_CharacterBase.prototype.isShaking = function() {
	return this._shakeCount > 0;
}

Game_CharacterBase.prototype.updateShake = function() {
	this._shakeCount--;
	
	if (this._shakeWidth > 0) {
		this._shakeXShift += this._shakeXShiftDirection;
		if (Math.abs(this._shakeXShift) >= (this._shakeWidth / 2)) 
			this._shakeXShiftDirection *= -1;
	}
	
	if (this._shakeHeight > 0) {
		this._shakeYShift += this._shakeYShiftDirection;
		if (Math.abs(this._shakeYShift) >= (this._shakeHeight / 2)) 
			this._shakeYShiftDirection *= -1;
	}
	
	if (this._shakeCount === 0) {
		this._shakeXShift = 0;
		this._shakeYShift = 0;
    }
}

FA.ShakeEvent.Game_CharacterBase_update = Game_CharacterBase.prototype.update;
Game_CharacterBase.prototype.update = function() {
	if (this.isShaking()) {
		this.updateShake();
	}
	FA.ShakeEvent.Game_CharacterBase_update.call(this);
}

FA.ShakeEvent.Game_CharacterBase_screenX = Game_CharacterBase.prototype.screenX;
Game_CharacterBase.prototype.screenX = function() {
    var tw = $gameMap.tileWidth();
    return Math.round(this.scrolledX() * tw + tw / 2 + this._shakeXShift);
}

FA.ShakeEvent.Game_CharacterBase_screenY = Game_CharacterBase.prototype.screenY;
Game_CharacterBase.prototype.screenY = function() {
    var th = $gameMap.tileHeight();
    return Math.round(this.scrolledY() * th + th -
                      this.shiftY() - this.jumpHeight() - this._shakeYShift);
};

