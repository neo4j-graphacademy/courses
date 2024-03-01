from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import CharacterTextSplitter

COURSES_PATH = "asciidoc"
loader = DirectoryLoader(COURSES_PATH, glob="**/lesson.adoc")
docs = loader.load()

text_splitter = CharacterTextSplitter(
    separator="\n\n",
    chunk_size=1500,
    chunk_overlap=200,
)

chunks = text_splitter.split_documents(docs)

print(chunks)
print(len(chunks), "chunks created.")