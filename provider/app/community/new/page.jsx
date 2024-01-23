import BackButton from "@/components/BackButton";
import NewCommunityForm from "./NewCommunityForm";

export const metadata = {
  title: "콘텐츠 추가",
};

export default async function NewContentPage() {
  return (
    <>
      <header className="nb">
        <BackButton />
      </header>
      <NewCommunityForm />
    </>
  );
}
