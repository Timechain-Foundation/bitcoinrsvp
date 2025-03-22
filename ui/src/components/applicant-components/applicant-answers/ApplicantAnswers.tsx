import styles from "./ApplicantAnswers.module.css";

interface ApplicantAnswersProps {
  answers: any[];
}

export default function ApplicantAnswers({ answers }: ApplicantAnswersProps) {
  return (
    <>
      {answers?.map((applicantAnswer: any) => {
        return (
          <div>
            <h3 className={styles.question}>{applicantAnswer.question}</h3>
            <p className={styles.answer}>{applicantAnswer.answer}</p>
          </div>
        );
      })}
    </>
  );
}
