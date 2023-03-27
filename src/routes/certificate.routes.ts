import { Router } from "express";
import { BASE_URL } from "../constants";
import getCertificateById from "../domain/services/get-certificate-by-id";
import { getUser } from "../middleware/auth.middleware";
import { getUserName } from "../utils";
import { courseOgBadgeImage, courseOgBannerImage } from "./route.utils";

const router = Router()


router.get('/:id', async (req, res) => {
    const { id } = req.params

    const { course, user } = await getCertificateById(id)
    const currentUser = await getUser(req)

    const userName = getUserName(user)

    const ogImage = courseOgBannerImage(course.slug)

    // Year and month for LinkedIn
    const year = course.completedAt ? course.completedAt.getFullYear() : null
    const month = course.completedAt ? course.completedAt.getMonth() + 1 : null
    const url = `${BASE_URL}/c/${req.params.id}/`

    res.render('profile/certificate', {
        title: [course.title, `${userName}'s Achievements`].join(' | '),
        course,
        name: userName,
        own: user.id === currentUser?.id,
        badge: courseOgBadgeImage(course.slug),
        ogTitle: `${userName} earned the ${course.title} badge on #Neo4j #GraphAcademy`,
        ogDescription: `On ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(course.completedAt?.toString()))} ${userName} earned the ${course.title} badge.  Test yourself with #Neo4j #GraphAcademy...`,
        ogImage,
        year,
        month,
        url,
    })
})



export default router