import { useEffect, useState } from "react";
import styles from "./OrganizerApproval.module.css";
import { ApprovalStatus, getApplications, setApprovalStatus } from "../../sdk";
import {
  Bitcoin,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import classNames from "classnames";
import { capitalizeFirstLetter } from "../../utils";

interface TableProps {
  columns: any[];
  data: any[];
}

function Table({ columns, data }: TableProps) {
  let [expandedIndex, setExpandedIndex] = useState<null | number>(null);
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        {columns.map((col: any, index: number) => {
          return (
            <p
              key={index}
              style={{
                width: col.width,
                textAlign: col.rightAlign && "right",
              }}
            >
              {col.name}
            </p>
          );
        })}
      </div>
      <div>
        {data.map((row: any, rowIndex: number) => {
          return (
            <>
              <div
                className={styles.row}
                onClick={() =>
                  setExpandedIndex((prevExpandedIndex) =>
                    prevExpandedIndex === rowIndex ? null : rowIndex
                  )
                }
              >
                {columns.map((col: any, columnIndex: number) => {
                  let value = row[col.name?.toLowerCase()];
                  if (!value) {
                    return <></>;
                  }

                  return typeof value === "string" ? (
                    <p
                      key={columnIndex}
                      style={{
                        width: col.width,
                      }}
                    >
                      {col.name}
                    </p>
                  ) : (
                    <div
                      style={{
                        width: col.width,
                      }}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
              {expandedIndex == rowIndex && (
                <div className={styles.expanded}>
                  {row?.answers?.map((r: any) => {
                    return (
                      <div>
                        <h3 className={styles.question}>{r.question}</h3>
                        <p className={styles.answer}>{r.answer}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
}

export default function OragnizerApproval() {
  const GROUP_ID = 1;
  let [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      let applications = await getApplications(GROUP_ID);
      setApplications(applications);
    })();
  }, []);

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
          <Clock
            className={classNames(styles.statusIcon, styles.pendingIcon)}
          />
        );
    }
  };

  function updateApplicationStatus(
    applicationId: number,
    approvalStatus: ApprovalStatus
  ) {
    let modifiedApplications = applications.map((application: any) => {
      if (application.id === applicationId) {
        return {
          ...application,
          approval_status: approvalStatus,
        };
      }
      return application;
    });

    setApplications(modifiedApplications);
  }

  return (
    <>
      <Table
        columns={[
          {
            name: "Applicant",
            width: 400,
          },
          {
            name: "Status",
            width: 200,
          },
          {
            name: "Submitted",
            width: 200,
          },
          {
            name: "Actions",
            width: 200,
            rightAlign: true,
          },
        ]}
        data={applications.map((a: any, i: number) => {
          return {
            applicant: (
              <div className={styles.applicant}>
                <ChevronDown className={styles.applicantExpandIcon} />
                <div>
                  <p className={styles.name}>{a.email}</p>
                  <p>{a.email}</p>
                </div>
              </div>
            ),
            status: (
              <div className={styles.status}>
                {getStatusIcon(a.approval_status)}
                <p
                  className={classNames(styles.pill, styles[a.approval_status])}
                >
                  {capitalizeFirstLetter(a.approval_status)}
                </p>
              </div>
            ),
            submitted: <p>{new Date(a.date_created).toLocaleDateString()}</p>,
            answers: a.answers,
            actions: (
              <div className={styles.actions}>
                {a.approval_status === ApprovalStatus.PENDING && (
                  <>
                    <p
                      className={styles.approveAction}
                      onClick={(e: React.MouseEvent<HTMLElement>) => {
                        e.stopPropagation();
                        setApprovalStatus(
                          GROUP_ID,
                          a.id,
                          ApprovalStatus.APPROVE
                        );
                        updateApplicationStatus(a.id, ApprovalStatus.APPROVE);
                      }}
                    >
                      Approve
                    </p>
                    <p
                      className={styles.rejectAction}
                      onClick={async (e: React.MouseEvent<HTMLElement>) => {
                        e.stopPropagation();
                        await setApprovalStatus(
                          GROUP_ID,
                          a.id,
                          ApprovalStatus.REJECT
                        );
                        updateApplicationStatus(a.id, ApprovalStatus.REJECT);
                      }}
                    >
                      Reject
                    </p>
                  </>
                )}
              </div>
            ),
          };
        })}
      />
    </>
  );
}
