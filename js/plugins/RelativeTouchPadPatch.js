//=============================================================================
// RelativeTouchPadPatch.js  (v3 - fixed bitmap refresh)
//=============================================================================
/*:
 * @plugindesc [v3] Patch RelativeTouchPad: dash off, joystick selalu tampil,
 * warna custom, knob ukuran konsisten.
 * @author -
 *
 * @param Disable Dash
 * @type boolean
 * @default true
 *
 * @param Always Show Pad
 * @type boolean
 * @default true
 *
 * @param Idle Pad X
 * @type number
 * @default 130
 *
 * @param Idle Pad Y
 * @type number
 * @default 500
 *
 * @param Idle Opacity
 * @type number
 * @min 0
 * @max 255
 * @default 120
 *
 * @param Pad Color
 * @desc Warna pad. Format: rgba(R,G,B,A)
 * @default rgba(50,50,50,0.5)
 *
 * @param Arrow Color
 * @desc Warna knob. Format: rgba(R,G,B,A)
 * @default rgba(255,255,255,0.95)
 *
 * @param Knob Size
 * @desc Diameter knob (lingkaran kecil yang ikut jari).
 * @type number
 * @default 32
 *
 * @help
 * Pasang SETELAH RelativeTouchPad.js.
 */

(function() {

    var pluginName = 'RelativeTouchPadPatch';
    var params = PluginManager.parameters(pluginName);

    var DISABLE_DASH = String(params['Disable Dash'] || 'true') === 'true';
    var ALWAYS_SHOW  = String(params['Always Show Pad'] || 'true') === 'true';
    var IDLE_X       = Number(params['Idle Pad X']    || 130);
    var IDLE_Y       = Number(params['Idle Pad Y']    || 500);
    var IDLE_OPACITY = Number(params['Idle Opacity']  || 120);
    var PAD_COLOR    = String(params['Pad Color']     || 'rgba(50,50,50,0.5)');
    var ARROW_COLOR  = String(params['Arrow Color']   || 'rgba(255,255,255,0.95)');
    var KNOB_SIZE    = Number(params['Knob Size']     || 32);

    console.log('[RelativeTouchPadPatch] Loaded. PadColor=' + PAD_COLOR + ' ArrowColor=' + ARROW_COLOR);

    //-------------------------------------------------------------------------
    // Helper: bikin bitmap lingkaran dengan warna & outline
    //-------------------------------------------------------------------------
    function makeCircleBitmap(size, fillColor, outlineColor, outlineWidth) {
        var bmp = new Bitmap(size, size);
        var ctx = bmp._context;
        var r = size / 2;
        // Fill
        ctx.beginPath();
        ctx.arc(r, r, r - outlineWidth, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        // Outline
        if (outlineColor && outlineWidth > 0) {
            ctx.beginPath();
            ctx.arc(r, r, r - outlineWidth, 0, Math.PI * 2);
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = outlineWidth;
            ctx.stroke();
        }
        // Refresh texture — coba berbagai cara untuk kompatibilitas MV
        if (bmp._setDirty) bmp._setDirty();
        if (bmp._baseTexture && bmp._baseTexture.update) bmp._baseTexture.update();
        return bmp;
    }

    //-------------------------------------------------------------------------
    // 1. Disable dash
    //-------------------------------------------------------------------------
    if (DISABLE_DASH) {
        Game_Player.prototype.updateDashing = function() {
            if (this._moveTarget) { this._dashing = false; return; }
            if ($gameMap.isDashDisabled() || !this.canMove() || this.isInVehicle()) {
                this._dashing = false; return;
            }
            this._dashing = this.isDashButtonPressed();
        };
    }

    //-------------------------------------------------------------------------
    // 2. Override sprite pad/arrow: warna, ukuran knob konsisten, idle visible
    //-------------------------------------------------------------------------
    var _Spriteset_Map_createRelativePad = Spriteset_Map.prototype.createRelativePad;
    Spriteset_Map.prototype.createRelativePad = function() {
        _Spriteset_Map_createRelativePad.call(this);
        // Sembunyikan touchpad di PC, hanya tampil di mobile
        if (!Utils.isMobileDevice()) {
            this._relativePadSprite.visible = false;
            return;
        }
        
        var sprite = this._relativePadSprite;
        if (!sprite) {
            console.warn('[RelativeTouchPadPatch] Sprite not found');
            return;
        }

        // === Replace bitmap pad ===
        var padSize = 240;
        sprite.bitmap = makeCircleBitmap(padSize, PAD_COLOR, 'rgba(255,255,255,0.7)', 2);
        console.log('[RelativeTouchPadPatch] Pad bitmap replaced');

        // === Replace bitmap knob ===
        if (sprite._arrowSprite) {
            // Bikin bitmap kotak yang muat knob, knob di tengah
            var knobBmpSize = padSize;
            var knobBmp = new Bitmap(knobBmpSize, knobBmpSize);
            var kctx = knobBmp._context;
            var kr = KNOB_SIZE / 2;
            var kcx = knobBmpSize / 2;
            var kcy = knobBmpSize / 2;
            // Fill knob
            kctx.beginPath();
            kctx.arc(kcx, kcy, kr - 1, 0, Math.PI * 2);
            kctx.fillStyle = ARROW_COLOR;
            kctx.fill();
            // Outline knob
            kctx.beginPath();
            kctx.arc(kcx, kcy, kr - 1, 0, Math.PI * 2);
            kctx.strokeStyle = 'rgba(0,0,0,0.6)';
            kctx.lineWidth = 2;
            kctx.stroke();
            if (knobBmp._setDirty) knobBmp._setDirty();
            if (knobBmp._baseTexture && knobBmp._baseTexture.update) knobBmp._baseTexture.update();
            sprite._arrowSprite.bitmap = knobBmp;
            console.log('[RelativeTouchPadPatch] Knob bitmap replaced');
        }

        // === Override updateArrowSprite: knob ukuran konsisten ===
        sprite.updateArrowSprite = function() {
            var pad = $gameTemp.getRelativeTouchPad();
            if (pad.isDistanceZero()) {
                this._arrowSprite.visible = false;
            } else {
                this._arrowSprite.visible = true;
                this._arrowSprite.scale.x = 1.0;
                this._arrowSprite.scale.y = 1.0;
                this._arrowSprite.opacity = 255;
                this._arrowSprite.rotation = 0;

                // Hitung posisi knob langsung dari delta jari (bukan dari rotation)
                // deltaX/deltaY dari Game_Relative_Pad: neutral - current, jadi kita
                // balik tandanya supaya knob bergerak SEARAH dengan jari.
                var dx = -pad.getDeltaX(); // jari ke kanan = knob ke kanan
                var dy = -pad.getDeltaY(); // jari ke bawah = knob ke bawah
                var dist = Math.sqrt(dx * dx + dy * dy);

                // Posisi knob mengikuti arah; bisa keluar setengah dari pad
                var maxRadius = this.bitmap.width / 2;
                if (dist > maxRadius) {
                    dx = dx * maxRadius / dist;
                    dy = dy * maxRadius / dist;
                }
                this._arrowSprite.x = dx;
                this._arrowSprite.y = dy;
            }
        };

        // === Always show pad ===
        if (ALWAYS_SHOW) {
            sprite.x = IDLE_X;
            sprite.y = IDLE_Y;
            sprite.opacity = IDLE_OPACITY;
            sprite.visible = true;
            sprite.scale.x = 1.0;
            sprite.scale.y = 1.0;

            var origUpdate = Object.getPrototypeOf(sprite).update.bind(sprite);
            sprite.update = function() {
                // Sembunyikan total jika berada di Map ID 3
                if ($gameMap.mapId() === 3) {
                    this.visible = false;
                    if (this._arrowSprite) this._arrowSprite.visible = false;
                    return; 
                }

                var pad = $gameTemp.getRelativeTouchPad();
                if (!pad.isActive()) {
                    this.visible = true;
                    this.opacity = IDLE_OPACITY;
                    this.x = IDLE_X;
                    this.y = IDLE_Y;
                    this.scale.x = 1.0;
                    this.scale.y = 1.0;
                    this._padActive = false;
                    if (this._arrowSprite) this._arrowSprite.visible = false;
                } else {
                    origUpdate();
                }
            };
        }
    };

})();
