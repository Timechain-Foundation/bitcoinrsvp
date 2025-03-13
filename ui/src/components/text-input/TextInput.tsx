import styles from "./TextInput.module.css";

interface TextInputProps {
  label?: string;
  placeholder?: string;
}

function TextInput({ label, placeholder }: TextInputProps) {
  return (
    <span className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={styles.input} type="text" placeholder={placeholder} />
    </span>
  );
}

export default TextInput;
