/** Min 8 chars, at least one Latin letter and one digit. Any other characters allowed. */
export const passwordRegexp: RegExp =
  /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export const emailRegexp: RegExp =
  /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;

export const usernameRegexp = /^[a-zA-Z0-9_]+$/;
