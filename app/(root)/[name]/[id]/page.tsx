

import Create from "@/components/Create";
import Home from "@/components/Home";
import { Room } from "@/components/Room";
import SharedWithMe from "@/components/SharedWithMe";


export default async function Main({ params }: { params: { id: string, name: string } }) {

  const { id } = await params


  return (

    <div className="overflow-auto h-screen w-full">
      {id.length === 20 && <Room roomId={id}><Create pageId={id} edit={true} /></Room>}
      {id === 'home' && <Home />}
      {id === 'shared' && <SharedWithMe />}
    </div>


  );
}
