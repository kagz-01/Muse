import { PageProps } from "$fresh/server.ts";
import JournalEntryView from "../../../islands/JournalEntryView.tsx";

export default function JournalEntryPage(props: PageProps) {
  const { id } = props.params;
  return (
    <JournalEntryView entryId={id} />
  );
}
