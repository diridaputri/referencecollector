//=============================================================================
// UndertaleStyle.js
//=============================================================================
/*:
 * @plugindesc Style Undertale untuk window message & name box.
 * Background hitam solid, border putih tebal, sudut siku tajam.
 * @author -
 *
 * @param BG Color
 * @desc Warna background window (hitam).
 * @default rgba(0,0,0,1)
 *
 * @param Border Color
 * @desc Warna border (putih).
 * @default rgba(255,255,255,1)
 *
 * @param Border Width
 * @desc Ketebalan border (pixel). Undertale pakai 4-5.
 * @type number
 * @default 4
 *
 * @param Text Color
 * @desc Warna teks (default putih).
 * @default rgba(255,255,255,1)
 *
 * @help
 * Pasang plugin ini di Plugin Manager, set ON.
 * Letakkan di BAWAH YEP_MessageCore di urutan plugin.
 *
 * Plugin meng-override background Window_Message dan Window_NameBox
 * dengan style Undertale: hitam solid, border putih tebal, sudut tajam.
 */

(function() {

    var params = PluginManager.parameters('UndertaleStyle');
    var BG_COLOR     = String(params['BG Color']     || 'rgba(0,0,0,1)');
    var BORDER_COLOR = String(params['Border Color'] || 'rgba(255,255,255,1)');
    var BORDER_W     = Number(params['Border Width'] || 4);
    var TEXT_COLOR   = String(params['Text Color']   || 'rgba(255,255,255,1)');

    //-------------------------------------------------------------------------
    // Helper: gambar background Undertale style (hitam + border putih siku)
    //-------------------------------------------------------------------------
    function drawUndertaleBg(win) {
        win._windowFrameSprite.visible = false;
        win._windowBackSprite.visible = false;
        win._windowSpriteContainer.visible = true;

        var w = win.width;
        var h = win.height;
        if (!win._customBg || win._customBg.width !== w || win._customBg.height !== h) {
            win._customBg = new Bitmap(w, h);
            var ctx = win._customBg._context;

            // Background solid
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, w, h);

            // Border (siku tajam, gak rounded)
            ctx.strokeStyle = BORDER_COLOR;
            ctx.lineWidth = BORDER_W;
            ctx.strokeRect(BORDER_W / 2, BORDER_W / 2, w - BORDER_W, h - BORDER_W);

            if (win._customBg._setDirty) win._customBg._setDirty();
            if (win._customBg._baseTexture && win._customBg._baseTexture.update) {
                win._customBg._baseTexture.update();
            }
        }

        if (!win._customBgSprite) {
            win._customBgSprite = new Sprite();
            win.addChildAt(win._customBgSprite, 0);
        }
        win._customBgSprite.bitmap = win._customBg;
    }

    //-------------------------------------------------------------------------
    // Override Window_Message
    //-------------------------------------------------------------------------
    var _Window_Message_refresh = Window_Message.prototype._refreshAllParts;
    Window_Message.prototype._refreshAllParts = function() {
        _Window_Message_refresh.call(this);
        drawUndertaleBg(this);
    };

    var _Window_Message_resetTextColor = Window_Message.prototype.resetTextColor;
    Window_Message.prototype.resetTextColor = function() {
        this.changeTextColor(TEXT_COLOR);
    };

    //-------------------------------------------------------------------------
    // Override Window_NameBox (YEP_MessageCore)
    //-------------------------------------------------------------------------
    if (typeof Window_NameBox !== 'undefined') {
        var _Window_NameBox_refresh = Window_NameBox.prototype._refreshAllParts;
        Window_NameBox.prototype._refreshAllParts = function() {
            _Window_NameBox_refresh.call(this);
            drawUndertaleBg(this);
        };

        var _Window_NameBox_resetTextColor = Window_NameBox.prototype.resetTextColor;
        Window_NameBox.prototype.resetTextColor = function() {
            this.changeTextColor(TEXT_COLOR);
        };
    }

})();