import styles from "./TextInput.module.css";

interface TextInputProps {
  label?: string;
  placeholder?: string;
  onChange?: (e: any) => void; 
}

function TextInput({ label, placeholder, onChange }: TextInputProps) {
  return (
    <span className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={styles.input} type="text" placeholder={placeholder} onChange={onChange}/>
    </span>
  );
}

export default TextInput;
