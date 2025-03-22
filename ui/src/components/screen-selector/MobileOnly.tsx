import { ReactElement } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface MobileOnlyProps {
  children: ReactElement;
}

export default function MobileOnly({
  children,
}: MobileOnlyProps): ReactElement {
  const isMobile = useMediaQuery("(max-width: 900px)");
  return isMobile ? <div>{children}</div> : <></>;
}
