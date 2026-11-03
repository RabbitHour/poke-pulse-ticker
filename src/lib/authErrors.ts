export function authErrorMessage(error:unknown):string {
 const e=error as {code?:string;status?:number;message?:string};
 if(e?.code==='email_address_not_authorized')return 'Public confirmation email delivery is not configured yet. Please contact support; your account cannot be confirmed until this is fixed.';
 if(e?.code==='over_email_send_rate_limit'||e?.status===429)return 'Confirmation emails are temporarily rate limited. Please wait before trying again. If this continues, contact support.';
 if(e?.code==='email_not_confirmed')return 'Please confirm your email before signing in. Check your spam folder or resend the confirmation below.';
 if(e?.code==='weak_password')return 'Choose a stronger password with at least 10 characters, including letters, numbers and a symbol.';
 if(e?.code==='invalid_credentials')return 'The email or password was not accepted. Try again or use password reset.';
 if(e?.code==='signup_disabled')return 'New accounts are temporarily unavailable. Please contact support.';
 if(e instanceof TypeError||/fetch|network/i.test(e?.message||''))return 'The account service could not be reached. Check your connection and try again.';
 return 'The account request could not be completed. Please try again or contact support if the problem continues.';
}
