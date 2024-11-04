import { User } from "./user";

export enum MembershipRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

type Team = {
  id: string;
  name: string;
  description: string;
  domains: string[];
  pin: string | undefined;
  memberCount: number;
  members?: User[];
  administrators?: User[];
  public: boolean;
  open: boolean;
}


type Membership = {
  role: MembershipRole
  isMember: boolean;
  isAdmin: boolean;
}

export type TeamWithMembership = Team & {
  membership: Membership;
}

export default Team
