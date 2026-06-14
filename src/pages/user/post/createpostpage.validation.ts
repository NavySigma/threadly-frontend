import * as y from "yup";

export const CreatePostSchema = y.object({
  category_id: y.string().required("Kategori wajib dipilih"),
  title: y
    .string()
    .trim()
    .required("Judul wajib diisi")
    .min(2, "Judul minimal 2 karakter")
    .max(300, "Judul maksimal 300 karakter"),
  body: y
    .string()
    .trim()
    .required("Konten wajib diisi")
    .min(10, "Konten minimal 10 karakter"),
  selectedTags: y.array().max(10, "Maksimal 10 tag"),
});
