//=============================================================================
// OnlyLencanaCategory.js
//=============================================================================
/*:
 * @plugindesc Hanya menyisakan kategori "Lencana" (item). Tab Weapon, Armor,
 * dan Key Item dihilangkan dari menu item.
 * @author -
 *
 * @help
 * Cara pakai:
 * 1. Simpan file ini di folder js/plugins/ project RPG Maker MV kamu.
 * 2. Buka Plugin Manager, aktifkan plugin "OnlyLencanaCategory".
 * 3. Selesai. Tab "Lencana" tetap tampil, 3 tab lainnya hilang.
 *
 * Catatan:
 * - Label "Item" tetap diubah jadi "Lencana" lewat Database > Terms > Commands.
 * - Plugin ini hanya menghapus 3 kategori yang tidak dipakai, layout custom
 *   kamu tidak diubah.
 */

(function() {

    Window_ItemCategory.prototype.makeCommandList = function() {
        this.addCommand(TextManager.item, 'item');
    };

})();
