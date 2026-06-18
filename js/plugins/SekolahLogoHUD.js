//=============================================================================
// SekolahLogoHUD.js
//=============================================================================
/*:
 * @plugindesc Otomatis menampilkan logo sekolah KHUSUS di Title Screen saja.
 * @author -
 *
 * @param Logo Image
 * @desc Nama file logo di folder img/pictures/ (tanpa ekstensi .png).
 * @default logo_sekolah
 *
 * @param Logo Scale
 * @desc Skala ukuran logo (1 = 100%, 0.5 = 50%).
 * @default 0.25
 *
 * @param X Position
 * @desc Jarak dari kiri layar (dalam piksel).
 * @default 20
 *
 * @param Y Position
 * @desc Jarak dari atas layar (dalam piksel).
 * @default 20
 */

(function() {
    var params = PluginManager.parameters('SekolahLogoHUD');
    var LOGO_NAME = String(params['Logo Image'] || 'logo_sekolah');
    var LOGO_SCALE = Number(params['Logo Scale'] || 0.25);
    var LOGO_X = Number(params['X Position'] || 20);
    var LOGO_Y = Number(params['Y Position'] || 20);

    // Helper untuk membuat sprite logo
    function createLogoSprite() {
        var sprite = new Sprite();
        sprite.bitmap = ImageManager.loadPicture(LOGO_NAME);
        sprite.x = LOGO_X;
        sprite.y = LOGO_Y;
        sprite.scale.x = LOGO_SCALE;
        sprite.scale.y = LOGO_SCALE;
        return sprite;
    }

    // TAMPILKAN DI TITLE SCREEN (LAYAR JUDUL)
    var _Scene_Title_start = Scene_Title.prototype.start;
    Scene_Title.prototype.start = function() {
        _Scene_Title_start.call(this);
        this._sekolahLogo = createLogoSprite();
        this.addChild(this._sekolahLogo);
    };

})();