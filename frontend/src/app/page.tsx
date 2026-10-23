import Landing from "@/features/landing/Landing";
import AuthRedirect from "@/features/landing/AuthRedirect";

export default function Home() {
  return (
    <>
      <AuthRedirect />
      <Landing />
    </>
  );
}
