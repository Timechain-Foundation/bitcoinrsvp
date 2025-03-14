import { useEffect, useState } from "react";
import Button from "../../components/button/Button";
import LogoSvg from "../../components/svg/LogoSvg";
import TextArea from "../../components/text-area/TextArea";
import TextInput from "../../components/text-input/TextInput";
import { getGroup, MembershipApplication, postApplication } from "../../sdk";
import styles from "./ApplicationForm.module.css";

function ApplicationForm() {
  // TODO: Get this from path
  const GROUP_ID = 1;

  let [group, setGroup] = useState<any>(undefined);
  let [form, setForm] = useState<any>({});
  let [loading, setLoading] = useState(false);
  let [error, setError] = useState<string | undefined>(undefined)

  async function postApplicationAsync(application: MembershipApplication) {
    try {
      setError(undefined);
      setLoading(true);
      let res = await postApplication(GROUP_ID, application);

      if (res.status != 200) {
        let errorText = await res.text();
        setError(errorText);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      let group = await getGroup(GROUP_ID);
      setGroup(group);
    })();
  }, []);

  const title = group?.name;
  const description =
    "Happening the third thursday of the month, over the course of four months, the Dinner Club offers an exclusive social and culinary experience for discerning bitcoiners. Invitees can select one of three ticket tiers. Season pass holders can attend all the dinners, but other passes only grant access to a single dinner. The monthly pass allows the invitee to select their preferred month, and with the random pass, the host selects a month for the invitee. After purchase confirmation, invitees will receive an E-mail from prem@premlee.com the week prior to the dinner with location details.";
  const rules =
    "Invitees can reserve only one ticket. Reservations are first come-first served, Ticket confirmations are final and cannot be transferred, as invitations are approved on a case-by-case basis.";

  return (
    <div className={styles.content}>
      <LogoSvg className={styles.logoSvg} />
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.panel}>
        <div>
          <h2>Event Description</h2>
          <p>{description}</p>
        </div>
        <div>
          <h2>Rules and Regulations</h2>
          <p>{rules}</p>
        </div>
      </div>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <TextInput
          label="Name"
          placeholder="Your full name"
          onChange={(e: any) =>
            setForm({
              ...form,
              name: e?.target?.value,
            })
          }
        />
        <TextInput
          label="Email"
          placeholder="Your email address"
          onChange={(e: any) =>
            setForm({
              ...form,
              email: e?.target?.value,
            })
          }
        />
        {group?.questions.map(
          (q: { id: number; question: string }, index: number) => {
            return (
              <TextArea
                key={index}
                label={q.question}
                placeholder={q.question}
                onChange={(e: any) =>
                  setForm({
                    ...form,
                    questions: [
                      ...(form?.questions?.filter(
                        (existingQuestion: { id: number; answer: string }) =>
                          existingQuestion.id != q.id
                      ) || []),
                      { id: q.id, answer: e.target.value },
                    ],
                  })
                }
              />
            );
          }
        )}

        <p className={styles.error}>{error}</p>
        <Button className={styles.submitButton} onClick={() => postApplicationAsync(form)} loading={loading}>Submit Registration</Button>
      </form>
    </div>
  );
}

export default ApplicationForm;
