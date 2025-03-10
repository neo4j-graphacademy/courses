import { CourseWithProgress } from "../model/course";
import { User } from "../model/user";

export class UserSharedCertificate {
  constructor(
    public readonly user: User,
    public readonly course: CourseWithProgress,
  ) { }
}