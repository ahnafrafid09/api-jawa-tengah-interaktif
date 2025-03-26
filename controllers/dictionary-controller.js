const supabase = require("../config/supabase.js");

exports.getAllDictionary = async (request, h) => {
    const { data, error } = await supabase.from("kamus").select("*");
    if (data.length === 0) return h.response({ statusCode: 404, message: "Tidak ada data kamus", error: "Not Found" }).code(404);
    if (error) return h.response({ statusCode: 500, message: "Gagal mengambil data", error: error.message }).code(500);
    return h.response({ statusCode: 200, message: "Berhasil mengambil data", data }).code(200);
}

exports.getDictionaryById = async (request, h) => {
    const { id } = request.params
    const { data, error } = await supabase.from('kamus').select("*").eq("id", id).single()
    if (data === null) return h.response({ statusCode: 404, message: "Data kamus tidak ditemukan", error: error.message }).code(404)
    if (error) return h.response({ statusCode: 500, message: "Gagal mengambil data", error: error.message }).code(500)
    return h.response({ statusCode: 200, message: "Berhasil mengambil data", data }).code(200)
}

exports.createDictionary = async (request, h) => {
    try {
        const { bahasa_indonesia, ngoko, kramaMadya, kramaInggil } = request.payload

        const { data, error } = await supabase.from('kamus').insert({ bahasa_indonesia, ngoko, krama_madya: kramaMadya, krama_inggil: kramaInggil }).select()

        if (error) return h.response({ statusCode: 500, message: "Gagal menambah data", error: error.message }).code(500)

        return h.response({ statusCode: 201, message: "Kamus berhasil ditambahkan", data }).code(201);
    } catch (error) {
        console.log(error.message)
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: error.message }).code(500)
    }
}

exports.updateDictionary = async (request, h) => {
    try {
        const { id } = request.params

        const { data: existingDictionary, error: fetchError } = await supabase
            .from('kamus')
            .select("*")
            .eq("id", id)
            .single()

        if (fetchError) return h.response({ statusCode: 500, message: "Gagal mengambil data tradisi", error: fetchError.message }).code(500);

        if (!existingDictionary) return h.response({ statusCode: 404, message: "Tradisi tidak ditemukan", error: "Tradisi tidak ditemukan" }).code(404);

        const { basaha_indonesia, ngoko, kramaMadya, kramaInggil } = request.payload

        const { error } = await supabase
            .from('kamus')
            .update({ bahasa_indonesia, ngoko, krama_madya: kramaMadya, krama_inggil: kramaInggil })
            .eq('id', id)

        if (error) return h.response({ statusCode: 500, message: "Gagal memperbarui kamus", error: error.message }).code(500)

        return h.response({ statusCode: 200, message: "Kamus berhasil diperbarui" }).code(200)
    } catch (error) {
        console.log(error.message)
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: error.message }).code(500)
    }
}

exports.deleteDictionary = async (request, h) => {
    try {
        const { id } = request.params

        const { data: existingDictionary, error: fetchError } = await supabase
            .from('kamus')
            .select("*")
            .eq("id", id)
            .single()

        if (fetchError) return h.response({ statusCode: 500, message: "Gagal mengambil data kamus", error: fetchError.message }).code(500);

        if (!existingDictionary) return h.response({ statusCode: 404, message: "Data kamus tidak ditemukan", error: "Data kamus tidak ditemukan" }).code(404);

        const { error: deleteError } = await supabase.from("kamus").delete().eq("id", id);
        if (deleteError) return h.response({ statusCode: 500, message: "Gagal menghapus kamus", error: deleteError.message }).code(500);

        return h.response({ statusCode: 200, message: "Kamus berhasil dihapus" }).code(200);

    } catch (error) {
        console.log(error.message)
        return h.response({ statusCode: 500, message: "Terjadi kesalahan", error: error.message }).code(500)
    }
}