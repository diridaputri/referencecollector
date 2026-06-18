//=============================================================================
// MateriSlideshow.js
//=============================================================================
/*:
 * @plugindesc Slideshow materi gambar, dipanggil via Plugin Command atau menu utama.
 * @author -
 *
 * @param Image Prefix
 * @desc Prefix nama file gambar. File: materi_1.png, materi_2.png, dst.
 * @default materi_
 *
 * @param Total Slides
 * @desc Jumlah slide materi.
 * @type number
 * @min 1
 * @default 10
 *
 * @param BG Color
 * @desc Warna background overlay.
 * @default #000000
 *
 * @param Accent Color
 * @desc Warna aksen (dot aktif, tombol next).
 * @default rgba(120,200,255,1)
 *
 * @help
 * Panggil dari event dengan Plugin Command: MATERI SHOW
 * Tersedia juga di tombol "Materi" pada menu utama (Title Screen).
 *
 * Pastikan kamu memasukkan gambar materi_1.png sampai materi_10.png
 * ke dalam folder img/pictures/
 */

(function () {

    var params     = PluginManager.parameters('MateriSlideshow');
    var IMG_PREFIX = String(params['Image Prefix'] || 'materi_');
    var TOTAL      = Number(params['Total Slides']  || 10);
    var BG_COLOR   = String(params['BG Color']      || '#000000');
    var ACCENT     = String(params['Accent Color']  || 'rgba(120,200,255,1)');

    var FONT = 'VT323Custom, "Courier New", monospace';

    //=========================================================================
    // MateriManager
    //=========================================================================
    var MateriManager = {
        _active:      false,
        _slide:       1,
        _overlay:     null,
        _interpreter: null,
        _onClose:     null,

        isActive: function () { return this._active; },

        show: function (interpreter, onClose) {
            if (this._active) return;
            this._active      = true;
            this._slide       = 1;
            this._interpreter = interpreter || null;
            this._onClose     = onClose     || null;
            this._build();
            this._render();
        },

        close: function () {
            if (this._overlay && this._overlay.parentNode) {
                this._overlay.parentNode.removeChild(this._overlay);
            }
            // Hapus keyboard listener
            if (this._keyHandler) {
                document.removeEventListener('keydown', this._keyHandler, true);
                this._keyHandler = null;
            }
            this._overlay     = null;
            this._active      = false;
            this._interpreter = null;

            // ================================================================
            // ANTI-GHOST CLICK MASK (PROTEKSI UNTUK MOBILE BROWSER)
            // ================================================================
            var mask = document.createElement('div');
            mask.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:10001;background:transparent;-webkit-tap-highlight-color:transparent;';
            
            var preventer = function(e) {
                e.preventDefault();
                e.stopPropagation();
            };
            
            // Tangkap semua jenis input hantu dan musnahkan
            mask.addEventListener('touchstart', preventer, {passive: false});
            mask.addEventListener('touchend', preventer);
            mask.addEventListener('click', preventer);
            mask.addEventListener('mousedown', preventer);
            document.body.appendChild(mask);
            
            // Hapus topeng pelindung setelah 350ms (setelah klik hantu lewat)
            setTimeout(function() {
                if (mask && mask.parentNode) {
                    mask.parentNode.removeChild(mask);
                }
            }, 350);
            // ================================================================

            if (this._onClose) {
                var cb = this._onClose;
                this._onClose = null;
                cb();
            }
        },

        goNext: function () {
            if (this._slide < TOTAL) {
                this._slide++;
                this._render();
            } else {
                this.close();
            }
        },

        goPrev: function () {
            if (this._slide > 1) {
                this._slide--;
                this._render();
            }
        },

        //---------------------------------------------------------------------
        // Bangun DOM overlay
        //---------------------------------------------------------------------
        _build: function () {
            var self = this;

            // Overlay fullscreen — flex column agar image + panel tersusun rapi
            var ov = document.createElement('div');
            ov.id = 'mat-overlay';
            ov.style.cssText = [
                'position:fixed',
                'top:0', 'left:0', 'right:0', 'bottom:0',
                'background:' + BG_COLOR,
                'z-index:10000',
                'display:flex',
                'flex-direction:column',
                '-webkit-tap-highlight-color:transparent',
                'user-select:none', '-webkit-user-select:none'
            ].join(';');

            // Gambar — flex:1 agar isi sisa ruang di atas panel
            var img = document.createElement('img');
            img.id = 'mat-img';
            img.style.cssText = [
                'flex:1',
                'min-height:0',
                'width:100%',
                'object-fit:contain',
                'display:block',
                'cursor:pointer',
                'touch-action:manipulation'
            ].join(';');
            img.addEventListener('click',      function () { self.goNext(); });
            img.addEventListener('touchstart', function (e) { e.preventDefault(); self.goNext(); });

            // Panel kontrol di bawah
            var panel = document.createElement('div');
            panel.id = 'mat-panel';
            panel.style.cssText = [
                'flex-shrink:0',
                'padding:10px 16px 16px',
                'background:rgba(0,0,0,0.75)',
                'display:flex',
                'flex-direction:column',
                'align-items:center',
                'gap:10px'
            ].join(';');

            // Dots indikator
            var dots = document.createElement('div');
            dots.id = 'mat-dots';
            dots.style.cssText = 'display:flex;gap:8px;align-items:center;';
            for (var i = 1; i <= TOTAL; i++) {
                var dot = document.createElement('span');
                dot.dataset.slide = i;
                dot.style.cssText = [
                    'width:10px', 'height:10px',
                    'background:rgba(255,255,255,0.3)',
                    'display:inline-block',
                    'transition:background 0.15s,transform 0.15s'
                ].join(';');
                dots.appendChild(dot);
            }

            // Baris tombol
            var row = document.createElement('div');
            row.style.cssText = [
                'display:flex', 'gap:10px',
                'align-items:center', 'justify-content:center',
                'width:100%', 'max-width:540px'
            ].join(';');

            var btnPrev = this._makePixelBtn('◄ Sebelumnya', 'rgba(40,40,60,0.9)', 'rgba(180,180,210,1)');
            btnPrev.id = 'mat-prev';
            btnPrev.addEventListener('click',      function () { self.goPrev(); });
            btnPrev.addEventListener('touchstart', function (e) { e.preventDefault(); self.goPrev(); });

            var btnNext = this._makePixelBtn('Lanjut ►', ACCENT, '#000');
            btnNext.id = 'mat-next';
            btnNext.style.flex = '1';
            btnNext.addEventListener('click',      function () { self.goNext(); });
            btnNext.addEventListener('touchstart', function (e) { e.preventDefault(); self.goNext(); });

            var btnSkip = this._makePixelBtn('Keluar', 'rgba(30,30,50,0.8)', 'rgba(200,200,200,0.8)');
            btnSkip.id = 'mat-skip';
            btnSkip.style.border     = '3px solid rgba(255,255,255,0.3)';
            btnSkip.style.boxShadow  = '3px 3px 0 rgba(0,0,0,0.7)';
            btnSkip.addEventListener('click',      function () { self.close(); });
            btnSkip.addEventListener('touchstart', function (e) { e.preventDefault(); self.close(); });

            row.appendChild(btnPrev);
            row.appendChild(btnNext);
            row.appendChild(btnSkip);

            panel.appendChild(dots);
            panel.appendChild(row);
            ov.appendChild(img);
            ov.appendChild(panel);

            document.body.appendChild(ov);
            this._overlay = ov;
            
            // Keyboard listener
            var self2 = this;
            this._keyHandler = function(e) {
                switch(e.key) {
                    case 'Enter':
                        // Enter = Lanjut / Selesai (Konfirmasi)
                        e.preventDefault();
                        e.stopPropagation();
                        self2.goNext();
                        break;
                    case 'Backspace':
                        // Backspace = Sebelumnya / Keluar (Kembali)
                        e.preventDefault();
                        e.stopPropagation();
                        if (self2._slide <= 1) {
                            self2.close();
                        } else {
                            self2.goPrev();
                        }
                        break;
                }
            };
            document.addEventListener('keydown', this._keyHandler, true);
        },

        //---------------------------------------------------------------------
        // Update tampilan sesuai slide saat ini
        //---------------------------------------------------------------------
        _render: function () {
            var img     = document.getElementById('mat-img');
            var dots    = document.getElementById('mat-dots');
            var btnNext = document.getElementById('mat-next');
            var btnPrev = document.getElementById('mat-prev');
            if (!img) return;

            // Load gambar materi_1.png, materi_2.png, dst dari folder pictures
            img.src = 'img/pictures/' + IMG_PREFIX + this._slide + '.png';

            var dotEls = dots ? dots.querySelectorAll('span') : [];
            for (var i = 0; i < dotEls.length; i++) {
                var active = (i + 1 === this._slide);
                dotEls[i].style.background = active ? ACCENT : 'rgba(255,255,255,0.3)';
                dotEls[i].style.transform  = active ? 'scale(1.4)' : 'scale(1)';
            }

            if (btnPrev) btnPrev.style.visibility = (this._slide === 1) ? 'hidden' : 'visible';

            if (btnNext) {
                var isLast = (this._slide === TOTAL);
                btnNext.innerHTML        = isLast ? 'Selesai' : 'Lanjut ►';
                btnNext.style.background = isLast ? 'rgba(50,200,80,1)' : ACCENT;
                btnNext.style.color      = '#000';
            }
        },

        //---------------------------------------------------------------------
        // Helper: tombol pixel-art style
        //---------------------------------------------------------------------
        _makePixelBtn: function (text, bg, color) {
            var btn = document.createElement('button');
            btn.innerHTML = text;
            btn.style.cssText = [
                'background:' + bg,
                'color:' + color,
                'border:3px solid rgba(255,255,255,0.85)',
                'border-radius:0',
                'box-shadow:4px 4px 0 rgba(0,0,0,0.85)',
                'font-family:' + FONT,
                'font-size:20px',
                'letter-spacing:2px',
                'padding:8px 18px',
                'cursor:pointer',
                'display:flex', 'align-items:center', 'justify-content:center',
                '-webkit-tap-highlight-color:transparent',
                'touch-action:manipulation',
                'white-space:nowrap',
                'transition:transform 0.06s,box-shadow 0.06s',
                'outline:none'
            ].join(';');

            function press() {
                btn.style.transform = 'translate(2px,2px)';
                btn.style.boxShadow = '2px 2px 0 rgba(0,0,0,0.85)';
            }
            function release() {
                btn.style.transform = '';
                btn.style.boxShadow = '4px 4px 0 rgba(0,0,0,0.85)';
            }
            btn.addEventListener('mousedown',  press);
            btn.addEventListener('mouseup',    release);
            btn.addEventListener('mouseleave', release);
            btn.addEventListener('touchstart', press,   { passive: true });
            btn.addEventListener('touchend',   release);

            return btn;
        }
    };

    //=========================================================================
    // Plugin Command: MATERI SHOW
    //=========================================================================
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command.toUpperCase() === 'MATERI') {
            if ((args[0] || '').toUpperCase() === 'SHOW') {
                MateriManager.show(this);
                this._waitMode = 'materi';
            }
        }
    };

    //=========================================================================
    // Wait mode: pause event selama materi aktif
    //=========================================================================
    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function () {
        if (this._waitMode === 'materi') {
            if (!MateriManager.isActive()) {
                this._waitMode = '';
                return false;
            }
            return true;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    //=========================================================================
    // Title Screen: TAMBAH tombol "Materi" (Tanpa menghapus Tutorial)
    //=========================================================================

    var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function () {
        _Scene_Title_createCommandWindow.call(this);
        this._commandWindow.setHandler('materi', this.commandMateri.bind(this));
    };

    // Menggunakan alias (menyambung) bukan menimpa agar menu "Cara Bermain" tetap ada
    var _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _Window_TitleCommand_makeCommandList.call(this); // Memanggil menu yang sudah ada (termasuk Tutorial jika ada)
        this.addCommand('Materi', 'materi');             // Menambahkan "Materi" di bawahnya
    };

    Scene_Title.prototype.commandMateri = function () {
        this._commandWindow.deactivate();
        MateriManager.show(null, function () {
            this._commandWindow.activate();
        }.bind(this));
    };

})();