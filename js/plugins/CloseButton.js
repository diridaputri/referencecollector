//=============================================================================
// CloseButton.js  (v2 - shape options)
//=============================================================================
/*:
 * @plugindesc [v2] Tombol X di pojok kanan atas untuk menutup menu.
 * Bisa pilih bentuk: bulat / kotak / persegi panjang.
 * @author -
 *
 * @param Shape
 * @desc Bentuk tombol. circle = bulat, square = kotak, rounded = kotak sudut tumpul.
 * @type select
 * @option Bulat
 * @value circle
 * @option Kotak
 * @value square
 * @option Kotak sudut tumpul
 * @value rounded
 * @default rounded
 *
 * @param Button Width
 * @desc Lebar tombol (pixel).
 * @type number
 * @default 48
 *
 * @param Button Height
 * @desc Tinggi tombol (pixel). Set sama dengan Width untuk kotak/bulat.
 * @type number
 * @default 48
 *
 * @param Corner Radius
 * @desc Radius sudut tumpul (hanya untuk shape "rounded"). 0-20 disarankan.
 * @type number
 * @default 8
 *
 * @param Margin
 * @desc Jarak tombol dari pinggir layar (pixel).
 * @type number
 * @default 12
 *
 * @param Background Color
 * @desc Warna background. Format rgba(R,G,B,A).
 * @default rgba(0,0,0,0.6)
 *
 * @param Icon Color
 * @desc Warna tanda X. Format rgba(R,G,B,A).
 * @default rgba(255,255,255,1)
 *
 * @param Outline Color
 * @desc Warna outline. Kosongkan untuk tanpa outline.
 * @default rgba(255,255,255,0.4)
 *
 * @param Show In Menu
 * @type boolean
 * @default true
 *
 * @param Show In Item
 * @type boolean
 * @default true
 *
 * @param Show In Status
 * @type boolean
 * @default true
 *
 * @param Show In Options
 * @type boolean
 * @default true
 *
 * @param Show In Save
 * @type boolean
 * @default true
 *
 * @param Show In Load
 * @type boolean
 * @default true
 *
 * @help
 * Tap/klik tombol X = sama dengan tekan Esc.
 *
 * Untuk persegi panjang: set Button Width > Button Height (atau sebaliknya).
 * Contoh: Width 80, Height 40 → tombol persegi panjang horizontal.
 */

(function() {

    var params = PluginManager.parameters('CloseButton');
    var SHAPE     = String(params['Shape'] || 'rounded');
    var BTN_W     = Number(params['Button Width']  || 48);
    var BTN_H     = Number(params['Button Height'] || 48);
    var RADIUS    = Number(params['Corner Radius'] || 8);
    var MARGIN    = Number(params['Margin'] || 12);
    var BG_COLOR  = String(params['Background Color'] || 'rgba(0,0,0,0.6)');
    var FG_COLOR  = String(params['Icon Color']       || 'rgba(255,255,255,1)');
    var OUTLINE   = String(params['Outline Color']    || 'rgba(255,255,255,0.4)');

    var SHOW = {
        Menu:    String(params['Show In Menu']    || 'true') === 'true',
        Item:    String(params['Show In Item']    || 'true') === 'true',
        Status:  String(params['Show In Status']  || 'true') === 'true',
        Options: String(params['Show In Options'] || 'true') === 'true',
        Save:    String(params['Show In Save']    || 'true') === 'true',
        Load:    String(params['Show In Load']    || 'true') === 'true'
    };

    //-------------------------------------------------------------------------
    // Helper: gambar shape sesuai pilihan
    //-------------------------------------------------------------------------
    function drawShape(ctx, w, h) {
        if (SHAPE === 'circle') {
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 2, 0, Math.PI * 2);
        } else if (SHAPE === 'square') {
            ctx.beginPath();
            ctx.rect(2, 2, w - 4, h - 4);
        } else { // rounded
            var r = Math.min(RADIUS, Math.min(w, h) / 2 - 2);
            ctx.beginPath();
            ctx.moveTo(2 + r, 2);
            ctx.lineTo(w - 2 - r, 2);
            ctx.quadraticCurveTo(w - 2, 2, w - 2, 2 + r);
            ctx.lineTo(w - 2, h - 2 - r);
            ctx.quadraticCurveTo(w - 2, h - 2, w - 2 - r, h - 2);
            ctx.lineTo(2 + r, h - 2);
            ctx.quadraticCurveTo(2, h - 2, 2, h - 2 - r);
            ctx.lineTo(2, 2 + r);
            ctx.quadraticCurveTo(2, 2, 2 + r, 2);
            ctx.closePath();
        }
    }

    //-------------------------------------------------------------------------
    // Sprite_CloseButton
    //-------------------------------------------------------------------------
    function Sprite_CloseButton() {
        this.initialize.apply(this, arguments);
    }

    Sprite_CloseButton.prototype = Object.create(Sprite.prototype);
    Sprite_CloseButton.prototype.constructor = Sprite_CloseButton;

    Sprite_CloseButton.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = this.makeBitmap();
        this.x = Graphics.boxWidth - BTN_W - MARGIN;
        this.y = MARGIN;
        // anchor di tengah supaya scale pressed efeknya enak
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.x += BTN_W / 2;
        this.y += BTN_H / 2;
        this._pressed = false;
        this._touching = false;
    };

    Sprite_CloseButton.prototype.makeBitmap = function() {
        var bmp = new Bitmap(BTN_W, BTN_H);
        var ctx = bmp._context;

        // Fill background
        drawShape(ctx, BTN_W, BTN_H);
        ctx.fillStyle = BG_COLOR;
        ctx.fill();

        // Outline (kalau ada)
        if (OUTLINE && OUTLINE.trim() !== '') {
            drawShape(ctx, BTN_W, BTN_H);
            ctx.strokeStyle = OUTLINE;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Tanda X (di tengah)
        var iconSize = Math.min(BTN_W, BTN_H) * 0.4;
        var cx = BTN_W / 2;
        var cy = BTN_H / 2;
        var half = iconSize / 2;
        ctx.beginPath();
        ctx.moveTo(cx - half, cy - half);
        ctx.lineTo(cx + half, cy + half);
        ctx.moveTo(cx + half, cy - half);
        ctx.lineTo(cx - half, cy + half);
        ctx.strokeStyle = FG_COLOR;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (bmp._setDirty) bmp._setDirty();
        if (bmp._baseTexture && bmp._baseTexture.update) bmp._baseTexture.update();
        return bmp;
    };

    Sprite_CloseButton.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updateInput();
        this.scale.x = this._pressed ? 0.9 : 1.0;
        this.scale.y = this._pressed ? 0.9 : 1.0;
    };

    Sprite_CloseButton.prototype.isInside = function(tx, ty) {
        // karena anchor 0.5, hitung dari posisi minus setengah
        var left = this.x - BTN_W / 2;
        var top  = this.y - BTN_H / 2;
        return tx >= left && tx < left + BTN_W && ty >= top && ty < top + BTN_H;
    };

    Sprite_CloseButton.prototype.updateInput = function() {
        if (TouchInput.isTriggered() && this.isInside(TouchInput.x, TouchInput.y)) {
            this._touching = true;
            this._pressed = true;
        }
        if (this._touching) {
            if (TouchInput.isReleased()) {
                this._touching = false;
                this._pressed = false;
                if (this.isInside(TouchInput.x, TouchInput.y)) {
                    SoundManager.playCancel();
                    if (this._handler) this._handler();
                }
            } else if (!TouchInput.isPressed()) {
                this._touching = false;
                this._pressed = false;
            }
        }
    };

    Sprite_CloseButton.prototype.setHandler = function(handler) {
        this._handler = handler;
    };

    //-------------------------------------------------------------------------
    // Inject ke scene
    //-------------------------------------------------------------------------
    function injectCloseButton(scenePrototype) {
        var _create = scenePrototype.create;
        scenePrototype.create = function() {
            _create.call(this);
            if (!Utils.isMobileDevice()) return; // ← tambahkan ini
            this._closeButton = new Sprite_CloseButton();
            this._closeButton.setHandler(this.onCloseButton.bind(this));
            this.addChild(this._closeButton);
        };

        scenePrototype.onCloseButton = function() {
            this.popScene();
        };
    }

    if (SHOW.Menu)    injectCloseButton(Scene_Menu.prototype);
    if (SHOW.Item)    injectCloseButton(Scene_Item.prototype);
    if (SHOW.Status)  injectCloseButton(Scene_Status.prototype);
    if (SHOW.Options) injectCloseButton(Scene_Options.prototype);
    if (SHOW.Save)    injectCloseButton(Scene_Save.prototype);
    if (SHOW.Load)    injectCloseButton(Scene_Load.prototype);

})();