//=============================================================================
// KeyboardControls.js
//=============================================================================
/*:
 * @plugindesc Custom keyboard control sesuai request (Backspace untuk Kembali/Keluar).
 * @author -
 */

(function() {

    // 1. TOMBOL PANAH UNTUK GERAK KARAKTER
    Input.keyMapper[38] = 'up';    // Panah Atas
    Input.keyMapper[37] = 'left';  // Panah Kiri
    Input.keyMapper[40] = 'down';  // Panah Bawah
    Input.keyMapper[39] = 'right'; // Panah Kanan

    // NONAKTIFKAN WASD (agar tidak bentrok)
    delete Input.keyMapper[87]; // W
    delete Input.keyMapper[65]; // A
    delete Input.keyMapper[83]; // S
    delete Input.keyMapper[68]; // D

    // 2. TOMBOL M UNTUK BUKA MENU
    delete Input.keyMapper[9];     // Matikan Tab dari kode lama
    Input.keyMapper[77] = 'menu';  // M = Menu

    // 3. TOMBOL ENTER UNTUK INTERAKSI / KONFIRMASI (OK)
    delete Input.keyMapper[69];    // Matikan E dari kode lama
    Input.keyMapper[13] = 'ok';    // Enter = OK

    // 4. TOMBOL BACKSPACE UNTUK KEMBALI / CANCEL / KELUAR MENU
    delete Input.keyMapper[88];     // Matikan X dari kode lama agar tidak berfungsi lagi
    Input.keyMapper[8] = 'cancel';  // 8 adalah kode tombol Backspace = Cancel / Kembali

    // 5. TOMBOL F UNTUK LAYAR PENUH (FULLSCREEN)
    // Mematikan ESC agar tidak menggagalkan fullscreen browser secara tidak sengaja
    delete Input.keyMapper[27]; 
    
    // Script khusus agar tombol F memicu Fullscreen bawaan RPG Maker
    window.addEventListener('keydown', function(event) {
        if (event.keyCode === 70) { // 70 adalah kode untuk tombol F
            Graphics._switchFullScreen();
        }
    });

    // Bersihkan tombol default lain yang tidak dipakai agar rapi
    delete Input.keyMapper[90]; // Z dimatikan
    delete Input.keyMapper[32]; // Space dimatikan

})();