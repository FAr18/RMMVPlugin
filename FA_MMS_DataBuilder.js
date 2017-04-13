//=============================================================================
// FA Magic Mark System - DataBuilder
// FA_MMS_DataBuilder.js
//=============================================================================

var Imported = Imported || {};
Imported.FA_MMS_DataBuilder = true;

var FA = FA || {};
FA.MMS_DataBuilder = FA.MMS_DataBuilder || {};
FA.MMS_DataBuilder.version = 0.1;
//=============================================================================
/*: 
 *	建立的棋盤為尖頂六邊形
 *	待解決問題:座標系與其相關的定位方法
 *	可能需要重寫大部分程式碼
 *	
 *	
 */
//=============================================================================
// Parameter Variables
//=============================================================================

//=============================================================================
// Game_Interpreter
//=============================================================================

var panelSize = 3;
FA.MMS_DataBuilder._Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	FA.MMS_DataBuilder._Game_Interpreter_pluginCommand.call(this, command, args);
	if (command == 'FA_MMS_DataBuilder') {
		switch (args[0]){
			case 'open':
				panelSize = Number(args[1]);
				SceneManager.push(Scene_MMS_Builder);
			break;
			
		}
	}
};


//=============================================================================
// Scene_MMS_Builder
//=============================================================================

function Scene_MMS_Builder() {
	this.initialize.apply(this, arguments);
}

Scene_MMS_Builder.prototype = Object.create(Scene_MenuBase.prototype);
Scene_MMS_Builder.prototype.constructor = Scene_MMS_Builder;

Scene_MMS_Builder.prototype.initialize = function() {
	Scene_MenuBase.prototype.initialize.call(this);
};

Scene_MMS_Builder.prototype.create = function() {
	Scene_MenuBase.prototype.create.call(this);
	
	this._builderWindow = new Window_MMS_Builder(panelSize);
	this.addWindow(this._builderWindow);
};

Scene_MMS_Builder.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
};

Scene_MMS_Builder.prototype.update = function() {
	Scene_MenuBase.prototype.update.call(this);
	
	if ( TouchInput.isCancelled() ||Input.isTriggered('cancel')) {
		SoundManager.playCancel();
		SceneManager.goto(Scene_Map);
	}
	
}
//=============================================================================
// Window_MMS_Builder
//=============================================================================

function Window_MMS_Builder() {
    this.initialize.apply(this, arguments);
}

Window_MMS_Builder.prototype = Object.create(Window_Base.prototype);
Window_MMS_Builder.prototype.constructor = Window_MMS_Builder;

Window_MMS_Builder.prototype.initialize = function(sideLength) {
    Window_Base.prototype.initialize.call(this, 0, 0, Graphics.boxWidth, Graphics.boxHeight);
    //this.refresh();
	this._sideLength = sideLength;
	this.createSlots();
	this.placeSlots();
};

Window_MMS_Builder.prototype.refresh = function() {
    var x = this.textPadding();
    var width = this.contents.width - this.textPadding() * 2;
    this.contents.clear();
	
};

Window_MMS_Builder.prototype.open = function() {
    this.refresh();
    Window_Base.prototype.open.call(this);
};

Window_MMS_Builder.prototype.sideLength = function() {
	return this._sideLength;
};

Window_MMS_Builder.prototype.numberOfSlot = function() {
	var sum = 0;
	var r = this._sideLength;
	var i = 0;
	for (i = 0; i < r; i++) {
		sum += r + i;
	}
	for (i = r - 2; i >= 0; i--) {
		sum += r + i;
	}
	return sum;
};

Window_MMS_Builder.prototype.createSlots = function() {
	var bitmap = ImageManager.loadSystem('hexagon');
	this._slots = [];
	for(var i = 0; i < this.numberOfSlot(); i++) {
		var slot = new Sprite_MM_Slot();
		slot.bitmap = bitmap;
		slot._slotId = i;
		slot._slotStatus = 0;
		slot.setColdFrame(0, 0, slot.slotWidth(), slot.slotHeight());
		slot.setHotFrame(0, 0, slot.slotWidth(), slot.slotHeight());
		this._slots.push(slot);
		this.addChild(slot);
	}
};


Window_MMS_Builder.prototype.placeSlots = function() {
	var a = Sprite_MM_Slot.prototype.sideLength();	//六邊形的邊長
	var sL = this.sideLength();						//每邊六邊形個數
	var r = 4 * sL - 3;								//橫排總數(縱向最大六邊形個數)
	var lr = r - sL + 1;							//六邊形其中五個頂點所圍範圍的列數
	var ySpacing = Math.sqrt(3) * (a / 2);			//縱向間距(六邊形中心點到邊的最小距離)
	var xSpacing = 3 * a;							//橫向間距(六邊形x軸起點到下一六邊形x軸起點距離)
	var xLeft = 1.5 * a;							//左邊空白單位間距
	var i, j;
	var index = 0;
	var locationY = 20;								//y軸起點
	var baseX = Graphics.boxWidth / 2 - (sL - 1) * xLeft - a;//最左點
	for (i = 1; i <= r; i++) {
		var x = baseX;
		var xr = 0;									//該列個數
		if (i < sL) {
			x = baseX + (sL - i) * xLeft;
			xr = i;
		} else if (i > lr) {
			x = baseX + (i - lr) * xLeft;
			xr = r - i + 1;
		} else { 
			x = ((i - sL) % 2 == 0) ? baseX : baseX + xLeft;
			xr = ((i - sL) % 2 == 0) ? sL : sL - 1;
		}
		for (j = 0; j < xr; j++) {
			var slot = this._slots[index];
			slot.x = x;
			slot.y = locationY;
			x += xSpacing;
			index++;
		}
		locationY += ySpacing;
	}
};

//=============================================================================
// Sprite_MM_Slot
//=============================================================================

function Sprite_MM_Slot() {
	this.initialize.apply(this, arguments);
}

Sprite_MM_Slot.prototype = Object.create(Sprite_Button.prototype);
Sprite_MM_Slot.prototype.constructor = Sprite_MM_Slot;

Sprite_MM_Slot.prototype.initialize = function() {
	Sprite_Button.prototype.initialize.call(this);
	this._slotStatus = 0;
	this._slotId = 0;
	this._clickHandler = function(){
		this._slotStatus++;
		if (this._slotStatus > this.maxStatus()) {
			this._slotStatus = 0;
		}
		this.updateImage();
	};
};

Sprite_MM_Slot.prototype.maxStatus = function() {
	return 2;
};

Sprite_MM_Slot.prototype.updateImage = function() {
	if (!this.bitmap){
		this.createImage();
	}
	var x = this.slotWidth() * this._slotStatus;
	this.setColdFrame(x, 0, this.slotWidth(), this.slotHeight());
	this.setHotFrame(x, 0, this.slotWidth(), this.slotHeight());
};

Sprite_MM_Slot.prototype.slotWidth = function() {
	return 50;
};

Sprite_MM_Slot.prototype.slotHeight = function() {
	return 50;
};

Sprite_MM_Slot.prototype.sideLength = function() {
	return 25;
}

/*
更改為判斷點在正六邊形內(flat topped)
*/
Sprite_MM_Slot.prototype.isButtonTouched = function() {
	var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
	var a = this.sideLength();//邊長
	
	//將正六邊形中心點作為原點
	var nX = Math.abs(x - a);
	var nY = Math.abs(y - a);
	
	if (nX >= a || nY >= Math.sqrt(3) * (a / 2)) {
		return false;
	} else {
		if (a - nX > nY / Math.sqrt(3)) {
			return true;
		} else {
			return false;
		}
	}
};



































