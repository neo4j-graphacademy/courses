import { User } from "../../../domain/model/user";
import { readTransaction } from "../../neo4j";
import checkExistingAttempts, { CertificationStatus } from "./check-existing-attempts";

export default function getCertificationStatus(slug: string, user: User): Promise<CertificationStatus> {
  return readTransaction(async tx => checkExistingAttempts(tx, slug, user))
}
