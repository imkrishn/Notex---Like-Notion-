interface Favourites {
  userId: string;
  pageId: string;
}

export interface User {
  $id: string | undefined;
  fullName?: string | undefined;
  email: string | undefined;
  favourites?: Favourites[]

}