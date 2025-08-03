import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function fileView(file) {
  const openFile = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
  };

  return (
    <>
      <div className="w-full h-auto flex flex-row align-middle justify-center py-2">
        <div className="h-auto w-fit flex items-center justify-center p-0 m-0 text-2xl">
          📋
        </div>

        <div className=" rounded cursor-pointer w-3/5 overflow-x-clip text-nowrap items-center flex flex-grow">
          {file.name}
        </div>

        <button
          className="h-auto flex align-middle justify-center w-fit bg-transparent m-0 p-0 items-center hover:border-none border-none pl-2"
          onClick={() => openFile(file)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="size-6"
          >
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path
              fill-rule="evenodd"
              d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </>
  );
}

export default function ChatPageSidebar({
  tipMSG,
  filesUploaded,
  startRag,
  extractMedicalFunction,
  uploadFunction
}) {
  return (
    <>
      <aside className="w-[22.5%] z-10 h-screen bg-gray-700 rounded-r-2xl bg-opacity-55 flex justify-center p-3 flex-col gap-5">
        <div className="h-2/3 bg-gray-700 bg-opacity-50 rounded-2xl p-3 flex flex-col">
          <h2 className="font-bold text-xl">Files Uploaded:</h2>
          <ul className="flex-grow overflow-y-auto">
            {filesUploaded.length > 0
              ? filesUploaded.map((file, index) => {
                  return fileView(file);
                })
              : "No Files Uploaded, Using Non Rag Chat Model"}
          </ul>
          {filesUploaded.length == 0 ? (
            <button className="bg-blue-600 text-sm font-bold w-full" onClick={()=>uploadFunction()}>
              {" "}
              Upload Reports{" "}
            </button>
          ) : (
            <>
              <div className="flex flex-row gap-5">
                <button className="bg-blue-600 text-sm font-bold w-/12" onClick={() => {
                    startRag();
                  }}>
                  Chat With PDF
                </button>
                <button
                  className="bg-blue-600 text-sm font-bold w-1/2"
                  onClick={() => {
                    extractMedicalFunction();
                  }}
                >
                  Extract Medical Info
                </button>
              </div>
            </>
          )}
        </div>
        <div className="h-1/3  bg-gray-700 bg-opacity-50 rounded-2xl p-3 overflow-auto">
          <h2 className="font-bold text-xl">Tip:</h2>
          <ReactMarkdown
            className="w-full break-words SERVERMSG  z-20 h-1/2"
            remarkPlugins={[remarkGfm]}
          >
            {tipMSG}
          </ReactMarkdown>
        </div>
      </aside>
    </>
  );
}
