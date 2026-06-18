//=============================================================================
// PhysicalKeyboardNameInput.js
//=============================================================================
/*:
 * @plugindesc Mengaktifkan keyboard fisik di Scene_Name (input nama karakter).
 * PC: ketik langsung. HP: tetap pakai keyboard virtual bawaan.
 * @author -
 *
 * @param Allow Spaces
 * @desc Izinkan player mengetik spasi pada nama.
 * @type boolean
 * @default true
 *
 * @param Allow Symbols
 * @desc Izinkan player mengetik simbol (-_.!?,'). Selain itu di-block.
 * @type boolean
 * @default false
 *
 * @help
 * Pasang plugin ini di Plugin Manager, set ON.
 * Tidak ada konfigurasi tambahan yang wajib diatur.
 *
 * Saat Scene_Name aktif (input nama karakter):
 * - Player bisa ketik HURUF/ANGKA langsung pakai keyboard fisik
 * - Tekan BACKSPACE untuk hapus huruf terakhir
 * - Tekan ENTER untuk konfirmasi nama (sama seperti pilih "OK")
 * - Tekan ESC untuk batal (hapus 1 huruf, sesuai default MV)
 *
 * Player HP masih bisa pakai grid keyboard virtual seperti biasa.
 */

(function() {

    var params = PluginManager.parameters('PhysicalKeyboardNameInput');
    var ALLOW_SPACES  = String(params['Allow Spaces']  || 'true')  === 'true';
    var ALLOW_SYMBOLS = String(params['Allow Symbols'] || 'false') === 'true';

    var SYMBOLS = "-_.!?,'";

    //-------------------------------------------------------------------------
    // Helper: cek apakah karakter diperbolehkan
    //-------------------------------------------------------------------------
    function isAllowedChar(ch) {
        if (!ch || ch.length !== 1) return false;
        var code = ch.charCodeAt(0);
        // Huruf A-Z
        if (code >= 65 && code <= 90)  return true;
        // Huruf a-z
        if (code >= 97 && code <= 122) return true;
        // Angka 0-9
        if (code >= 48 && code <= 57)  return true;
        // Spasi
        if (ch === ' ' && ALLOW_SPACES) return true;
        // Simbol
        if (ALLOW_SYMBOLS && SYMBOLS.indexOf(ch) >= 0) return true;
        return false;
    }

    //-------------------------------------------------------------------------
    // Scene_Name: tambah listener keyboard saat scene aktif
    //-------------------------------------------------------------------------
    var _Scene_Name_create = Scene_Name.prototype.create;
    Scene_Name.prototype.create = function() {
        _Scene_Name_create.call(this);
        this._keyboardHandler = this.onKeyDown.bind(this);
        document.addEventListener('keydown', this._keyboardHandler);
    };

    var _Scene_Name_terminate = Scene_Name.prototype.terminate;
    Scene_Name.prototype.terminate = function() {
        if (this._keyboardHandler) {
            document.removeEventListener('keydown', this._keyboardHandler);
            this._keyboardHandler = null;
        }
        _Scene_Name_terminate.call(this);
    };

    Scene_Name.prototype.onKeyDown = function(e) {
        if (!this._editWindow) return;

        var editWindow = this._editWindow;
        var key = e.key;

        // ENTER → konfirmasi (sama seperti pilih OK)
        if (key === 'Enter') {
            e.preventDefault();
            if (editWindow.name().length > 0) {
                SoundManager.playOk();
                this.onInputOk();
            } else {
                SoundManager.playBuzzer();
            }
            return;
        }

        // BACKSPACE → hapus huruf terakhir
        if (key === 'Backspace') {
            e.preventDefault();
            if (editWindow.back && editWindow.back()) {
                SoundManager.playCancel();
            } else {
                SoundManager.playBuzzer();
            }
            return;
        }

        // Karakter biasa
        if (key.length === 1 && isAllowedChar(key)) {
            e.preventDefault();
            if (editWindow.add(key)) {
                SoundManager.playOk();
            } else {
                SoundManager.playBuzzer();
            }
            return;
        }
    };

})();
