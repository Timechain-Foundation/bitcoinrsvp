import { useEffect, useState } from "react";
import styles from "./OrganizerApproval.module.css";
import { getApplications } from "../../sdk";
import {
  Bitcoin,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
                <div>
                  {row?.answers?.map((r: any) => {
                    return (
                      <div>
                        <h3>{r.question}</h3>
                        <p>{r.answer}</p>
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
  let [applications, setApplications] = useState([]);

  useEffect(() => {
    (async () => {
      let applications = await getApplications(GROUP_ID);
      setApplications(applications);
    })();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

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
          },
        ]}
        data={applications.map((a: any, i: number) => {
          return {
            applicant: (
              <div className={styles.applicant}>
                <ChevronDown className={styles.applicantExpandIcon} />
                <div>
                  <p>{a.email}</p>
                  <p>{a.email}</p>
                </div>
              </div>
            ),
            status: (
              <div>
                {getStatusIcon(a.approval_status)}
                <p>{a.approval_status}</p>
              </div>
            ),
            submitted: <p>{new Date(a.date_created).toDateString()}</p>,
            answers: a.answers,
            actions: <div></div>,
          };
        })}
      />
    </>
  );
}
