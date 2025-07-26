import dataProvider from "@/hooks/dataProvider";

export type UpdateProfileParams = {
  id: string;
  role: string;
  firstName: string;
  email: string;
  currentPassword: string;
  newPassword?: string;
};

export async function handleUpdateProfile({ id, role, firstName, email, currentPassword, newPassword }: UpdateProfileParams) {
  let resource: keyof typeof import("@/hooks/dataProvider").default["update_path"] = "students";
  if (role === "teacher") resource = "teachers";
  else if (role === "parent") resource = "parents";
  else if (role === "admin") resource = "students"; // adjust if you have admin resource
  else if (role === "director") resource = "students"; // adjust if you have director resource

  return dataProvider.update(resource, {
    id,
    data: {
      firstName,
      email,
      currentPassword,
      newPassword: newPassword || undefined,
    },
  });
}
