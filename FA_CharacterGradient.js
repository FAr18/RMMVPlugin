var Imported = Imported || {};
Imported.FA_CharGradient = true;

var FA = FA || {};
FA.CharGradient = FA.CharGradient || {};
FA.CharGradient.version = 1.0;

//=============================================================================
/*:
 * @plugindesc v1.0 Character 不透明度漸變
 * @author FA
 * 
 * @help
 * 對人物使用 opacityGradient 方法可以在接下來進行不透明度的轉變
 * example:
 * 經過60幀後將地圖上ID為1的事件不透明度降為0
 * $gameMap.event(1).opacityGradient(0, 60); 
 * 
 */
//=============================================================================

(function() {

FA.CharGradient.Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function() {
    FA.CharGradient.Game_CharacterBase_initMembers.call(this);
    this._opacityTarget = 0;
    this._opacityCount = 0;
    this._opacityChange = 0;
};


FA.CharGradient.Game_CharacterBase_update = Game_CharacterBase.prototype.update;
Game_CharacterBase.prototype.update = function() {
    if (this.isOpacityChanging()) {
        this.updateOpacity();
    }
    FA.CharGradient.Game_CharacterBase_update.call(this);
};


Game_CharacterBase.prototype.isOpacityChanging = function() {
    return this._opacityCount > 0;
};


Game_CharacterBase.prototype.updateOpacity = function() {
    this._opacityCount--;
    this._opacity += this._opacityChange;
    this._opacity = this._opacity.clamp(0, 255);
};

Game_CharacterBase.prototype.opacityGradient = function(target, frame) {
    if (target === this._opacity) return;
    this._opacityTarget = target.clamp(0, 255);
    this._opacityCount = frame;
    this._opacityChange = (target - this._opacity) / frame;
};

})();