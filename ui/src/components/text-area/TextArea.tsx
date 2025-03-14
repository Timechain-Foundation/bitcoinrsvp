import styles from "./TextArea.module.css";

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  onChange?: (e: any) => void;
}

function TextArea({ label, placeholder, onChange }: TextAreaProps) {
  return (
    <span>
      {label && <label className={styles.label}>{label}</label>}
      <textarea className={styles.input} placeholder={placeholder} onChange={onChange}/>
    </span>
  );
}

export default TextArea;
