//=============================================================================
// AutoFullscreen.js  (RPG Maker MV)
//=============================================================================
/*:
 * @plugindesc v1.0 Auto fullscreen browser saat user klik/tap. Aktif di PC & HP.
 * @author CustomFix
 *
 * @param Enabled
 * @desc Aktifkan auto-fullscreen? (true/false)
 * @default true
 *
 * @param LockLandscape
 * @desc Lock orientation ke landscape di HP? (true/false)
 * @default true
 *
 * @help
 * ===========================================================================
 * Plugin ini bikin browser auto-fullscreen pas user pertama kali klik/tap
 * layar. Aktif di PC & HP.
 *
 * CATATAN PENTING:
 * - Browser GAK MENGIZINKAN auto-fullscreen tanpa user gesture (aturan
 *   keamanan). Jadi harus tap/klik dulu, baru fullscreen.
 * - Plugin ini cuma jalan di web browser (deploy ke Netlify dll).
 *   Di RPG Maker MV playtest mungkin gak kelihatan efeknya.
 * - Di iOS Safari, fullscreen API agak terbatas.
 *
 * Cara pakai:
 * 1. Taruh file ini di folder: js/plugins/
 * 2. Plugin Manager > pilih AutoFullscreen > set ON
 * ===========================================================================
 */

(function() {
    var parameters = PluginManager.parameters('AutoFullscreen');
    var enabled = String(parameters['Enabled'] || 'true') === 'true';
    var lockLandscape = String(parameters['LockLandscape'] || 'true') === 'true';

    if (!enabled) return;

    var fsTriggered = false;

    function requestFs() {
        if (fsTriggered) return;
        var el = document.documentElement;
        var req = el.requestFullscreen 
            || el.webkitRequestFullscreen 
            || el.mozRequestFullScreen 
            || el.msRequestFullscreen;
        if (req) {
            var p = req.call(el);
            if (p && p.then) {
                p.then(function() {
                    fsTriggered = true;
                    // Lock landscape cuma di HP
                    if (lockLandscape && Utils.isMobileDevice() 
                        && screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock("landscape").catch(function(){});
                    }
                }).catch(function(){});
            } else {
                fsTriggered = true;
            }
        }
    }

    window.addEventListener("touchstart", requestFs);
    window.addEventListener("click", requestFs);
})();
