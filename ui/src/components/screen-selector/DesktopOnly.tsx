import { ReactElement } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface DesktopOnlyProps {
  children: ReactElement;
}

export default function DesktopOnly({
  children,
}: DesktopOnlyProps): ReactElement {
  const isMobile = useMediaQuery("(max-width: 900px)");
  return !isMobile ? <div>{children}</div> : <></>;
}
