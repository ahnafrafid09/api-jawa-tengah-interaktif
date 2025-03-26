const path = require("path");
const supabase = require("../config/supabase.js");
require("dotenv").config();

const sanitizeFileName = (fileName) => {
    return fileName.trim().toLowerCase().replace(/\s+/g, "-");
};

const uploadAudio = async (file, folder) => {
    try {
        if (!file || !file.hapi || !file.hapi.filename) {
            throw new Error("File tidak valid atau tidak ditemukan");
        }

        const fileExt = path.extname(file.hapi.filename).toLowerCase();
        const allowedExtensions = [".mp3", ".wav", ".ogg"];

        if (!allowedExtensions.includes(fileExt)) {
            throw new Error("Ekstensi file tidak valid. Hanya diperbolehkan: MP3, WAV, OGG");
        }

        const baseName = path.basename(file.hapi.filename, fileExt);
        const sanitizedFileName = sanitizeFileName(baseName);
        const fileName = `${sanitizedFileName}-${Date.now()}${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const fileBuffer = await new Promise((resolve, reject) => {
            const chunks = [];
            file.on("data", (chunk) => chunks.push(chunk));
            file.on("end", () => resolve(Buffer.concat(chunks)));
            file.on("error", reject);
        });

        const { data, error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET_NAME)
            .upload(filePath, fileBuffer, {
                contentType: file.hapi.headers["content-type"],
            });

        if (error) throw new Error(error.message);

        const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/${filePath}`;

        return fileUrl;
    } catch (err) {
        throw new Error(`Gagal mengupload file audio: ${err.message}`);
    }
};

module.exports = uploadAudio;
