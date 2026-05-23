// Super-admin users page — re-uses the admin users component.
// The underlying component already includes super_admin in its allowedRoles,
// and the API returns all roles (including admins) when the caller is super_admin.
export { default } from "@/app/admin/users/page"
