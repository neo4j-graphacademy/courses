import { Language, LANGUAGE_EN, LANGUAGE_JP } from "../domain/model/course";
import { loadFile } from "./asciidoc";

type Phrase = string
type LanguageMap = Record<Phrase, string>

const languages = new Map<Language, LanguageMap>()


export function initLocalisation() {
    const enabled: Language[] = [
        LANGUAGE_EN,
        LANGUAGE_JP,
    ]

    enabled.forEach((language: Language) => {
        const path = `languages/${language}.adoc`
        const file = loadFile(path)

        const attributes = file.getAttributes()

        file.getBlocks().map(block => {
            attributes[ block.getId() ] = `<h2>${block.getTitle()}</h2>${block.getContent()}`
        })

        languages.set(language, attributes)
    })
}

export function getPhrase(language: Language, phrase: string, defaultValue?: any): string {
    const found = languages.get(language)
    const foundPhrase = found ? found[phrase] : undefined

    return foundPhrase || defaultValue
}

export const translate = (language: Language) =>
    (phrase: string, defaultValue?: any) => getPhrase(language, phrase, defaultValue)
