import MuseLogoAnimation from "../../components/ui/MuseLogoAnimation.tsx";

export default function BrandModal({ onClose, onOpenAuth: _onOpenAuth }: {
  onClose: () => void;
  onOpenAuth?: (mode: "login" | "signup") => void;
}) {
  return <MuseLogoAnimation onClose={onClose} />;
}
