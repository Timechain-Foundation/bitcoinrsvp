const API_BASE = ``;

async function get_(path: string) {
  let res = await fetch(`${API_BASE}/${path}`, {
    credentials: "include",
  });
  return res.json();
}

async function post_(path: string, body: any) {
  let res = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
