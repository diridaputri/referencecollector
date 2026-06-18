//=============================================================================
// MessageWindowCustom.js
//=============================================================================
/*:
 * @plugindesc Window message custom: lebar 70% layar, posisi tengah, face di kanan.
 * @author -
 *
 * @param Width Ratio
 * @desc Lebar window relative ke layar (0.0 - 1.0). 0.7 = 70%.
 * @default 0.7
 *
 * @param Face On Right
 * @desc Posisi face di kanan window (true) atau kiri default (false).
 * @type boolean
 * @default true
 */

(function() {

    var params = PluginManager.parameters('MessageWindowCustom');
    var WIDTH_RATIO   = Number(params['Width Ratio'] || 0.7);
    var FACE_ON_RIGHT = String(params['Face On Right'] || 'true') === 'true';

    //-------------------------------------------------------------------------
    // 1. Override windowWidth: lebar window message jadi 70% layar
    //-------------------------------------------------------------------------
    Window_Message.prototype.windowWidth = function() {
        return Math.floor(Graphics.boxWidth * WIDTH_RATIO);
    };

    //-------------------------------------------------------------------------
    // 2. Override updatePlacement: center window secara horizontal
    //-------------------------------------------------------------------------
    var _Window_Message_updatePlacement = Window_Message.prototype.updatePlacement;
    Window_Message.prototype.updatePlacement = function() {
        _Window_Message_updatePlacement.call(this);
        // center horizontal
        this.x = (Graphics.boxWidth - this.width) / 2;
    };

    //-------------------------------------------------------------------------
    // 3. Face di kanan: override newLineX & drawMessageFace
    //-------------------------------------------------------------------------
    if (FACE_ON_RIGHT) {

        // newLineX: posisi X tempat teks mulai. Default 168 (kalau ada face).
        // Karena face di kanan, teks mulai dari 0 (atau standardPadding).
        Window_Message.prototype.newLineX = function() {
            return 0;
        };

        // Override drawMessageFace: gambar face di kanan
        Window_Message.prototype.drawMessageFace = function() {
            var faceName  = $gameMessage.faceName();
            var faceIndex = $gameMessage.faceIndex();
            var faceWidth = Window_Base._faceWidth;
            // Posisi X face: di paling kanan window
            var x = this.contents.width - faceWidth;
            this.drawFace(faceName, faceIndex, x, 0);
        };

        // Override newPage: text area menyesuaikan, sisakan ruang di kanan untuk face
        var _Window_Message_newPage = Window_Message.prototype.newPage;
        Window_Message.prototype.newPage = function(textState) {
            _Window_Message_newPage.call(this, textState);
            // Set width text supaya gak overlap face
            if ($gameMessage.faceName() !== '') {
                textState.width = this.contents.width - Window_Base._faceWidth - 16;
            }
        };
    }

})();