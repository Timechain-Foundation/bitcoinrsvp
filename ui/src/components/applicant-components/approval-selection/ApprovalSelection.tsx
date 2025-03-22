import { ApprovalStatus } from "../../../sdk";
import styles from "./ApprovalSelection.module.css";

interface ApprovalSelectionProps {
  isPending: boolean;
  setApprovalStatus: (approvalStatus: ApprovalStatus) => Promise<void>;
}

export default function ApprovalSelection({
  isPending,
  setApprovalStatus,
}: ApprovalSelectionProps) {
  return (
    <div className={styles.actions}>
      {isPending ? (
        <>
          <p
            className={styles.approveAction}
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              setApprovalStatus(ApprovalStatus.APPROVE);
            }}
          >
            Approve
          </p>
          <p
            className={styles.rejectAction}
            onClick={async (e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              setApprovalStatus(ApprovalStatus.REJECT);
            }}
          >
            Reject
          </p>
        </>
      ) : (
        <p
          className={styles.undoAction}
          onClick={async (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            setApprovalStatus(ApprovalStatus.PENDING);
          }}
        >
          Undo
        </p>
      )}
    </div>
  );
}
