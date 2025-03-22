import styles from "./ApprovalStatusBadge.module.css";
import classNames from "classnames";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { capitalizeFirstLetter } from "../../../utils";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return (
        <CheckCircle
          className={classNames(styles.statusIcon, styles.approvedIcon)}
        />
      );
    case "rejected":
      return (
        <XCircle
          className={classNames(styles.statusIcon, styles.rejectedIcon)}
        />
      );
    default:
      return (
        <Clock className={classNames(styles.statusIcon, styles.pendingIcon)} />
      );
  }
};

interface ApprovalStatusBadgeProps {
  approval_status: "pending" | "approved" | "rejected";
}

export default function ApprovalStatusBadge({ approval_status }: ApprovalStatusBadgeProps) {
  return (
    <div className={styles.status}>
      {getStatusIcon(approval_status)}
      <p className={classNames(styles.pill, styles[approval_status])}>
        {capitalizeFirstLetter(approval_status)}
      </p>
    </div>
  );
}
