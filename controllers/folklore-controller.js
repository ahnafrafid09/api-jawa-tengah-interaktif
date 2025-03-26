const supabase = require("../config/supabase.js");
const uploadImage = require("../handlers/upload-image.js");
const uploadAudio = require("../handlers/upload-audio.js");
require("dotenv").config();


exports.getAllFolklore = async (request, h) => {
    const { latest, search } = request.query

    let query = supabase.from("cerita_rakyat").select("id, judul, deskripsi, tanggal_cerita, author, url_gambar");
    if (latest) {
        query = query.order("created_at", { ascending: false }).limit(parseInt(latest));
    }
    if (search) {
        query = query.ilike("judul", `%${search}%`);
    }

    const { data, error } = await query
    if (!data || data.length === 0) return h.response({ statusCode: 404, message: "Tidak ada data cerita rakyat", error: "Not Found" }).code(404);
    if (error) return h.response({ statusCode: 500, message: "Gagal mengambil data", error: error.message }).code(500);
    return h.response({ statusCode: 200, message: "Berhasil mengambil data", data }).code(200);
};

exports.getFolkloreById = async (request, h) => {
    const { id } = request.params;
    const { error, data } = await supabase.from("cerita_rakyat").select("*").eq("id", id).single();
    if (data === null) return h.response({ statusCode: 404, message: "Cerita rakyat tidak ditemukan", error: "Not Found" }).code(404);
    if (error) return h.response({ statusCode: 500, message: "Gagal mengambil data", error: error.message }).code(500);
    return h.response({ statusCode: 200, message: "Berhasil mengambil data", data }).code(200);
};

exports.createFolklore = async (request, h) => {
    try {
        const file = request.payload;

        const url_gambar = await uploadImage(file.image, "gambar-cerita-rakyat");
        const url_audio = await uploadAudio(file.audio, "audio-cerita-rakyat")
        const { judul, konten, deskripsi, author } = request.payload;

        const folkloreDate = new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        const { data, error: dbError } = await supabase.from("cerita_rakyat").insert([
            { judul, konten, deskripsi, author, url_gambar, url_audio, tanggal_cerita: folkloreDate },
        ]).select();

        if (dbError) return h.response({ statusCode: 500, message: "Gagal menambahkan cerita rakyat", error: dbError.message }).code(500);

        return h.response({ statusCode: 201, message: "Cerita rakyat berhasil ditambahkan", data }).code(201);
    } catch (err) {
        console.error("Error:", err.message);
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: err.message }).code(500);
    }
};

exports.updateFolklore = async (request, h) => {
    try {
        const { id } = request.params;
        const { judul, konten, deskripsi, author } = request.payload;
        const image = request.payload?.image || null;
        const audio = request.payload?.audio || null;

        const { data: existingArticle, error: fetchError } = await supabase
            .from("cerita_rakyat")
            .select("url_gambar, url_audio")
            .eq("id", id)
            .single();

        if (fetchError) return h.response({ statusCode: 500, message: "Gagal mengambil data artikel", error: fetchError.message }).code(500);

        if (!existingArticle) return h.response({ statusCode: 404, message: "Artikel tidak ditemukan", error: "Artikel tidak ditemukan" }).code(404);

        let url_gambar = existingArticle.url_gambar;
        let url_audio = existingArticle.url_audio;

        if (image) {
            if (url_gambar) {
                const oldImagePath = url_gambar.replace(`${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/`, "");
                const { error: deleteError } = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).remove([oldImagePath]);
                if (deleteError) {
                    console.error("Gagal menghapus gambar lama:", deleteError.message);
                }
            }
            url_gambar = await uploadImage(image, "gambar-cerita-rakyat");
        }

        if (audio) {
            if (url_audio) {
                const oldImagePath = url_audio.replace(`${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/`, "");
                const { error: deleteError } = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).remove([oldImagePath]);
                if (deleteError) {
                    console.error("Gagal menghapus audio lama:", deleteError.message);
                }
            }
            url_audio = await uploadAudio(audio, "audio-cerita-rakyat");
        }

        const { error: updateError } = await supabase
            .from("cerita_rakyat")
            .update({ judul, konten, deskripsi, author, url_gambar, url_audio },)
            .eq("id", id);

        if (updateError) return h.response({ statusCode: 500, message: "Gagal memperbarui artikel", error: updateError.message }).code(500);

        return h.response({ statusCode: 200, message: "Artikel berhasil diperbarui" }).code(200);
    } catch (error) {
        console.error("Error:", error.message);
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: error.message }).code(500);
    }
};

exports.deleteFolklore = async (request, h) => {
    try {
        const { id } = request.params;

        const { data: existingFolklore, error: fetchError } = await supabase
            .from("cerita_rakyat")
            .select("url_gambar, url_audio")
            .eq("id", id)
            .single();

        if (fetchError) return h.response({ statusCode: 500, message: "Gagal mengambil data artikel", error: fetchError.message }).code(500);
        if (!existingFolklore) return h.response({ statusCode: 404, message: "Artikel tidak ditemukan", error: "Artikel tidak ditemukan" }).code(404);

        if (existingFolklore.url_gambar) {
            const imagePath = existingFolklore.url_gambar.replace(`${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/`, "");
            await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).remove([imagePath]);
        }

        if (existingFolklore.url_audio) {
            const audioPath = existingFolklore.url_audio.replace(`${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/`, "");
            await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).remove([audioPath]);
        }

        const { error: deleteError } = await supabase.from("cerita_rakyat").delete().eq("id", id);
        if (deleteError) return h.response({ statusCode: 500, message: "Gagal menghapus cerita rakyat", error: deleteError.message }).code(500);

        return h.response({ statusCode: 200, message: "Cerita rakyat berhasil dihapus" }).code(200);
    } catch (error) {
        console.error("Error:", error.message);
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: error.message }).code(500);
    }
};
