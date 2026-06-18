//=============================================================================
// MobileFullscreen.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Auto fullscreen + mobile scaling untuk web browser HP
 * @author CustomFix
 *
 * @param ZoomScale
 * @text Zoom Scale
 * @desc Skala zoom map. 1.0 = normal, 2.0 = 2x lebih besar
 * @type number
 * @decimals 2
 * @default 2.0
 *
 * @param AutoFullscreenOnTouch
 * @text Auto Fullscreen on Touch
 * @desc Otomatis fullscreen saat layar disentuh pertama kali
 * @type boolean
 * @default true
 *
 * @help
 * Plugin ini:
 * 1. Auto-zoom map biar besar di HP
 * 2. Auto-fullscreen pas user tap layar (bypass batasan browser)
 * 3. Lock orientation ke landscape kalau bisa
 * 4. Resize canvas ngikut layar HP
 *
 * Cara pakai:
 * - Drop file ini ke folder js/plugins/
 * - Aktifkan di Plugin Manager
 * - Set ZoomScale sesuai selera
 */

(() => {
    const pluginName = "MobileFullscreen";
    const params = PluginManager.parameters(pluginName);
    const zoomScale = Number(params["ZoomScale"] || 2.0);
    const autoFullscreen = params["AutoFullscreenOnTouch"] === "true";

    // ===== 1. AUTO ZOOM MAP =====
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        $gameScreen.setZoom(
            Graphics.width / 2,
            Graphics.height / 2,
            zoomScale
        );
    };

    // ===== 2. AUTO FULLSCREEN ON FIRST TOUCH =====
    if (autoFullscreen) {
        let fullscreenTriggered = false;

        const requestFullscreen = () => {
            if (fullscreenTriggered) return;
            const el = document.documentElement;
            const req = el.requestFullscreen 
                || el.webkitRequestFullscreen 
                || el.mozRequestFullScreen 
                || el.msRequestFullscreen;
            if (req) {
                req.call(el).then(() => {
                    fullscreenTriggered = true;
                    // Coba lock ke landscape
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock("landscape").catch(() => {});
                    }
                }).catch(() => {});
            }
        };

        // Trigger pas user tap layar pertama kali
        window.addEventListener("touchstart", requestFullscreen, { once: false });
        window.addEventListener("click", requestFullscreen, { once: false });
    }

    // ===== 3. RESIZE CANVAS FIT KE LAYAR HP =====
    const _Graphics_updateRealScale = Graphics._updateRealScale;
    Graphics._updateRealScale = function() {
        if (Utils.isMobileDevice()) {
            // Fit ke window size dengan menjaga aspect ratio
            const scaleX = window.innerWidth / this._width;
            const scaleY = window.innerHeight / this._height;
            this._realScale = Math.min(scaleX, scaleY);
        } else {
            _Graphics_updateRealScale.call(this);
        }
    };

    // ===== 4. PAKSA CANVAS FILL VIEWPORT =====
    const _Graphics__updateCanvas = Graphics._updateCanvas;
    Graphics._updateCanvas = function() {
        _Graphics__updateCanvas.call(this);
        if (Utils.isMobileDevice() && this._canvas) {
            this._canvas.style.width = "100vw";
            this._canvas.style.height = "100vh";
            this._canvas.style.objectFit = "contain";
        }
    };
})();
