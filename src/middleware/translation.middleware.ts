import { Express } from "express";

export function registerTranslationMiddleware(app: Express) {
  app.use((req, res, next) => {
    res.locals.offerTranslation = false

    const acceptLanguage = req.header('accept-language')

    if (typeof acceptLanguage === 'string') {
      const [allLanguages] = acceptLanguage.split(";")
      const languages = allLanguages.split(",")

      // Has the user requested something other than English?
      if (languages.some(el => !el.includes('en'))) {
        res.locals.offerTranslation = true
      }
    }

    next()
  })
}
