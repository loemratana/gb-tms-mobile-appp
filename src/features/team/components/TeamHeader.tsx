import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { SearchInput } from "@/components/ui/SearchInput";

type TeamHeaderProps = {
  memberCount: number;
  query: string;
  onChangeQuery: (query: string) => void;
  onBack?: () => void;
};

/** Title, member count, and an always-visible search field. */
export function TeamHeader({ memberCount, query, onChangeQuery, onBack }: TeamHeaderProps) {
  return (
    <ScreenHeader
      title="Team"
      subtitle={`${memberCount} ${memberCount === 1 ? "member" : "members"}`}
      onBack={onBack}
    >
      <SearchInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Search name, role or phone"
        accessibilityLabel="Search team"
      />
    </ScreenHeader>
  );
}
