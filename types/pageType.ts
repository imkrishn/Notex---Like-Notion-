
export type Block = {
  $id: string;
  parentId: string;
  content: string;
}
export type SharedUserIds = {
  $id: string;
  ownerId: string;
  permission: 'can_read' | 'can_edit' | 'All';
  pages?: PageType[];
  sharedUserId: string
}

export type Children = {
  $id: string
  childrenPageId: string
}


export type PageType = {
  $id: string;
  ownerId?: string;
  coverImageUrl?: string;
  name?: string;
  sharedUsersIds?: SharedUserIds[];
  blocks?: Block[];
  imgUrl?: string;
  children?: Children[]
}