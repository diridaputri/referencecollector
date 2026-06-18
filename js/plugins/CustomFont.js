//=============================================================================
// CustomFont.js
//=============================================================================
/*:
 * @plugindesc Load font Determination (Undertale) ke semua window.
 * @author -
 *
 * @param Font File
 * @desc Nama file font di folder fonts/ (tanpa .ttf).
 * @default VT323-Regular
 *
 * @param Font Family Name
 * @desc Nama identifier font.
 * @default VT323Custom
 */

(function() {

    var params = PluginManager.parameters('CustomFont');
    var FONT_FILE = String(params['Font File']        || 'VT323-Regular');
    var FONT_NAME = String(params['Font Family Name'] || 'VT323Custom');

    // Load font lewat CSS @font-face
    var style = document.createElement('style');
    style.innerHTML = '@font-face { font-family: "' + FONT_NAME + '"; ' +
                      'src: url("fonts/' + FONT_FILE + '.ttf"); ' +
                      'font-display: block; }';
    document.head.appendChild(style);

    // Preload font via FontFace API supaya ready sebelum scene di-render
    if (window.FontFace) {
        var fontFace = new FontFace(FONT_NAME, 'url(fonts/' + FONT_FILE + '.ttf)');
        fontFace.load().then(function(loaded) {
            document.fonts.add(loaded);
            // Force re-render title screen kalau lagi di title
            if (SceneManager._scene instanceof Scene_Title) {
                SceneManager._scene._gameTitleSprite.bitmap.clear();
                SceneManager._scene.drawGameTitle();
                if (SceneManager._scene._commandWindow) {
                    SceneManager._scene._commandWindow.refresh();
                }
            }
        }).catch(function(err) {
            console.error('Font load failed:', err);
        });
    }

    Window_Base.prototype.standardFontFace = function() {
        return FONT_NAME + ', GameFont, sans-serif';
    };
    // Override ukuran font default untuk semua window
    Window_Base.prototype.standardFontSize = function() {
        return 35; // sesuaikan biar visual setara default 28
    };
    // Override font untuk Title Screen
    var _Window_TitleCommand_standardFontFace = Window_TitleCommand.prototype.standardFontFace;
    Window_TitleCommand.prototype.standardFontFace = function() {
        return FONT_NAME + ', GameFont, sans-serif';
    };
    Window_TitleCommand.prototype.standardFontSize = function() {
        return 35;
    };

    // Override font untuk game title text (tulisan judul game)
    var _Scene_Title_drawGameTitle = Scene_Title.prototype.drawGameTitle;
    Scene_Title.prototype.drawGameTitle = function() {
        var x = 20;
        var y = Graphics.height / 4;
        var maxWidth = Graphics.width - x * 2;
        var text = $dataSystem.gameTitle;
        this._gameTitleSprite.bitmap.fontFace = FONT_NAME + ', GameFont, sans-serif';
        this._gameTitleSprite.bitmap.outlineColor = 'black';
        this._gameTitleSprite.bitmap.outlineWidth = 8;
        this._gameTitleSprite.bitmap.fontSize = 72;
        this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
    };

    // Fix center text vertikal di Window_NameBox dengan baseline offset
    if (typeof Window_NameBox !== 'undefined') {
        var _Window_NameBox_drawTextEx = Window_NameBox.prototype.drawTextEx;
        Window_NameBox.prototype.drawTextEx = function(text, x, y) {
            // Geser y posisi naik beberapa pixel untuk koreksi baseline VT323
            return _Window_NameBox_drawTextEx.call(this, text, x, y - 6);
        };
    }

})();