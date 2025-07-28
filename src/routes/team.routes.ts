import { Router } from "express";
import getTeam from "../domain/services/teams/get-team";
import { getUser } from "../middleware/auth.middleware";
import getLeaderboard from "../domain/services/teams/get-leaderboard";
import { getTeamProgress } from "../domain/services/teams/get-team-progress";
import updateTeam from "../domain/services/teams/update-team";
import { requiresAuth } from "express-openid-connect";
import NotFoundError from "../errors/not-found.error";
import getCourses from "../domain/services/get-courses";
import updateTeamCourses from "../domain/services/teams/update-team-courses";
import joinTeam, { JoinTeamOutcome } from "../domain/services/teams/join-team";
import { User } from "../domain/model/user";
import { z } from 'zod'
import { prepareAndSend } from "../modules/mailer/mailer";
import { canonical } from "../utils";
import getLearningPaths from "../domain/services/teams/get-learning-paths";

const router = Router()

/**
 * Invitation link for ABM
 */
router.get('/i/:id', async (req, res) => {
  const { team } = await getTeam(req.params.id)

  // Set a team cookie if the team exists
  if (team !== undefined) {
    res.cookie('team', team?.id)
  }

  res.redirect('/')
})

/**
 * Team landing page with leaderboard
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await getUser(req)

    const { team, ...props } = await getLeaderboard(req.params.id, user)

    return res.render('teams/leaderboard', {
      title: `${team.name} | Teams`,
      tab: 'leaderboard',
      team,
      ...props,
    })
  }
  catch (e) {
    next(e)
  }
})

const displayJoin = async (req, res, next, errors = {}) => {
  try {
    const user = await getUser(req)

    const { team, courses, membership } = await getTeam(req.params.id, user)
    const { name, pin } = req.query

    if (!team) {
      return next(new NotFoundError(`Team ${req.params.id} not found`))
    }
    if (membership?.isMember) {
      return res.redirect(`/teams/${team.id}/`)
    }

    return res.render('teams/join', {
      title: `Join ${team.id} | Teams`,
      user,
      team,
      courses,
      membership,
      name,
      pin,
      errors,
    })
  }
  catch (e) {
    next(e)
  }
}

/**
 * Invitation page to join a team 
 */
router.get('/:id/join', displayJoin)

/**
 * Process request to join a team
 */
router.post('/:id/join', requiresAuth(), async (req, res, next) => {
  try {
    const user = await getUser(req) as User

    const { pin } = req.body
    const { id } = req.params

    const { error, outcome } = await joinTeam(user, id, pin)

    if (outcome === JoinTeamOutcome.NOT_FOUND) {
      next(new NotFoundError(`Team ${id} not found`))
    }

    if (error) {
      return displayJoin(req, res, next, { pin: error })
    }

    req.flash('success', 'Welcome to the team!')
    return res.redirect(`/teams/${req.params.id}/`)

  }
  catch (e) {
    next(e)
  }
})

/**
 * Team member matrix showing which users have enrolled in, or completed a course
 */
router.get('/:id/progress', async (req, res, next) => {
  try {
    const user = await getUser(req)

    const { courses, members, matrix, team, membership } = await getTeamProgress(req.params.id, user)

    return res.render('teams/progress', {
      title: `${team.name} | Teams`,
      tab: 'progress',
      team,
      membership,
      courses,
      members,
      matrix,
    })
  }
  catch (e) {
    next(e)
  }
})


/**
 * Show team edit form
 */
router.get('/:id/edit', requiresAuth(), async (req, res, next) => {
  try {
    const user = await getUser(req)
    if (!user) {
      return res.redirect('/login')
    }

    const { team, membership, courses } = await getTeam(req.params.id, user)

    if (!team) {
      return next(new NotFoundError('Team not found'))
    }

    // Check if user is admin
    if (!membership?.isAdmin) {
      return res.redirect(`/teams/${team.id}`)
    }

    return res.render('teams/edit', {
      title: `Edit ${team.name} | Teams`,
      tab: 'edit',
      team,
      membership,
      courses,
      body: req.body,
      action: `/teams/${team.id}`,
      submitText: 'Update Team'
    })
  }
  catch (e) {
    next(e)
  }
})

/**
 * Update team information
 */
router.post('/:id', requiresAuth(), async (req, res, next) => {
  try {
    const user = await getUser(req)
    if (!user) {
      return res.redirect('/login')
    }

    const { name, description, isPublic, isOpen } = req.body

    // Convert string values from form to booleans
    const updates = {
      name,
      description,
      isPublic: isPublic === 'true',
      isOpen: isOpen === 'true'
    }

    // Update team
    const { errors } = await updateTeam(req.params.id, user, updates)

    // Handle validation errors
    if (errors) {
      const firstError = Object.values(errors)[0];
      req.flash('error', firstError)
      return res.redirect(`/teams/${req.params.id}`)
    }

    // Flash success message and redirect
    req.flash('success', 'Team settings have been updated')
    return res.redirect(`/teams/${req.params.id}`)
  }
  catch (e) {
    next(e)
  }
})

/**
 * Allow member to invite other members to the team
 */
router.get('/:id/invite', requiresAuth(), async (req, res, next) => {
  try {
    const user = await getUser(req)

    const { team, courses, membership } = await getTeam(req.params.id, user)

    if (!team) {
      return next(new NotFoundError('Team not found'))
    }

    return res.render('teams/invite', {
      title: `Invite Members to ${team.name} | Teams`,
      tab: 'invite',
      team,
      membership,
      courses,
    })
  }
  catch (e) {
    next(e)
  }
})

/**
 * Process invite form to send invites to multiple emails
 */
router.post('/:id/invite', requiresAuth(), async (req, res, next) => {
  try {
    const user = await getUser(req) as User

    const { team, membership } = await getTeam(req.params.id, user)

    if (team === undefined || !membership?.isAdmin) {
      return next(new NotFoundError('Team not found'))
    }

    // Extract and split emails
    let emailsRaw = req.body.emails || ''
    let emails = emailsRaw
      .split(/[;,	\n]+/)
      .map(e => e.trim())
      .filter(Boolean)


    // Validate emails 
    const emailSchema = z.string().email()
    const validEmails = emails.map(el => el.trim()).filter(email => emailSchema.safeParse(email).success)

    if (validEmails.length > 0) {
      const url = canonical(`/teams/${team.id}/join?name=${encodeURIComponent(team.name)}&pin=${encodeURIComponent(team.pin || '')}`)

      for (const email of validEmails) {
        await prepareAndSend('user-invited-to-team', email, {
          team,
          user,
          url,
        })
      }

      req.flash('success', `Invitations sent to ${validEmails.length} email${validEmails.length === 1 ? '' : 's'}`)
      res.redirect(`/teams/${team.id}/`)
    }
    else {
      req.flash('error', 'No valid emails provided')
      res.redirect(`/teams/${team.id}/invite/`)
    }
  } catch (e) {
    next(e)
  }
})

/**
 * Show team learning path edit form
 */
router.get('/:id/courses', requiresAuth(), async (req, res, next) => {
  try {
    const user = await getUser(req) as User

    const { team, membership, courses } = await getTeam(req.params.id, user)

    if (!team) {
      return next(new NotFoundError('Team not found'))
    }

    // Check if user is admin
    if (!membership?.isAdmin) {
      return res.redirect(`/teams/${team.id}`)
    }

    const allCourses = await getCourses()

    const orders = courses?.reduce((map, course, i) => {
      map[course.slug] = i + 1;
      return map;
    }, {});

    const { teamPaths, categoryPaths } = await getLearningPaths(user)

    return res.render('teams/courses', {
      title: `Edit Learning Path for ${team.name} | Teams`,
      tab: 'courses',
      team,
      membership,
      courses,
      allCourses,
      orders,
      categoryPaths,
      teamPaths,
    })
  }
  catch (e) {
    next(e)
  }
})

/**
 * Update team learning path
 */
router.post('/:id/courses', requiresAuth(), async (req, res, next) => {
  try {
    const user = await getUser(req) as User
    if (!user) {
      return res.redirect('/login')
    }

    const { courses } = req.body

    await updateTeamCourses(req.params.id, user, courses.split(','))

    // Flash success message and redirect
    req.flash('success', `Your team's learning path has been updated`)
    return res.redirect(`/teams/${req.params.id}/courses`)
  }
  catch (e) {
    next(e)
  }
})

export default router
