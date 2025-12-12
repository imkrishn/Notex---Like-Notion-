interface Favourites {
  userId: string;
  pageId: string;
}

export type User = {
  $id: string;
  fullname: string;
  password?: string;
  isVerified?: Boolean;
  verificationToken?: string | null;
  verificationTokenTime?: Date | null;
  resetVerificationToken?: string | null;
  resetVerificationTokenTime?: Date | null;
};
