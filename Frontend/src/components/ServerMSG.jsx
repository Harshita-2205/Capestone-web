import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
function ServerMSG({ isRag=false, msg }) {
  return (
    <>
      <div className={`h-fit rounded-2xl flex flex-col text-white text-center bg-opacity-35 gap-2 mr-auto ml-0 w-[90%] ${isRag ? "!w-full" : ""}`}>
      <div className="flex flex-row text-sm font-bold w-full text-transparent bg-gradient-to-r from-[#3398DB] via-[#DDE6E8] to-[#DDE6E8] bg-clip-text flex-1 items-center gap-2 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#3398DB"
            class="size-5"
          >
            <path
              fill-rule="evenodd"
              d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
              clip-rule="evenodd"
            />
          </svg>
          { isRag ? "CDSS Rag" : "CDSS" }
        </div>
        <div className="bg-white bg-opacity-10 text-left flex-1 text-base px-3 py-2 rounded-lg break-words">
          <ReactMarkdown
            className="w-full break-words SERVERMSG"
            remarkPlugins={[remarkGfm]}
          >
            {msg}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
}

export default ServerMSG;