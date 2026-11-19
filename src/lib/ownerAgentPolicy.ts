/** Authorization follows a server-verified Auth user, never a submitted email/display name. */
export function isOwnerIdentity(verifiedUserId:string|undefined, configuredOwnerId:string|undefined):boolean {
 return Boolean(configuredOwnerId && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(configuredOwnerId) && verifiedUserId===configuredOwnerId);
}
