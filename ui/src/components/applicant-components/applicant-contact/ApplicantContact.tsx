import styles from "./ApplicantContact.module.css";

interface ApplicantContactProps {
  email: string;
}

export default function ApplicantContact({ email }: ApplicantContactProps) {
  return (
    <div className={styles.applicant}>
      <div>
        <p className={styles.name}>{email}</p>
        <p className={styles.email}>{email}</p>
      </div>
    </div>
  );
}
