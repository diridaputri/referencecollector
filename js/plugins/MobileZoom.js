/*:
 * @plugindesc v2.0 Auto zoom map + camera follow + fullscreen untuk PC & HP
 * @author CustomFix
 *
 * @param ZoomScaleDesktop
 * @desc Skala zoom di PC/Desktop. 1.0 = normal, 1.5 = 1.5x. Coba 1.5.
 * @default 1.5
 *
 * @param ZoomScaleMobile
 * @desc Skala zoom di HP/Mobile. 1.0 = normal, 2.0 = 2x. Coba 2.0.
 * @default 2.0
 *
 * @help
 * ===========================================================================
 * Plugin zoom map + camera follow player. Aktif di PC & HP.
 *
 * Cara pakai:
 * 1. Taruh file ini di folder: js/plugins/
 * 2. Plugin Manager > pilih MobileZoom > set ON
 * 3. Atur ZoomScaleDesktop & ZoomScaleMobile sesuai selera
 * ===========================================================================
 */

(function() {
    var parameters = PluginManager.parameters('MobileZoom');
    var zoomDesktop = Number(parameters['ZoomScaleDesktop'] || 1.5);
    var zoomMobile = Number(parameters['ZoomScaleMobile'] || 2.0);
        
    // Ukuran asli tile (default RPG Maker MV = 48x48)
    var TILE_REAL_W = 48;
    var TILE_REAL_H = 48;

    function getZoomScale() {
        return Utils.isMobileDevice() ? zoomMobile : zoomDesktop;
    }
    
    function getCoefficient() {
        return 1.0 / getZoomScale();
    }
    // ===== ZOOM via TILEMAP SCALE (bukan $gameScreen.setZoom) =====
    // Pendekatan: scale tilemap-nya langsung, sambil pertahankan tile real size
    // biar tileset image tetep ke-load dengan koordinat yang bener (gak hitam)
    
    var _Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function() {
        _Spriteset_Map_createTilemap.call(this);
        var s = getZoomScale();
        this._tilemap.scale.x = s;
        this._tilemap.scale.y = s;
    };
    
    var _Spriteset_Map_loadTileset = Spriteset_Map.prototype.loadTileset;
    Spriteset_Map.prototype.loadTileset = function() {
        // Force tilemap pakai REAL tile size buat slice gambar tileset
        this._tilemap.tileWidth = TILE_REAL_W;
        this._tilemap.tileHeight = TILE_REAL_H;
        _Spriteset_Map_loadTileset.call(this);
    };
    
    // Override updateTilemap: scroll origin pakai real size, scale handled by tilemap.scale
    Spriteset_Map.prototype.updateTilemap = function() {
        this._tilemap.origin.x = $gameMap.displayX() * TILE_REAL_W;
        this._tilemap.origin.y = $gameMap.displayY() * TILE_REAL_H;
    };
    
    // ===== POSISI PLAYER & EVENT: pakai real tile size biar gak ketinggalan tilemap =====
    Game_CharacterBase.prototype.screenX = function() {
        return Math.round(this.scrolledX() * TILE_REAL_W + TILE_REAL_W * 0.5);
    };
    
    Game_CharacterBase.prototype.screenY = function() {
        return Math.round(this.scrolledY() * TILE_REAL_H + TILE_REAL_H -
            this.shiftY() - this.jumpHeight());
    };
    
    // ===== TILE WIDTH/HEIGHT: return scaled value (penting buat collision & event) =====
    Game_Map.prototype.tileWidth = function() {
        return TILE_REAL_W * getZoomScale();
    };
    
    Game_Map.prototype.tileHeight = function() {
        return TILE_REAL_H * getZoomScale();
    };
    
    // ===== VIEWPORT TILES: dibagi scale biar engine tau muat berapa tile setelah zoom =====
    var _Game_Map_screenTileX = Game_Map.prototype.screenTileX;
    Game_Map.prototype.screenTileX = function() {
        return _Game_Map_screenTileX.call(this) * getCoefficient();
    };
    
    var _Game_Map_screenTileY = Game_Map.prototype.screenTileY;
    Game_Map.prototype.screenTileY = function() {
        return _Game_Map_screenTileY.call(this) * getCoefficient();
    };
    
    // ===== SPRITE_DESTINATION (kursor klik tap-to-move) =====
    Sprite_Destination.prototype.updatePosition = function() {
        this.x = ($gameMap.adjustX($gameTemp.destinationX()) + 0.5) 
            * $gameMap.tileWidth() * getCoefficient();
        this.y = ($gameMap.adjustY($gameTemp.destinationY()) + 0.5) 
            * $gameMap.tileHeight() * getCoefficient();
    };

    // ===== FIX SCROLL UP & DOWN: override scroll methods biar nyambung sama viewport scaled =====
    Game_Map.prototype.scrollDown = function(distance) {
        if (this.isLoopVertical()) {
            this._displayY += distance;
            this._displayY %= $dataMap.height;
            if (this._parallaxLoopY) {
                this._parallaxY += distance;
            }
        } else if (this.height() >= this.screenTileY()) {
            var lastY = this._displayY;
            this._displayY = Math.min(this._displayY + distance,
                this.height() - this.screenTileY());
            this._parallaxY += this._displayY - lastY;
        }
    };
    
    Game_Map.prototype.scrollUp = function(distance) {
        if (this.isLoopVertical()) {
            this._displayY += $dataMap.height - distance;
            this._displayY %= $dataMap.height;
            if (this._parallaxLoopY) {
                this._parallaxY -= distance;
            }
        } else if (this.height() >= this.screenTileY()) {
            var lastY = this._displayY;
            this._displayY = Math.max(this._displayY - distance, 0);
            this._parallaxY += this._displayY - lastY;
        }
    };

    // ===== RESIZE CANVAS FIT KE LAYAR (PC + HP) =====
    // Strategi: hitung pixel eksplisit biar aspect ratio terjaga,
    // sehingga getBoundingClientRect() selalu cocok dengan koordinat game.

    function _applyMobileZoomLayout() {
        var canvas = Graphics._canvas;
        if (!canvas) return;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var gw = Graphics._width  || canvas.width;
        var gh = Graphics._height || canvas.height;
        var scale = Math.min(vw / gw, vh / gh);
        var cw = Math.round(gw * scale);
        var ch = Math.round(gh * scale);
        canvas.style.position  = 'fixed';
        canvas.style.width     = cw + 'px';
        canvas.style.height    = ch + 'px';
        canvas.style.top       = Math.round((vh - ch) / 2) + 'px';
        canvas.style.left      = Math.round((vw - cw) / 2) + 'px';
        canvas.style.right     = 'auto';
        canvas.style.bottom    = 'auto';
        canvas.style.objectFit = '';
        canvas.style.margin    = '0';
        if (document.body) {
            document.body.style.margin     = '0';
            document.body.style.padding    = '0';
            document.body.style.overflow   = 'hidden';
            document.body.style.background = '#000';
        }
    }

    var _Graphics__updateCanvas = Graphics._updateCanvas;
    Graphics._updateCanvas = function() {
        _Graphics__updateCanvas.call(this);
        _applyMobileZoomLayout();
    };

    window.addEventListener('resize', _applyMobileZoomLayout);
    document.addEventListener('fullscreenchange', function() {
        setTimeout(_applyMobileZoomLayout, 100);
    });
    document.addEventListener('webkitfullscreenchange', function() {
        setTimeout(_applyMobileZoomLayout, 100);
    });

    //-------------------------------------------------------------------------
    // Fix touch coordinate: getBoundingClientRect() sekarang tepat
    // karena canvas size/posisi sudah eksplisit (bukan 100vw/100vh + object-fit)
    //-------------------------------------------------------------------------
    var _Graphics_pageToCanvasX = Graphics.pageToCanvasX;
    Graphics.pageToCanvasX = function(x) {
        if (this._canvas) {
            var rect = this._canvas.getBoundingClientRect();
            if (rect.width > 0) {
                return Math.round((x - rect.left) * (this.width / rect.width));
            }
        }
        return _Graphics_pageToCanvasX.call(this, x);
    };

    var _Graphics_pageToCanvasY = Graphics.pageToCanvasY;
    Graphics.pageToCanvasY = function(y) {
        if (this._canvas) {
            var rect = this._canvas.getBoundingClientRect();
            if (rect.height > 0) {
                return Math.round((y - rect.top) * (this.height / rect.height));
            }
        }
        return _Graphics_pageToCanvasY.call(this, y);
    };

    })();
