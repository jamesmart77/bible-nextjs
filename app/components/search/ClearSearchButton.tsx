import { IconButton } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";

type Props = { onClear: () => void; disabled?: boolean };

export default function ClearSearchButton({ onClear, disabled }: Props) {
  return (
    <IconButton
      type="button"
      aria-label="Clear search"
      title="Clear search"
      variant="ghost"
      rounded="full"
      width="32px"
      minWidth="32px"
      height="32px"
      color="var(--js-text-secondary)"
      disabled={disabled}
      onClick={(event) => {
        const input = event.currentTarget.closest('[data-search-field]')?.querySelector('input');
        onClear();
        input?.focus();
      }}
    >
      <FiX size={18} />
    </IconButton>
  );
}
