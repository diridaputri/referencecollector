//=============================================================================
// FullscreenButton.js
//=============================================================================
/*:
 * @plugindesc Tombol fullscreen di pojok kanan atas game (cuma di mobile).
 * @author -
 *
 * @param Show On PC
 * @desc Tampilkan juga di PC?
 * @type boolean
 * @default false
 *
 * @param Button Size
 * @desc Ukuran tombol fullscreen (pixel).
 * @type number
 * @default 48
 *
 * @param Margin
 * @desc Jarak dari pinggir layar.
 * @type number
 * @default 12
 *
 * @param BG Color
 * @desc Warna background tombol.
 * @default rgba(0,0,0,0.6)
 *
 * @param Icon Color
 * @desc Warna icon.
 * @default rgba(255,255,255,1)
 */

(function() {

    var params = PluginManager.parameters('FullscreenButton');
    var SHOW_ON_PC = String(params['Show On PC'] || 'false') === 'true';
    var BTN_SIZE   = Number(params['Button Size'] || 48);
    var MARGIN     = Number(params['Margin'] || 12);
    var BG_COLOR   = String(params['BG Color']   || 'rgba(0,0,0,0.6)');
    var FG_COLOR   = String(params['Icon Color'] || 'rgba(255,255,255,1)');

    function isMobile() {
        return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    }

    // Detect mobile, kalau bukan mobile dan SHOW_ON_PC false, gak usah pasang tombol
    if (!isMobile() && !SHOW_ON_PC) return;

    function isFullscreen() {
        return !!(document.fullscreenElement ||
                  document.webkitFullscreenElement ||
                  document.mozFullScreenElement ||
                  document.msFullscreenElement);
    }

    function toggleFullscreen() {
        if (isFullscreen()) {
            // Exit
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        } else {
            // Enter
            var elem = document.documentElement;
            if (elem.requestFullscreen) elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
            else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
            else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
        }
    }

    // Bikin tombol HTML overlay
    function createFullscreenButton() {
        var btn = document.createElement('button');
        btn.id = 'fullscreen-button';
        btn.style.cssText = [
            'position: fixed',
            'top: ' + MARGIN + 'px',
            'right: ' + MARGIN + 'px',
            'width: ' + BTN_SIZE + 'px',
            'height: ' + BTN_SIZE + 'px',
            'background: ' + BG_COLOR,
            'border: 2px solid ' + FG_COLOR,
            'border-radius: 8px',
            'color: ' + FG_COLOR,
            'font-size: ' + (BTN_SIZE * 0.5) + 'px',
            'font-weight: bold',
            'cursor: pointer',
            'z-index: 9999',
            'display: flex',
            'align-items: center',
            'justify-content: center',
            'padding: 0',
            'user-select: none',
            '-webkit-tap-highlight-color: transparent',
            'font-family: sans-serif'
        ].join(';');
        btn.innerHTML = '⛶';
        btn.title = 'Fullscreen';
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleFullscreen();
        });
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleFullscreen();
        });
        document.body.appendChild(btn);

        // Update icon saat fullscreen state berubah
        function updateIcon() {
            btn.innerHTML = isFullscreen() ? '✕' : '⛶';
        }
        document.addEventListener('fullscreenchange', updateIcon);
        document.addEventListener('webkitfullscreenchange', updateIcon);
        document.addEventListener('mozfullscreenchange', updateIcon);
        document.addEventListener('MSFullscreenChange', updateIcon);
    }

    // Pasang tombol setelah DOM ready
    if (document.readyState === 'complete') {
        createFullscreenButton();
    } else {
        window.addEventListener('load', createFullscreenButton);
    }

})();