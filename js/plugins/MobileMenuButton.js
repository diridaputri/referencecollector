//=============================================================================
// MobileMenuButton.js
//=============================================================================
/*:
 * @plugindesc Tombol menu (≡) di pojok kiri atas, cuma muncul di mobile saat di map.
 * @author -
 *
 * @param Button Size
 * @desc Ukuran tombol (pixel).
 * @type number
 * @default 52
 *
 * @param Margin
 * @desc Jarak dari pinggir layar (pixel).
 * @type number
 * @default 12
 *
 * @param BG Color
 * @desc Warna background tombol.
 * @default rgba(0,0,0,0.55)
 *
 * @param Icon Color
 * @desc Warna icon hamburger.
 * @default rgba(255,255,255,1)
 *
 * @param Corner Radius
 * @desc Kelengkungan sudut tombol.
 * @type number
 * @default 10
 */

(function() {

    // Cuma jalan di mobile
    if (!Utils.isMobileDevice()) return;

    var params     = PluginManager.parameters('MobileMenuButton');
    var BTN_SIZE   = Number(params['Button Size']   || 52);
    var MARGIN     = Number(params['Margin']        || 12);
    var BG_COLOR   = String(params['BG Color']      || 'rgba(0,0,0,0.55)');
    var FG_COLOR   = String(params['Icon Color']    || 'rgba(255,255,255,1)');
    var RADIUS     = Number(params['Corner Radius'] || 10);

    var _btn = null;

    //-------------------------------------------------------------------------
    // Buat tombol HTML
    //-------------------------------------------------------------------------
    function createButton() {
        if (_btn) return;

        var btn = document.createElement('button');
        btn.id  = 'mobile-menu-btn';

        // Style tombol
        btn.style.cssText = [
            'position: fixed',
            'top: ' + MARGIN + 'px',
            'left: ' + MARGIN + 'px',
            'width: ' + BTN_SIZE + 'px',
            'height: ' + BTN_SIZE + 'px',
            'background: ' + BG_COLOR,
            'border: none',
            'border-radius: ' + RADIUS + 'px',
            'cursor: pointer',
            'z-index: 9998',
            'display: flex',
            'flex-direction: column',
            'align-items: center',
            'justify-content: center',
            'gap: 5px',
            'padding: 12px 10px',
            'box-sizing: border-box',
            '-webkit-tap-highlight-color: transparent',
            'touch-action: manipulation'
        ].join(';');

        // Bikin 3 garis hamburger dari div
        for (var i = 0; i < 3; i++) {
            var line = document.createElement('div');
            line.style.cssText = [
                'width: 100%',
                'height: 3px',
                'background: ' + FG_COLOR,
                'border-radius: 2px',
                'display: block'
            ].join(';');
            btn.appendChild(line);
        }

        // Handler tap
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            triggerMenu();
        });
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            triggerMenu();
        });

        document.body.appendChild(btn);
        _btn = btn;
    }

    //-------------------------------------------------------------------------
    // Trigger buka menu (sama seperti tekan M)
    //-------------------------------------------------------------------------
    function triggerMenu() {
        if (!SceneManager._scene) return;
        // Cuma trigger di Scene_Map
        if (!(SceneManager._scene instanceof Scene_Map)) return;
        // Simulasikan input 'menu'
        Input._currentState['menu'] = true;
        setTimeout(function() {
            Input._currentState['menu'] = false;
        }, 100);
    }

    //-------------------------------------------------------------------------
    // Show / hide tombol sesuai scene
    //-------------------------------------------------------------------------
    function updateButtonVisibility() {
        if (!_btn) return;
        var isMap = SceneManager._scene instanceof Scene_Map;
        // Daftar Map ID yang boleh tampil tombol menu
        // Lihat map ID di kiri bawah RPG Maker MV saat klik map
        var allowedMaps = [6, 11]; // Ruang Kelas (006) & Perpustakaan (011)
        var currentMapId = $gameMap ? $gameMap.mapId() : 0;
        var mapAllowed = allowedMaps.indexOf(currentMapId) >= 0;
        _btn.style.display = (isMap && mapAllowed) ? 'flex' : 'none';
    }

    //-------------------------------------------------------------------------
    // Hook Scene_Map start & stop
    //-------------------------------------------------------------------------
    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        createButton();
        updateButtonVisibility();
    };

    var _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        _Scene_Map_terminate.call(this);
        updateButtonVisibility();
    };

    // Update tiap scene berubah
    var _SceneManager_goto = SceneManager.goto;
    SceneManager.goto = function(sceneClass) {
        _SceneManager_goto.call(this, sceneClass);
        setTimeout(updateButtonVisibility, 100);
    };

})();