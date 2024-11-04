import { emitter } from '../../../events';
import { write } from '../../../modules/neo4j';
import UserCreatedTeam from '../../events/UserCreatedTeam';
import { TeamWithMembership } from '../../model/team';
import { User } from '../../model/user';

function nanoid(size = 6) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < size; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}

export default async function createTeam(
  user: User,
  name: string,
  description: string | undefined,
  isPublic: boolean = false,
  open: boolean = true,
  domains: string[] = [],
): Promise<{ errors?: Record<string, any>, team?: TeamWithMembership }> {
  // Validation
  const errors: Record<string, any> = {};
  if (!name || name === '') errors.name = 'Please enter a team name.';
  if (Object.keys(errors).length > 0) return { errors };


  const result = await write<{ team: TeamWithMembership }>(`
    MATCH (u:User {sub: $sub})
    CREATE (t:Team {
      id: $id,
      name: $name,
      description: $description,
      domains: $domains,
      pin: $pin,
      public: $public,
      open: $open
    })
    CREATE (u)-[:MEMBER_OF {role: 'admin'}]->(t)
    RETURN t {
     .*,
     isAdmin: true,
     isMember: true,
     role: 'admin'
    } AS team
  `, {
    sub: user.sub,
    id: nanoid(6),
    name,
    description: description || null,
    domains,
    pin: isPublic ? null : (Math.floor(Math.random() * 900000) + 100000).toString().padStart(6, '0').substring(0, 6),
    public: isPublic,
    open,
  });

  if (result.records.length === 0) {
    return { errors: { user: 'User not found' } };
  }

  const team = result.records[0].get('team')

  emitter.emit(new UserCreatedTeam(user, team))

  return {
    team,
  }
}