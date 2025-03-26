const supabase = require("../config/supabase.js");
const uploadImage = require("../handlers/upload-image.js");
require("dotenv").config();


exports.getAllArticles = async (request, h) => {
    const { search, latest } = request.query

    let query = supabase.from("artikel").select("id, judul, deskripsi, tanggal_artikel, author, url_gambar");

    if (latest) {
        query = query.order("created_at", { ascending: false }).limit(parseInt(latest));
    }
    if (search) {
        query = query.ilike("judul", `%${search}%`);
    }
    const { data, error } = await query

    if (!data || data.length === 0) return h.response({ statusCode: 404, message: "Tidak ada data artikel", error: "Not Found" }).code(404);
    if (error) return h.response({ statusCode: 500, message: "Gagal mengambil data", error: error.message }).code(500);
    return h.response({ statusCode: 200, message: "Berhasil mengambil data", data }).code(200);
};

exports.getArticleById = async (request, h) => {
    const { id } = request.params;
    const { error, data } = await supabase.from("artikel").select("*").eq("id", id).single();
    if (data === null) return h.response({ statusCode: 404, message: "Artikel tidak ditemukan", error: "Not Found" }).code(404);
    if (error) return h.response({ statusCode: 500, message: "Gagal mengambil data", error: error.message }).code(500);
    return h.response({ statusCode: 200, message: "Berhasil mengambil data", data }).code(200);
};

exports.createArticle = async (request, h) => {
    try {
        const file = request.payload.image;
        if (!file) {
            return h.response({ statusCode: 400, message: "File tidak ditemukan", error: "File Not Found" }).code(400);
        }

        const url_gambar = await uploadImage(file, "gambar-artikel");
        const { judul, konten, deskripsi, author } = request.payload;

        const articleDate = new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        const { data, error: dbError } = await supabase.from("artikel").insert([
            { judul, konten, deskripsi, author, url_gambar, tanggal_artikel: articleDate },
        ]).select();

        if (dbError) return h.response({ statusCode: 500, message: "Gagal menambahkan artikel", error: dbError.message }).code(500);

        return h.response({ statusCode: 201, message: "Artikel berhasil ditambahkan", data }).code(201);
    } catch (err) {
        console.error("Error:", err.message);
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: err.message }).code(500);
    }
};

exports.updateArticle = async (request, h) => {
    try {
        const { id } = request.params;
        const { judul, konten, deskripsi, author } = request.payload;
        const file = request.payload?.image || null;

        const { data: existingArticle, error: fetchError } = await supabase
            .from("artikel")
            .select("url_gambar")
            .eq("id", id)
            .single();

        if (fetchError) return h.response({ statusCode: 500, message: "Gagal mengambil data artikel", error: fetchError.message }).code(500);
        if (!existingArticle) return h.response({ statusCode: 404, message: "Artikel tidak ditemukan", error: "Artikel tidak ditemukan" }).code(404);

        let url_gambar = existingArticle.url_gambar;

        if (file) {
            if (url_gambar) {
                const oldImagePath = url_gambar.replace(`${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/`, "");
                const { error: deleteError } = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).remove([oldImagePath]);
                if (deleteError) {
                    console.error("Gagal menghapus gambar lama:", deleteError.message);
                }
            }
            url_gambar = await uploadImage(file, "gambar-artikel");
        }

        const { error: updateError } = await supabase
            .from("artikel")
            .update({ judul, konten, deskripsi, author, url_gambar },)
            .eq("id", id);

        if (updateError) return h.response({ statusCode: 500, message: "Gagal memperbarui artikel", error: updateError.message }).code(500);

        return h.response({ statusCode: 200, message: "Artikel berhasil diperbarui" }).code(200);
    } catch (error) {
        console.error("Error:", error.message);
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: error.message }).code(500);
    }
};

exports.deleteArticle = async (request, h) => {
    try {
        const { id } = request.params;

        const { data: existingArticle, error: fetchError } = await supabase
            .from("artikel")
            .select("url_gambar")
            .eq("id", id)
            .single();

        if (fetchError) return h.response({ statusCode: 500, message: "Gagal mengambil data artikel", error: fetchError.message }).code(500);
        if (!existingArticle) return h.response({ statusCode: 404, message: "Artikel tidak ditemukan", error: "Artikel tidak ditemukan" }).code(404);

        if (existingArticle.url_gambar) {
            const imagePath = existingArticle.url_gambar.replace(`${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/`, "");
            await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).remove([imagePath]);
        }

        const { error: deleteError } = await supabase.from("artikel").delete().eq("id", id);
        if (deleteError) return h.response({ statusCode: 500, message: "Gagal menghapus artikel", error: deleteError.message }).code(500);

        return h.response({ statusCode: 200, message: "Artikel berhasil dihapus" }).code(200);
    } catch (error) {
        console.error("Error:", error.message);
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: error.message }).code(500);
    }
};
