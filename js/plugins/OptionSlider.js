//=============================================================================
// OptionsSlider.js
//=============================================================================
/*:
 * @plugindesc Menu Options custom: cuma BGM (Musik) & BGS (SFX), dengan
 * slider visual. Label di atas, slider di bawah. Drag knob untuk ubah volume.
 * @author -
 *
 * @param BGM Label
 * @desc Label untuk BGM Volume.
 * @default Musik
 *
 * @param BGS Label
 * @desc Label untuk BGS Volume.
 * @default Efek Suara (SFX)
 *
 * @param Track Color
 * @desc Warna track slider (background bar).
 * @default rgba(80,80,80,0.8)
 *
 * @param Fill Color
 * @desc Warna isi slider (bagian yang sudah ter-fill).
 * @default rgba(120,200,255,1)
 *
 * @param Knob Color
 * @desc Warna knob (bulatan yang bisa di-drag).
 * @default rgba(255,255,255,1)
 *
 * @param Knob Size
 * @desc Diameter knob (pixel).
 * @type number
 * @default 22
 *
 * @param Track Height
 * @desc Ketebalan track slider (pixel).
 * @type number
 * @default 8
 *
 * @help
 * Pasang plugin ini di Plugin Manager, set ON.
 * Hilangkan plugin OptionsCustom.js sebelumnya kalau ada (set OFF).
 *
 * Hanya BGM (Musik) dan BGS (SFX) yang tampil di Options.
 * Player drag knob di slider untuk ubah volume.
 * Tap di slider juga bisa untuk pindah ke posisi itu.
 */

(function() {

//Taruh roundrect
    function roundRect(ctx, x, y, w, h, r) {
        r = Math.min(r, h / 2, w / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    var params = PluginManager.parameters('OptionsSlider');
    var BGM_LABEL    = String(params['BGM Label']    || 'Musik');
    var BGS_LABEL    = String(params['BGS Label']    || 'Efek Suara (SFX)');
    var TRACK_COLOR  = String(params['Track Color']  || 'rgba(80,80,80,0.8)');
    var FILL_COLOR   = String(params['Fill Color']   || 'rgba(120,200,255,1)');
    var KNOB_COLOR   = String(params['Knob Color']   || 'rgba(255,255,255,1)');
    var KNOB_SIZE    = Number(params['Knob Size']    || 25);
    var TRACK_HEIGHT = Number(params['Track Height'] || 15);

    var ROW_HEIGHT = 64; // tinggi tiap row (label + slider)
    var LABEL_HEIGHT = 28;

    //-------------------------------------------------------------------------
    // 1. Override addGeneralOptions & addVolumeOptions
    //-------------------------------------------------------------------------
    Window_Options.prototype.addGeneralOptions = function() {
        // kosong
    };

    Window_Options.prototype.addVolumeOptions = function() {
        this.addCommand(BGM_LABEL, 'bgmVolume');
        this.addCommand(BGS_LABEL, 'bgsVolume');
    };

    //-------------------------------------------------------------------------
    // 2. Tinggi tiap item dibesarkan supaya muat label + slider
    //-------------------------------------------------------------------------
    Window_Options.prototype.itemHeight = function() {
        return ROW_HEIGHT;
    };

    //-------------------------------------------------------------------------
    // Override tinggi window Options supaya semua item kelihatan tanpa scroll
    //-------------------------------------------------------------------------
    Window_Options.prototype.windowHeight = function() {
        return this.fittingHeight(this.numVisibleRows());
    };

    Window_Options.prototype.numVisibleRows = function() {
        return Math.min(this.maxItems(), 8); // max 8 row tanpa scroll
    };

    //-------------------------------------------------------------------------
    // Posisi & ukuran Scene_Options window
    //-------------------------------------------------------------------------
    Scene_Options.prototype.createOptionsWindow = function() {
        this._optionsWindow = new Window_Options();
        this._optionsWindow.setHandler('cancel', this.popScene.bind(this));
        var win = this._optionsWindow;
        var h = (win.maxItems() * win.itemHeight()) + (win.standardPadding() * 2);
        win.height = h;
        win.x = (Graphics.boxWidth - win.width) / 2;
        win.y = (Graphics.boxHeight - h) / 2;
        win._refreshAllParts();
        win.refresh();
        this.addWindow(win);
    };    

    //-------------------------------------------------------------------------
    // 3. Override drawItem: gambar label di atas, slider di bawah
    //-------------------------------------------------------------------------
    Window_Options.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var symbol = this.commandSymbol(index);
        var value  = this.getConfigValue(symbol);

        // Gambar label di atas
        this.resetTextColor();
        this.changePaintOpacity(true);
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'left');

       // Gambar slider di bawah label (kasih margin kiri-kanan biar knob gak kepotong)
       var sliderMargin = KNOB_SIZE / 2 + 2;
       var trackY = rect.y + LABEL_HEIGHT + (ROW_HEIGHT - LABEL_HEIGHT - TRACK_HEIGHT) / 2 - 4;
       this.drawSlider(rect.x + sliderMargin, trackY, rect.width - sliderMargin * 2, value);
    };

    Window_Options.prototype.drawSlider = function(x, y, width, value) {
        var ctx = this.contents._context;
        var isOn = value > 0; // ON kalau volume > 0, OFF kalau 0

        // Ukuran switch
        var switchW = 60;
        var switchH = 28;
        var radius = switchH / 2;

        // Posisi switch (di kanan area)
        var switchX = x + width - switchW;
        var switchY = y - 8;

        // Background track (rounded full = pill shape)
        ctx.fillStyle = isOn ? FILL_COLOR : TRACK_COLOR;
        roundRect(ctx, switchX, switchY, switchW, switchH, radius);
        ctx.fill();

        // Knob (bulatan)
        var knobR = (switchH - 6) / 2;
        var knobX = isOn ? (switchX + switchW - knobR - 3) : (switchX + knobR + 3);
        var knobY = switchY + switchH / 2;
        ctx.beginPath();
        ctx.arc(knobX, knobY, knobR, 0, Math.PI * 2);
        ctx.fillStyle = KNOB_COLOR;
        ctx.fill();

        if (this.contents._setDirty) this.contents._setDirty();
        if (this.contents._baseTexture && this.contents._baseTexture.update) {
            this.contents._baseTexture.update();
        }
    };
    //-------------------------------------------------------------------------
    // 4. Handle touch/drag pada slider
    //-------------------------------------------------------------------------
    var _Window_Options_processTouch = Window_Options.prototype.processTouch;
    Window_Options.prototype.processTouch = function() {
        if (!this.active || this._touchCooldown > 0) {
            if (this._touchCooldown > 0) this._touchCooldown--;
            return;
        }

        if (TouchInput.isTriggered()) {
            var localX = this.canvasToLocalX(TouchInput.x);
            var localY = this.canvasToLocalY(TouchInput.y);
            var index  = this.hitTest(localX, localY);
            if (index >= 0) {
                var symbol = this.commandSymbol(index);
                if (symbol === 'bgmVolume' || symbol === 'bgsVolume') {
                    var current = this.getConfigValue(symbol);
                    var newValue = current > 0 ? 0 : 100;
                    this.changeValue(symbol, newValue);
                    SoundManager.playCursor();
                    this.select(index);
                    this._touchCooldown = 10; // cooldown ~10 frame
                    return;
                }
            }
        }

        _Window_Options_processTouch.call(this);
    };

    //-------------------------------------------------------------------------
    // 5. Override processOk: toggle slider saat tekan Enter
    //-------------------------------------------------------------------------
    Window_Options.prototype.processOk = function() {
        var index = this.index();
        if (index >= 0) {
            var symbol = this.commandSymbol(index);
            if (symbol === 'bgmVolume' || symbol === 'bgsVolume') {
                var current = this.getConfigValue(symbol);
                var newValue = current > 0 ? 0 : 100;
                this.changeValue(symbol, newValue);
                SoundManager.playCursor();
                return;
            }
        }
        Window_Command.prototype.processOk.call(this);
    };

    //-------------------------------------------------------------------------
    // 6. Disable cursorLeft & cursorRight default (yang biasa naik/turun volume)
    //-------------------------------------------------------------------------
    Window_Options.prototype.cursorLeft = function() {
        var index = this.index();
        if (index >= 0) {
            var symbol = this.commandSymbol(index);
            if (symbol === 'bgmVolume' || symbol === 'bgsVolume') {
                var current = this.getConfigValue(symbol);
                var newValue = current > 0 ? 0 : 100;
                this.changeValue(symbol, newValue);
                SoundManager.playCursor();
            }
        }
    };

    Window_Options.prototype.cursorRight = function() {
        this.cursorLeft();
    };

})();