import SideBar from "@/components/SideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen w-screen relative flex overflow-clip">
      <SideBar />
      {children}
    </main>
  );
}
