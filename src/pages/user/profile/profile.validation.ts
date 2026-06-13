import * as Yup from "yup";

export const ProfileSchema = Yup.object({
  username: Yup.string()
    .required("Username wajib diisi.")
    .min(3, "Username minimal 3 karakter.")
    .max(100, "Username maksimal 100 karakter."),
  bio: Yup.string().max(500, "Bio maksimal 500 karakter."),
  avatar_url: Yup.string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .trim()
    .url("Avatar URL harus valid.")
    .notRequired(),
});

export const PasswordSchema = Yup.object({
  current_password: Yup.string(),
  new_password: Yup.string()
    .required("Password baru wajib diisi.")
    .min(8, "Password baru minimal 8 karakter."),
  new_password_confirmation: Yup.string()
    .oneOf([Yup.ref("new_password")], "Konfirmasi password baru tidak cocok.")
    .required("Konfirmasi password baru wajib diisi."),
});
