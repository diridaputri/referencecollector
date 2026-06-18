//=============================================================================
// HideGoldWindow.js
//=============================================================================
/*:
 * @plugindesc Menyembunyikan window Gold (jumlah uang) di Menu utama.
 * @author -
 *
 * @param Hide In Menu
 * @desc Sembunyikan Gold window di Scene Menu (menu utama).
 * @type boolean
 * @default true
 *
 * @param Hide In Shop
 * @desc Sembunyikan Gold window di Scene Shop juga? (default: false)
 * @type boolean
 * @default false
 *
 * @help
 * Pasang plugin ini di Plugin Manager, set ON.
 * Tidak ada konfigurasi tambahan yang perlu diatur.
 *
 * Plugin ini hanya menyembunyikan tampilan window Gold,
 * tidak menghapus gold dari sistem. Player tetap punya gold,
 * cuma tidak ditampilkan di menu.
 */

(function() {

    var params = PluginManager.parameters('HideGoldWindow');
    var HIDE_IN_MENU = String(params['Hide In Menu'] || 'true') === 'true';
    var HIDE_IN_SHOP = String(params['Hide In Shop'] || 'false') === 'true';

    if (HIDE_IN_MENU) {
        var _Scene_Menu_createGoldWindow = Scene_Menu.prototype.createGoldWindow;
        Scene_Menu.prototype.createGoldWindow = function() {
            _Scene_Menu_createGoldWindow.call(this);
            this._goldWindow.visible = false;
            this._goldWindow.opacity = 0;
            this._goldWindow.contentsOpacity = 0;
        };
    }

    if (HIDE_IN_SHOP) {
        var _Scene_Shop_createGoldWindow = Scene_Shop.prototype.createGoldWindow;
        Scene_Shop.prototype.createGoldWindow = function() {
            _Scene_Shop_createGoldWindow.call(this);
            this._goldWindow.visible = false;
        };
    }

})();
