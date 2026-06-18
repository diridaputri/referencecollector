//=============================================================================
// HideHpMp.js
//=============================================================================
/*:
 * @plugindesc Menyembunyikan HP bar, MP bar, dan angka HP/MP di semua window
 * (menu utama, status, dll). TP tidak terpengaruh.
 * @author -
 *
 * @param Hide HP
 * @desc Sembunyikan HP bar & angka HP.
 * @type boolean
 * @default true
 *
 * @param Hide MP
 * @desc Sembunyikan MP bar & angka MP.
 * @type boolean
 * @default true
 *
 * @param Hide TP
 * @desc Sembunyikan TP bar & angka TP juga.
 * @type boolean
 * @default false
 *
 * @help
 * Pasang plugin di Plugin Manager, set ON.
 * Tidak ada konfigurasi tambahan.
 *
 * Plugin ini membuat function drawActorHp, drawActorMp, dan drawActorTp
 * jadi tidak melakukan apa-apa. Hasilnya: bar dan angka HP/MP tidak
 * digambar di window status manapun.
 *
 * HP/MP/TP secara data tetap ada di sistem, jadi battle dan skill yang
 * butuh HP/MP tetap berfungsi normal.
 */

(function() {

    var params = PluginManager.parameters('HideHpMp');
    var HIDE_HP = String(params['Hide HP'] || 'true')  === 'true';
    var HIDE_MP = String(params['Hide MP'] || 'true')  === 'true';
    var HIDE_TP = String(params['Hide TP'] || 'false') === 'true';

    if (HIDE_HP) {
        Window_Base.prototype.drawActorHp = function() {};
    }

    if (HIDE_MP) {
        Window_Base.prototype.drawActorMp = function() {};
    }

    if (HIDE_TP) {
        Window_Base.prototype.drawActorTp = function() {};
    }

})();
