const supabase = require("../config/supabase.js");
const uploadImage = require("../handlers/upload-image.js");
require("dotenv").config();



exports.getAllTraditions = async (request, h) => {
    const { data, error } = await supabase.from("tradisi").select("id, judul, konten, author, url_gambar");
    if (data.length === 0) return h.response({ statusCode: 404, message: "Tidak ada data tradisi", error: "Not Found" }).code(404);
    if (error) return h.response({ statusCode: 500, message: "Gagal mengambil data", error: error.message }).code(500);
    return h.response({ statusCode: 200, message: "Berhasil mengambil data", data }).code(200);
};

exports.getTraditionById = async (request, h) => {
    const { id } = request.params;
    const { error, data } = await supabase.from("tradisi").select("*").eq("id", id).single();
    if (data === null) return h.response({ statusCode: 404, message: "Tradisi tidak ditemukan", error: "Not Found" }).code(404);
    if (error) return h.response({ statusCode: 500, message: "Gagal mengambil data", error: error.message }).code(500);
    return h.response({ statusCode: 200, message: "Berhasil mengambil data", data }).code(200);
};

exports.createTradition = async (request, h) => {
    try {
        const file = request.payload.image;
        if (!file) {
            return h.response({ statusCode: 400, message: "File tidak ditemukan", error: "File Not Found" }).code(400);
        }

        const url_gambar = await uploadImage(file, "gambar-tradisi");
        const { judul, konten, author, kota } = request.payload;

        const { data, error: dbError } = await supabase.from("tradisi").insert([
            { judul, konten, author, url_gambar, kota },
        ]).select();

        if (dbError) return h.response({ statusCode: 500, message: "Gagal menambahkan tradisi", error: dbError.message }).code(500);

        return h.response({ statusCode: 201, message: "Tradisi berhasil ditambahkan", data }).code(201);
    } catch (error) {
        console.error("Error:", error.message);
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: error.message }).code(500);
    }
};

exports.updateTradition = async (request, h) => {
    try {
        const { id } = request.params;
        const { judul, konten, author, kota } = request.payload;
        const file = request.payload?.image || null;

        const { data: existingTradition, error: fetchError } = await supabase
            .from("tradisi")
            .select("image_url")
            .eq("id", id)
            .single();

        if (fetchError) return h.response({ statusCode: 500, message: "Gagal mengambil data tradisi", error: fetchError.message }).code(500);
        if (!existingTradition) return h.response({ statusCode: 404, message: "Tradisi tidak ditemukan", error: "Tradisi tidak ditemukan" }).code(404);

        let url_gambar = existingTradition.url_gambar;

        if (file) {
            if (url_gambar) {
                const oldImagePath = url_gambar.replace(`${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/`, "");
                const { error: deleteError } = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).remove([oldImagePath]);
                if (deleteError) {
                    console.error("Gagal menghapus gambar lama:", deleteError.message);
                }
            }
            url_gambar = await uploadImage(file, "gambar-tradisi");
        }

        const { error: updateError } = await supabase
            .from("tradisi")
            .update({ judul, konten, author, url_gambar, kota })
            .eq("id", id);

        if (updateError) return h.response({ statusCode: 500, message: "Gagal memperbarui tradisi", error: updateError.message }).code(500);

        return h.response({ statusCode: 200, message: "Tradisi berhasil diperbarui" }).code(200);
    } catch (error) {
        console.error("Error:", error.message);
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: error.message }).code(500);
    }
};

exports.deleteTradition = async (request, h) => {
    try {
        const { id } = request.params;

        const { data: existingTradition, error: fetchError } = await supabase
            .from("tradisi")
            .select("url_gambar")
            .eq("id", id)
            .single();

        if (fetchError) return h.response({ statusCode: 500, message: "Gagal mengambil data tradisi", error: fetchError.message }).code(500);
        if (!existingTradition) return h.response({ statusCode: 404, message: "Tradisi tidak ditemukan", error: "Tradisi tidak ditemukan" }).code(404);

        if (existingTradition.image_url) {
            const imagePath = existingTradition.image_url.replace(`${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/`, "");
            await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).remove([imagePath]);
        }

        const { error: deleteError } = await supabase.from("tradisi").delete().eq("id", id);
        if (deleteError) return h.response({ statusCode: 500, message: "Gagal menghapus tradisi", error: deleteError.message }).code(500);

        return h.response({ statusCode: 200, message: "Tradisi berhasil dihapus" }).code(200);
    } catch (error) {
        console.error("Error:", error.message);
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: error.message }).code(500);
    }
};
