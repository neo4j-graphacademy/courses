import { CDN_URL } from "../../../constants";
import { convert, loadFile } from "../../asciidoc"
import { load } from 'cheerio'

type QuestionOutput = {
  title: string | undefined;
  role: string | undefined;
  html: string | null;
}

export default function getQuestionHTML(certification: string, id: string): Promise<QuestionOutput> {
  const filepath = `courses/${certification}/questions/${id}`

  const file = loadFile(filepath)


  // Remove Hint and Solution from HTML
  const $ = load(convert(file, {
    standalone: true,
    attributes: {
      'cdn-url': CDN_URL,
    }
  }))

  // $('.solution').remove()
  $('.exampleblock').remove()
  $('.header').remove()

  const $html = $('.question')

  return Promise.resolve({
    title: file.getTitle(),
    role: file.getAttribute('role'),
    html: $html.html(),
  })
}
