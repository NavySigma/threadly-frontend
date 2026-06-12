import * as y from "yup";

export const CreatePostSchema = y.object({
  category_id: y.string().required("Pilih kategori terlebih dahulu."),
  title: y
    .string()
    .trim()
    .required("Judul tidak boleh kosong.")
    .min(10, "Judul minimal 10 karakter.")
    .max(300, "Judul maksimal 300 karakter."),
  body: y
    .string()
    .trim()
    .required("Konten tidak boleh kosong.")
    .min(20, "Konten minimal 20 karakter."),
  selectedTags: y.array().max(5, "Maksimal 5 tag."),
});
