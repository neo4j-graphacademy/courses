import { Router } from "express";
import { BASE_URL } from "../constants";
import getCertificateById from "../domain/services/get-certificate-by-id";
import { getUser } from "../middleware/auth.middleware";
import { canonical, getUserName } from "../utils";
import { courseOgBadgeImage, courseOgBannerImage } from "./route.utils";

const router = Router()


router.get('/:id', async (req, res, next) => {
    const { id } = req.params

    try {
        const { course, user } = await getCertificateById(id)
        const currentUser = await getUser(req)

        const userName = getUserName(user)

        const ogImage = courseOgBannerImage(course.slug)

        // Year and month for LinkedIn
        const year = course.completedAt ? course.completedAt.getFullYear() : null
        const month = course.completedAt ? course.completedAt.getMonth() + 1 : null
        const url = `${BASE_URL}/c/${req.params.id}/`

        const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
        const prettyDate = formatter.format(course.completedAt)


        res.render('profile/certificate', {
            title: [course.title, `${userName}'s Achievements`].join(' | '),
            course,
            name: userName,
            own: user.id === currentUser?.id,
            badge: courseOgBadgeImage(course.slug),
            ogTitle: `${userName} earned the ${course.title} badge on #Neo4j #GraphAcademy`,
            ogDescription: `On ${prettyDate}, ${userName} earned the ${course.title} badge.  Test yourself with #Neo4j #GraphAcademy...`,
            ogImage,
            year,
            month,
            url,
            canonical: canonical(`/c/${id}/`),
        })
    }
    catch (e) {
        next(e)
    }
})



export default router