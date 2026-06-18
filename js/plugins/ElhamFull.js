//=============================================================================
// SRD_FullscreenToggleOption_Fixed.js
//=============================================================================

/*:
 * @plugindesc v1.20 Adds a Fullscreen Toggle to Options Window (WITHOUT DISTORTION)
 * @author SumRndmDde (Fixed by Christian Schicho)
 *
 * @param Option Name
 * @desc The name used by the Fullscreen Toggle option.
 * @default Fullscreen
 *
 * @param Position
 * @desc The position of the option in the Options Window.
 * Choices are: Top, Middle, Bottom
 * @default Middle
 *
 * @param Default Value
 * @desc The default value of the option first time playing.
 * true = on    false = off
 * @default false
 *
 * @param Persist Default?
 * @desc If set to true, then the game will always start with the Default Value.  (Choices are: true, false)
 * @default false
 *
 * @param Fullscreen Mode
 * @desc How to display game in fullscreen:
 * Zoom = zoom to fill width (small black bars top/bottom)
 * Crop = crop edges to fill screen (no black bars, no distortion)
 * Letterbox = keep original size (black bars on sides)
 * @default Zoom
 *
 * @help
 * ============================================================================
 * FULLSCREEN WITHOUT DISTORTION - ZOOM & CROP MODE
 * ============================================================================
 * 
 * Masalah "gepeng" SOLVED!
 * 
 * Mode yang tersedia:
 * 
 * 1. ZOOM (Rekomendasi)
 *    - Game diperbesar sampai lebar penuh layar
 *    - Black bar hanya di atas/bawah (tipis)
 *    - TIDAK GEPENG karena rasio tetap
 * 
 * 2. CROP
 *    - Game diperbesar sampai memenuhi seluruh layar
 *    - Bagian atas/bawah game terpotong
 *    - TIDAK GEPENG, fullscreen penuh
 * 
 * 3. LETTERBOX
 *    - Game tetap ukuran asli
 *    - Black bar di kanan/kiri (seperti plugin asli)
 * 
 * ============================================================================
 */

(function () {

	var parameters = PluginManager.parameters('SRD_FullscreenToggleOption_Fixed');
	var optionName = String(parameters['Option Name'] || 'Fullscreen');
	var defaultValue = String(parameters['Default Value']).trim().toLowerCase() === 'true';
	var position = String(parameters['Position']).toLowerCase();
	var persist = String(parameters['Persist Default?']).trim().toLowerCase() === 'true';
	var fullscreenMode = String(parameters['Fullscreen Mode'] || 'Zoom').toLowerCase();

	// Fungsi untuk melakukan scaling tanpa distortion
	function applySmartScaling() {
		try {
			var canvas = Graphics._canvas;
			if (!canvas) return;

			var screenWidth = window.innerWidth;
			var screenHeight = window.innerHeight;
			var gameWidth = Graphics._width;   // 816
			var gameHeight = Graphics._height; // 624

			var gameAspect = gameWidth / gameHeight;      // 1.3077
			var screenAspect = screenWidth / screenHeight;

			// Reset style
			canvas.style.width = '';
			canvas.style.height = '';
			canvas.style.transform = '';
			canvas.style.position = '';
			canvas.style.top = '';
			canvas.style.left = '';
			canvas.style.objectFit = '';

			if (Graphics._isFullScreen()) {
				document.body.style.backgroundColor = '#000000';
				document.body.style.margin = '0';
				document.body.style.padding = '0';
				document.body.style.overflow = 'hidden';

				if (fullscreenMode === 'zoom') {
					// ZOOM MODE: Perbesar sampai lebar penuh, rasio tetap
					var scale = screenWidth / gameWidth;
					var scaledHeight = gameHeight * scale;

					canvas.style.width = screenWidth + 'px';
					canvas.style.height = scaledHeight + 'px';
					canvas.style.position = 'fixed';
					canvas.style.top = ((screenHeight - scaledHeight) / 2) + 'px';
					canvas.style.left = '0';

				} else if (fullscreenMode === 'crop') {
					// CROP MODE: Perbesar sampai penuh, potong kelebihan
					var scale = Math.max(screenWidth / gameWidth, screenHeight / gameHeight);
					var scaledWidth = gameWidth * scale;
					var scaledHeight = gameHeight * scale;

					canvas.style.width = scaledWidth + 'px';
					canvas.style.height = scaledHeight + 'px';
					canvas.style.position = 'fixed';
					canvas.style.top = ((screenHeight - scaledHeight) / 2) + 'px';
					canvas.style.left = ((screenWidth - scaledWidth) / 2) + 'px';

				} else {
					// LETTERBOX MODE: Ukuran asli
					var scale = Math.min(screenWidth / gameWidth, screenHeight / gameHeight);
					var scaledWidth = gameWidth * scale;
					var scaledHeight = gameHeight * scale;

					canvas.style.width = scaledWidth + 'px';
					canvas.style.height = scaledHeight + 'px';
					canvas.style.position = 'fixed';
					canvas.style.top = ((screenHeight - scaledHeight) / 2) + 'px';
					canvas.style.left = ((screenWidth - scaledWidth) / 2) + 'px';
				}
			} else {
				document.body.style.backgroundColor = '';
				document.body.style.overflow = '';
			}

		} catch (e) {
			console.warn("Fullscreen scaling error: " + e.message);
		}
	}

	// Override fungsi fullscreen
	var _requestFullScreen = Graphics._requestFullScreen;
	Graphics._requestFullScreen = function () {
		_requestFullScreen.call(this);
		setTimeout(applySmartScaling, 100);
	};

	var _cancelFullScreen = Graphics._cancelFullScreen;
	Graphics._cancelFullScreen = function () {
		_cancelFullScreen.call(this);
		setTimeout(applySmartScaling, 100);
	};

	var _switchFullScreen = Graphics._switchFullScreen;
	Graphics._switchFullScreen = function () {
		_switchFullScreen.call(this);
		setTimeout(applySmartScaling, 100);
	};

	// Event listeners
	window.addEventListener('resize', function () {
		if (Graphics._isFullScreen()) {
			setTimeout(applySmartScaling, 50);
		}
	});

	document.addEventListener('fullscreenchange', function () {
		setTimeout(applySmartScaling, 100);
	});
	document.addEventListener('webkitfullscreenchange', function () {
		setTimeout(applySmartScaling, 100);
	});
	document.addEventListener('mozfullscreenchange', function () {
		setTimeout(applySmartScaling, 100);
	});

	// Update setiap frame
	var _Graphics_updateFrame = Graphics.updateFrame;
	Graphics.updateFrame = function () {
		_Graphics_updateFrame.call(this);
		if (Graphics._isFullScreen()) {
			applySmartScaling();
		}
	};

	// ========== Config Manager ==========
	ConfigManager.fullscreen = defaultValue;

	Object.defineProperty(ConfigManager, 'fullscreen', {
		get: function () {
			return Graphics._isFullScreen();
		},
		set: function (value) {
			if (value) {
				Graphics._requestFullScreen();
			} else {
				Graphics._cancelFullScreen();
			}
		},
		configurable: true
	});

	var _ConfigManager_makeData = ConfigManager.makeData;
	ConfigManager.makeData = function () {
		var config = _ConfigManager_makeData.call(this);
		config.fullscreen = this.fullscreen;
		return config;
	};

	var _ConfigManager_applyData = ConfigManager.applyData;
	ConfigManager.applyData = function (config) {
		_ConfigManager_applyData.call(this, config);
		this.fullscreen = this.readFullscreen(config, 'fullscreen');
	};

	ConfigManager.readFullscreen = function (config, name) {
		var value = config[name];
		if (!persist) {
			if (value !== undefined) {
				return value;
			} else {
				return defaultValue;
			}
		} else {
			return defaultValue;
		}
	};

	// ========== Window Options ==========
	var _Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
	Window_Options.prototype.addGeneralOptions = function () {
		_Window_Options_addGeneralOptions.call(this);
		if (position === 'middle') {
			this.addCommand(optionName, 'fullscreen');
		}
	};

	var _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
	Window_Options.prototype.makeCommandList = function () {
		if (position === 'top') {
			this.addCommand(optionName, 'fullscreen');
		}
		_Window_Options_makeCommandList.call(this);
	};

	var _Window_Options_addVolumeOptions = Window_Options.prototype.addVolumeOptions;
	Window_Options.prototype.addVolumeOptions = function () {
		_Window_Options_addVolumeOptions.call(this);
		if (position === 'bottom') {
			this.addCommand(optionName, 'fullscreen');
		}
	};

	// ========== Plugin Command ==========
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);

		if (command.toLowerCase() === 'togglescreentype') {
			Graphics._switchFullScreen();
		}

		if (command.toLowerCase() === 'setfullscreenmode') {
			if (args[0] && args[0].toLowerCase() === 'zoom') {
				fullscreenMode = 'zoom';
			} else if (args[0] && args[0].toLowerCase() === 'crop') {
				fullscreenMode = 'crop';
			} else if (args[0] && args[0].toLowerCase() === 'letterbox') {
				fullscreenMode = 'letterbox';
			}
			if (Graphics._isFullScreen()) {
				applySmartScaling();
			}
		}
	};

	// Apply scaling awal
	applySmartScaling();

	// Fix: canvas.offsetTop/offsetLeft selalu 0 untuk position:fixed di Chrome Android.
	// getBoundingClientRect() mengembalikan posisi visual sebenarnya.
	var _pageToCanvasX = Graphics.pageToCanvasX;
	Graphics.pageToCanvasX = function(x) {
		if (this._canvas) {
			var rect = this._canvas.getBoundingClientRect();
			if (rect.width > 0) {
				return Math.round((x - rect.left) / (rect.width / this._width));
			}
		}
		return _pageToCanvasX.call(this, x);
	};

	var _pageToCanvasY = Graphics.pageToCanvasY;
	Graphics.pageToCanvasY = function(y) {
		if (this._canvas) {
			var rect = this._canvas.getBoundingClientRect();
			if (rect.height > 0) {
				return Math.round((y - rect.top) / (rect.height / this._height));
			}
		}
		return _pageToCanvasY.call(this, y);
	};

})();