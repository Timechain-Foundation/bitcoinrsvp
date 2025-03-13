import Button from "../../components/button/Button";
import LogoSvg from "../../components/svg/LogoSvg";
import TextArea from "../../components/text-area/TextArea";
import TextInput from "../../components/text-input/TextInput";
import styles from "./ApplicationForm.module.css";

function ApplicationForm() {
  const title = "Bitcoin Dinner Club Season One";
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

      <form className={styles.form} onSubmit={(e) => e.preventDefault() }>
        <TextInput label="Name" placeholder="Your full name" />
        <TextInput label="Email" placeholder="Your email address" />
        <TextArea
          label="What is your contribution to bitcoin? What are your goals in the bitcoin community?"
          placeholder="Share your bitcoin journey and aspirations"
        />
        <Button className={styles.submitButton}>Submit Registration</Button>
      </form>
    </div>
  );
}

export default ApplicationForm;
