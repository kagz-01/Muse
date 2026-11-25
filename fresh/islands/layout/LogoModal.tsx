import MuseLogoAnimation from "../../components/ui/MuseLogoAnimation.tsx";

export default function LogoModal({ onClose }: { onClose: () => void }) {
  return <MuseLogoAnimation onClose={onClose} />;
}
