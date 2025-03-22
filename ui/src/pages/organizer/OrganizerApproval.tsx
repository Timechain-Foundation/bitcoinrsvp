import { useEffect, useState } from "react";
import styles from "./OrganizerApproval.module.css";
import { ApprovalStatus, getApplications, setApprovalStatus } from "../../sdk";
import classNames from "classnames";
import Table from "../../components/table/Table";
import ApprovalSelection from "../../components/applicant-components/approval-selection/ApprovalSelection";
import ApplicantContact from "../../components/applicant-components/applicant-contact/ApplicantContact";
import DesktopOnly from "../../components/screen-selector/DesktopOnly";
import MobileOnly from "../../components/screen-selector/MobileOnly";
import ApprovalStatusBadge from "../../components/applicant-components/approval-status-badge/ApprovalStatusBadge";
import ApplicantAnswers from "../../components/applicant-components/applicant-answers/ApplicantAnswers";
import CardList from "../../components/card-list/CardList";

export default function OrganizerApproval() {
  const GROUP_ID = 1;
  let [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      let applications = await getApplications(GROUP_ID);
      setApplications(applications);
    })();
  }, []);

  function updateApplicationStatusState(
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

  let updateApprovalStatus = async (
    applicationId: number,
    approvalStatus: ApprovalStatus
  ) => {
    await setApprovalStatus(GROUP_ID, applicationId, approvalStatus);
    updateApplicationStatusState(applicationId, approvalStatus);
  };

  return (
    <>
      <DesktopOnly>
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
          rows={applications.map((a: any) => {
            return {
              applicant: <ApplicantContact email={a.email} />,
              status: (
                <ApprovalStatusBadge approval_status={a.approval_status} />
              ),
              submitted: <p>{new Date(a.date_created).toLocaleDateString()}</p>,
              answers: a.answers,
              expanded: <ApplicantAnswers answers={a.answers} />,
              actions: (
                <ApprovalSelection
                  isPending={a.approval_status === ApprovalStatus.PENDING}
                  setApprovalStatus={(approvalStatus: ApprovalStatus) =>
                    updateApprovalStatus(a.id, approvalStatus)
                  }
                />
              ),
            };
          })}
        />
      </DesktopOnly>

      <MobileOnly>
        <CardList
          className={classNames(styles.cards)}
          rows={applications.map((a: any) => {
            return {
              rows: [
                {
                  fields: [
                    <ApplicantContact email={a.email} />,
                    <ApprovalStatusBadge approval_status={a.approval_status} />,
                  ],
                },
                {
                  fields: [
                    <p>
                      Submitted: {new Date(a.date_created).toLocaleDateString()}
                    </p>,
                  ],
                },
                {
                  fields: [
                    <ApprovalSelection
                      isPending={a.approval_status === ApprovalStatus.PENDING}
                      setApprovalStatus={(approvalStatus: ApprovalStatus) =>
                        updateApprovalStatus(a.id, approvalStatus)
                      }
                    />,
                  ],
                },
              ],
              expanded: <ApplicantAnswers answers={a.answers} />,
            };
          })}
        />
      </MobileOnly>
    </>
  );
}
