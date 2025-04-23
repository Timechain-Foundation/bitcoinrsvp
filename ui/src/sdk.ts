const BASE_URL = process.env["REACT_APP_BASE_URL"] ?? "";

async function get_(path: string) {
  let res = await fetch(`${BASE_URL}/${path}`, {
    credentials: "include",
  });
  return res.json();
}

async function post_(path: string, body?: any) {
  let res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "include",
  });

  return res;
}

export function getGroup(id: number): Promise<any> {
  return get_(`group/${id}`);
}

export interface MembershipApplication {
  name: string;
  email: string;
  questions: { id: number; answer: string }[];
}

export function postApplication(
  groupId: number,
  membershipApplication: MembershipApplication
) {
  return post_(`${groupId}/membership`, membershipApplication);
}

export function getApplications(groupId: number) {
  return get_(`${groupId}/membership`);
}

export enum ApprovalStatus {
  REJECT = "rejected",
  PENDING = "pending",
  APPROVE = "approved",
}

export function setApprovalStatus(
  groupId: number,
  membershipId: number,
  approvalStatus: ApprovalStatus
): Promise<Response> {
  return post_(`${groupId}/membership/${membershipId}/${approvalStatus}`);
}

export interface CreateEvent {
  name: string;
  description: string;
  location: string;
  date: string;
}

export async function createEvent(groupId: number, event: CreateEvent) {
  // TODO: Change these values.
  let price_in_cents = 0;
  let max_quantity = 100;
  return post_(`${groupId}/event`, {
    ...event,
    price_in_cents,
    max_quantity,
  });
}

export function getEvents(groupId: number) {
  return get_(`${groupId}/event`);
}
