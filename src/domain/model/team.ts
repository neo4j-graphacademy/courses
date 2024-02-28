import { User } from "./user";

type Team = {
  id: string;
  name: string;
  description: string;
  domains: string[];
  pin: string | undefined;
  members?: User[];
  public: boolean;
  open: boolean;
}

export default Team
