import {
  DialogRoot,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
} from "@/app/components/chakra-snippets/dialog";
import Image from "next/image";
import SearchOptions from ".";

interface PopupSearchProps {
  isUserSignedIn: boolean;
  open: boolean;
  closePopup: (open: boolean) => void;
}

export default function PopupSearch({
  open,
  closePopup,
  isUserSignedIn,
}: PopupSearchProps) {
  return (
    <DialogRoot
      lazyMount
      open={open}
      size={{ smDown: "full", md: "cover", lg: "lg" }}
      onOpenChange={(e) => closePopup(e.open)}
    >
      <DialogContent display="flex" justifyContent="center" pb={6}>
        <DialogHeader justifyContent="center" mt={8} minH='8rem'>
          <Image
            src="/logo.webp"
            alt="Just scripture logo"
            width={65}
            height={65}
            priority
            style={{
              objectFit: "none",
            }}
          />
        </DialogHeader>
        <DialogBody>
          <SearchOptions isSignedIn={isUserSignedIn} />
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
