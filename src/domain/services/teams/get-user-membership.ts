import { MembershipRole } from "../../model/team";

export type MembershipStatus = {
  role?: MembershipRole;
  isMember?: boolean;
  isAdmin?: boolean;
}

export default async function getUserMembership(tx, userSub: string, teamId: string): Promise<MembershipStatus> {
  const userRes = await tx.run(`
      MATCH (u:User {sub: $sub})
      OPTIONAL MATCH (u)-[r:MEMBER_OF]->(t:Team {id: $id})
      RETURN r IS NOT NULL as isMember,
        r.role = $admin AS isAdmin,
        r.role AS role
      `, { id: teamId, sub: userSub, admin: MembershipRole.ADMIN });

  return userRes.records.length ? userRes.records[0].toObject() : { isMember: false, isAdmin: false, role: undefined };
}
