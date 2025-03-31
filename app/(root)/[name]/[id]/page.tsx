

import Create from "@/components/Create";
import { Room } from "@/components/Room";


export default async function Main({ params }: { params: { id: string } }) {

  const pageId = await params.id

  return (

    <Room><Create pageId={pageId} /></Room>


  );
}
