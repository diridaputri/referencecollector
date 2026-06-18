//=============================================================================
// MessageWindowNeoDark.js
//=============================================================================
/*:
 * @plugindesc Style Neo Dark untuk window message & name box (Hades/Disco Elysium vibe).
 * @author -
 *
 * @param BG Color
 * @desc Warna background window (dark navy).
 * @default rgba(26,29,46,0.96)
 *
 * @param Border Color
 * @desc Warna border window (abu kebiruan).
 * @default rgba(74,74,106,1)
 *
 * @param Text Color
 * @desc Warna teks pesan utama (krem hangat).
 * @default rgba(232,227,208,1)
 *
 * @param Name Text Color
 * @desc Warna teks name box (kuning emas).
 * @default rgba(255,208,122,1)
 *
 * @param Border Width
 * @desc Ketebalan border (pixel).
 * @type number
 * @default 2
 *
 * @param Corner Radius
 * @desc Kelengkungan sudut window.
 * @type number
 * @default 4
 *
 * @help
 * Plugin ini meng-override gambar background & border Window_Message dan
 * Window_NameBox (dari YEP_MessageCore) dengan style Neo Dark.
 *
 * Pasang plugin di Plugin Manager, set ON. Letakkan plugin ini di BAWAH
 * YEP_MessageCore di urutan Plugin Manager.
 */

(function() {

    var params = PluginManager.parameters('MessageWindowNeoDark');
    var BG_COLOR     = String(params['BG Color']        || 'rgba(26,29,46,0.96)');
    var BORDER_COLOR = String(params['Border Color']    || 'rgba(74,74,106,1)');
    var TEXT_COLOR   = String(params['Text Color']      || 'rgba(232,227,208,1)');
    var NAME_COLOR   = String(params['Name Text Color'] || 'rgba(255,208,122,1)');
    var BORDER_W     = Number(params['Border Width']    || 2);
    var RADIUS       = Number(params['Corner Radius']   || 4);

    //-------------------------------------------------------------------------
    // Helper: rounded rect
    //-------------------------------------------------------------------------
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

    //-------------------------------------------------------------------------
    // Helper: gambar background window custom
    //-------------------------------------------------------------------------
    function drawNeoDarkBg(win) {
        // Hide windowskin default
        win._windowFrameSprite.visible = false;
        win._windowBackSprite.visible = false;
        win._windowSpriteContainer.visible = true;

        // Bikin custom bitmap untuk background
        var w = win.width;
        var h = win.height;
        if (!win._customBg || win._customBg.width !== w || win._customBg.height !== h) {
            win._customBg = new Bitmap(w, h);
            var ctx = win._customBg._context;

            // Background fill
            ctx.fillStyle = BG_COLOR;
            roundRect(ctx, BORDER_W / 2, BORDER_W / 2, w - BORDER_W, h - BORDER_W, RADIUS);
            ctx.fill();

            // Border
            ctx.strokeStyle = BORDER_COLOR;
            ctx.lineWidth = BORDER_W;
            roundRect(ctx, BORDER_W / 2, BORDER_W / 2, w - BORDER_W, h - BORDER_W, RADIUS);
            ctx.stroke();

            if (win._customBg._setDirty) win._customBg._setDirty();
            if (win._customBg._baseTexture && win._customBg._baseTexture.update) {
                win._customBg._baseTexture.update();
            }
        }

        // Apply ke sprite background
        if (!win._customBgSprite) {
            win._customBgSprite = new Sprite();
            win.addChildAt(win._customBgSprite, 0);
        }
        win._customBgSprite.bitmap = win._customBg;
    }

    //-------------------------------------------------------------------------
    // 1. Override Window_Message: background + text color
    //-------------------------------------------------------------------------
    var _Window_Message_refresh = Window_Message.prototype._refreshAllParts;
    Window_Message.prototype._refreshAllParts = function() {
        _Window_Message_refresh.call(this);
        drawNeoDarkBg(this);
    };

    var _Window_Message_resetTextColor = Window_Message.prototype.resetTextColor;
    Window_Message.prototype.resetTextColor = function() {
        this.changeTextColor(TEXT_COLOR);
    };

    //-------------------------------------------------------------------------
    // 2. Override Window_NameBox (YEP_MessageCore): background + text color
    //-------------------------------------------------------------------------
    if (typeof Window_NameBox !== 'undefined') {
        var _Window_NameBox_refresh = Window_NameBox.prototype._refreshAllParts;
        Window_NameBox.prototype._refreshAllParts = function() {
            _Window_NameBox_refresh.call(this);
            drawNeoDarkBg(this);
        };

        var _Window_NameBox_resetTextColor = Window_NameBox.prototype.resetTextColor;
        Window_NameBox.prototype.resetTextColor = function() {
            this.changeTextColor(NAME_COLOR);
        };
    }

})();