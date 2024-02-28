import { Router } from "express";
import getTeam from "../domain/services/teams/get-team";
import { requiresAuth } from "express-openid-connect";
import joinTeam from "../domain/services/teams/join-team";
import { getUser } from "../middleware/auth.middleware";
import { User } from "../domain/model/user";
import getLeaderboard from "../domain/services/teams/get-leaderboard";

const router = Router()

/**
 * Invitation link for ABM
 */
router.get('/i/:id', async (req, res) => {
  const team = await getTeam(req.params.id)

  // Set a team cookie if the team exists
  if (team !== undefined) {
    res.cookie('team', team.id)
  }

  res.redirect('/')
})

/**
 * Team landing page with leaderboard
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await getUser(req)

    const { team, leaderboard, isMember } = await getLeaderboard(req.params.id, user)

    return res.render('teams/leaderboard', {
      title: `${team.name} | Teams`,
      team,
      leaderboard,
      isMember
    })
  }
  catch (e) {
    next(e)
  }
})

/**
 *  Submit form to join team
 */
router.post('/:id/join', requiresAuth(), async (req, res) => {
  const { id } = req.params
  const { pin } = req.body

  const user = await getUser(req) as User

  const { team, error } = await joinTeam(user, id, pin)

  if (error !== undefined) {
    req.flash('danger', error)
  }
  else if (team !== undefined) {
    req.flash('success', `Welcome to ${team.name}!`)
    return res.redirect(`/teams/${team.id}`)
  }

  return res.redirect(req.originalUrl)
})

export default router
