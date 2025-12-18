export function can(
  permissions: string[],
  permission?: string
): boolean {
  if (!permission) return true
  return permissions.includes(permission)
}
