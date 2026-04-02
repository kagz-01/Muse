import { PageProps } from "$fresh/server.ts";
import { JournalEntryView } from "../../../islands/journal/index.ts";

export default function JournalEntryPage(props: PageProps) {
  const { id } = props.params;
  return (
    <JournalEntryView entryId={id} />
  );
}
