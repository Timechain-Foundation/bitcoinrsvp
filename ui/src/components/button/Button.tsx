import styles from "./Button.module.css";
import classNames from "classnames";

interface ButtonProps {
  className?: string;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => Promise<void> | void;
}

function Button({ className, loading, children, onClick }: ButtonProps) {
  return (
    <button
      className={classNames(styles.button, className)}
      style={{
        opacity: loading ? 0.5 : 1,
      }}
      disabled={!!loading}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
