import styles from "./Button.module.css";
import classNames from "classnames"

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
}

function Button({ children, className }: ButtonProps) {
  return <button className={classNames(styles.button, className)}>{children}</button>;
}

export default Button;
