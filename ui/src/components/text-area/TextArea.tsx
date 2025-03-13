import styles from "./TextArea.module.css";

interface TextAreaProps {
  label?: string;
  placeholder?: string;
}

function TextArea({ label, placeholder }: TextAreaProps) {
  return (
    <span>
      {label && <label className={styles.label}>{label}</label>}
      <textarea className={styles.input} placeholder={placeholder} />
    </span>
  );
}

export default TextArea;
